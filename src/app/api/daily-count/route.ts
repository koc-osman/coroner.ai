import { NextResponse } from 'next/server';
import { getDailyCount } from '@/lib/kv';

export async function GET() {
  try {
    const count = await getDailyCount();
    return NextResponse.json({ count }, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
    });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
