/** Venue page — photos, capacity, and what's coming up. */

async function getVenue(slug: string) {
  const res = await fetch(`/api/venues/${slug}`, { cache: 'no-store' });
  return res.json();
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = await getVenue(slug);

  return (
    <article>
      <h1>{venue.name}</h1>
      <p>{venue.address} · capacity {venue.capacity}</p>
      <ul>
        {venue.photos.map((p: { url: string; caption: string; credit: string }) => (
          <li key={p.url}>
            {p.caption} — {p.credit}
          </li>
        ))}
      </ul>
      <h2>Coming up</h2>
      <ul>
        {venue.upcoming.map((e: { slug: string; title: string; price: number }) => (
          <li key={e.slug}>
            <a href={`/events/${e.slug}`}>{e.title}</a> — £{e.price}
          </li>
        ))}
      </ul>
    </article>
  );
}
