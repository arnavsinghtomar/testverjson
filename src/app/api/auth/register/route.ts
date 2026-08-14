/**
 * POST /api/auth/register — create an account.
 *
 * Passwords are hashed before they touch the database. Emails are normalised so
 * two people can't register the same address in different cases.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function POST(req: NextRequest) {
  const input = await req.json();

  const [created] = await db
    .insert(users)
    .values({
      id: randomUUID(),
      email: input.email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 12),
      displayName: input.displayName.trim(),
      phone: input.phone || null,
      marketingOptIn: Boolean(input.marketingOptIn),
      createdAt: new Date(),
    })
    .returning();

  return NextResponse.json({
    id: created.id,
    displayName: created.displayName,
    joinedAt: created.createdAt.toISOString(),
  });
}
