'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, RefreshCw, ChevronDown } from 'lucide-react';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  source: 'wazuh' | 'suricata' | 'splunk';
  severity: Severity;
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
}

export interface AlertStats {
  critical: number; high: number; medium: number; low: number;
  total: number; wazuh_ok: boolean; suricata_ok: boolean;
}

export const SEV_COLOR: Record<Severity, string> = {
  critical: 'var(--alert-red)', high: '#ff6b35',
  medium: 'var(--gold-primary)', low: 'var(--text-muted)',
};
export const SEV_BG: Record<Severity, string> = {
  critical: 'rgba(255,59,48,0.12)', high: 'rgba(255,107,53,0.10)',
  medium: 'rgba(212,175,55,0.10)', low: 'rgba(255,255,255,0.04)',
};
export const SEV_BORDER: Record<Severity, string> = {
  critical: 'rgba(255,59,48,0.35)', high: 'rgba(255,107,53,0.25)',
  medium: 'rgba(212,175,55,0.20)', low: 'rgba(255,255,255,0.08)',
};

export function relTime(ts: string | null): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '—';
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

const SRC: Record<string, string> = { wazuh: 'W', suricata: 'S', splunk: 'P' };

interface Props {
  defaultCollapsed?: boolean;
  onAlertExpand?: (alert: Alert) => void;
}

export default function SecurityAlertPanel({ defaultCollapsed = false, onAlertExpand }: Props) {
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [stats,  setStats]    = useState<AlertStats | null>(null);
  const [filter, setFilter]   = useState<Severity | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const prevIds = useRef<Set<string>>(new Set());
  const [newIds, setNewIds]   = useState<Set<string>>(new Set());

  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch('/api/volt/alerts');
      if (!r.ok) return;
      const d = await r.json();
      const inc: Alert[] = d.alerts ?? [];
      const fresh = new Set(inc.map(a => a.id).filter(id => !prevIds.current.has(id)));
      if (fresh.size) { setNewIds(fresh); setTimeout(() => setNewIds(new Set()), 3000); }
      inc.forEach(a => prevIds.current.add(a.id));
      setAlerts(inc); setStats(d.stats ?? null);
    } catch { /**/ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); const iv = setInterval(fetch_, 10_000); return () => clearInterval(iv); }, [fetch_]);

  const visible = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
      className="glass-panel overflow-hidden flex flex-col">

      {/* ── Header / collapse toggle ── */}
      <button onClick={() => setCollapsed(c => !c)}
        className="px-3 py-2.5 border-b border-(--border-primary) flex items-center gap-2 w-full hover:bg-white/2 transition-colors">
        <Shield className="w-3.5 h-3.5 text-(--alert-red) shrink-0" />
        <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-(--text-heading) flex-1 text-left">SECURITY ALERTS</span>
        {stats && stats.total > 0 && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
            style={{ background: SEV_BG.critical, color: SEV_COLOR.critical, border: `1px solid ${SEV_BORDER.critical}` }}>
            {stats.total}
          </span>
        )}
        {stats && (
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <span className="text-[8px] font-mono text-(--text-muted)">W</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: stats.wazuh_ok ? 'var(--alert-green)' : 'var(--alert-red)' }} />
            <span className="text-[8px] font-mono text-(--text-muted)">S</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: stats.suricata_ok ? 'var(--alert-green)' : 'var(--alert-red)' }} />
          </div>
        )}
        <button onClick={e => { e.stopPropagation(); fetch_(); }} className="p-0.5 hover:text-(--cyan-primary) transition-colors">
          <RefreshCw className="w-3 h-3 text-(--text-muted)" />
        </button>
        <ChevronDown className={`w-3.5 h-3.5 text-(--text-muted) transition-transform duration-200 shrink-0 ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden flex flex-col">

            {/* Severity filter */}
            {stats && (
              <div className="grid grid-cols-4 px-3 py-1.5 gap-1 shrink-0 border-b border-(--border-primary)/40">
                {(['critical','high','medium','low'] as Severity[]).map(sev => (
                  <button key={sev} onClick={() => setFilter(f => f === sev ? 'all' : sev)}
                    className="text-center py-1 rounded transition-all"
                    style={{ background: filter === sev ? SEV_BG[sev] : 'transparent', border: `1px solid ${filter === sev ? SEV_BORDER[sev] : 'transparent'}` }}>
                    <div className="text-[11px] font-mono font-bold" style={{ color: SEV_COLOR[sev] }}>{stats[sev]}</div>
                    <div className="text-[8px] font-mono text-(--text-muted) uppercase tracking-wider">{sev.slice(0,3)}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Alert list */}
            <div className="overflow-y-auto styled-scrollbar" style={{ maxHeight: '300px' }}>
              {loading && (
                <div className="flex items-center justify-center py-6 gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-(--cyan-primary) animate-osiris-pulse" />
                  <span className="text-[10px] font-mono text-(--text-muted)">CONNECTING...</span>
                </div>
              )}
              {!loading && visible.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <Eye className="w-5 h-5 text-(--alert-green)" />
                  <span className="text-[10px] font-mono text-(--alert-green)">NO ALERTS — NOMINAL</span>
                </div>
              )}
              <AnimatePresence initial={false}>
                {visible.map(alert => (
                  <motion.div key={alert.id} layout
                    initial={newIds.has(alert.id) ? { opacity: 0, x: 10 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-b border-(--border-primary)/30 cursor-pointer hover:bg-white/3 transition-colors group"
                    style={{ background: newIds.has(alert.id) ? SEV_BG[alert.severity] : undefined }}
                    onClick={() => onAlertExpand?.(alert)}
                  >
                    <div className="px-3 py-2 flex items-start gap-2">
                      <span className="shrink-0 w-4 h-4 rounded text-[8px] font-mono font-bold flex items-center justify-center mt-0.5"
                        style={{ background: SEV_BG[alert.severity], color: SEV_COLOR[alert.severity], border: `1px solid ${SEV_BORDER[alert.severity]}` }}>
                        {SRC[alert.source] ?? '?'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wider" style={{ color: SEV_COLOR[alert.severity] }}>
                            {alert.severity}
                          </span>
                          {alert.action === 'blocked' && (
                            <span className="px-1 rounded text-[7px] font-mono" style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--cyan-primary)' }}>BLOCKED</span>
                          )}
                          <span className="ml-auto text-[8px] font-mono text-(--text-muted)">{relTime(alert.timestamp)}</span>
                        </div>
                        <p className="text-[10px] font-mono text-foreground leading-snug truncate">{alert.message}</p>
                        {alert.agent && <p className="text-[8px] font-mono text-(--text-muted) mt-0.5">agent: {alert.agent}</p>}
                      </div>
                      <span className="text-[7px] font-mono text-(--text-muted) shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">VIEW ›</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
