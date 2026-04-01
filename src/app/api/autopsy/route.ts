import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { kv } from '@vercel/kv';
import { parseScreenshot, generateAutopsy } from '@/lib/ai';
import type { AutopsyReport, LeaderboardEntry } from '@/lib/types';

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

async function updateLeaderboard(report: AutopsyReport): Promise<void> {
  const key = 'leaderboard';
  const existing = (await kv.get<LeaderboardEntry[]>(key)) ?? [];

  const jobCategory = report.job_category;
  const score = report.ai_exposure_score.score;

  const idx = existing.findIndex((e) => e.job_title === jobCategory);
  if (idx === -1) {
    existing.push({ job_title: jobCategory, total_autopsies: 1, average_score: score });
  } else {
    const entry = existing[idx];
    const newTotal = entry.total_autopsies + 1;
    existing[idx] = {
      job_title: jobCategory,
      total_autopsies: newTotal,
      average_score: Math.round((entry.average_score * entry.total_autopsies + score) / newTotal),
    };
  }

  // Keep top 20 by total autopsies
  existing.sort((a, b) => b.total_autopsies - a.total_autopsies);
  await kv.set(key, existing.slice(0, 20));
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const ip = await getClientIp(headersList);

    // Rate limiting
    const { allowed, remaining } = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You may submit 5 autopsies per day.' },
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
        { error: 'Invalid file type. Accepted formats: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
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
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Failed to parse screenshot' },
        { status: 422 }
      );
    }

    let report: AutopsyReport;
    try {
      report = await generateAutopsy(profile);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Failed to generate autopsy report' },
        { status: 500 }
      );
    }

    // Persist to KV (best-effort — non-fatal if KV is unavailable)
    try {
      await kv.set(`report:${report.id}`, report);
      await updateLeaderboard(report);
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
