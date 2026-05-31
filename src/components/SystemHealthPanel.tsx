'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Trash2, RefreshCw, CheckCircle, AlertCircle, Clock, ChevronDown } from 'lucide-react';

interface ServiceDef { name: string; url: string; method?: string; timeout?: number; }

export interface CheckResult extends ServiceDef {
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'TIMEOUT';
  http_status?: number;
  latency_ms: number | null;
  error?: string;
}

interface Summary { total: number; up: number; down: number; health: 'healthy' | 'degraded' | 'critical'; }

const DEFAULT_SERVICES: ServiceDef[] = [
  { name: 'Wazuh Manager',    url: 'http://localhost:55000',               method: 'GET' },
  { name: 'Suricata (ES)',     url: 'http://localhost:9200/_cluster/health', method: 'GET' },
  { name: 'ntopng',           url: 'http://localhost:3000',                method: 'GET' },
  { name: 'Volt Backend',     url: 'http://localhost:8000/healthz',        method: 'GET' },
];

const STATUS_COLOR: Record<string, string> = {
  UP: 'var(--alert-green)', DEGRADED: 'var(--gold-primary)',
  TIMEOUT: '#ff6b35',       DOWN: 'var(--alert-red)',
};

const STATUS_ICON = {
  UP:       <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--alert-green)' }} />,
  DEGRADED: <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--gold-primary)' }} />,
  TIMEOUT:  <Clock       className="w-3.5 h-3.5" style={{ color: '#ff6b35' }} />,
  DOWN:     <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--alert-red)' }} />,
};

const HEALTH_COLOR = { healthy: 'var(--alert-green)', degraded: 'var(--gold-primary)', critical: 'var(--alert-red)' };

interface Props {
  defaultCollapsed?: boolean;
  onServiceExpand?: (result: CheckResult) => void;
}

