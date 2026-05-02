import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Memo from '@/models/Memo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Test: Starting memo test endpoint');
    console.log('Test: MONGODB_URI exists:', !!process.env.MONGODB_URI);

    const conn = await dbConnect();
    console.log('Test: DB connected');

    const testMemo = await Memo.create({
      title: 'Test Memo',
      message: 'This is a test memo',
      audience: 'all',
      createdBy: 'System',
      important: false,
      expiryDate: null,
      attachmentUrl: null,
      fileName: null,
      fileType: null,
    });

    console.log('Test: Memo created:', testMemo._id);

    return NextResponse.json({
      success: true,
      message: 'Test passed',
      memoId: testMemo._id,
    });
  } catch (error: unknown) {
    console.error('Test: Failed', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
