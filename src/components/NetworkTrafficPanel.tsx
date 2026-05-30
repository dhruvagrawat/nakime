'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, ArrowUpRight, ArrowDownLeft, RefreshCw, Server } from 'lucide-react';

interface InterfaceStats {
  throughput?: { download: number; upload: number };
  flows?: { active: number; idle: number };
  packets?: { received: number; sent: number };
  bytes?: { received: number; sent: number };
  error?: string;
}

interface TopHost {
  name?: string;
  ip?: string;
  bytes?: number;
  pkts?: number;
}

interface SuricataStats {
  uptime?: number;
  detect?: { alert: number };
  flow?: { state?: Record<string, number> };
  capture?: { kernel_packets: number; kernel_drops: number };
  error?: string;
}

interface TrafficData {
  interface: InterfaceStats | null;
  top_hosts: { hosts?: TopHost[] } | null;
  suricata_stats: SuricataStats | null;
  sources: { ntopng: boolean; suricata: boolean };
  timestamp: string;
}

function fmtBytes(n: number): string {
  if (!n || isNaN(n)) return '0 B';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function fmtBps(bps: number): string {
  if (!bps || isNaN(bps)) return '0 bps';
  if (bps < 1000) return `${Math.round(bps)} bps`;
  if (bps < 1_000_000) return `${(bps / 1000).toFixed(1)} Kbps`;
  return `${(bps / 1_000_000).toFixed(2)} Mbps`;
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function NetworkTrafficPanel() {
  const [data,    setData]    = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch('/api/volt/traffic');
      if (!r.ok) return;
      setData(await r.json());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const iv = setInterval(fetch_, 15_000);
    return () => clearInterval(iv);
  }, [fetch_]);

  const iface   = data?.interface;
  const hosts   = data?.top_hosts?.hosts ?? (data?.top_hosts as any)?.rsp ?? [];
  const suriSts = data?.suricata_stats;

  const maxBytes = hosts.reduce((m: number, h: TopHost) => Math.max(m, h.bytes ?? 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-panel overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[var(--border-primary)] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-[var(--cyan-primary)]" />
          <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-[var(--text-heading)]">NETWORK TRAFFIC</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Source indicators */}
          {data && (
            <div className="flex items-center gap-1">
              <span className="text-[7px] font-mono text-[var(--text-muted)]">ntopng</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: data.sources.ntopng ? 'var(--alert-green)' : 'var(--text-muted)' }} />
              <span className="text-[7px] font-mono text-[var(--text-muted)]">suricata</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: data.sources.suricata ? 'var(--alert-green)' : 'var(--text-muted)' }} />
            </div>
          )}
          <button onClick={fetch_} className="p-1 hover:text-[var(--cyan-primary)] transition-colors">
            <RefreshCw className="w-3 h-3 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto styled-scrollbar">
        {loading && (
          <div className="flex items-center justify-center py-5 gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-primary)] animate-osiris-pulse" />
            <span className="text-[10px] font-mono text-[var(--text-muted)]">CONNECTING TO NTOPNG...</span>
          </div>
        )}

        {/* Interface throughput */}
        {iface && !iface.error && (
          <div className="px-3 py-2.5 border-b border-[var(--border-primary)]/40">
            <div className="text-[8px] font-mono text-[var(--text-muted)] tracking-widest mb-1.5">INTERFACE</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-1.5">
                <ArrowDownLeft className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--alert-green)' }} />
                <div>
                  <div className="text-[8px] font-mono text-[var(--text-muted)]">DOWNLOAD</div>
                  <div className="text-[10px] font-mono font-bold" style={{ color: 'var(--alert-green)' }}>
                    {fmtBps(iface.throughput?.download ?? 0)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowUpRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--cyan-primary)' }} />
                <div>
                  <div className="text-[8px] font-mono text-[var(--text-muted)]">UPLOAD</div>
                  <div className="text-[10px] font-mono font-bold" style={{ color: 'var(--cyan-primary)' }}>
                    {fmtBps(iface.throughput?.upload ?? 0)}
                  </div>
                </div>
              </div>
              {iface.flows && (
                <>
                  <div>
                    <div className="text-[8px] font-mono text-[var(--text-muted)]">ACTIVE FLOWS</div>
                    <div className="text-[10px] font-mono text-[var(--gold-primary)] font-bold">{(iface.flows.active ?? 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-mono text-[var(--text-muted)]">IDLE FLOWS</div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">{(iface.flows.idle ?? 0).toLocaleString()}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Suricata stats */}
        {suriSts && !suriSts.error && (
          <div className="px-3 py-2.5 border-b border-[var(--border-primary)]/40">
            <div className="text-[8px] font-mono text-[var(--text-muted)] tracking-widest mb-1.5">SURICATA IDS</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-[8px] font-mono text-[var(--text-muted)]">ALERTS</div>
                <div className="text-[11px] font-mono font-bold" style={{ color: 'var(--alert-red)' }}>
                  {(suriSts.detect?.alert ?? 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[8px] font-mono text-[var(--text-muted)]">UPTIME</div>
                <div className="text-[10px] font-mono text-[var(--text-primary)]">
                  {suriSts.uptime ? `${Math.floor(suriSts.uptime / 3600)}h` : '—'}
                </div>
              </div>
              {suriSts.capture && (
                <div>
                  <div className="text-[8px] font-mono text-[var(--text-muted)]">PKT DROPS</div>
                  <div className="text-[10px] font-mono" style={{ color: (suriSts.capture.kernel_drops ?? 0) > 0 ? 'var(--alert-red)' : 'var(--alert-green)' }}>
                    {(suriSts.capture.kernel_drops ?? 0).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top hosts */}
        {hosts.length > 0 && (
          <div className="px-3 py-2.5">
            <div className="text-[8px] font-mono text-[var(--text-muted)] tracking-widest mb-2">TOP TALKERS</div>
            <div className="flex flex-col gap-1.5">
              {hosts.slice(0, 8).map((h: TopHost, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Server className="w-3 h-3 flex-shrink-0 text-[var(--text-muted)]" />
                  <span className="text-[9px] font-mono text-[var(--text-primary)] truncate min-w-0 flex-1">
                    {h.name ?? h.ip ?? 'unknown'}
                  </span>
                  <Bar value={h.bytes ?? 0} max={maxBytes} color={i === 0 ? 'var(--alert-red)' : i < 3 ? 'var(--gold-primary)' : 'var(--cyan-primary)'} />
                  <span className="text-[8px] font-mono text-[var(--text-muted)] flex-shrink-0 w-14 text-right">
                    {fmtBytes(h.bytes ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No data state */}
        {!loading && !iface && !suriSts && hosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <Wifi className="w-5 h-5 text-[var(--text-muted)]" />
            <span className="text-[10px] font-mono text-[var(--text-muted)]">NTOPNG / SURICATA NOT REACHABLE</span>
            <span className="text-[9px] font-mono text-[var(--text-muted)]">Configure VOLT_SERVER_URL in .env</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
