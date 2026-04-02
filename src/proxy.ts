import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';

const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_SECONDS = 24 * 60 * 60;

export async function proxy(request: NextRequest) {
  // Only rate-limit POST requests to /api/autopsy
  if (request.method !== 'POST') {
    return NextResponse.next();
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  try {
    const key = `ratelimit:${ip}`;
    const count = await kv.get<number>(key);

    if (count !== null && count >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "You've used all your autopsies for today. Come back tomorrow." },
        { status: 429 }
      );
    }
  } catch {
    // KV unavailable — fail open, let the request through
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/autopsy',
};
