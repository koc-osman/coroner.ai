import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { kv } from '@vercel/kv';
import { parseScreenshot, generateAutopsy } from '@/lib/ai';
import { saveReport, updateLeaderboard, incrementDailyCount } from '@/lib/kv';
import type { AutopsyReport } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_SECONDS = 24 * 60 * 60; // 24 hours

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function getClientIp(headersList: Awaited<ReturnType<typeof headers>>): Promise<string> {
  return (
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
    headersList.get('x-real-ip') ??
    'unknown'
  );
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${ip}`;
  try {
    const count = await kv.get<number>(key);

    if (count === null) {
      await kv.set(key, 1, { ex: RATE_LIMIT_WINDOW_SECONDS });
      return { allowed: true, remaining: RATE_LIMIT - 1 };
    }

    if (count >= RATE_LIMIT) {
      return { allowed: false, remaining: 0 };
    }

    await kv.incr(key);
    return { allowed: true, remaining: RATE_LIMIT - count - 1 };
  } catch (err) {
    // If KV is not configured, allow the request (fail open)
    console.warn('[autopsy] Rate limit check skipped (KV unavailable):', err instanceof Error ? err.message : err);
    return { allowed: true, remaining: RATE_LIMIT };
  }
}


export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const ip = await getClientIp(headersList);

    // Rate limiting
    const { allowed, remaining } = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "You've used all your autopsies for today. Come back tomorrow." },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': '0' },
        }
      );
    }

    // Parse multipart form
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid request: expected multipart/form-data' }, { status: 400 });
    }

    const file = formData.get('image');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing required field: image' }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. The morgue only accepts JPEG, PNG, or WebP images.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "This file is too large. We're a morgue, not a warehouse. Max 5MB." },
        { status: 400 }
      );
    }

    // Convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';

    // AI pipeline
    let profile;
    try {
      profile = await parseScreenshot(base64, mimeType);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      const isInvalid = msg.toLowerCase().includes('invalid screenshot') || msg.toLowerCase().includes('not a linkedin');
      return NextResponse.json(
        {
          error: isInvalid
            ? "This doesn't look like a LinkedIn profile. The coroner needs a proper body."
            : "The autopsy failed. Even AI has bad days. Try again.",
        },
        { status: 422 }
      );
    }

    let report: AutopsyReport;
    try {
      report = await generateAutopsy(profile);
    } catch {
      return NextResponse.json(
        { error: "The autopsy failed. Even AI has bad days. Try again." },
        { status: 500 }
      );
    }

    // Persist to KV (best-effort — non-fatal if KV is unavailable)
    try {
      await saveReport(report);
      await updateLeaderboard(report.job_category, report.ai_exposure_score.score);
      await incrementDailyCount();
    } catch (err) {
      console.warn('[autopsy] KV persistence failed:', err instanceof Error ? err.message : err);
    }

    return NextResponse.json(report, {
      status: 201,
      headers: { 'X-RateLimit-Remaining': String(remaining) },
    });
  } catch (err) {
    console.error('[autopsy] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
