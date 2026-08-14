/** GET /api/venues/[slug] — one room, with its photos and upcoming shows. */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { venues, venuePhotos, events } from '@/db/schema';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const venue = await db.query.venues.findFirst({ where: eq(venues.slug, slug) });
  if (!venue) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const photos = await db.select().from(venuePhotos).where(eq(venuePhotos.venueId, venue.id));
  const upcoming = await db.select().from(events).where(eq(events.venueId, venue.id));

  return NextResponse.json({
    name: venue.name,
    city: venue.city,
    address: `${venue.addressLine1}, ${venue.city}`,
    capacity: venue.capacity,
    photos: photos.map((p) => ({
      url: p.url,
      caption: p.caption,
      credit: p.credit || 'Uncredited',
    })),
    upcoming: upcoming.map((e) => ({
      slug: e.slug,
      title: e.title,
      price: e.doorPriceCents / 100,
    })),
  });
}
