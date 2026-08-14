/** GET /api/tags — the genre tree. */

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tags } from '@/db/schema';

export async function GET() {
  const rows = await db.select().from(tags);
  return NextResponse.json({
    tags: rows.map((t) => ({ slug: t.slug, name: t.name, parent: t.parentId })),
  });
}
