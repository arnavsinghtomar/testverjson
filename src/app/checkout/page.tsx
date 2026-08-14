'use client';

/** Checkout — pick tiers, pay, get tickets. */

import { useState } from 'react';

export default function CheckoutPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function pay(form: FormData) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        eventId: form.get('eventId'),
        items: [{ ticketTypeId: form.get('tier'), quantity: form.get('quantity') }],
        paymentMethodId: form.get('paymentMethodId'),
        cardNumber: form.get('cardNumber'),
      }),
    });
    const out = await res.json();
    setStatus(out.status ?? 'failed');
  }

  return (
    <form action={pay}>
      <h1>Checkout</h1>
      <input name="eventId" placeholder="Event" />
      <input name="tier" placeholder="Ticket type" />
      <input name="quantity" type="number" defaultValue={1} />
      <input name="cardNumber" placeholder="Card number" />
      <input name="paymentMethodId" placeholder="Payment method" />
      <button type="submit">Pay</button>
      {status && <p>{status}</p>}
    </form>
  );
}
