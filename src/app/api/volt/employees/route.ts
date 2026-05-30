import { NextResponse } from 'next/server';

const VOLT = process.env.VOLT_SERVER_URL ?? 'http://localhost:8000';

export async function GET() {
  try {
    const r = await fetch(`${VOLT}/employees/presence`, { signal: AbortSignal.timeout(8_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return NextResponse.json(await r.json());
  } catch (e) {
    return NextResponse.json({ employees: [], active_count: 0, total: 0, error: (e as Error).message }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const r = await fetch(`${VOLT}/employees/checkin`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(8_000),
    });
    return NextResponse.json(await r.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
