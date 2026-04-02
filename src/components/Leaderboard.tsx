'use client';

import { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@/lib/types';

interface LeaderboardData {
  most_dead: LeaderboardEntry[];
  survivors: LeaderboardEntry[];
}

type Tab = 'most_dead' | 'survivors';

function scoreColor(score: number): string {
  if (score >= 70) return '#E24B4A';
  if (score >= 40) return '#ef9f27';
  return '#1D9E75';
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('most_dead');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((d: LeaderboardData) => setData(d))
      .catch(() => {/* silently ignore — leaderboard is non-critical */})
      .finally(() => setLoading(false));
  }, []);

  const entries = data ? data[tab] : [];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header + tabs */}
      <div className="flex items-stretch border-b border-gray-200">
        <div className="flex-1 px-5 py-3 flex items-center">
          <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400">
            Career Mortality Index
          </h2>
        </div>
        <div className="flex">
          <TabButton
            active={tab === 'most_dead'}
            onClick={() => setTab('most_dead')}
            label="Most Dead"
          />
          <TabButton
            active={tab === 'survivors'}
            onClick={() => setTab('survivors')}
            label="Survivors"
          />
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <LoadingSkeleton />
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : (
        <ol>
          {entries.map((entry, i) => (
            <li
              key={entry.job_title}
              className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
            >
              {/* Rank */}
              <span className="w-5 text-xs font-mono text-gray-300 shrink-0 text-right">
                {i + 1}
              </span>

              {/* Title */}
              <span className="flex-1 text-sm text-gray-700 truncate min-w-0">
                {entry.job_title}
              </span>

              {/* Score */}
              <span
                className="text-sm font-bold tabular-nums shrink-0"
                style={{ color: scoreColor(entry.average_score) }}
              >
                {entry.average_score}
              </span>

              {/* Autopsy count */}
              <span className="text-xs text-gray-300 tabular-nums shrink-0 w-14 text-right">
                {entry.total_autopsies.toLocaleString()} autopsies
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-3 text-xs font-semibold transition-colors border-b-2',
        active
          ? 'border-[#E24B4A] text-[#E24B4A]'
          : 'border-transparent text-gray-400 hover:text-gray-600',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-5 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-b-0">
          <div className="w-5 h-3 bg-gray-100 rounded animate-pulse" />
          <div className="flex-1 h-3 bg-gray-100 rounded animate-pulse" />
          <div className="w-8 h-3 bg-gray-100 rounded animate-pulse" />
          <div className="w-14 h-3 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-8 text-center">
      <p className="text-xs text-gray-400">No autopsies performed yet.</p>
      <p className="text-xs text-gray-300 mt-1">Be the first victim.</p>
    </div>
  );
}
