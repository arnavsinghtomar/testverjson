/**
 * GET /api/internal/metrics — counts for the ops dashboard.
 *
 * Scraped by our monitoring, not called from the site.
 */

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { events, orders } from '@/db/schema';

export async function GET() {
  const allEvents = await db.select().from(events);
  const allOrders = await db.select().from(orders);

  return NextResponse.json({
    events: allEvents.length,
    onSale: allEvents.filter((e) => e.status === 'on_sale').length,
    orders: allOrders.length,
    grossCents: allOrders.reduce((sum, o) => sum + o.totalCents, 0),
  });
}
