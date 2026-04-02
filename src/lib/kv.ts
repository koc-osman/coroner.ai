import { kv } from '@vercel/kv';
import type { AutopsyReport, LeaderboardEntry } from './types';

// ── Reports ──────────────────────────────────────────────────────────────────

export async function saveReport(report: AutopsyReport): Promise<void> {
  await kv.set(`report:${report.id}`, report);
}

export async function getReport(id: string): Promise<AutopsyReport | null> {
  return kv.get<AutopsyReport>(`report:${id}`);
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
// Each job is stored under its own key: leaderboard:job:<title>
// This avoids read-modify-write races on a single array key.

function jobKey(jobTitle: string): string {
  return `leaderboard:job:${jobTitle}`;
}

export async function updateLeaderboard(
  jobCategory: string,
  score: number
): Promise<void> {
  const key = jobKey(jobCategory);
  const existing = await kv.get<LeaderboardEntry>(key);

  if (existing === null) {
    await kv.set(key, {
      job_title: jobCategory,
      total_autopsies: 1,
      average_score: score,
    } satisfies LeaderboardEntry);
  } else {
    const newTotal = existing.total_autopsies + 1;
    await kv.set(key, {
      job_title: jobCategory,
      total_autopsies: newTotal,
      average_score: Math.round(
        (existing.average_score * existing.total_autopsies + score) / newTotal
      ),
    } satisfies LeaderboardEntry);
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const keys = await kv.keys('leaderboard:job:*');
    if (keys.length === 0) return [];

    const values = await kv.mget<LeaderboardEntry[]>(...keys);
    return values.filter((v): v is LeaderboardEntry => v !== null);
  } catch {
    return [];
  }
}

// ── Daily counter ─────────────────────────────────────────────────────────────

function dailyKey(): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `daily:count:${date}`;
}

export async function incrementDailyCount(): Promise<number> {
  const key = dailyKey();
  const count = await kv.incr(key);
  // Set TTL on first increment so the key auto-expires after 48h
  if (count === 1) {
    await kv.expire(key, 48 * 60 * 60);
  }
  return count;
}

export async function getDailyCount(): Promise<number> {
  return (await kv.get<number>(dailyKey())) ?? 0;
}
