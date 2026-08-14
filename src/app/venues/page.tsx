/** Venues — the rooms we sell for. */

async function getVenues() {
  const res = await fetch('/api/venues', { cache: 'no-store' });
  return res.json();
}

export default async function VenuesPage() {
  const { venues } = await getVenues();
  return (
    <section>
      <h1>Venues</h1>
      <ul>
        {venues.map((v: { slug: string; name: string; address: string; capacity: number }) => (
          <li key={v.slug}>
            {v.name} — {v.address} (capacity {v.capacity})
          </li>
        ))}
      </ul>
    </section>
  );
}
