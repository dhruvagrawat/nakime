'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { ADANI_ASSETS, ASSET_TYPE_META, STATUS_COLOR, type AdaniAsset, type AssetType } from '@/data/adani-assets';

interface Props {
  onSelectAsset: (assetId: string) => void;
  onFlyTo?: (lat: number, lng: number, zoom?: number) => void;
  selectedAssetId?: string | null;
  defaultCollapsed?: boolean;
}

type Region = 'all' | 'india' | 'international';

const COUNTRY_FLAGS: Record<string, string> = {
  India: '🇮🇳', Australia: '🇦🇺', 'United Kingdom': '🇬🇧',
  Singapore: '🇸🇬', UAE: '🇦🇪', Israel: '🇮🇱', 'Sri Lanka': '🇱🇰',
  Tanzania: '🇹🇿', Myanmar: '🇲🇲',
};

const TYPE_GROUPS: Array<{ id: AssetType | 'all'; label: string }> = [
  { id: 'all',           label: 'All' },
  { id: 'port',          label: 'Ports' },
  { id: 'airport',       label: 'Airports' },
  { id: 'power_thermal', label: 'Thermal' },
  { id: 'power_solar',   label: 'Solar' },
  { id: 'hq',            label: 'HQ' },
  { id: 'office',        label: 'Offices' },
  { id: 'datacenter',    label: 'Data Centres' },
  { id: 'mine',          label: 'Mining' },
];

