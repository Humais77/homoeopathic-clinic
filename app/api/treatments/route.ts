
import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const treatments = await prisma.treatment.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ treatments });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatments' },
      { status: 500 }
    );
  }
}