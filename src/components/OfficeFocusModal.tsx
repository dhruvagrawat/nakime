'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Camera, Users, Video, VideoOff } from 'lucide-react';
import { OFFICES, STATUS_DOT } from '@/data/offices';
import { FloorSVG } from './OfficePanel';

const TYPE_COLOR = { hq: 'var(--gold-primary)', datacenter: 'var(--cyan-primary)', office: 'var(--alert-green)' };
const TYPE_LABEL = { hq: 'Headquarters', datacenter: 'Data Centre', office: 'Regional Office' };

interface Props {
  officeIdx: number | null;
  onClose: () => void;
  onFlyTo?: (lat: number, lng: number, zoom?: number) => void;
  onCameraOpen?: (cam: any) => void;
}

export default function OfficeFocusModal({ officeIdx, onClose, onFlyTo, onCameraOpen }: Props) {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const office = officeIdx !== null ? OFFICES[officeIdx] : null;

  // Reset floor when office changes
  const floor = office ? (office.floors.find(f => f.floor === selectedFloor) ?? office.floors[0]) : null;
  const floorCams = office ? office.cameras.filter(c => c.floor === (floor?.floor ?? 1)) : [];
  const floorEmps = office ? office.employees.filter(e => e.floor === (floor?.floor ?? 1)) : [];
  const onlineCount = floorCams.filter(c => c.status === 'online').length;
  const activeEmps  = floorEmps.filter(e => e.status !== 'offline').length;

  return (
    <AnimatePresence>
      {office && floor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[650] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 32, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-[95vw] max-w-[900px] max-h-[90vh] overflow-y-auto styled-scrollbar flex flex-col"
            style={{ background: 'var(--bg-void)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.85)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="px-5 py-4 border-b border-(--border-primary) flex items-start gap-3 sticky top-0"
              style={{ background: 'var(--bg-void)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold"
                    style={{ background: (TYPE_COLOR[office.type] + '18'), color: TYPE_COLOR[office.type], border: `1px solid ${TYPE_COLOR[office.type]}30` }}>
                    {TYPE_LABEL[office.type]}
                  </span>
                </div>
                <h2 className="text-[14px] font-mono font-bold text-(--text-heading)">{office.name}</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-(--text-muted)" />
                  <span className="text-[10px] font-mono text-(--text-muted)">{office.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onFlyTo && (
                  <button onClick={() => { onFlyTo(office.lat, office.lng, 15); onClose(); }}
                    className="px-2.5 py-1 rounded text-[9px] font-mono font-bold transition-colors"
                    style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--cyan-primary)', border: '1px solid rgba(0,229,255,0.3)' }}>
                    FLY TO
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-(--text-muted)" />
                </button>
              </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-3 border-b border-(--border-primary)">
              {[
                { label: 'ACTIVE STAFF',  value: String(activeEmps),  color: 'var(--alert-green)' },
                { label: 'CAMERAS LIVE',  value: `${onlineCount} / ${floorCams.length}`, color: 'var(--cyan-primary)' },
                { label: 'ROOMS',         value: String(floor.rooms.length), color: 'var(--gold-primary)' },
              ].map(s => (
                <div key={s.label} className="px-4 py-2.5 border-r border-(--border-primary) last:border-r-0 text-center">
                  <div className="text-[7px] font-mono text-(--text-muted) tracking-widest">{s.label}</div>
                  <div className="text-[11px] font-mono font-bold mt-0.5" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* ── Floor tabs ── */}
            <div className="flex px-5 py-2 gap-2 border-b border-(--border-primary)/40">
              {office.floors.map(f => (
                <button key={f.floor} onClick={() => setSelectedFloor(f.floor)}
                  className="px-3 py-1 rounded text-[9px] font-mono font-bold transition-all"
                  style={{
                    background: selectedFloor === f.floor ? 'rgba(212,175,55,0.12)' : 'transparent',
                    color: selectedFloor === f.floor ? 'var(--gold-primary)' : 'var(--text-muted)',
                    border: `1px solid ${selectedFloor === f.floor ? 'rgba(212,175,55,0.35)' : 'transparent'}`,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* ── Large floor plan ── */}
            <div className="px-5 py-4">
              <FloorSVG floor={floor} employees={office.employees} cameras={office.cameras} heightPx={420} />
            </div>

            {/* ── Cameras + Employees side by side ── */}
            <div className="grid md:grid-cols-2 gap-0 border-t border-(--border-primary)/30">
              {/* Camera list */}
              <div className="border-r border-(--border-primary)/30">
                <div className="px-4 py-2 flex items-center gap-1.5 border-b border-(--border-primary)/20">
                  <Camera className="w-3.5 h-3.5 text-(--cyan-primary)" />
                  <span className="text-[9px] font-mono text-(--text-muted) tracking-widest">CAMERAS</span>
                  <span className="ml-auto text-[8px] font-mono font-bold text-(--alert-green)">{onlineCount} ONLINE</span>
                </div>
                <div className="max-h-52 overflow-y-auto styled-scrollbar">
                  {floorCams.length === 0 && (
                    <div className="px-4 py-4 text-[9px] font-mono text-(--text-muted)">No cameras on this floor</div>
                  )}
                  {floorCams.map(cam => (
                    <div key={cam.id}
                      className="px-4 py-2 flex items-center gap-2 hover:bg-white/2 border-b border-(--border-primary)/15 cursor-pointer group"
                      onClick={() => onCameraOpen?.({ ...cam, name: `${office.short} — ${cam.name}`, type: 'cctv' })}>
                      {cam.status === 'online'
                        ? <Video className="w-3 h-3 shrink-0 text-(--alert-green)" />
                        : <VideoOff className="w-3 h-3 shrink-0 text-(--text-muted)" />}
                      <span className="text-[10px] font-mono text-foreground flex-1 truncate">{cam.name}</span>
                      {cam.location && <span className="text-[8px] font-mono text-(--text-muted) shrink-0">{cam.location}</span>}
                      <span className="text-[7px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        style={{ color: cam.status === 'online' ? 'var(--cyan-primary)' : 'var(--text-muted)' }}>
                        OPEN
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee list */}
              <div>
                <div className="px-4 py-2 flex items-center gap-1.5 border-b border-(--border-primary)/20">
                  <Users className="w-3.5 h-3.5 text-(--alert-green)" />
                  <span className="text-[9px] font-mono text-(--text-muted) tracking-widest">PERSONNEL</span>
                  <span className="ml-auto text-[8px] font-mono font-bold text-(--alert-green)">{activeEmps} ACTIVE</span>
                </div>
                <div className="max-h-52 overflow-y-auto styled-scrollbar">
                  {floorEmps.length === 0 && (
                    <div className="px-4 py-4 text-[9px] font-mono text-(--text-muted)">No personnel on this floor</div>
                  )}
                  {floorEmps.map(emp => (
                    <div key={emp.id} className="px-4 py-2 flex items-center gap-2.5 border-b border-(--border-primary)/15">
                      <div className="w-7 h-7 rounded flex items-center justify-center text-[8px] font-mono font-bold shrink-0"
                        style={{ background: emp.color+'22', border: `1px solid ${emp.color}44`, color: emp.color }}>
                        {emp.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono text-foreground truncate">{emp.name}</div>
                        <div className="text-[8px] font-mono text-(--text-muted) truncate">{emp.role}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_DOT[emp.status] }} />
                        <span className="text-[7px] font-mono" style={{ color: STATUS_DOT[emp.status] }}>{emp.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
