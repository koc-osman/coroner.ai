'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadZone from '@/components/UploadZone';
import Leaderboard from '@/components/Leaderboard';

export default function LandingPage() {
  const router = useRouter();

  const handleSuccess = useCallback(
    (reportId: string) => {
      router.push(`/report/${reportId}`);
    },
    [router]
  );

  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-[520px] mx-auto flex flex-col gap-8">

        {/* ── 1. Header ──────────────────────────────────── */}
        <div className="flex flex-col items-center text-center gap-3">
          <SkullIcon className="w-11 h-11 text-[#E24B4A]" />

          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-gray-400">
            Coroner&apos;s Office — AI Division
          </p>

          <h1 className="text-5xl font-black tracking-tight leading-none">
            <span className="text-gray-900">coroner</span>
            <span className="text-[#E24B4A]">.ai</span>
          </h1>

          <p className="text-sm text-gray-500 max-w-[340px] leading-relaxed mt-1">
            We dissect your LinkedIn profile. You find out when AI kills your career.
          </p>
        </div>

        {/* ── 2. Upload card ──────────────────────────────── */}
        <div className="border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-400 mb-4">
            Submit body for examination
          </p>
          <UploadZone onSuccess={handleSuccess} />
        </div>

        {/* ── 3. Leaderboard ──────────────────────────────── */}
        <Leaderboard />

        {/* ── 4. Footer counter ───────────────────────────── */}
        <DeathCounter />

      </div>
    </main>
  );
}

function DeathCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      // daily count lives on a separate endpoint but we reuse the leaderboard
      // fetch timing; the actual per-day count is fetched here independently
      .catch(() => null);

    fetch('/api/daily-count')
      .then((r) => r.json())
      .then((d: { count: number }) => setCount(d.count))
      .catch(() => null);
  }, []);

  return (
    <p className="text-center text-xs text-gray-400 pb-4">
      {count !== null ? (
        <>
          <span className="font-semibold text-gray-600">{count.toLocaleString()}</span>{' '}
          {count === 1 ? 'career' : 'careers'} pronounced dead today
        </>
      ) : (
        <span className="text-gray-300">— careers pronounced dead today</span>
      )}
    </p>
  );
}

function SkullIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Skull dome */}
      <path d="M12 3a7 7 0 0 1 7 7c0 2.8-1.6 5.2-4 6.4V19a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.6C6.6 15.2 5 12.8 5 10a7 7 0 0 1 7-7z" />
      {/* Eye sockets */}
      <circle cx="9.5" cy="10" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="10" r="1.25" fill="currentColor" stroke="none" />
      {/* Teeth */}
      <line x1="9" y1="20" x2="9" y2="19" />
      <line x1="12" y1="20" x2="12" y2="19" />
      <line x1="15" y1="20" x2="15" y2="19" />
    </svg>
  );
}
