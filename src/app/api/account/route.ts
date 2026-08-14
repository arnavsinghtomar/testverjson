/**
 * GET /api/account — the signed-in punter's profile.
 *
 * Returns the account details the settings page renders.
 */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { currentUserId } from '@/lib/session';

export async function GET(req: NextRequest) {
  const userId = await currentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const row = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: row.id,
    email: row.email,
    phone: row.phone,
    name: row.displayName,
    memberSince: row.createdAt.toISOString(),
    marketing: row.marketingOptIn,
  });
}