export default function AssetBrowserPanel({ onSelectAsset, onFlyTo, selectedAssetId, defaultCollapsed = false }: Props) {
  const [region,  setRegion]  = useState<Region>('all');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [search,  setSearch]  = useState('');
  const [country, setCountry] = useState<string>('all');
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const countries = useMemo(() => {
    const src = region === 'all' ? ADANI_ASSETS : ADANI_ASSETS.filter(a => a.region === region);
    return ['all', ...Array.from(new Set(src.map(a => a.country))).sort()];
  }, [region]);

  const filtered = useMemo(() => {
    return ADANI_ASSETS.filter(a => {
      if (region !== 'all' && a.region !== region) return false;
      if (country !== 'all' && a.country !== country) return false;
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) &&
          !a.city.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [region, country, typeFilter, search]);

  // Group by country for display
  const grouped = useMemo(() => {
    const m: Record<string, AdaniAsset[]> = {};
    for (const a of filtered) {
      (m[a.country] ??= []).push(a);
    }
    return m;
  }, [filtered]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel overflow-hidden flex flex-col"
    >
      {/* Header / collapse toggle */}
      <button onClick={() => setCollapsed(c => !c)}
        className="px-3 py-2.5 border-b border-(--border-primary) flex items-center gap-2 w-full shrink-0 hover:bg-white/2 transition-colors">
        <Globe2 className="w-3.5 h-3.5 text-(--gold-primary) shrink-0" />
        <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-(--text-heading) flex-1 text-left">ADANI ASSETS</span>
        <span className="text-[9px] font-mono text-(--text-muted)">{filtered.length} / {ADANI_ASSETS.length}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-(--text-muted) transition-transform duration-200 shrink-0 ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
      {!collapsed && (
      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden flex flex-col">

      {/* Region tabs */}
      <div className="flex border-b border-[var(--border-primary)] shrink-0">
        {([['all','GLOBAL'],['india','INDIA'],['international','INTL']] as [Region,string][]).map(([r, lbl]) => (
          <button key={r} onClick={() => { setRegion(r); setCountry('all'); }}
            className="flex-1 py-1.5 text-[9px] font-mono font-bold tracking-wider transition-all"
            style={{
              background: region === r ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: region === r ? 'var(--gold-primary)' : 'var(--text-muted)',
              borderBottom: region === r ? '2px solid var(--gold-primary)' : '2px solid transparent',
            }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-3 py-1.5 border-b border-[var(--border-primary)]/40 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search className="w-3 h-3 text-(--text-muted) shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="flex-1 bg-transparent text-[9px] font-mono text-(--text-primary) placeholder:text-(--text-muted) outline-none"
          />
        </div>
      </div>

      {/* Type filter chips */}
      <div className="px-3 py-1.5 border-b border-[var(--border-primary)]/30 flex gap-1 overflow-x-auto shrink-0">
        {TYPE_GROUPS.map(tg => (
          <button key={tg.id} onClick={() => setTypeFilter(tg.id as AssetType | 'all')}
            className="px-2 py-0.5 rounded text-[7px] font-mono whitespace-nowrap transition-all shrink-0"
            style={{
              background: typeFilter === tg.id ? 'rgba(0,229,255,0.12)' : 'transparent',
              color: typeFilter === tg.id ? 'var(--cyan-primary)' : 'var(--text-muted)',
              border: `1px solid ${typeFilter === tg.id ? 'rgba(0,229,255,0.3)' : 'transparent'}`,
            }}>
            {tg.label}
          </button>
        ))}
      </div>

      {/* Country filter (only show when not filtering by type already narrowing things) */}
      {countries.length > 2 && (
        <div className="px-3 py-1 border-b border-[var(--border-primary)]/20 flex gap-1 overflow-x-auto shrink-0">
          {countries.map(c => (
            <button key={c} onClick={() => setCountry(c)}
              className="px-2 py-0.5 rounded text-[7px] font-mono whitespace-nowrap shrink-0 transition-all"
              style={{
                background: country === c ? 'rgba(212,175,55,0.08)' : 'transparent',
                color: country === c ? 'var(--gold-primary)' : 'var(--text-muted)',
                border: `1px solid ${country === c ? 'rgba(212,175,55,0.25)' : 'transparent'}`,
              }}>
              {c === 'all' ? 'All Countries' : `${COUNTRY_FLAGS[c] ?? ''} ${c}`}
            </button>
          ))}
        </div>
      )}

      {/* Asset list */}
      <div className="overflow-y-auto styled-scrollbar flex-1 min-h-0" style={{ maxHeight: '320px' }}>
        {filtered.length === 0 && (
          <div className="py-6 text-center text-[9px] font-mono text-(--text-muted)">No assets match filters</div>
        )}

        {Object.entries(grouped).map(([ctry, assets]) => (
          <div key={ctry}>
            {Object.keys(grouped).length > 1 && (
              <div className="px-3 py-1 text-[7px] font-mono text-(--text-muted) tracking-widest sticky top-0"
                style={{ background: 'rgba(0,0,0,0.6)' }}>
                {COUNTRY_FLAGS[ctry] ?? ''} {ctry.toUpperCase()}
              </div>
            )}
            {assets.map(asset => {
              const meta = ASSET_TYPE_META[asset.type];
              const isSelected = selectedAssetId === asset.id;
              return (
                <div key={asset.id}
                  className="px-3 py-2 flex items-center gap-2 cursor-pointer transition-all border-b border-[var(--border-primary)]/20"
                  style={{
                    background: isSelected ? `${meta.color}12` : 'transparent',
                    borderLeft: isSelected ? `2px solid ${meta.color}` : '2px solid transparent',
                  }}
                  onClick={() => {
                    onSelectAsset(asset.id);
                    if (onFlyTo) onFlyTo(asset.lat, asset.lng, 12);
                  }}
                >
                  {/* Status dot + type color */}
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] shrink-0"
                    style={{ background: meta.color + '18', border: `1px solid ${meta.color}35`, color: meta.color }}>
                    {meta.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono font-bold truncate"
                      style={{ color: isSelected ? meta.color : 'var(--text-primary)' }}>
                      {asset.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[7px] font-mono text-(--text-muted)">{asset.city}</span>
                      {asset.capacity && <span className="text-[7px] font-mono text-(--text-muted)">· {asset.capacity}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[asset.status] }} />
                    <ChevronRight className="w-3 h-3 text-(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className="px-3 py-1.5 border-t border-(--border-primary)/30 flex items-center gap-3 shrink-0">
        {['port','airport','power_thermal','power_solar','power_wind','hq','office','datacenter','mine'].map(t => {
          const count = ADANI_ASSETS.filter(a => a.type === t && (region === 'all' || a.region === region)).length;
          if (!count) return null;
          const meta = ASSET_TYPE_META[t as AssetType];
          return (
            <div key={t} className="text-center">
              <div className="text-[9px] font-mono font-bold" style={{ color: meta.color }}>{count}</div>
              <div className="text-[6px] font-mono text-(--text-muted) leading-tight">{meta.label.split(' ')[0]}</div>
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
