import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connected successfully',
      mongoUrl: process.env.MONGODB_URL ? 'Set' : 'Not set'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message,
      mongoUrl: process.env.MONGODB_URL ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}