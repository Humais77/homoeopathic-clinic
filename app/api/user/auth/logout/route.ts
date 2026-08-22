// src/app/api/user/auth/logout/route.ts
import { clearUserSession } from '@/src/lib/user-auth';
import { NextResponse } from 'next/server';

export async function POST() {
  await clearUserSession();
  return NextResponse.json({ success: true });
}