'use client';

import { useEffect, useRef, useState } from 'react';

const MESSAGES = [
  'Spreading the plastic wrap...',
  'Analyzing blood spatter patterns...',
  'Consulting the Dark Passenger...',
  'Calculating time of death...',
  'Preparing the kill table...',
];

export default function LoadingAnimation() {
  const [visibleCount, setVisibleCount] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisibleCount((c) => {
        if (c >= MESSAGES.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return c;
        }
        return c + 1;
      });
    }, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Progress: based on messages revealed
  const progress = (visibleCount / MESSAGES.length) * 100;

  return (
    <div className="py-6 px-2 flex flex-col items-center gap-5">
      {/* Pulsing icon */}
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-[#E24B4A]/10 animate-ping absolute" />
        <div className="w-8 h-8 rounded-full bg-[#E24B4A]/20 flex items-center justify-center relative z-10">
          <SkullIcon className="w-4 h-4 text-[#E24B4A]" />
        </div>
      </div>

      {/* Message log */}
      <div className="w-full space-y-2">
        {MESSAGES.slice(0, visibleCount).map((msg, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm text-gray-600 animate-fade-in"
          >
            <span className="text-[#E24B4A] text-xs">›</span>
            <span className={i === visibleCount - 1 ? 'font-medium text-gray-800' : 'text-gray-400'}>
              {msg}
            </span>
            {i === visibleCount - 1 && (
              <span className="inline-flex gap-0.5 ml-1">
                <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#E24B4A] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function SkullIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a9 9 0 0 1 9 9c0 3.18-1.65 5.97-4.13 7.6V21a1 1 0 0 1-1 1H8.13a1 1 0 0 1-1-1v-2.4A9 9 0 0 1 12 2zm-2 14v3h4v-3h-4zm-1-4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm6 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    </svg>
  );
}
