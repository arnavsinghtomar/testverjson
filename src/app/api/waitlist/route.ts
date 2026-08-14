/** POST /api/waitlist — tell us to email you if a ticket frees up. */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { waitlist } from '@/db/schema';

export async function POST(req: NextRequest) {
  const input = await req.json();

  await db.insert(waitlist).values({
    id: randomUUID(),
    eventId: input.eventId,
    email: input.email.trim().toLowerCase(),
    notified: false,
    createdAt: new Date(),
  });

  return NextResponse.json({ joined: true });
}
