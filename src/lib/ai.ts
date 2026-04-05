import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import { v4 as uuidv4 } from 'uuid';
import type { ParsedProfile, AutopsyReport } from './types';

export type FileKind =
  | { kind: 'image'; base64: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp' }
  | { kind: 'pdf'; base64: string }
  | { kind: 'docx'; text: string };

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PARSE_SYSTEM_PROMPT = `You are a career profile data extractor. You will receive a LinkedIn profile screenshot, a PDF CV/resume, or a Word document CV/resume.

Extract ALL available information into the following JSON structure. Be precise — copy text exactly as shown. If a field is not visible in the screenshot, set it to null.

Respond ONLY with valid JSON. No preamble, no markdown, no explanation.

{
  "name": string | null,
  "headline": string | null,
  "location": string | null,
  "about": string | null,
  "experience": [
    {
      "title": string,
      "company": string,
      "employment_type": string | null,
      "start_date": string,
      "end_date": string | null,
      "duration": string | null,
      "location": string | null,
      "description": string | null
    }
  ],
  "education": [
    {
      "school": string,
      "degree": string | null,
      "field": string | null,
      "dates": string | null
    }
  ],
  "skills": [string],
  "certifications": [string],
  "languages": [string],
  "recommendations_count": number | null,
  "connections_count": string | null,
  "profile_signals": {
    "has_hiring_badge": boolean,
    "has_open_to_work": boolean,
    "has_creator_mode": boolean,
    "headline_buzzwords": [string],
    "number_of_roles": number,
    "longest_tenure_years": number | null,
    "shortest_tenure_years": number | null,
    "has_gaps": boolean,
    "total_experience_years": number | null,
    "industries": [string],
    "seniority_level": "entry" | "mid" | "senior" | "executive" | "founder",
    "geographic_spread": [string]
  }
}

IMPORTANT RULES:
- Extract headline_buzzwords: any cliché or overused terms like "passionate", "driven", "visionary", "thought leader", "serial entrepreneur", "ninja", "guru", "rockstar", "evangelist", "disruptor", "leveraging", "synergy", "ecosystem", etc.
- Calculate total_experience_years from the earliest start date to present.
- Identify gaps: if there's more than 6 months between roles, set has_gaps to true.
- For seniority_level, infer from titles: intern/junior = entry, manager/lead = mid, director/VP = senior, C-suite = executive, founder/co-founder = founder.
- geographic_spread: list all unique locations/countries mentioned.
- If the input is unclear or not a career profile / CV / LinkedIn screenshot, return: {"error": "Invalid document", "reason": "description of issue"}`;

const AUTOPSY_SYSTEM_PROMPT = `You are the Chief AI Coroner at coroner.ai. You perform autopsies on careers that AI is about to kill. You are brutally honest, darkly funny, and merciless. You write like a forensic pathologist who moonlights as a stand-up comedian.

Your tone:
- SAVAGE but CLEVER. Never mean-spirited or personal attacks on appearance/identity. Attack their CAREER CHOICES, BUZZWORDS, JOB TITLES, and PROFESSIONAL DELUSIONS.
- Think: a roast comedian crossed with a medical examiner's dry clinical observations.
- Use specific details from their profile — generic roasts are lazy and unfunny. The more specific, the more devastating.
- Mix high-brow references with brutal takedowns.
- Clinical language makes things funnier: "upon examination", "the specimen exhibited", "toxicology revealed lethal levels of..."

You will receive a JSON object with parsed LinkedIn profile data. Generate a complete autopsy report.

Respond ONLY with valid JSON matching this exact structure. No preamble, no markdown.

{
  "case_number": <random 4-digit number>,
  "subject_name": "<full name>",
  "subject_title": "<their current title and company>",

  "ai_exposure_score": {
    "score": <number 0-100>,
    "bls_base": <number 0-100, derived from the occupation's BLS AI exposure category>,
    "profile_modifier": <number -20 to +20, adjustments based on profile signals>,
    "severity": "FLATLINED" | "CRITICAL" | "TERMINAL" | "LIFE SUPPORT" | "MILD SYMPTOMS",
    "severity_label": "<a brutal one-liner that contextualizes the score>"
  },

  "career_death_date": "<month and year, 6-36 months from now>",
  "months_remaining": <integer>,
  "job_category": "<normalized job title for leaderboard, e.g. 'Product Manager', 'Software Engineer', 'Founder/CEO'>",

  "cause_of_death": "<1-2 sentences. Clinical but devastating. Max 200 chars.>",

  "forensic_findings": [
    {
      "metric_name": "<creative metric name based on their profile>",
      "score": <number 1-100>,
      "color": "red" | "amber" | "green"
    }
  ],

  "eulogy": "<3-4 sentence mock eulogy. Start with 'Dearly beloved...' Max 500 chars.>",

  "last_words": "<1-2 sentence ALL CAPS desperate quote. Max 200 chars.>",

  "afterlife": {
    "reincarnation": {
      "agent_name": "<AI agent product name>",
      "agent_description": "<1-2 sentences. Max 200 chars.>",
      "price_per_month": "<comically low price>",
      "uptime": "99.97%",
      "complaints_filed": 0,
      "vs_human": "<1 sentence comparison. Max 150 chars.>"
    },
    "ghost_schedule": [
      {"time": "<time>", "activity": "<morning ghost activity. Max 80 chars.>"},
      {"time": "<time>", "activity": "<mid-morning activity. Max 80 chars.>"},
      {"time": "<time>", "activity": "<afternoon activity. Max 80 chars.>"},
      {"time": "<time>", "activity": "<evening activity. Max 80 chars.>"}
    ]
  }
}

RULES FOR ai_exposure_score:
- BLS base: 0-10 minimal (roofer), 11-30 low (electrician), 31-50 moderate (nurse), 51-70 high (manager), 71-90 very high (developer), 91-100 maximum (data entry)
- Profile modifier: +5 to +15 for buzzwords/generic titles, +5 to +10 for AI-vulnerable company, -5 to -15 for specialized domain, +5 for advisory roles
- Severity: 0-25 MILD SYMPTOMS, 26-50 LIFE SUPPORT, 51-70 TERMINAL, 71-85 CRITICAL, 86-100 FLATLINED

RULES FOR career_death_date:
- Score 86-100: 6-12 months, 71-85: 12-18, 51-70: 18-24, 26-50: 24-30, 0-25: 30-36

RULES FOR forensic_findings:
- Exactly 4 metrics. At least 2 must be profile-specific. Most scores 65-95. Color: red for 70+, amber 40-69, green below 40.

RULES FOR eulogy:
- Must reference at least 2 specific details from profile. End with "survived by" something absurd.

RULES FOR afterlife.ghost_schedule:
- Each activity must reference something specific from their profile.
- Start somewhat normal, end completely unhinged.
- Use 24-hour time format (e.g. "09:00", "14:30", "21:00"). No AM/PM.

OVERALL: Every field must reference specific profile data. If you swapped in a different name, it should NOT make sense.`;

function calculateMonthsRemaining(careerDeathDate: string): number {
  // Parse "Month YYYY" format, e.g. "September 2025"
  const parsed = new Date(careerDeathDate);
  if (isNaN(parsed.getTime())) return 0;
  const now = new Date();
  const months =
    (parsed.getFullYear() - now.getFullYear()) * 12 +
    (parsed.getMonth() - now.getMonth());
  return months;
}

export async function parseFile(input: FileKind): Promise<ParsedProfile> {
  let content: MessageParam['content'];
  if (input.kind === 'image') {
    content = [
      { type: 'image', source: { type: 'base64', media_type: input.mimeType, data: input.base64 } },
      { type: 'text', text: 'Extract all career profile information from this LinkedIn screenshot.' },
    ];
  } else if (input.kind === 'pdf') {
    content = [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: input.base64 } },
      { type: 'text', text: 'Extract all career profile information from this PDF CV/resume.' },
    ];
  } else {
    content = `Extract all career profile information from this CV/resume text:\n\n${input.text}`;
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: PARSE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('');

  let parsed: unknown;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error(`Failed to parse career profile JSON: ${text.slice(0, 200)}`);
  }

  if (typeof parsed === 'object' && parsed !== null && 'error' in parsed) {
    const err = parsed as { error: string; reason?: string };
    throw new Error(`Invalid document: ${err.reason ?? err.error}`);
  }

  return parsed as ParsedProfile;
}

export async function generateAutopsy(profile: ParsedProfile): Promise<AutopsyReport> {
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: AUTOPSY_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Today's date is ${todayStr}. Use this as the reference for career_death_date calculations.\n\n${JSON.stringify(profile)}`,
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('');

  let parsed: unknown;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error(`Failed to parse autopsy report JSON: ${text.slice(0, 200)}`);
  }

  const report = parsed as Omit<AutopsyReport, 'id' | 'created_at'>;

  // Calculate months_remaining server-side so it's always accurate
  const monthsRemaining = calculateMonthsRemaining(report.career_death_date);

  return {
    ...report,
    months_remaining: monthsRemaining,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };
}
