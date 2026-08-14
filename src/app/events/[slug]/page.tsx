/** Event detail — the show, its tiers, and what people said. */

async function getEvent(slug: string) {
  const res = await fetch(`/api/events/${slug}`, { cache: 'no-store' });
  return res.json();
}

async function getReviews(slug: string) {
  const res = await fetch(`/api/reviews/${slug}`, { cache: 'no-store' });
  return res.json();
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  const { reviews } = await getReviews(slug);

  return (
    <article>
      <h1>{event.title}</h1>
      <p>{event.venue}</p>
      <p>Door price £{event.doorPrice}</p>
      <ul>
        {event.tiers.map((t: { id: string; name: string; price: number; remaining: number }) => (
          <li key={t.id}>
            {t.name} — £{t.price} ({t.remaining} left)
          </li>
        ))}
      </ul>
      <h2>Reviews</h2>
      <ul>
        {reviews.map((r: { author: string; rating: number; body: string }, i: number) => (
          <li key={i}>
            {r.rating}/5 — {r.body} — {r.author}
          </li>
        ))}
      </ul>
    </article>
  );
}
