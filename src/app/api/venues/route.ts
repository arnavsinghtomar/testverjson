/** GET /api/venues — every room we sell for. */

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { venues } from '@/db/schema';

export async function GET() {
  const rows = await db.select().from(venues);

  return NextResponse.json({
    venues: rows.map((v) => ({
      slug: v.slug,
      name: v.name,
      city: v.city,
      address: `${v.addressLine1}, ${v.city}`,
      capacity: v.capacity,
    })),
  });
}
