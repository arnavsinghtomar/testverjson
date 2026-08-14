/** GET /api/reviews/[slug] — reviews for one event, newest first. */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { events, reviews, users } from '@/db/schema';
import { maskEmail } from '@/lib/redact';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const event = await db.query.events.findFirst({ where: eq(events.slug, slug) });
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rows = await db
    .select()
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.eventId, event.id));

  return NextResponse.json({
    reviews: rows.map((r) => ({
      rating: r.reviews.rating,
      body: r.reviews.body,
      author: r.users.displayName,
      contact: maskEmail(r.users.email),
      postedAt: r.reviews.createdAt.toISOString(),
    })),
  });
}
