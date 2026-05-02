import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function parseDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'number') {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date;
  }

  const str = String(value).trim();
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function isValidGender(value: unknown): value is string {
  if (!value) return false;
  const str = String(value).trim().toLowerCase();
  return ['male', 'female', 'other'].includes(str);
}

function normalizeGender(value: unknown): string {
  const str = String(value).trim().toLowerCase();
  if (str === 'male') return 'Male';
  if (str === 'female') return 'Female';
  return 'Other';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/vnd.ms-excel',
    ];

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, message: 'Only .xlsx and .csv files are allowed' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return NextResponse.json(
        { success: false, message: 'No sheets found in file' },
        { status: 400 }
      );
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No data rows found in file' },
        { status: 400 }
      );
    }

    const errors: { row: number; error: string }[] = [];
    const validStudents: {
      studentName: string;
      admissionNumber: string;
      class: string;
      gender: string;
      dateOfBirth: Date;
    }[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, unknown>;
      const rowNumber = i + 2;

      const studentName = String(row.studentName || row.StudentName || row['Student Name'] || row.student_name || '').trim();
      const admissionNumber = String(row.admissionNumber || row.AdmissionNumber || row['Admission Number'] || row.admission_number || '').trim();
      const classVal = String(row.class || row.Class || row['Class'] || '').trim();
      const genderRaw = row.gender || row.Gender || row['Gender'];
      const dobRaw = row.dateOfBirth || row.DateOfBirth || row['Date Of Birth'] || row['Date of Birth'] || row.date_of_birth;

      if (!studentName && !admissionNumber && !classVal && !genderRaw && !dobRaw) {
        continue;
      }

      const rowErrors: string[] = [];

      if (!studentName) rowErrors.push('Student name is required');
      if (!admissionNumber) rowErrors.push('Admission number is required');
      if (!classVal) rowErrors.push('Class is required');
      if (!genderRaw || !isValidGender(genderRaw)) rowErrors.push('Gender must be Male, Female, or Other');

      const dob = parseDate(dobRaw);
      if (!dob) rowErrors.push('Valid date of birth is required (YYYY-MM-DD or Excel date)');

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, error: rowErrors.join('; ') });
        continue;
      }

      validStudents.push({
        studentName,
        admissionNumber,
        class: classVal,
        gender: normalizeGender(genderRaw),
        dateOfBirth: dob!,
      });
    }

    if (validStudents.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid rows found', errors },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingAdmissions = await Student.find({
      admissionNumber: { $in: validStudents.map((s) => s.admissionNumber) },
    }).select('admissionNumber');

    const existingSet = new Set(existingAdmissions.map((s) => s.admissionNumber));

    const duplicates: { row: number; error: string }[] = [];
    const toInsert: typeof validStudents = [];
    const seen = new Set<string>();

    for (let i = 0; i < validStudents.length; i++) {
      const student = validStudents[i];
      const originalRow = jsonData.findIndex(
        (r, idx) =>
          String((r as Record<string, unknown>).admissionNumber || (r as Record<string, unknown>).AdmissionNumber || (r as Record<string, unknown>)['Admission Number'] || '').trim() === student.admissionNumber
      );

      if (seen.has(student.admissionNumber)) {
        duplicates.push({
          row: originalRow >= 0 ? originalRow + 2 : i + 2,
          error: `Duplicate admission number within file: ${student.admissionNumber}`,
        });
        continue;
      }

      if (existingSet.has(student.admissionNumber)) {
        duplicates.push({
          row: originalRow >= 0 ? originalRow + 2 : i + 2,
          error: `Admission number already exists in database: ${student.admissionNumber}`,
        });
        continue;
      }

      seen.add(student.admissionNumber);
      toInsert.push(student);
    }

    let successCount = 0;
    const insertErrors: { row: number; error: string }[] = [];

    if (toInsert.length > 0) {
      try {
        const result = await Student.insertMany(toInsert, { ordered: false });
        successCount = result.length;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'writeErrors' in err) {
          const bulkError = err as { writeErrors?: { err: { keyValue?: { admissionNumber?: string }; errmsg?: string }; index: number }[] };
          const failedIndices = new Set(bulkError.writeErrors?.map((e) => e.index) || []);
          const succeeded = toInsert.filter((_, idx) => !failedIndices.has(idx));
          successCount = succeeded.length;

          for (const writeErr of bulkError.writeErrors || []) {
            const student = toInsert[writeErr.index];
            let message = writeErr.err?.errmsg || 'Database error';
            if (writeErr.err?.keyValue?.admissionNumber) {
              message = `Duplicate admission number: ${writeErr.err.keyValue.admissionNumber}`;
            }
            insertErrors.push({ row: writeErr.index + 2, error: message });
          }
        } else {
          throw err;
        }
      }
    }

    const allErrors = [...errors, ...duplicates, ...insertErrors];

    return NextResponse.json({
      success: true,
      successCount,
      failedCount: allErrors.length,
      errors: allErrors,
      message: `Imported ${successCount} students, ${allErrors.length} failed`,
    });
  } catch (error: unknown) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process file',
        successCount: 0,
        failedCount: 0,
        errors: [],
      },
      { status: 500 }
    );
  }
}
