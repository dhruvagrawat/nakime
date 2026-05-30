'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ExternalLink, RefreshCw, AlertOctagon } from 'lucide-react';

interface Threat {
  id: string;
  name: string;
  vendor: string;
  product: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
  due?: string;
  source: string;
  description?: string;
}

interface ThreatData {
  threats: Threat[];
  stats: {
    cisa_total?: number;
    active_cves?: number;
    threat_level?: string;
  };
}

const SEV_COLOR = {
  CRITICAL: 'var(--alert-red)',
  HIGH:     '#ff6b35',
  MEDIUM:   'var(--gold-primary)',
  LOW:      'var(--text-muted)',
};

const SEV_BG = {
  CRITICAL: 'rgba(255,59,48,0.10)',
  HIGH:     'rgba(255,107,53,0.08)',
  MEDIUM:   'rgba(212,175,55,0.08)',
  LOW:      'rgba(255,255,255,0.03)',
};

function daysAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

export default function CyberNewsPanel() {
  const [data,    setData]    = useState<ThreatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch('/api/cyber-threats');
      if (!r.ok) return;
      setData(await r.json());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const iv = setInterval(fetch_, 1800_000); // 30 min
    return () => clearInterval(iv);
  }, [fetch_]);

  const threats = data?.threats ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel overflow-hidden flex flex-col"
      style={{ maxHeight: '420px' }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[var(--border-primary)] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-[var(--alert-red)]" />
          <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-[var(--text-heading)]">CYBER THREAT INTEL</span>
          {data?.stats?.threat_level && (
            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{ background: SEV_BG[data.stats.threat_level as keyof typeof SEV_BG] ?? SEV_BG.HIGH, color: SEV_COLOR[data.stats.threat_level as keyof typeof SEV_COLOR] ?? '#ff6b35' }}>
              {data.stats.threat_level}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data?.stats?.cisa_total && (
            <span className="text-[8px] font-mono text-[var(--text-muted)]">
              CISA KEV: {data.stats.cisa_total}
            </span>
          )}
          <button onClick={fetch_} className="p-1 hover:text-[var(--cyan-primary)] transition-colors">
            <RefreshCw className="w-3 h-3 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto styled-scrollbar flex-1 min-h-0">
        {loading && (
          <div className="flex items-center justify-center py-5 gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-primary)] animate-osiris-pulse" />
            <span className="text-[10px] font-mono text-[var(--text-muted)]">LOADING THREAT FEED...</span>
          </div>
        )}

        {!loading && threats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <AlertOctagon className="w-5 h-5 text-[var(--text-muted)]" />
            <span className="text-[10px] font-mono text-[var(--text-muted)]">NO ACTIVE THREATS LOADED</span>
          </div>
        )}

        {threats.map(t => (
          <div key={t.id}
            className="border-b border-[var(--border-primary)]/30 cursor-pointer hover:bg-white/[0.02] transition-colors"
            onClick={() => setExpanded(e => e === t.id ? null : t.id)}
          >
            <div className="px-3 py-2 flex items-start gap-2">
              <span className="flex-shrink-0 text-[8px] font-mono font-bold px-1 py-0.5 rounded mt-0.5"
                style={{ background: SEV_BG[t.severity], color: SEV_COLOR[t.severity] }}>
                {t.severity.slice(0, 4)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] font-mono font-bold text-[var(--cyan-primary)]">{t.id}</span>
                  <span className="ml-auto text-[8px] font-mono text-[var(--text-muted)]">{daysAgo(t.date)}</span>
                </div>
                <p className="text-[9px] font-mono text-[var(--text-primary)] leading-snug line-clamp-2">{t.name}</p>
                <p className="text-[8px] font-mono text-[var(--text-muted)] mt-0.5">{t.vendor} — {t.product}</p>
              </div>
            </div>

            {expanded === t.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-3 pb-2 border-t border-[var(--border-primary)]/20"
                style={{ background: SEV_BG[t.severity] }}
              >
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {[
                    ['VENDOR',  t.vendor],
                    ['PRODUCT', t.product],
                    ['SOURCE',  t.source],
                    ['DUE',     t.due ?? '—'],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div className="text-[7px] font-mono text-[var(--text-muted)] tracking-wider">{label}</div>
                      <div className="text-[9px] font-mono text-[var(--text-primary)]">{val}</div>
                    </div>
                  ))}
                </div>
                <a
                  href={`https://nvd.nist.gov/vuln/detail/${t.id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-[8px] font-mono text-[var(--cyan-primary)] hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  <ExternalLink className="w-2.5 h-2.5" /> View in NVD
                </a>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
