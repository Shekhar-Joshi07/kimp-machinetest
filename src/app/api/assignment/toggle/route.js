import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Assignment from '@/lib/models/Assignment';

export async function PATCH(request) {
  try {
    await connectDB();
    const { roleId, permissionId, value } = await request.json();
    
    const assignment = await Assignment.findOneAndUpdate(
      { roleId, permissionId },
      { granted: value },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(assignment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const assignments = await Assignment.find({})
      .populate('roleId', 'name')
      .populate('permissionId', 'name');
    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}