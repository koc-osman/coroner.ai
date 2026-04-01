'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  careerDeathDate: string;
  score: number;
  severity: string;
  monthsRemaining: number;
}

export default function ShareButtons({
  careerDeathDate,
  score,
  severity,
  monthsRemaining,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const xText = encodeURIComponent(
    `I just got autopsied by AI. Career death date: ${careerDeathDate}. AI Exposure: ${score}/100 (${severity}). Get yours → coroner.ai`
  );
  const xUrl = `https://twitter.com/intent/tweet?text=${xText}`;

  const linkedInText = encodeURIComponent(
    `coroner.ai just performed a career autopsy on me. ${monthsRemaining} months to live. Try it yourself.`
  );
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.href : ''
  )}&summary=${linkedInText}`;

  async function handleCopy() {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex gap-2">
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
      >
        <XIcon />
        Share on X
      </a>

      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#0A66C2] text-white text-xs font-semibold hover:bg-[#004182] transition-colors"
      >
        <LinkedInIcon />
        LinkedIn
      </a>

      <button
        onClick={handleCopy}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
      >
        {copied ? (
          <>
            <CheckIcon />
            Copied!
          </>
        ) : (
          <>
            <LinkIcon />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
