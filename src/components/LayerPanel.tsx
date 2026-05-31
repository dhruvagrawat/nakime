'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Shield, Users, Activity, Camera, ChevronDown } from 'lucide-react';

interface LayerPanelProps {
  data: any;
  activeLayers: any;
  setActiveLayers: React.Dispatch<React.SetStateAction<any>>;
  defaultCollapsed?: boolean;
}

const ENTERPRISE_LAYERS = [
  { key: 'security_alerts', label: 'Security Alerts',    sub: 'Wazuh + Suricata IDS',          icon: Shield,   color: '#ff3b30', dataKey: 'volt_alerts'   },
  { key: 'system_health',   label: 'Agent Tracking',     sub: 'Endpoint agents online/offline', icon: Activity, color: '#00e5ff', dataKey: 'volt_agents'   },
  { key: 'employees',       label: 'Personnel Presence', sub: 'Live employee locations',        icon: Users,    color: '#4caf50', dataKey: 'volt_employees' },
  { key: 'flights',         label: 'Company Aircraft',   sub: 'Asset tracking via ADS-B',       icon: Plane,    color: '#d4af37', dataKey: 'commercial_flights' },
  { key: 'cctv',            label: 'Facility Cameras',   sub: 'Office & datacenter feeds',      icon: Camera,   color: '#39ff14', dataKey: 'cameras'       },
];

function LayerPanel({ data, activeLayers, setActiveLayers, defaultCollapsed = false }: LayerPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const toggle = (key: string) =>
    setActiveLayers((prev: any) => ({ ...prev, [key]: !prev[key] }));

  const getCount = (dk: string): number | null => {
    if (!dk || !data[dk]) return null;
    const val = data[dk];
    return Array.isArray(val) ? val.length : null;
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel overflow-hidden">
      <button onClick={() => setCollapsed(c => !c)}
        className="px-3 py-2.5 border-b border-(--border-primary) flex items-center gap-2 w-full hover:bg-white/2 transition-colors">
        <Shield className="w-3.5 h-3.5 text-(--gold-primary) shrink-0" />
        <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-(--text-heading) flex-1 text-left">ACTIVE LAYERS</span>
        <ChevronDown className={`w-3.5 h-3.5 text-(--text-muted) transition-transform duration-200 shrink-0 ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="py-1">
              {ENTERPRISE_LAYERS.map(layer => {
                const active = activeLayers[layer.key];
                const count  = getCount(layer.dataKey);
                const Icon   = layer.icon;
                return (
                  <button key={layer.key} onClick={() => toggle(layer.key)}
                    className="w-full px-3 py-2 flex items-center gap-2.5 transition-all hover:bg-white/2 text-left"
                    style={{ background: active ? `${layer.color}09` : 'transparent' }}>
                    <div className="shrink-0 w-8 h-4 rounded-full relative transition-colors"
                      style={{ background: active ? `${layer.color}40` : 'rgba(255,255,255,0.06)', border: `1px solid ${active ? layer.color+'60' : 'rgba(255,255,255,0.1)'}` }}>
                      <div className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                        style={{ background: active ? layer.color : 'rgba(255,255,255,0.2)', left: active ? 'calc(100% - 14px)' : '1px', boxShadow: active ? `0 0 6px ${layer.color}80` : 'none' }} />
                    </div>
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: active ? layer.color : 'var(--text-muted)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono font-bold" style={{ color: active ? layer.color : 'var(--text-muted)' }}>{layer.label}</div>
                      <div className="text-[8px] font-mono text-(--text-muted)">{layer.sub}</div>
                    </div>
                    {count !== null && active && (
                      <span className="shrink-0 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${layer.color}15`, color: layer.color }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(LayerPanel);
