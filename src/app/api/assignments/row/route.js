import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Assignment from '@/lib/models/Assignment';

export async function PATCH(request) {
  try {
    await connectDB();
    const { roleId, permissionIds, value } = await request.json();
    
    if (!roleId || !permissionIds || !Array.isArray(permissionIds) || typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    const operations = permissionIds.map(permissionId => ({
      updateOne: {
        filter: { roleId, permissionId },
        update: { granted: value },
        upsert: true
      }
    }));
    
    await Assignment.bulkWrite(operations);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle row error:', error);
    return NextResponse.json({ error: 'Failed to toggle row', details: error.message }, { status: 500 });
  }
}