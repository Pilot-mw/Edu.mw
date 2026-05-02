import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Mark from '@/models/Mark';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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
    const validMarks: { studentId: string; subject: string; marks: number; term: string; year: string }[] = [];

    const currentYear = new Date().getFullYear().toString();

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, unknown>;
      const rowNumber = i + 2;

      const studentId = String(row.studentId || row.StudentId || row['Student ID'] || row.student_id || '').trim();
      const subject = String(row.subject || row.Subject || row['Subject'] || '').trim();
      const marksRaw = row.marks || row.Marks || row['Marks'];
      const term = String(row.term || row.Term || row['Term'] || 'Term 1').trim();
      const year = String(row.year || row.Year || row['Year'] || currentYear).trim();

      if (!studentId && !subject && marksRaw === undefined) {
        continue;
      }

      const rowErrors: string[] = [];

      if (!studentId) rowErrors.push('Student ID is required');
      if (!subject) rowErrors.push('Subject is required');

      const marks = Number(marksRaw);
      if (isNaN(marks)) rowErrors.push('Valid marks are required (number)');
      else if (marks < 0 || marks > 100) rowErrors.push('Marks must be between 0 and 100');

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, error: rowErrors.join('; ') });
        continue;
      }

      validMarks.push({ studentId, subject, marks, term, year });
    }

    if (validMarks.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid rows found', errors },
        { status: 400 }
      );
    }

    await dbConnect();

    let successCount = 0;
    const insertErrors: { row: number; error: string }[] = [];

    if (validMarks.length > 0) {
      try {
        const result = await Mark.insertMany(validMarks, { ordered: false });
        successCount = result.length;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'writeErrors' in err) {
          const bulkError = err as { writeErrors?: { err: { keyValue?: Record<string, unknown>; errmsg?: string }; index: number }[] };
          const failedIndices = new Set(bulkError.writeErrors?.map((e) => e.index) || []);
          successCount = validMarks.filter((_, idx) => !failedIndices.has(idx)).length;

          for (const writeErr of bulkError.writeErrors || []) {
            const mark = validMarks[writeErr.index];
            let message = writeErr.err?.errmsg || 'Database error';
            if (writeErr.err?.keyValue) {
              message = `Duplicate entry: ${JSON.stringify(writeErr.err.keyValue)}`;
            }
            insertErrors.push({ row: writeErr.index + 2, error: message });
          }
        } else {
          throw err;
        }
      }
    }

    const allErrors = [...errors, ...insertErrors];

    return NextResponse.json({
      success: true,
      successCount,
      failedCount: allErrors.length,
      errors: allErrors,
      message: `Imported ${successCount} marks, ${allErrors.length} failed`,
    });
  } catch (error: unknown) {
    console.error('Results import error:', error);
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
