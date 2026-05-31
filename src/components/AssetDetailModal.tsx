'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Camera, Users, Zap, Building2, Anchor, Plane, Video, VideoOff, AlertTriangle, Activity } from 'lucide-react';
import { ASSET_BY_ID, ASSET_TYPE_META, STATUS_COLOR, type AdaniAsset } from '@/data/adani-assets';
import { OFFICES } from '@/data/offices';
import { FloorSVG } from './OfficePanel';

interface Props {
  assetId: string | null;
  onClose: () => void;
  onFlyTo?: (lat: number, lng: number, zoom?: number) => void;
  onCameraOpen?: (cam: any) => void;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  port:                 <Anchor className="w-4 h-4" />,
  airport:              <Plane className="w-4 h-4" />,
  power_thermal:        <Zap className="w-4 h-4" />,
  power_solar:          <Zap className="w-4 h-4" />,
  power_wind:           <Zap className="w-4 h-4" />,
  hq:                   <Building2 className="w-4 h-4" />,
  office:               <Building2 className="w-4 h-4" />,
  datacenter:           <Activity className="w-4 h-4" />,
  mine:                 <MapPin className="w-4 h-4" />,
  warehouse:            <Building2 className="w-4 h-4" />,
  special_economic_zone:<MapPin className="w-4 h-4" />,
};

const OFFICE_TYPES = new Set(['hq','office','datacenter']);

function matchOffice(asset: AdaniAsset) {
  return OFFICES.find(o => o.city.toLowerCase() === asset.city.toLowerCase()) ?? null;
}

