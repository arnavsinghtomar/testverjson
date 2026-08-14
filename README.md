# Roundhouse

Ticketing for independent music venues. Venues programme shows, punters buy
tickets, we don't take a cut of the door.

## Stack

Next.js 16 (App Router) · Drizzle ORM · Postgres · Stripe · Typesense

## Running it

```bash
cp .env.example .env      # fill in DATABASE_URL
npm install
npm run db:push           # create the tables
npm run dev
```

## Shape of the code

| Path | What's there |
|------|--------------|
| `src/db/schema.ts` | Every table. Money is stored in pence as integers. |
| `src/app/api/**` | Route handlers. One folder per resource. |
| `src/app/**/page.tsx` | The storefront. |
| `src/lib/` | Shared helpers — session, slugs, redaction, search client. |

## Conventions

**Money never touches a float.** Prices are `*_cents` integers in the database.
Routes convert at the boundary — `/ 100` on the way out, `Math.round(x * 100)`
on the way in. If you find a float price, it's a bug.

**Card numbers do not get stored.** `maskCard()` keeps the last four digits and
throws the rest away before the row is written.

**Emails are normalised on write.** Trimmed and lowercased, so `Sam@X.com` and
`sam@x.com` can't both register.

## Domain notes

- An **event** belongs to a **venue** and may have a **curator** (staff user).
- **Ticket types** are the tiers on an event — advance, early bird, guest list.
- **Tags** nest: `parent_id` points at a broader tag.
- **`audit_log`** is written by a nightly job that lives in a separate service.
  Nothing in this repo reads or writes it.
- **`/api/internal/metrics`** is scraped by monitoring, not called by the site.
