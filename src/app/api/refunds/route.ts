/**
 * GET  /api/refunds — refunds issued against the punter's own orders.
 * POST /api/refunds — issue one. Staff only.
 *
 * Writes to `refunds` and moves `payments.status`, so it is the second path
 * (after /api/orders) that can change what a customer has been charged.
 */

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { refunds, payments, orders } from '@/db/schema';
import { currentUserId } from '@/lib/session';

export async function GET(req: NextRequest) {
  const userId = await currentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const rows = await db.select().from(refunds).where(eq(refunds.issuedById, userId));

  return NextResponse.json({
    refunds: rows.map((r) => ({
      id: r.id,
      amount: r.amountCents / 100,
      reason: r.reason,
      status: r.status,
      issuedAt: r.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await currentUserId(req);
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();

  const [payment] = await db.select().from(payments).where(eq(payments.id, body.paymentId));
  if (!payment) return NextResponse.json({ error: 'No such payment' }, { status: 404 });

  // Amounts arrive as pounds from the client and are stored in pence.
  const amountCents = Math.round(Number(body.amount) * 100);
  if (amountCents <= 0 || amountCents > payment.amountCents) {
    return NextResponse.json({ error: 'Refund exceeds the payment' }, { status: 422 });
  }

  const id = randomUUID();
  await db.insert(refunds).values({
    id,
    paymentId: payment.id,
    orderId: payment.orderId,
    amountCents,
    reason: String(body.reason ?? '').trim(),
    issuedById: userId,
    status: 'pending',
  });

  await db
    .update(payments)
    .set({ status: amountCents === payment.amountCents ? 'refunded' : 'partially_refunded' })
    .where(eq(payments.id, payment.id));

  await db.update(orders).set({ status: 'refunded' }).where(eq(orders.id, payment.orderId));

  return NextResponse.json({ id, amount: amountCents / 100, status: 'pending' }, { status: 201 });
}
