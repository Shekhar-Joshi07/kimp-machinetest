import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Assignment from '@/lib/models/Assignment';

export async function GET() {
  try {
    await connectDB();
    const assignments = await Assignment.find({})
      .populate('roleId', 'name')
      .populate('permissionId', 'name');
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Fetch assignments error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments', details: error.message }, { status: 500 });
  }
}