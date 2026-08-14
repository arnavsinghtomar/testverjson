/**
 * GET  /api/orders — the punter's order history.
 * POST /api/orders — take payment and issue tickets.
 *
 * This is the only route that writes to `payments`, so it is the sole path
 * between a customer and a card charge.
 */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import Stripe from 'stripe';
import { db } from '@/db';
import { orders, orderItems, payments, ticketTypes } from '@/db/schema';
import { currentUserId } from '@/lib/session';
import { orderReference } from '@/lib/reference';
import { maskCard } from '@/lib/redact';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

export async function GET(req: NextRequest) {
  const userId = await currentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const rows = await db.select().from(orders).where(eq(orders.userId, userId));

  return NextResponse.json({
    orders: rows.map((o) => ({
      id: o.id,
      reference: o.reference,
      total: o.totalCents / 100,
      paid: o.status === 'paid',
      placedAt: o.placedAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await currentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const input = await req.json();
  const tiers = await db.select().from(ticketTypes).where(eq(ticketTypes.eventId, input.eventId));

  const total = input.items.reduce((sum: number, item: { ticketTypeId: string; quantity: number }) => {
    const tier = tiers.find((t) => t.id === item.ticketTypeId);
    return sum + (tier ? tier.priceCents * item.quantity : 0);
  }, 0);

  const orderId = randomUUID();

  await db.insert(orders).values({
    id: orderId,
    userId: userId,
    eventId: input.eventId,
    totalCents: total,
    status: 'pending',
    reference: orderReference(orderId),
    placedAt: new Date(),
  });

  for (const item of input.items) {
    const tier = tiers.find((t) => t.id === item.ticketTypeId);
    await db.insert(orderItems).values({
      id: randomUUID(),
      orderId: orderId,
      ticketTypeId: item.ticketTypeId,
      quantity: Number(item.quantity),
      unitPriceCents: tier?.priceCents ?? 0,
    });
  }

  const charge = await stripe.paymentIntents.create({
    amount: total,
    currency: 'gbp',
    payment_method: input.paymentMethodId,
    confirm: true,
  });

  await db.insert(payments).values({
    id: randomUUID(),
    orderId: orderId,
    provider: 'stripe',
    providerRef: charge.id,
    amountCents: total,
    cardLast4: maskCard(input.cardNumber),
    status: 'pending',
    createdAt: new Date(),
  });

  return NextResponse.json({
    orderId: orderId,
    total: total / 100,
    status: 'pending',
  });
}