export default function AssetDetailModal({ assetId, onClose, onFlyTo, onCameraOpen }: Props) {
  const [floorTab, setFloorTab] = useState(1);
  const asset: AdaniAsset | null = assetId ? (ASSET_BY_ID[assetId] ?? null) : null;
  const meta = asset ? ASSET_TYPE_META[asset.type] : null;
  const matchedOffice = asset && OFFICE_TYPES.has(asset.type) ? matchOffice(asset) : null;
  const officeFloor   = matchedOffice?.floors.find(f => f.floor === floorTab) ?? matchedOffice?.floors[0] ?? null;

  return (
    <AnimatePresence>
      {asset && meta && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-[92vw] max-w-[760px] max-h-[85vh] overflow-y-auto styled-scrollbar flex flex-col"
            style={{ background: 'var(--bg-void)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="px-5 py-4 border-b border-[var(--border-primary)] flex items-start gap-3 sticky top-0"
              style={{ background: 'var(--bg-void)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: meta.color + '18', border: `1px solid ${meta.color}40`, color: meta.color }}>
                {TYPE_ICON[asset.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[13px] font-mono font-bold text-[var(--text-heading)] truncate">{asset.name}</h2>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold shrink-0"
                    style={{ background: meta.color + '18', color: meta.color, border: `1px solid ${meta.color}30` }}>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold shrink-0"
                    style={{ background: STATUS_COLOR[asset.status] + '18', color: STATUS_COLOR[asset.status], border: `1px solid ${STATUS_COLOR[asset.status]}30` }}>
                    {asset.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {asset.city}{asset.state ? `, ${asset.state}` : ''}, {asset.country}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">·</span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{asset.lat.toFixed(4)}, {asset.lng.toFixed(4)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {onFlyTo && (
                  <button onClick={() => { onFlyTo(asset.lat, asset.lng, 14); onClose(); }}
                    className="px-2.5 py-1 rounded text-[9px] font-mono font-bold transition-colors"
                    style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--cyan-primary)', border: '1px solid rgba(0,229,255,0.3)' }}>
                    FLY TO
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-[var(--border-primary)]">
              {[
                { label: 'CAPACITY', value: asset.capacity ?? '—', color: meta.color },
                { label: 'PERSONNEL', value: asset.employee_count ? asset.employee_count.toLocaleString() : '—', color: 'var(--alert-green)' },
                { label: 'CAMERAS', value: String(asset.cameras.length), color: 'var(--cyan-primary)' },
                { label: 'ESTABLISHED', value: asset.established ?? '—', color: 'var(--gold-primary)' },
              ].map(stat => (
                <div key={stat.label} className="px-4 py-2.5 border-r border-[var(--border-primary)] last:border-r-0 text-center">
                  <div className="text-[7px] font-mono text-[var(--text-muted)] tracking-widest">{stat.label}</div>
                  <div className="text-[11px] font-mono font-bold mt-0.5" style={{ color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="p-5 grid md:grid-cols-2 gap-5">
              {/* ── Office floor plan (only for office / hq / datacenter assets) ── */}
              {matchedOffice && officeFloor && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-[8px] font-mono text-(--text-muted) tracking-widest">FLOOR PLAN</div>
                    <div className="flex gap-1 ml-auto">
                      {matchedOffice.floors.map(f => (
                        <button key={f.floor} onClick={() => setFloorTab(f.floor)}
                          className="px-2 py-0.5 rounded text-[7px] font-mono font-bold transition-all"
                          style={{
                            background: floorTab === f.floor ? 'rgba(212,175,55,0.12)' : 'transparent',
                            color: floorTab === f.floor ? 'var(--gold-primary)' : 'var(--text-muted)',
                            border: `1px solid ${floorTab === f.floor ? 'rgba(212,175,55,0.35)' : 'transparent'}`,
                          }}>
                          {f.label.split(' — ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <FloorSVG floor={officeFloor} employees={matchedOffice.employees} cameras={matchedOffice.cameras} heightPx={240} />
                </div>
              )}

              {/* ── Description ── */}
              <div className="md:col-span-2">
                <div className="text-[8px] font-mono text-[var(--text-muted)] tracking-widest mb-2">FACILITY OVERVIEW</div>
                <p className="text-[11px] font-mono text-[var(--text-secondary)] leading-relaxed">{asset.description}</p>
                {asset.address && (
                  <div className="flex items-start gap-1.5 mt-2">
                    <MapPin className="w-3 h-3 text-[var(--text-muted)] mt-0.5 shrink-0" />
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{asset.address}</span>
                  </div>
                )}
              </div>

              {/* ── Camera Feeds ── */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-3.5 h-3.5 text-[var(--cyan-primary)]" />
                  <span className="text-[8px] font-mono text-[var(--text-muted)] tracking-widest">CAMERA FEEDS</span>
                  <span className="text-[8px] font-mono font-bold" style={{ color: 'var(--alert-green)' }}>
                    {asset.cameras.filter(c => c.status === 'online').length} ONLINE
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {asset.cameras.map(cam => (
                    <div key={cam.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/[0.03] transition-colors group"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                      onClick={() => onCameraOpen?.({ ...cam, name: `${asset.short} — ${cam.name}`, type: 'cctv' })}
                    >
                      {cam.status === 'online'
                        ? <Video className="w-3 h-3 shrink-0" style={{ color: 'var(--alert-green)' }} />
                        : <VideoOff className="w-3 h-3 shrink-0 text-[var(--text-muted)]" />}
                      <span className="text-[10px] font-mono text-[var(--text-primary)] flex-1 truncate">{cam.name}</span>
                      {cam.location && <span className="text-[8px] font-mono text-[var(--text-muted)] shrink-0">{cam.location}</span>}
                      <span className="text-[7px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        style={{ color: cam.status === 'online' ? 'var(--cyan-primary)' : 'var(--text-muted)' }}>
                        OPEN
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Asset details ── */}
              <div>
                <div className="text-[8px] font-mono text-[var(--text-muted)] tracking-widest mb-2">ASSET DETAILS</div>
                <div className="flex flex-col gap-2">
                  {[
                    ['Type',    meta.label],
                    ['Region',  asset.region === 'india' ? 'India' : 'International'],
                    ['Country', asset.country],
                    ['City',    `${asset.city}${asset.state ? `, ${asset.state}` : ''}`],
                    ['Status',  asset.status.charAt(0).toUpperCase() + asset.status.slice(1)],
                    asset.capacity ? ['Capacity', asset.capacity] : null,
                    asset.employee_count ? ['Workforce', asset.employee_count.toLocaleString() + ' staff'] : null,
                  ].filter(Boolean).map((row) => {
                    const [label, val] = row as [string, string];
                    return (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-[var(--text-muted)] tracking-wider w-20 shrink-0">{label}</span>
                      <span className="text-[10px] font-mono text-[var(--text-primary)]">{val}</span>
                    </div>
                  );
                  })}
                </div>

                {/* ── Alert callout ── */}
                {asset.status === 'maintenance' && (
                  <div className="mt-3 px-3 py-2 rounded flex items-center gap-2"
                    style={{ background: 'rgba(255,152,0,0.08)', border: '1px solid rgba(255,152,0,0.25)' }}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--gold-primary)' }} />
                    <span className="text-[9px] font-mono text-[var(--gold-primary)]">Scheduled maintenance in progress — some systems may be offline.</span>
                  </div>
                )}
                {asset.status === 'construction' && (
                  <div className="mt-3 px-3 py-2 rounded flex items-center gap-2"
                    style={{ background: 'rgba(33,150,243,0.08)', border: '1px solid rgba(33,150,243,0.25)' }}>
                    <Activity className="w-3.5 h-3.5 shrink-0 text-[#2196f3]" />
                    <span className="text-[9px] font-mono text-[#2196f3]">Under construction — projected capacity on first commissioning.</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
