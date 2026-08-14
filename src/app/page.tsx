/** Home — the next few shows on sale. */

async function getEvents() {
  const res = await fetch('/api/events', { cache: 'no-store' });
  return res.json();
}

export default async function HomePage() {
  const { events, from } = await getEvents();
  return (
    <section>
      <h1>Tonight and beyond</h1>
      <p>Tickets from £{from}</p>
      <ul>
        {events.map((e: { slug: string; title: string; venue: string; doorPrice: number }) => (
          <li key={e.slug}>
            <a href={`/events/${e.slug}`}>{e.title}</a> — {e.venue} · £{e.doorPrice}
          </li>
        ))}
      </ul>
    </section>
  );
}
