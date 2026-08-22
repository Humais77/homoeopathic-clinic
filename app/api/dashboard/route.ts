
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
    const dashboardData = { message: "Welcome to the dashboard" };

    // ❌ DO NOT just write: NextResponse.json(...)
    // ✅ MUST include the return keyword:
    return NextResponse.json({ 
      success: true, 
      data: dashboardData 
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}