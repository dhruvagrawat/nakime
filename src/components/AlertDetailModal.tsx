'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, AlertTriangle, Clock, Server, Network, Tag, ChevronRight } from 'lucide-react';
import { type Alert, SEV_COLOR, SEV_BG, SEV_BORDER, relTime } from './SecurityAlertPanel';

const SOURCE_LABEL: Record<string, string> = {
  wazuh:    'Wazuh SIEM',
  suricata: 'Suricata IDS',
  splunk:   'Splunk',
};

const SOURCE_DESC: Record<string, string> = {
  wazuh:    'Host-based intrusion detection and log analysis',
  suricata: 'Network-based intrusion detection system',
  splunk:   'Security information and event management',
};

const RECOMMENDATIONS: Record<string, string[]> = {
  critical: [
    'Isolate affected host immediately',
    'Escalate to Tier 2 SOC analyst',
    'Capture forensic memory snapshot',
    'Review lateral movement indicators',
  ],
  high: [
    'Investigate source IP reputation',
    'Check for related alerts in last 24h',
    'Review user/agent activity logs',
    'Apply temporary firewall rule if needed',
  ],
  medium: [
    'Monitor affected host for 1 hour',
    'Correlate with existing threat intel',
    'Update detection rule if false-positive',
  ],
  low: [
    'Log and review during next shift',
    'Tune detection threshold if noisy',
  ],
};

interface Props {
  alert: Alert | null;
  onClose: () => void;
}

export default function AlertDetailModal({ alert, onClose }: Props) {
  if (!alert) return null;
  const sev = alert.severity;

  const fields: Array<[string, string | undefined, React.ReactNode]> = [
    ['Source IP',    alert.src_ip,                    <Network className="w-3 h-3" />],
    ['Dest IP',      alert.dest_ip,                   <Network className="w-3 h-3" />],
    ['Protocol',     alert.proto,                     <ChevronRight className="w-3 h-3" />],
    ['Agent',        alert.agent,                     <Server className="w-3 h-3" />],
    ['Category',     alert.category,                  <Tag className="w-3 h-3" />],
    ['Action',       alert.action?.toUpperCase(),     <Shield className="w-3 h-3" />],
    ['Groups',       alert.groups?.join(', '),        <Tag className="w-3 h-3" />],
    ['Score',        String(alert.severity_score),    <AlertTriangle className="w-3 h-3" />],
  ].filter(([, v]) => v) as Array<[string, string, React.ReactNode]>;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[650] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 32, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-[92vw] max-w-[680px] max-h-[85vh] overflow-y-auto styled-scrollbar flex flex-col"
          style={{ background: 'var(--bg-void)', border: `1px solid ${SEV_BORDER[sev]}`, borderRadius: 12, boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 40px ${SEV_COLOR[sev]}18` }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="px-5 py-4 border-b border-(--border-primary) flex items-start gap-3 sticky top-0"
            style={{ background: 'var(--bg-void)' }}>
            {/* Severity badge */}
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: SEV_BG[sev], border: `1px solid ${SEV_BORDER[sev]}`, color: SEV_COLOR[sev] }}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider"
                  style={{ background: SEV_BG[sev], color: SEV_COLOR[sev], border: `1px solid ${SEV_BORDER[sev]}` }}>
                  {sev}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {SOURCE_LABEL[alert.source] ?? alert.source}
                </span>
                {alert.action === 'blocked' && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold"
                    style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--cyan-primary)', border: '1px solid rgba(0,229,255,0.3)' }}>
                    BLOCKED
                  </span>
                )}
              </div>
              <p className="text-[12px] font-mono font-bold text-(--text-heading) leading-snug">{alert.message}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5 transition-colors shrink-0">
              <X className="w-4 h-4 text-(--text-muted)" />
            </button>
          </div>

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-3 border-b border-(--border-primary)">
            {[
              { label: 'SEVERITY SCORE', value: String(alert.severity_score), color: SEV_COLOR[sev] },
              { label: 'DETECTED',       value: relTime(alert.timestamp),     color: 'var(--text-secondary)' },
              { label: 'SOURCE',         value: SOURCE_LABEL[alert.source] ?? alert.source, color: 'var(--cyan-primary)' },
            ].map(s => (
              <div key={s.label} className="px-4 py-2.5 border-r border-(--border-primary) last:border-r-0 text-center">
                <div className="text-[7px] font-mono text-(--text-muted) tracking-widest">{s.label}</div>
                <div className="text-[11px] font-mono font-bold mt-0.5" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="p-5 grid md:grid-cols-2 gap-5">
            {/* ── Source info ── */}
            <div className="md:col-span-2">
              <div className="text-[8px] font-mono text-(--text-muted) tracking-widest mb-2">DETECTION SOURCE</div>
              <div className="px-3 py-2.5 rounded flex items-start gap-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SEV_COLOR[sev] }} />
                <div>
                  <div className="text-[10px] font-mono font-bold text-(--text-heading)">{SOURCE_LABEL[alert.source]}</div>
                  <div className="text-[9px] font-mono text-(--text-muted) mt-0.5">{SOURCE_DESC[alert.source]}</div>
                </div>
              </div>
            </div>

            {/* ── Network / event metadata ── */}
            {fields.length > 0 && (
              <div>
                <div className="text-[8px] font-mono text-(--text-muted) tracking-widest mb-2">EVENT DETAILS</div>
                <div className="flex flex-col gap-1.5">
                  {fields.map(([label, val, icon]) => (
                    <div key={label} className="flex items-center gap-2 px-2.5 py-1.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
                      <span className="text-[8px] font-mono text-(--text-muted) w-16 shrink-0">{label}</span>
                      <span className="text-[10px] font-mono text-foreground truncate">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Recommended actions ── */}
            <div>
              <div className="text-[8px] font-mono text-(--text-muted) tracking-widest mb-2">RECOMMENDED ACTIONS</div>
              <div className="flex flex-col gap-1.5">
                {(RECOMMENDATIONS[sev] ?? []).map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 px-2.5 py-1.5 rounded"
                    style={{ background: SEV_BG[sev] + '80', border: `1px solid ${SEV_BORDER[sev]}` }}>
                    <span className="text-[8px] font-mono font-bold mt-0.5 shrink-0" style={{ color: SEV_COLOR[sev] }}>{i+1}.</span>
                    <span className="text-[9px] font-mono text-(--text-secondary) leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Timestamp ── */}
            {alert.timestamp && (
              <div className="md:col-span-2 flex items-center gap-2 px-3 py-2 rounded"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Clock className="w-3.5 h-3.5 text-(--text-muted) shrink-0" />
                <span className="text-[8px] font-mono text-(--text-muted)">EVENT TIME</span>
                <span className="text-[10px] font-mono text-foreground ml-2">{new Date(alert.timestamp).toLocaleString()}</span>
                <span className="text-[9px] font-mono text-(--text-muted) ml-auto">{relTime(alert.timestamp)}</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
