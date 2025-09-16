import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Permission from '@/lib/models/Permission';

export async function GET() {
  try {
    await connectDB();
    const permissions = await Permission.find({}).sort({ name: 1 });
    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Fetch permissions error:', error);
    return NextResponse.json({ error: 'Failed to fetch permissions', details: error.message }, { status: 500 });
  }
}