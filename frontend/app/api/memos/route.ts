import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Memo from '@/models/Memo';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
  };
  return map[mimeType] || 'bin';
}

async function saveFile(file: File): Promise<{ url: string; fileName: string; fileType: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = getExtension(file.type);
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${timestamp}_${safeName}`;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'memos');
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  return {
    url: `/uploads/memos/${fileName}`,
    fileName: safeName,
    fileType: ext,
  };
}

function isAllowedFile(file: File): boolean {
  if (ALLOWED_TYPES.includes(file.type)) return true;

  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = (formData.get('title') || '').toString().trim();
    const message = (formData.get('message') || '').toString().trim();
    const audience = (formData.get('audience') || '').toString().trim();
    const createdBy = (formData.get('createdBy') || '').toString().trim();
    const important = formData.get('important') === 'true';
    const expiryDate = (formData.get('expiryDate') || '').toString() || null;

    const fileEntry = formData.get('file');
    const file = (fileEntry && typeof (fileEntry as File).name === 'string' && (fileEntry as File).size > 0)
      ? fileEntry as File
      : null;

    if (!title || !message || !audience || !createdBy) {
      return NextResponse.json(
        { success: false, message: 'Title, message, audience, and creator are required' },
        { status: 400 }
      );
    }

    if (!['teachers', 'students', 'all'].includes(audience)) {
      return NextResponse.json(
        { success: false, message: 'Audience must be teachers, students, or all' },
        { status: 400 }
      );
    }

    let attachmentData = { attachmentUrl: null as string | null, fileName: null as string | null, fileType: null as string | null };

    if (file) {
      if (!isAllowedFile(file)) {
        return NextResponse.json(
          { success: false, message: 'Only PDF, JPG, PNG, and GIF files are allowed' },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: 'File size must be less than 5MB' },
          { status: 400 }
        );
      }

      const savedFile = await saveFile(file);
      attachmentData = {
        attachmentUrl: savedFile.url,
        fileName: savedFile.fileName,
        fileType: savedFile.fileType,
      };
    }

    const conn = await dbConnect();
    console.log('DB connected for memo creation');

    const memo = await Memo.create({
      title,
      message,
      audience,
      createdBy,
      important,
      expiryDate: expiryDate || null,
      ...attachmentData,
    });

    return NextResponse.json({ success: true, data: memo }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create memo error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: `Failed to create memo: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const audience = searchParams.get('audience');

    await dbConnect();

    let query: Record<string, unknown> = {};

    if (audience) {
      if (audience === 'teachers') {
        query.audience = { $in: ['teachers', 'all'] };
      } else if (audience === 'students') {
        query.audience = { $in: ['students', 'all'] };
      } else if (audience !== 'all') {
        return NextResponse.json(
          { success: false, message: 'Invalid audience filter' },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    query.$or = [
      { expiryDate: null },
      { expiryDate: { $gte: now } },
    ];

    const memos = await Memo.find(query).sort({ important: -1, createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: memos });
  } catch (error: unknown) {
    console.error('Fetch memos error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch memos' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Memo ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const memo = await Memo.findByIdAndDelete(id);

    if (!memo) {
      return NextResponse.json(
        { success: false, message: 'Memo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Memo deleted' });
  } catch (error: unknown) {
    console.error('Delete memo error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to delete memo' },
      { status: 500 }
    );
  }
}
