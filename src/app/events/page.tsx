/** Listings — every show currently on sale. */

async function getEvents() {
  const res = await fetch('/api/events', { cache: 'no-store' });
  return res.json();
}

export default async function EventsPage() {
  const { events } = await getEvents();
  return (
    <section>
      <h1>What&apos;s on</h1>
      <ul>
        {events.map((e: { slug: string; title: string; city: string; startsAt: string }) => (
          <li key={e.slug}>
            <a href={`/events/${e.slug}`}>{e.title}</a> — {e.city} · {e.startsAt}
          </li>
        ))}
      </ul>
    </section>
  );
}