export default function SystemHealthPanel({ defaultCollapsed = false, onServiceExpand }: Props) {
  const [services, setServices] = useState<ServiceDef[]>(DEFAULT_SERVICES);
  const [results,  setResults]  = useState<CheckResult[]>([]);
  const [summary,  setSummary]  = useState<Summary | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [addMode,  setAddMode]  = useState(false);
  const [newName,  setNewName]  = useState('');
  const [newUrl,   setNewUrl]   = useState('');
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const lastCheck = useRef<number>(0);

  const runCheck = useCallback(async (svcs?: ServiceDef[]) => {
    setLoading(true);
    try {
      const r = await fetch('/api/volt/health', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(svcs ?? services),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setResults(d.results ?? []); setSummary(d.summary ?? null);
      lastCheck.current = Date.now();
    } catch { /**/ } finally { setLoading(false); }
  }, [services]);

  useEffect(() => { runCheck(); const iv = setInterval(() => runCheck(), 30_000); return () => clearInterval(iv); }, [runCheck]);

  const addService = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    const updated = [...services, { name: newName.trim(), url: newUrl.trim(), method: 'GET' }];
    setServices(updated); runCheck(updated);
    setNewName(''); setNewUrl(''); setAddMode(false);
  };

  const removeService = (idx: number) => {
    setServices(services.filter((_, i) => i !== idx));
    setResults(r => r.filter((_, i) => i !== idx));
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }} className="glass-panel overflow-hidden flex flex-col">

      {/* ── Header / collapse toggle ── */}
      <button onClick={() => setCollapsed(c => !c)}
        className="px-3 py-2.5 border-b border-(--border-primary) flex items-center gap-2 w-full hover:bg-white/2 transition-colors">
        <Activity className="w-3.5 h-3.5 shrink-0" style={{ color: summary ? HEALTH_COLOR[summary.health] : 'var(--cyan-primary)' }} />
        <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-(--text-heading) flex-1 text-left">SYSTEM HEALTH</span>
        {summary && (
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: HEALTH_COLOR[summary.health] }}>
            {summary.health}
          </span>
        )}
        <button onClick={e => { e.stopPropagation(); setAddMode(a => !a); }}
          className="p-0.5 hover:text-(--cyan-primary) transition-colors" title="Add service">
          <Plus className="w-3 h-3 text-(--text-muted)" />
        </button>
        <button onClick={e => { e.stopPropagation(); runCheck(); }}
          className={`p-0.5 transition-colors ${loading ? 'text-(--cyan-primary)' : 'hover:text-(--cyan-primary)'}`}
          disabled={loading}>
          <RefreshCw className={`w-3 h-3 text-(--text-muted) ${loading ? 'animate-spin' : ''}`} />
        </button>
        <ChevronDown className={`w-3.5 h-3.5 text-(--text-muted) transition-transform duration-200 shrink-0 ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">

            {/* Summary bar */}
            {summary && (
              <div className="px-3 py-1.5 border-b border-(--border-primary)/40 flex items-center gap-4 shrink-0">
                <span className="text-[9px] font-mono text-(--alert-green)">{summary.up} UP</span>
                <span className="text-[9px] font-mono text-(--alert-red)">{summary.down} DOWN</span>
                <span className="text-[9px] font-mono text-(--text-muted)">{summary.total} TOTAL</span>
                {lastCheck.current > 0 && (
                  <span className="ml-auto text-[8px] font-mono text-(--text-muted)">
                    {Math.round((Date.now() - lastCheck.current) / 1000)}s ago
                  </span>
                )}
              </div>
            )}

            {/* Add form */}
            <AnimatePresence>
              {addMode && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-(--border-primary)/40">
                  <div className="px-3 py-2 flex flex-col gap-1.5">
                    <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Service name"
                      className="w-full bg-black/40 border border-(--border-primary) rounded px-2 py-1 text-[10px] font-mono text-foreground placeholder:text-(--text-muted) outline-none focus:border-(--cyan-primary)" />
                    <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="http://host:port/path"
                      onKeyDown={e => e.key === 'Enter' && addService()}
                      className="w-full bg-black/40 border border-(--border-primary) rounded px-2 py-1 text-[10px] font-mono text-foreground placeholder:text-(--text-muted) outline-none focus:border-(--cyan-primary)" />
                    <button onClick={addService}
                      className="self-end px-3 py-1 rounded text-[9px] font-mono font-bold bg-(--cyan-primary)/10 border border-(--cyan-primary)/30 text-(--cyan-primary) hover:bg-(--cyan-primary)/20 transition-colors">
                      ADD
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Service list */}
            <div className="overflow-y-auto styled-scrollbar">
              {loading && results.length === 0 && (
                <div className="flex items-center justify-center py-5 gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-(--cyan-primary) animate-osiris-pulse" />
                  <span className="text-[10px] font-mono text-(--text-muted)">CHECKING SERVICES...</span>
                </div>
              )}
              {services.map((svc, i) => {
                const res = results[i];
                return (
                  <div key={svc.name + svc.url}
                    className={`px-3 py-2 flex items-center gap-2.5 border-b border-(--border-primary)/30 group ${onServiceExpand && res ? 'cursor-pointer hover:bg-white/2' : 'hover:bg-white/2'}`}
                    onClick={() => res && onServiceExpand?.(res)}
                  >
                    <div className="shrink-0">
                      {res ? (STATUS_ICON[res.status] ?? STATUS_ICON.DOWN) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-(--border-primary) animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-foreground truncate">{svc.name}</div>
                      <div className="text-[8px] font-mono text-(--text-muted) truncate">{svc.url}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      {res ? (
                        <>
                          <div className="text-[9px] font-mono font-bold" style={{ color: STATUS_COLOR[res.status] }}>{res.status}</div>
                          <div className="text-[8px] font-mono text-(--text-muted)">{res.latency_ms !== null ? `${res.latency_ms}ms` : '—'}</div>
                        </>
                      ) : <div className="text-[9px] font-mono text-(--text-muted)">—</div>}
                    </div>
                    {onServiceExpand && res && (
                      <span className="text-[7px] font-mono text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity shrink-0">VIEW ›</span>
                    )}
                    <button onClick={e => { e.stopPropagation(); removeService(i); }}
                      className="shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-0.5">
                      <Trash2 className="w-3 h-3 text-(--alert-red)" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
