import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getReport } from '@/lib/kv';

export const runtime = 'nodejs';

const W = 1200;
const H = 630;

const RED = '#E24B4A';
const DARK = '#1a1a1a';
const GRAY = '#6b7280';
const LIGHT_GRAY = '#f3f4f6';

function severityColor(severity: string): string {
  switch (severity) {
    case 'FLATLINED':    return '#b91c1c';
    case 'CRITICAL':     return RED;
    case 'TERMINAL':     return '#ea580c';
    case 'LIFE SUPPORT': return '#d97706';
    default:             return '#16a34a'; // MILD SYMPTOMS
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // ── Fallback image (no id or report not found) ──────────────────────────
  if (!id) {
    return fallbackImage();
  }

  let report;
  try {
    report = await getReport(id);
  } catch {
    report = null;
  }

  if (!report) {
    return fallbackImage();
  }

  const {
    subject_name,
    subject_title,
    ai_exposure_score: { score, severity, severity_label },
    career_death_date,
    case_number,
  } = report;

  const sColor = severityColor(severity);

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Red left accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 8,
            height: H,
            background: RED,
          }}
        />

        {/* Top band */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '40px 60px 0 60px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: DARK, letterSpacing: '-0.5px' }}>
              dexter
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: RED, letterSpacing: '-0.5px' }}>
              me
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: GRAY, letterSpacing: '-0.5px' }}>
              .ai
            </span>
          </div>
          <span style={{ fontSize: 13, color: '#9ca3af', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Case #{case_number} · Kill File
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            padding: '36px 60px 0 60px',
            gap: 48,
          }}
        >
          {/* Left column: name + score */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Subject name */}
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: DARK,
                lineHeight: 1.05,
                letterSpacing: '-1.5px',
                marginBottom: 8,
              }}
            >
              {subject_name}
            </div>

            {/* Subject title */}
            <div
              style={{
                fontSize: 20,
                color: GRAY,
                lineHeight: 1.3,
                marginBottom: 36,
                maxWidth: 520,
              }}
            >
              {subject_title}
            </div>

            {/* Score row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span
                  style={{
                    fontSize: 96,
                    fontWeight: 900,
                    color: RED,
                    lineHeight: 1,
                    letterSpacing: '-3px',
                  }}
                >
                  {score}
                </span>
                <span style={{ fontSize: 28, color: '#9ca3af', fontWeight: 500 }}>/100</span>
              </div>

              {/* Severity badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: sColor,
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '8px 18px',
                  borderRadius: 6,
                  marginBottom: 12,
                }}
              >
                {severity}
              </div>
            </div>

            {/* Severity one-liner */}
            <div
              style={{
                fontSize: 18,
                color: GRAY,
                fontStyle: 'italic',
                lineHeight: 1.4,
                maxWidth: 540,
              }}
            >
              &ldquo;{severity_label}&rdquo;
            </div>
          </div>

          {/* Right column: death date card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: LIGHT_GRAY,
              borderRadius: 16,
              padding: '32px 36px',
              width: 260,
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Career death date
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: RED,
                textAlign: 'center',
                lineHeight: 1.15,
                letterSpacing: '-0.5px',
              }}
            >
              {career_death_date}
            </div>
            <div
              style={{
                width: 40,
                height: 2,
                background: '#e5e7eb',
                marginTop: 8,
                marginBottom: 8,
              }}
            />
            <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 1.4 }}>
              {report.months_remaining} months remaining
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 60px',
            marginTop: 'auto',
            borderTop: '1px solid #f3f4f6',
          }}
        >
          <span style={{ fontSize: 14, color: '#d1d5db' }}>
            dexterme.ai — AI career forensics
          </span>
          <span style={{ fontSize: 14, color: '#d1d5db' }}>
            Find out when AI puts you on the kill table →
          </span>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}

function fallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span style={{ fontSize: 72, fontWeight: 900, color: DARK, letterSpacing: '-2px' }}>
            dexter
          </span>
          <span style={{ fontSize: 72, fontWeight: 900, color: RED, letterSpacing: '-2px' }}>
            me
          </span>
          <span style={{ fontSize: 72, fontWeight: 900, color: GRAY, letterSpacing: '-2px' }}>
            .ai
          </span>
        </div>
        <div style={{ fontSize: 24, color: GRAY, textAlign: 'center', maxWidth: 600 }}>
          Upload your LinkedIn.
          Find out when AI puts you on the kill table.
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
