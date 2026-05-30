'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Eye, EyeOff, LayoutDashboard, Map, ChevronDown } from 'lucide-react';

export interface DashboardConfig {
  // Left panel sections
  showAssetBrowser:   boolean;
  showOfficeMap:      boolean;
  showLayerPanel:     boolean;
  // Right panel tabs
  showSecurityTab:    boolean;
  showOperationsTab:  boolean;
  showIntelTab:       boolean;
  // Map company layers
  showCompanyAssets:  boolean;
  showFacilityCams:   boolean;
  showCompanyFlights: boolean;
}

export const DEFAULT_CONFIG: DashboardConfig = {
  showAssetBrowser:   true,
  showOfficeMap:      true,
  showLayerPanel:     true,
  showSecurityTab:    true,
  showOperationsTab:  true,
  showIntelTab:       true,
  showCompanyAssets:  true,
  showFacilityCams:   false,
  showCompanyFlights: false,
};

interface Props {
  config: DashboardConfig;
  onChange: (c: DashboardConfig) => void;
}

type Toggle = { key: keyof DashboardConfig; label: string; description: string };

const LEFT_TOGGLES: Toggle[] = [
  { key: 'showAssetBrowser',   label: 'Asset Browser',    description: 'Adani asset list + hierarchy' },
  { key: 'showOfficeMap',      label: 'Office Floor Maps',description: 'Per-office SVG floor plans' },
  { key: 'showLayerPanel',     label: 'Layer Controls',   description: 'Map layer toggle panel' },
];

const RIGHT_TOGGLES: Toggle[] = [
  { key: 'showSecurityTab',    label: 'Security Tab',     description: 'Alerts + system health' },
  { key: 'showOperationsTab',  label: 'Operations Tab',   description: 'Personnel + network traffic' },
  { key: 'showIntelTab',       label: 'Intel Tab',        description: 'CVE / threat intel feed' },
];

const MAP_TOGGLES: Toggle[] = [
  { key: 'showCompanyAssets',  label: 'Company Assets',   description: 'Ports, airports, plants on map' },
  { key: 'showFacilityCams',   label: 'Facility Cameras', description: 'CCTV dots at company sites' },
  { key: 'showCompanyFlights', label: 'Company Aircraft', description: 'ADS-B flight layer' },
];

const PRESETS: Array<{ label: string; description: string; config: Partial<DashboardConfig> }> = [
  {
    label: 'FULL VIEW',
    description: 'All panels + all map layers',
    config: { showAssetBrowser: true, showOfficeMap: true, showLayerPanel: true, showSecurityTab: true, showOperationsTab: true, showIntelTab: true, showCompanyAssets: true },
  },
  {
    label: 'SECURITY OPS',
    description: 'Security + Intel only, clean map',
    config: { showAssetBrowser: false, showOfficeMap: false, showLayerPanel: false, showSecurityTab: true, showOperationsTab: false, showIntelTab: true, showCompanyAssets: true },
  },
  {
    label: 'EXECUTIVE',
    description: 'Asset browser + Operations',
    config: { showAssetBrowser: true, showOfficeMap: false, showLayerPanel: false, showSecurityTab: false, showOperationsTab: true, showIntelTab: false, showCompanyAssets: true },
  },
  {
    label: 'MINIMAL',
    description: 'Map only, no side panels',
    config: { showAssetBrowser: false, showOfficeMap: false, showLayerPanel: false, showSecurityTab: false, showOperationsTab: false, showIntelTab: false, showCompanyAssets: true },
  },
];

function ToggleRow({ t, config, onChange }: { t: Toggle; config: DashboardConfig; onChange: (c: DashboardConfig) => void }) {
  const on = config[t.key];
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-[var(--border-primary)]/20 last:border-b-0">
      <button
        onClick={() => onChange({ ...config, [t.key]: !on })}
        className="shrink-0 w-8 h-4.5 rounded-full relative transition-colors"
        style={{ background: on ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)', border: `1px solid ${on ? 'rgba(0,229,255,0.5)' : 'rgba(255,255,255,0.12)'}` }}
      >
        <div className="absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-200"
          style={{ background: on ? 'var(--cyan-primary)' : 'rgba(255,255,255,0.3)', left: on ? 'calc(100% - 16px)' : '1px', boxShadow: on ? '0 0 8px rgba(0,229,255,0.5)' : 'none' }} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono font-bold" style={{ color: on ? 'var(--text-primary)' : 'var(--text-muted)' }}>{t.label}</div>
        <div className="text-[8px] font-mono text-(--text-muted)">{t.description}</div>
      </div>
      {on ? <Eye className="w-3 h-3 text-(--cyan-primary) shrink-0" /> : <EyeOff className="w-3 h-3 text-(--text-muted) shrink-0" />}
    </div>
  );
}

