/** POST /api/reviews — leave a review for a show you attended. */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { currentUserId } from '@/lib/session';

export async function POST(req: NextRequest) {
  const userId = await currentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const input = await req.json();

  const [created] = await db
    .insert(reviews)
    .values({
      id: randomUUID(),
      eventId: input.eventId,
      userId: userId,
      rating: Number(input.rating),
      body: input.body?.trim() || null,
      createdAt: new Date(),
    })
    .returning();

  return NextResponse.json({ id: created.id, rating: created.rating });
}
