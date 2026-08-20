
import { validateAuth } from '@/src/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check authentication
    const admin = await validateAuth();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}