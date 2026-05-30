'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Camera, Users, Video, VideoOff, ChevronRight } from 'lucide-react';
import { OFFICES, ROOM_STYLE, STATUS_DOT, type Office, type FloorPlan } from '@/data/offices';

interface Props {
  onFlyTo?: (lat: number, lng: number, zoom?: number) => void;
  onCameraOpen?: (cam: any) => void;
}

const OFFICE_TYPE_COLOR = {
  hq:         'var(--gold-primary)',
  datacenter: 'var(--cyan-primary)',
  office:     'var(--alert-green)',
};

const OFFICE_TYPE_LABEL = {
  hq:         'HQ',
  datacenter: 'DC',
  office:     'RO',
};

// ── SVG Floor Plan ──────────────────────────────────────────────────────────
function FloorSVG({ floor, employees, cameras }: {
  floor: FloorPlan;
  employees: Office['employees'];
  cameras: Office['cameras'];
}) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const floorEmployees = employees.filter(e => e.floor === floor.floor && e.status !== 'offline');
  const floorCameras   = cameras.filter(c => c.floor === floor.floor);

  // Count per room
  const empPerRoom = useMemo(() => {
    const m: Record<string, typeof employees> = {};
    for (const e of floorEmployees) {
      if (!m[e.room_id]) m[e.room_id] = [];
      m[e.room_id].push(e);
    }
    return m;
  }, [floorEmployees]);

  const camPerRoom = useMemo(() => {
    const m: Record<string, typeof cameras> = {};
    for (const c of floorCameras) {
      if (!m[c.room_id]) m[c.room_id] = [];
      m[c.room_id].push(c);
    }
    return m;
  }, [floorCameras]);

  return (
    <div className="w-full" style={{ aspectRatio: '400/280' }}>
      <svg
        viewBox="0 0 400 280"
        className="w-full h-full"
        style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Grid lines for depth */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="280" fill="url(#grid)" />

        {/* Rooms */}
        {floor.rooms.map(room => {
          const style = ROOM_STYLE[room.type];
          const isHovered = hoveredRoom === room.id;
          const emps = empPerRoom[room.id] ?? [];
          const cams = camPerRoom[room.id] ?? [];
          const pad = 2;

          return (
            <g key={room.id}
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => setHoveredRoom(null)}
              style={{ cursor: 'default' }}
            >
              {/* Room fill */}
              <rect
                x={room.x + pad} y={room.y + pad}
                width={room.w - pad * 2} height={room.h - pad * 2}
                fill={isHovered ? style.stroke.replace('0.40', '0.22').replace('0.45', '0.25').replace('0.55', '0.28').replace('0.60', '0.30') : style.fill}
                stroke={style.stroke}
                strokeWidth={isHovered ? 1.5 : 0.8}
                rx={2}
              />

              {/* Room label */}
              {room.w >= 60 && room.h >= 30 && (
                <text
                  x={room.x + room.w / 2}
                  y={room.y + Math.min(20, room.h / 2 + 4)}
                  textAnchor="middle"
                  fill={style.label}
                  fontSize={Math.min(9, room.w / room.name.length * 1.4)}
                  fontFamily="monospace"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {room.name}
                </text>
              )}

              {/* Camera icons — top-right of room */}
              {cams.map((cam, ci) => (
                <g key={cam.id} transform={`translate(${room.x + room.w - 12 - ci * 10}, ${room.y + 6})`}>
                  <circle r="5" fill={cam.status === 'online' ? 'rgba(0,229,255,0.25)' : 'rgba(100,100,100,0.25)'}
                    stroke={cam.status === 'online' ? 'rgba(0,229,255,0.6)' : 'rgba(100,100,100,0.4)'} strokeWidth="0.6" />
                  <text textAnchor="middle" y="3.5" fontSize="5" fontFamily="monospace"
                    fill={cam.status === 'online' ? '#00e5ff' : '#555'} style={{ userSelect: 'none' }}>
                    ◉
                  </text>
                </g>
              ))}

              {/* Employee dots — bottom of room */}
              {emps.map((emp, ei) => (
                <g key={emp.id} transform={`translate(${room.x + 10 + ei * 14}, ${room.y + room.h - 12})`}>
                  <circle r="5" fill={STATUS_DOT[emp.status] + '33'} stroke={STATUS_DOT[emp.status]} strokeWidth="0.8" />
                  <text textAnchor="middle" y="3.5" fontSize="5" fontFamily="monospace"
                    fill={STATUS_DOT[emp.status]} style={{ userSelect: 'none' }}>
                    {emp.initials.slice(0, 1)}
                  </text>
                </g>
              ))}
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoveredRoom && (() => {
          const room = floor.rooms.find(r => r.id === hoveredRoom);
          if (!room) return null;
          const emps = empPerRoom[hoveredRoom] ?? [];
          const cams = camPerRoom[hoveredRoom] ?? [];
          if (!emps.length && !cams.length) return null;
          const tx = Math.min(room.x + room.w / 2, 330);
          const ty = room.y > 150 ? room.y - 28 : room.y + room.h + 6;
          return (
            <g>
              <rect x={tx - 2} y={ty} width={Math.max(emps.length, cams.length) * 55 + 8} height={22}
                fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" rx="3" />
              {emps.map((e, i) => (
                <text key={e.id} x={tx + 4 + i * 55} y={ty + 14} fontSize="7" fontFamily="monospace"
                  fill={STATUS_DOT[e.status]} style={{ userSelect: 'none' }}>
                  {e.name.split(' ')[0]}
                </text>
              ))}
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

// ── Main Panel ──────────────────────────────────────────────────────────────
export default function OfficePanel({ onFlyTo, onCameraOpen }: Props) {
  const [selectedOffice, setSelectedOffice] = useState(0);
  const [selectedFloor,  setSelectedFloor]  = useState(1);

  const office = OFFICES[selectedOffice];
  const floor  = office.floors.find(f => f.floor === selectedFloor) ?? office.floors[0];

  const floorCams = office.cameras.filter(c => c.floor === selectedFloor);
  const floorEmps = office.employees.filter(e => e.floor === selectedFloor);
  const onlineCount = floorCams.filter(c => c.status === 'online').length;
  const activeEmps  = floorEmps.filter(e => e.status !== 'offline').length;

  const handleSelectOffice = (idx: number) => {
    setSelectedOffice(idx);
    setSelectedFloor(1);
    if (onFlyTo) onFlyTo(OFFICES[idx].lat, OFFICES[idx].lng, 14);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel overflow-hidden flex flex-col gap-0"
    >
      {/* ── Office selector tabs ── */}
      <div className="px-3 py-2 border-b border-[var(--border-primary)] flex items-center gap-1.5 flex-shrink-0">
        <Building2 className="w-3.5 h-3.5 text-[var(--gold-primary)] flex-shrink-0" />
        <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-[var(--text-heading)] flex-shrink-0">FACILITIES</span>
      </div>

      <div className="flex border-b border-[var(--border-primary)] flex-shrink-0">
        {OFFICES.map((o, i) => (
          <button
            key={o.id}
            onClick={() => handleSelectOffice(i)}
            className="flex-1 py-2 px-1 text-center transition-all relative"
            style={{
              background: selectedOffice === i ? `${OFFICE_TYPE_COLOR[o.type]}18` : 'transparent',
              borderBottom: selectedOffice === i ? `2px solid ${OFFICE_TYPE_COLOR[o.type]}` : '2px solid transparent',
            }}
          >
            <div className="text-[8px] font-mono font-bold tracking-widest"
              style={{ color: selectedOffice === i ? OFFICE_TYPE_COLOR[o.type] : 'var(--text-muted)' }}>
              {o.short}
            </div>
            <div className="text-[7px] font-mono text-[var(--text-muted)] truncate">{OFFICE_TYPE_LABEL[o.type]}</div>
          </button>
        ))}
      </div>

      {/* ── Office info + fly-to ── */}
      <div className="px-3 py-2 border-b border-[var(--border-primary)]/40 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[10px] font-mono font-bold text-[var(--text-heading)]">{office.name}</div>
          <div className="text-[8px] font-mono text-[var(--text-muted)]">{office.address}</div>
        </div>
        {onFlyTo && (
          <button
            onClick={() => onFlyTo(office.lat, office.lng, 14)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[8px] font-mono transition-colors"
            style={{ background: 'rgba(0,229,255,0.08)', color: 'var(--cyan-primary)', border: '1px solid rgba(0,229,255,0.25)' }}
          >
            MAP <ChevronRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* ── Floor selector ── */}
      <div className="flex px-3 py-1.5 gap-1.5 border-b border-[var(--border-primary)]/40 flex-shrink-0">
        {office.floors.map(f => (
          <button
            key={f.floor}
            onClick={() => setSelectedFloor(f.floor)}
            className="px-3 py-1 rounded text-[9px] font-mono font-bold transition-all"
            style={{
              background: selectedFloor === f.floor ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: selectedFloor === f.floor ? 'var(--gold-primary)' : 'var(--text-muted)',
              border: `1px solid ${selectedFloor === f.floor ? 'rgba(212,175,55,0.35)' : 'transparent'}`,
            }}
          >
            {f.label.split(' — ')[0]}
          </button>
        ))}
        <span className="ml-auto text-[8px] font-mono text-[var(--text-muted)] self-center">
          {floor.label.split(' — ')[1]}
        </span>
      </div>

      {/* ── Floor stats ── */}
      <div className="grid grid-cols-3 px-3 py-1.5 gap-2 border-b border-[var(--border-primary)]/30 flex-shrink-0">
        <div className="text-center">
          <div className="text-[11px] font-mono font-bold text-[var(--alert-green)]">{activeEmps}</div>
          <div className="text-[7px] font-mono text-[var(--text-muted)]">PERSONNEL</div>
        </div>
        <div className="text-center">
          <div className="text-[11px] font-mono font-bold text-[var(--cyan-primary)]">{onlineCount}</div>
          <div className="text-[7px] font-mono text-[var(--text-muted)]">CAMERAS</div>
        </div>
        <div className="text-center">
          <div className="text-[11px] font-mono font-bold text-[var(--gold-primary)]">{floor.rooms.length}</div>
          <div className="text-[7px] font-mono text-[var(--text-muted)]">ROOMS</div>
        </div>
      </div>

      {/* ── SVG Floor Plan ── */}
      <div className="px-3 py-2 flex-shrink-0">
        <FloorSVG floor={floor} employees={office.employees} cameras={office.cameras} />
      </div>

      {/* ── Camera list for this floor ── */}
      {floorCams.length > 0 && (
        <div className="border-t border-[var(--border-primary)]/30 flex-shrink-0">
          <div className="px-3 py-1.5 flex items-center gap-1.5">
            <Camera className="w-3 h-3 text-[var(--cyan-primary)]" />
            <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-widest">CAMERAS — {floor.label.split(' — ')[0]}</span>
          </div>
          <div className="max-h-32 overflow-y-auto styled-scrollbar">
            {floorCams.map(cam => (
              <div key={cam.id}
                className="px-3 py-1.5 flex items-center gap-2 hover:bg-white/[0.02] border-b border-[var(--border-primary)]/20 cursor-pointer"
                onClick={() => onCameraOpen?.({ ...cam, name: `${office.short} — ${cam.name}`, type: 'cctv' })}
              >
                {cam.status === 'online'
                  ? <Video className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--alert-green)' }} />
                  : <VideoOff className="w-3 h-3 flex-shrink-0 text-[var(--text-muted)]" />}
                <span className="text-[9px] font-mono text-[var(--text-primary)] flex-1 truncate">{cam.name}</span>
                <span className="text-[7px] font-mono font-bold"
                  style={{ color: cam.status === 'online' ? 'var(--alert-green)' : 'var(--text-muted)' }}>
                  {cam.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Employee list for this floor ── */}
      {floorEmps.length > 0 && (
        <div className="border-t border-[var(--border-primary)]/30">
          <div className="px-3 py-1.5 flex items-center gap-1.5">
            <Users className="w-3 h-3 text-[var(--alert-green)]" />
            <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-widest">PERSONNEL — {floor.label.split(' — ')[0]}</span>
          </div>
          <div className="max-h-28 overflow-y-auto styled-scrollbar">
            {floorEmps.map(emp => (
              <div key={emp.id} className="px-3 py-1 flex items-center gap-2 border-b border-[var(--border-primary)]/15">
                <div className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-mono font-bold flex-shrink-0"
                  style={{ background: emp.color + '22', border: `1px solid ${emp.color}44`, color: emp.color }}>
                  {emp.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-mono text-[var(--text-primary)] truncate">{emp.name}</div>
                  <div className="text-[7px] font-mono text-[var(--text-muted)] truncate">{emp.role}</div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_DOT[emp.status] }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
