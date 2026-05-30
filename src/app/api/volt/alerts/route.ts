import { NextResponse } from 'next/server';

const VOLT = process.env.VOLT_SERVER_URL ?? 'http://localhost:8000';

type Alert = {
  id: string;
  source: 'wazuh' | 'suricata' | 'splunk';
  severity: 'critical' | 'high' | 'medium' | 'low';
  severity_score: number;
  message: string;
  timestamp: string | null;
  agent?: string;
  src_ip?: string;
  dest_ip?: string;
  proto?: string;
  category?: string;
  action?: string;
  groups?: string[];
};

function wazuhSeverity(level: number): Alert['severity'] {
  if (level >= 12) return 'critical';
  if (level >= 8)  return 'high';
  if (level >= 5)  return 'medium';
  return 'low';
}

function suricataSeverity(sev: number): Alert['severity'] {
  if (sev <= 1) return 'critical';
  if (sev === 2) return 'high';
  if (sev === 3) return 'medium';
  return 'low';
}

export async function GET() {
  const [wazuhR, suricataR] = await Promise.allSettled([
    fetch(`${VOLT}/wazuh/alerts?limit=50`,    { signal: AbortSignal.timeout(8_000) }),
    fetch(`${VOLT}/suricata/alerts?limit=100`, { signal: AbortSignal.timeout(8_000) }),
  ]);

  const alerts: Alert[] = [];

  if (wazuhR.status === 'fulfilled' && wazuhR.value.ok) {
    const d = await wazuhR.value.json() as any;
    for (const item of d?.data?.affected_items ?? []) {
      const lvl = item.rule?.level ?? 0;
      alerts.push({
        id:             `wazuh-${item.id ?? Math.random().toString(36).slice(2)}`,
        source:         'wazuh',
        severity:       wazuhSeverity(lvl),
        severity_score: lvl,
        message:        item.rule?.description ?? 'Wazuh alert',
        timestamp:      item.timestamp ?? null,
        agent:          item.agent?.name ?? 'unknown',
        groups:         item.rule?.groups ?? [],
      });
    }
  }

  if (suricataR.status === 'fulfilled' && suricataR.value.ok) {
    const d = await suricataR.value.json() as any;
    for (const item of d?.alerts ?? []) {
      const sev = item.severity ?? 3;
      alerts.push({
        id:             `suricata-${Math.random().toString(36).slice(2)}`,
        source:         'suricata',
        severity:       suricataSeverity(sev),
        severity_score: (5 - sev) * 3,     // invert: suricata 1=critical → score 12
        message:        item.signature ?? 'Suricata alert',
        timestamp:      item.timestamp ?? null,
        src_ip:         item.src_ip,
        dest_ip:        item.dest_ip,
        proto:          item.proto,
        category:       item.category,
        action:         item.action,
      });
    }
  }

  alerts.sort((a, b) =>
    b.severity_score - a.severity_score ||
    new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime(),
  );

  const stats = {
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high:     alerts.filter((a) => a.severity === 'high').length,
    medium:   alerts.filter((a) => a.severity === 'medium').length,
    low:      alerts.filter((a) => a.severity === 'low').length,
    total:    alerts.length,
    wazuh_ok:    wazuhR.status    === 'fulfilled' && wazuhR.value.ok,
    suricata_ok: suricataR.status === 'fulfilled' && suricataR.value.ok,
  };

  return NextResponse.json({ alerts: alerts.slice(0, 150), stats, timestamp: new Date().toISOString() });
}
