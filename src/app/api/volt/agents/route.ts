import { NextResponse } from 'next/server';

const VOLT = process.env.VOLT_SERVER_URL ?? 'http://localhost:8000';

let cache: { data: unknown; expires: number } = { data: null, expires: 0 };

export async function GET() {
  if (cache.data && Date.now() < cache.expires) {
    return NextResponse.json(cache.data);
  }
  try {
    const r = await fetch(`${VOLT}/wazuh/agents?limit=500`, {
      signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) throw new Error(`Wazuh agents HTTP ${r.status}`);
    const raw = await r.json() as any;

    const items: any[] = raw?.data?.affected_items ?? [];
    const agents = items.map((a: any) => ({
      id: a.id,
      name: a.name ?? 'unnamed',
      ip: a.ip ?? a.registerIP ?? null,
      os: a.os?.name ?? a.os?.platform ?? 'Unknown',
      os_version: a.os?.version ?? '',
      status: a.status,               // active | disconnected | pending | never_connected
      version: a.version ?? '',
      last_seen: a.lastKeepAlive ?? null,
    }));

    const result = {
      agents,
      counts: {
        total: raw?.data?.total_affected_items ?? agents.length,
        active: agents.filter((a) => a.status === 'active').length,
        disconnected: agents.filter((a) => a.status === 'disconnected').length,
        pending: agents.filter((a) => a.status === 'pending').length,
      },
      timestamp: new Date().toISOString(),
    };

    cache = { data: result, expires: Date.now() + 30_000 };
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { agents: [], counts: { total: 0, active: 0, disconnected: 0, pending: 0 }, error: (e as Error).message },
      { status: 502 },
    );
  }
}
