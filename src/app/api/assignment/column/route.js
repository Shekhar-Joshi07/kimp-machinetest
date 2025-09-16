import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Assignment from '@/lib/models/Assignment';

export async function PATCH(request) {
  try {
    await connectDB();
    const { permissionId, roleIds, value } = await request.json();
    
    const operations = roleIds.map(roleId => ({
      updateOne: {
        filter: { roleId, permissionId },
        update: { granted: value },
        upsert: true
      }
    }));
    
    await Assignment.bulkWrite(operations);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle column' }, { status: 500 });
  }
}