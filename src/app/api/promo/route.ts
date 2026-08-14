/**
 * POST /api/promo — check a discount code and return what it takes off.
 *
 * Codes are matched case-insensitively; the stored code is the canonical form.
 */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { promoCodes } from '@/db/schema';

export async function POST(req: NextRequest) {
  const input = await req.json();

  const code = await db.query.promoCodes.findFirst({
    where: eq(promoCodes.code, input.code.trim().toUpperCase()),
  });

  if (!code) return NextResponse.json({ valid: false });

  const exhausted = code.maxRedemptions !== null && code.redeemed >= code.maxRedemptions;

  return NextResponse.json({
    valid: !exhausted,
    code: code.code,
    percentOff: code.percentOff,
    remaining: code.maxRedemptions === null ? null : code.maxRedemptions - code.redeemed,
    expires: code.expiresAt?.toISOString() ?? null,
  });
}
