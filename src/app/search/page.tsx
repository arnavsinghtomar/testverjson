/** Search results. */

async function search(q: string) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
  return res.json();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { results } = await search(q ?? '');
  return (
    <section>
      <h1>Search</h1>
      <ul>
        {results.map((r: { slug: string; title: string; price: number }) => (
          <li key={r.slug}>
            <a href={`/events/${r.slug}`}>{r.title}</a> — £{r.price}
          </li>
        ))}
      </ul>
    </section>
  );
}
