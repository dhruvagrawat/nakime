'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, UserX, MapPin, RefreshCw, Plus, X } from 'lucide-react';

interface Employee {
  employee_id: string;
  name: string;
  department: string;
  role: string;
  location: string;
  lat: number | null;
  lng: number | null;
  status: 'active' | 'away' | 'busy' | 'offline';
  avatar_initials: string;
  badge_color: string;
  last_seen: number;
  checked_in: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  active:  'var(--alert-green)',
  away:    'var(--gold-primary)',
  busy:    '#ff6b35',
  offline: 'var(--text-muted)',
};

const STATUS_LABEL: Record<string, string> = {
  active:  'ACTIVE',
  away:    'AWAY',
  busy:    'BUSY',
  offline: 'OFFLINE',
};

function timeSince(ts: number): string {
  const secs = Math.floor((Date.now() / 1000) - ts);
  if (secs < 60)   return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  return `${Math.floor(secs / 3600)}h`;
}

interface Props {
  onLocate?: (lat: number, lng: number) => void;
}

export default function EmployeePanel({ onLocate }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [counts,    setCounts]    = useState({ active: 0, total: 0 });
  const [loading,   setLoading]   = useState(true);
  const [addMode,   setAddMode]   = useState(false);
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Add form state
  const [form, setForm] = useState({
    employee_id: '', name: '', department: '', role: '', location: '',
    lat: '', lng: '', status: 'active', avatar_initials: '',
  });

  const fetchPresence = useCallback(async () => {
    try {
      const r = await fetch('/api/volt/employees');
      if (!r.ok) return;
      const d = await r.json();
      setEmployees(d.employees ?? []);
      setCounts({ active: d.active_count ?? 0, total: d.total ?? 0 });
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresence();
    const iv = setInterval(fetchPresence, 15_000);
    return () => clearInterval(iv);
  }, [fetchPresence]);

  const addEmployee = async () => {
    if (!form.employee_id.trim() || !form.name.trim()) return;
    try {
      await fetch('/api/volt/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          avatar_initials: form.avatar_initials || form.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(),
          badge_color: '#00e5ff',
        }),
      });
      setForm({ employee_id: '', name: '', department: '', role: '', location: '', lat: '', lng: '', status: 'active', avatar_initials: '' });
      setAddMode(false);
      fetchPresence();
    } catch { /* silent */ }
  };

  const departments = ['ALL', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];
  const visible = deptFilter === 'ALL' ? employees : employees.filter(e => e.department === deptFilter);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-panel overflow-hidden flex flex-col"
      style={{ maxHeight: '400px' }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[var(--border-primary)] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[var(--cyan-primary)]" />
          <span className="text-[11px] font-mono font-bold tracking-[0.15em] text-[var(--text-heading)]">PERSONNEL</span>
          <span className="text-[9px] font-mono text-[var(--alert-green)]">{counts.active} ACTIVE</span>
          <span className="text-[9px] font-mono text-[var(--text-muted)]">/ {counts.total}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setAddMode(a => !a)} className="p-1 hover:text-[var(--cyan-primary)] transition-colors" title="Add employee">
            {addMode ? <X className="w-3 h-3 text-[var(--text-muted)]" /> : <Plus className="w-3 h-3 text-[var(--text-muted)]" />}
          </button>
          <button onClick={fetchPresence} className="p-1 hover:text-[var(--cyan-primary)] transition-colors">
            <RefreshCw className="w-3 h-3 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {addMode && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[var(--border-primary)]/40">
            <div className="px-3 py-2 grid grid-cols-2 gap-1.5">
              {[
                ['employee_id', 'Employee ID *'],
                ['name',        'Full Name *'],
                ['department',  'Department'],
                ['role',        'Role'],
                ['location',    'Location'],
                ['lat',         'Lat (opt)'],
                ['lng',         'Lng (opt)'],
              ].map(([key, label]) => (
                <input key={key}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={label}
                  className="bg-black/40 border border-[var(--border-primary)] rounded px-2 py-1 text-[9px] font-mono text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--cyan-primary)]"
                />
              ))}
              <button onClick={addEmployee}
                className="col-span-2 py-1 rounded text-[9px] font-mono font-bold bg-[var(--cyan-primary)]/10 border border-[var(--cyan-primary)]/30 text-[var(--cyan-primary)] hover:bg-[var(--cyan-primary)]/20 transition-colors">
                CHECK IN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Department filter */}
      {departments.length > 2 && (
        <div className="px-3 py-1.5 flex gap-1 overflow-x-auto border-b border-[var(--border-primary)]/40 flex-shrink-0">
          {departments.map(dept => (
            <button key={dept} onClick={() => setDeptFilter(dept)}
              className="px-2 py-0.5 rounded text-[8px] font-mono whitespace-nowrap transition-colors flex-shrink-0"
              style={{
                background: deptFilter === dept ? 'rgba(0,229,255,0.1)' : 'transparent',
                color: deptFilter === dept ? 'var(--cyan-primary)' : 'var(--text-muted)',
                border: `1px solid ${deptFilter === dept ? 'rgba(0,229,255,0.3)' : 'transparent'}`,
              }}>
              {dept}
            </button>
          ))}
        </div>
      )}

      {/* Employee list */}
      <div className="overflow-y-auto styled-scrollbar flex-1 min-h-0">
        {loading && (
          <div className="flex items-center justify-center py-5 gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan-primary)] animate-osiris-pulse" />
            <span className="text-[10px] font-mono text-[var(--text-muted)]">LOADING PERSONNEL...</span>
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <Users className="w-5 h-5 text-[var(--text-muted)]" />
            <span className="text-[10px] font-mono text-[var(--text-muted)]">NO PERSONNEL ON RECORD</span>
            <span className="text-[9px] font-mono text-[var(--text-muted)]">Use + to add employees</span>
          </div>
        )}

        {visible.map((emp) => (
          <div key={emp.employee_id}
            className="px-3 py-2 flex items-center gap-2.5 border-b border-[var(--border-primary)]/30 hover:bg-white/[0.02]">
            {/* Avatar */}
            <div className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-[9px] font-mono font-bold relative"
              style={{ background: `${emp.badge_color}18`, border: `1px solid ${emp.badge_color}40`, color: emp.badge_color }}>
              {emp.avatar_initials || emp.name.slice(0,2).toUpperCase()}
              <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black"
                style={{ background: STATUS_COLOR[emp.status] }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[var(--text-primary)] truncate">{emp.name}</span>
                <span className="text-[7px] font-mono font-bold" style={{ color: STATUS_COLOR[emp.status] }}>
                  {STATUS_LABEL[emp.status]}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {emp.department && <span className="text-[8px] font-mono text-[var(--text-muted)]">{emp.department}</span>}
                {emp.location && (
                  <span className="flex items-center gap-0.5 text-[8px] font-mono text-[var(--text-muted)]">
                    <MapPin className="w-2 h-2" />{emp.location}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <span className="text-[8px] font-mono text-[var(--text-muted)]">{timeSince(emp.last_seen)}</span>
              {onLocate && emp.lat != null && emp.lng != null && (
                <button onClick={() => onLocate(emp.lat!, emp.lng!)}
                  className="p-0.5 hover:text-[var(--cyan-primary)] transition-colors">
                  <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
