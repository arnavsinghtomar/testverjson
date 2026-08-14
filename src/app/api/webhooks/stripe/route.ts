/**
 * POST /api/webhooks/stripe — payment outcomes from Stripe.
 *
 * Marks the payment and its order settled once the charge succeeds.
 */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { payments, orders } from '@/db/schema';

export async function POST(req: NextRequest) {
  const event = await req.json();

  if (event.type === 'payment_intent.succeeded') {
    await db
      .update(payments)
      .set({ status: 'settled' })
      .where(eq(payments.providerRef, event.data.object.id));

    await db
      .update(orders)
      .set({ status: 'paid' })
      .where(eq(orders.id, event.data.object.metadata.orderId));
  }

  return NextResponse.json({ received: true });
}
