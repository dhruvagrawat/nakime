import { NextResponse } from 'next/server';

const VOLT = process.env.VOLT_SERVER_URL ?? 'http://localhost:8000';

export async function GET() {
  try {
    const r = await fetch(`${VOLT}/health/ping`, { signal: AbortSignal.timeout(10_000) });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const services: unknown[] = await req.json();
    const r = await fetch(`${VOLT}/health/check`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(services),
      signal:  AbortSignal.timeout(35_000),
    });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ results: [], error: (e as Error).message }, { status: 502 });
  }
}
