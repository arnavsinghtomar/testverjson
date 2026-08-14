/** Resolve the signed-in user from the session cookie. */
import type { NextRequest } from 'next/server';

export async function currentUserId(req: NextRequest): Promise<string | null> {
  const raw = req.cookies.get('rh_session')?.value;
  if (!raw) return null;
  const [userId] = raw.split('.');
  return userId || null;
}
