/**
 * GET  /api/events — what's on, cheapest ticket first.
 * POST /api/events — programme a new show (venue staff only).
 *
 * Prices live in the database as pence and are returned as pounds, so the
 * storefront never has to divide.
 */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { events, venues, ticketTypes } from '@/db/schema';
import { slugify } from '@/lib/slug';
import { currentUserId } from '@/lib/session';

export async function GET() {
  const rows = await db
    .select()
    .from(events)
    .innerJoin(venues, eq(events.venueId, venues.id))
    .where(eq(events.status, 'on_sale'));

  const tiers = await db.select().from(ticketTypes);

  return NextResponse.json({
    events: rows.map((r) => ({
      id: r.events.id,
      title: r.events.title,
      slug: r.events.slug,
      startsAt: r.events.startsAt.toISOString(),
      doorPrice: r.events.doorPriceCents / 100,
      soldOut: r.events.status === 'sold_out',
      venue: r.venues.name,
      city: r.venues.city,
    })),
    from: Math.min(...tiers.map((t) => t.priceCents)) / 100,
  });
}

export async function POST(req: NextRequest) {
  const userId = await currentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const input = await req.json();

  const [created] = await db
    .insert(events)
    .values({
      id: randomUUID(),
      venueId: input.venueId,
      curatorId: userId,
      title: input.title.trim(),
      slug: slugify(input.title),
      description: input.description?.trim() || null,
      startsAt: new Date(input.startsAt),
      doorPriceCents: Math.round(input.doorPrice * 100),
      status: 'draft',
      ageRestriction: Number(input.ageRestriction),
      createdAt: new Date(),
    })
    .returning();

  return NextResponse.json({ id: created.id, slug: created.slug });
}
