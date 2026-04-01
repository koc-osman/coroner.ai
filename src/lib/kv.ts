import { kv } from '@vercel/kv';
import type { AutopsyReport, LeaderboardEntry } from './types';

export async function saveReport(report: AutopsyReport): Promise<void> {
  await kv.set(`report:${report.id}`, report);
}

export async function getReport(id: string): Promise<AutopsyReport | null> {
  return kv.get<AutopsyReport>(`report:${id}`);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return (await kv.get<LeaderboardEntry[]>('leaderboard')) ?? [];
}
