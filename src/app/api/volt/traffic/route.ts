import { NextResponse } from 'next/server';

const VOLT = process.env.VOLT_SERVER_URL ?? 'http://localhost:8000';

let cache: { data: unknown; expires: number } = { data: null, expires: 0 };

export async function GET() {
  if (cache.data && Date.now() < cache.expires) {
    return NextResponse.json(cache.data);
  }
  const [statsR, hostsR, suricataR] = await Promise.allSettled([
    fetch(`${VOLT}/ntopng/stats`,     { signal: AbortSignal.timeout(8_000) }),
    fetch(`${VOLT}/ntopng/top-hosts`, { signal: AbortSignal.timeout(8_000) }),
    fetch(`${VOLT}/suricata/stats`,   { signal: AbortSignal.timeout(8_000) }),
  ]);

  const stats    = statsR.status    === 'fulfilled' && statsR.value.ok    ? await statsR.value.json()    : null;
  const topHosts = hostsR.status    === 'fulfilled' && hostsR.value.ok    ? await hostsR.value.json()    : null;
  const surStats = suricataR.status === 'fulfilled' && suricataR.value.ok ? await suricataR.value.json() : null;

  const result = {
    interface: stats,
    top_hosts: topHosts,
    suricata_stats: surStats,
    sources: {
      ntopng:   stats    !== null,
      suricata: surStats !== null,
    },
    timestamp: new Date().toISOString(),
  };

  cache = { data: result, expires: Date.now() + 15_000 };
  return NextResponse.json(result);
}
