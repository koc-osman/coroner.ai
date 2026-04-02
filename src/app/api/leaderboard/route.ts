import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/kv';
import type { LeaderboardEntry } from '@/lib/types';

// Cache this route for 60 seconds
export const revalidate = 60;

const MIN_AUTOPSIES = 3;

export async function GET() {
  const all: LeaderboardEntry[] = await getLeaderboard();

  // Include entries with >= MIN_AUTOPSIES, unless all are below threshold
  // (i.e. freshly seeded data with total_autopsies set to 100 will always pass)
  const qualified = all.filter((e) => e.total_autopsies >= MIN_AUTOPSIES);
  const entries = qualified.length > 0 ? qualified : all;

  // Most dead: sorted by average_score descending
  const most_dead = [...entries]
    .sort((a, b) => b.average_score - a.average_score)
    .slice(0, 10);

  // Survivors: sorted by average_score ascending
  const survivors = [...entries]
    .sort((a, b) => a.average_score - b.average_score)
    .slice(0, 10);

  return NextResponse.json(
    { most_dead, survivors },
    {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
