/**
 * Seed script: pre-populates leaderboard with common job titles and their
 * estimated AI exposure scores (based on BLS / Karpathy data).
 *
 * Usage:
 *   npx tsx src/scripts/seed-leaderboard.ts
 *
 * Requires KV_REST_API_URL and KV_REST_API_TOKEN to be set in .env.local
 */

import { config } from 'dotenv';
import path from 'path';

// Load .env.local before importing kv (which reads env vars on import)
config({ path: path.resolve(process.cwd(), '.env.local') });

import { kv } from '@vercel/kv';
import type { LeaderboardEntry } from '../lib/types';

const SEED_DATA: Array<{ job_title: string; average_score: number }> = [
  { job_title: 'Data Entry Clerk',          average_score: 96 },
  { job_title: 'Telemarketer',               average_score: 94 },
  { job_title: 'Content Marketing Manager', average_score: 91 },
  { job_title: 'Copywriter',                average_score: 89 },
  { job_title: 'Social Media Manager',      average_score: 88 },
  { job_title: 'Graphic Designer',          average_score: 85 },
  { job_title: 'Financial Analyst',         average_score: 84 },
  { job_title: 'Product Manager',           average_score: 82 },
  { job_title: 'Paralegal',                 average_score: 81 },
  { job_title: 'Software Developer',        average_score: 79 },
  { job_title: 'UX Designer',              average_score: 78 },
  { job_title: 'Accountant',               average_score: 77 },
  { job_title: 'HR Generalist',            average_score: 75 },
  { job_title: 'Project Manager',          average_score: 74 },
  { job_title: 'Business Analyst',         average_score: 73 },
  { job_title: 'Marketing Manager',        average_score: 72 },
  { job_title: 'Technical Writer',         average_score: 71 },
  { job_title: 'Founder/CEO (SaaS)',       average_score: 70 },
  { job_title: 'Sales Representative',     average_score: 68 },
  { job_title: 'Management Consultant',    average_score: 65 },
  { job_title: 'Teacher',                  average_score: 58 },
  { job_title: 'Registered Nurse',         average_score: 42 },
  { job_title: 'Police Officer',           average_score: 38 },
  { job_title: 'Veterinarian',             average_score: 35 },
  { job_title: 'Electrician',              average_score: 18 },
  { job_title: 'Plumber',                  average_score: 15 },
  { job_title: 'Firefighter',              average_score: 12 },
  { job_title: 'Surgeon',                  average_score: 10 },
  { job_title: 'Construction Worker',      average_score:  9 },
  { job_title: 'Roofer',                   average_score:  6 },
];

async function seed() {
  console.log(`Seeding ${SEED_DATA.length} job titles...\n`);

  for (const { job_title, average_score } of SEED_DATA) {
    const key = `leaderboard:job:${job_title}`;
    const entry: LeaderboardEntry = {
      job_title,
      total_autopsies: 100,
      average_score,
    };
    await kv.set(key, entry);
    console.log(`  ✓  ${job_title.padEnd(30)} score=${average_score}`);
  }

  console.log('\nDone. Leaderboard seeded successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
