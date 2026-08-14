/** GET /api/search?q= — search runs on Typesense, results hydrate from Postgres. */

import { NextRequest, NextResponse } from 'next/server';
import { inArray } from 'drizzle-orm';
import { db } from '@/db';
import { events } from '@/db/schema';
import { searchEvents } from '@/lib/search-client';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (!q) return NextResponse.json({ results: [] });

  const hits = await searchEvents(q);
  const slugs = hits.hits.map((h) => h.document.slug);
  if (slugs.length === 0) return NextResponse.json({ results: [] });

  const rows = await db.select().from(events).where(inArray(events.slug, slugs));

  return NextResponse.json({
    results: rows.map((e) => ({
      slug: e.slug,
      title: e.title,
      price: e.doorPriceCents / 100,
    })),
  });
}
