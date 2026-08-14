/**
 * GET /api/events/[slug] — the event page payload: the show, its room, and the
 * tiers still on sale.
 */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { events, venues, ticketTypes } from '@/db/schema';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const event = await db.query.events.findFirst({ where: eq(events.slug, slug) });
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const venue = await db.query.venues.findFirst({ where: eq(venues.id, event.venueId) });
  const tiers = await db.select().from(ticketTypes).where(eq(ticketTypes.eventId, event.id));

  return NextResponse.json({
    title: event.title,
    description: event.description,
    startsAt: event.startsAt.toISOString(),
    doorPrice: event.doorPriceCents / 100,
    onSale: event.status === 'on_sale',
    minimumAge: event.ageRestriction || 0,
    venue: venue ? venue.name + ', ' + venue.city : 'To be announced',
    tiers: tiers.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.priceCents / 100,
      remaining: t.quantity - t.sold,
    })),
  });
}