export default function DashboardCustomizer({ config, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<'panels' | 'map'>('panels');

  return (
    <>
      {/* Gear button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="glass-panel p-2.5 pointer-events-auto hover:border-(--gold-primary)/40 transition-colors group relative"
        title="Customise Dashboard"
      >
        <Settings className={`w-4 h-4 transition-all duration-300 ${open ? 'rotate-90 text-(--gold-primary)' : 'text-(--text-muted) group-hover:text-(--gold-primary)'}`} />
      </button>

      {/* Side sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[490]"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-72 z-[500] flex flex-col overflow-hidden"
              style={{ background: 'var(--bg-void)', borderLeft: '1px solid rgba(212,175,55,0.15)' }}
            >
              {/* Sheet header */}
              <div className="px-4 py-3.5 border-b border-[var(--border-primary)] flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-(--gold-primary)" />
                <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-(--text-heading) flex-1">CUSTOMISE</span>
                <button onClick={() => setOpen(false)}>
                  <X className="w-4 h-4 text-(--text-muted) hover:text-(--text-primary) transition-colors" />
                </button>
              </div>

              {/* Preset buttons */}
              <div className="px-4 py-3 border-b border-[var(--border-primary)]/50">
                <div className="text-[8px] font-mono text-(--text-muted) tracking-widest mb-2">QUICK PRESETS</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESETS.map(p => (
                    <button key={p.label}
                      onClick={() => onChange({ ...DEFAULT_CONFIG, ...p.config })}
                      className="px-2 py-1.5 rounded text-left transition-all group"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="text-[9px] font-mono font-bold text-(--gold-primary) group-hover:text-(--text-heading) transition-colors">{p.label}</div>
                      <div className="text-[7px] font-mono text-(--text-muted)">{p.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section switcher */}
              <div className="flex border-b border-[var(--border-primary)]/50">
                <button onClick={() => setSection('panels')}
                  className="flex-1 py-2 text-[9px] font-mono font-bold tracking-wider transition-all"
                  style={{ color: section === 'panels' ? 'var(--cyan-primary)' : 'var(--text-muted)', borderBottom: section === 'panels' ? '2px solid var(--cyan-primary)' : '2px solid transparent' }}>
                  PANELS
                </button>
                <button onClick={() => setSection('map')}
                  className="flex-1 py-2 text-[9px] font-mono font-bold tracking-wider transition-all"
                  style={{ color: section === 'map' ? 'var(--cyan-primary)' : 'var(--text-muted)', borderBottom: section === 'map' ? '2px solid var(--cyan-primary)' : '2px solid transparent' }}>
                  MAP LAYERS
                </button>
              </div>

              {/* Toggles */}
              <div className="overflow-y-auto styled-scrollbar flex-1 px-4 py-2">
                {section === 'panels' && (
                  <>
                    <div className="text-[7px] font-mono text-(--text-muted) tracking-widest py-2">LEFT PANEL</div>
                    {LEFT_TOGGLES.map(t => <ToggleRow key={t.key} t={t} config={config} onChange={onChange} />)}
                    <div className="text-[7px] font-mono text-(--text-muted) tracking-widest py-2 mt-2">RIGHT PANEL TABS</div>
                    {RIGHT_TOGGLES.map(t => <ToggleRow key={t.key} t={t} config={config} onChange={onChange} />)}
                  </>
                )}
                {section === 'map' && (
                  <>
                    <div className="text-[7px] font-mono text-(--text-muted) tracking-widest py-2">COMPANY OVERLAYS</div>
                    {MAP_TOGGLES.map(t => <ToggleRow key={t.key} t={t} config={config} onChange={onChange} />)}
                    <div className="mt-3 px-3 py-2 rounded text-[9px] font-mono text-(--text-muted) leading-relaxed"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <Map className="w-3 h-3 inline mr-1.5" />
                      Toggle company asset markers, camera feeds, and flight tracking on the globe.
                    </div>
                  </>
                )}
              </div>

              {/* Reset */}
              <div className="px-4 py-3 border-t border-[var(--border-primary)]/50">
                <button
                  onClick={() => onChange(DEFAULT_CONFIG)}
                  className="w-full py-1.5 rounded text-[9px] font-mono font-bold transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  RESET TO DEFAULTS
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
