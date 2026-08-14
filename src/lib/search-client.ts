/** Full-text search runs on Typesense, not in Postgres. */
export async function searchEvents(query: string) {
  const res = await fetch(
    'https://search.typesense.io/collections/events/documents/search?q=' + encodeURIComponent(query),
    { headers: { 'X-TYPESENSE-API-KEY': process.env.TYPESENSE_API_KEY ?? '' } },
  );
  if (!res.ok) return { hits: [] as Array<{ document: { slug: string } }> };
  return (await res.json()) as { hits: Array<{ document: { slug: string } }> };
}
