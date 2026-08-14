/** My tickets — past and upcoming orders. */

async function getOrders() {
  const res = await fetch('/api/orders', { cache: 'no-store' });
  return res.json();
}

export default async function OrdersPage() {
  const { orders } = await getOrders();
  return (
    <section>
      <h1>My tickets</h1>
      <ul>
        {orders.map((o: { id: string; reference: string; total: number; paid: boolean }) => (
          <li key={o.id}>
            {o.reference} — £{o.total} — {o.paid ? 'Paid' : 'Awaiting payment'}
          </li>
        ))}
      </ul>
    </section>
  );
}
