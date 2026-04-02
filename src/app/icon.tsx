import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#E24B4A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Simplified skull: dome + two eyes */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M12 2a8 8 0 0 1 8 8c0 3.2-1.8 6-4.5 7.4V20a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-2.6C5.8 16 4 13.2 4 10a8 8 0 0 1 8-8zm-2.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
