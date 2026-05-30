'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MapPinned, Satellite, Moon, X, Shield, Activity } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ScaleBar from '@/components/ScaleBar';
import ErrorBoundary from '@/components/ErrorBoundary';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import SecurityAlertPanel from '@/components/SecurityAlertPanel';
import SystemHealthPanel from '@/components/SystemHealthPanel';
import EmployeePanel from '@/components/EmployeePanel';
import NetworkTrafficPanel from '@/components/NetworkTrafficPanel';
import OfficePanel from '@/components/OfficePanel';
import CyberNewsPanel from '@/components/CyberNewsPanel';
import AssetBrowserPanel from '@/components/AssetBrowserPanel';
import AssetDetailModal from '@/components/AssetDetailModal';
import DashboardCustomizer, { DEFAULT_CONFIG, type DashboardConfig } from '@/components/DashboardCustomizer';
import { ADANI_ASSETS, ASSET_TYPE_META } from '@/data/adani-assets';

const NakimeMap = dynamic(() => import('@/components/NakimeMap'), { ssr: false });
const LayerPanel = dynamic(() => import('@/components/LayerPanel'));
const CameraViewer = dynamic(() => import('@/components/CameraViewer'));

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Mobile if narrow, OR landscape phone (short height + moderate width)
      setIsMobile(w < 768 || (h < 500 && w < 1024));
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);
  return isMobile;
}
const UptimeClock = () => {
  const [uptime, setUptime] = useState('00:00:00');
  const startTime = useRef(Date.now());
  useEffect(() => {
    const iv = setInterval(() => {
      const e = Math.floor((Date.now() - startTime.current) / 1000);
      setUptime(`${String(Math.floor(e/3600)).padStart(2,'0')}:${String(Math.floor((e%3600)/60)).padStart(2,'0')}:${String(e%60).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  return <span className="hidden lg:inline">UPTIME: <span className="text-[var(--gold-primary)]">{uptime}</span></span>;
};

const ZuluClock = () => {
  const [time, setTime] = useState('');
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      setTime(`ZULU ${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}:${String(now.getUTCSeconds()).padStart(2,'0')}Z`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  return <span className="text-[var(--cyan-primary)] font-bold tabular-nums">{time || 'ZULU --:--:--Z'}</span>;
};


export default function Dashboard() {
  const dataRef = useRef<any>({});
  const [dataVersion, setDataVersion] = useState(0);
  const data = dataRef.current;

  const [backendStatus, setBackendStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [mapView, setMapView] = useState({ zoom: 4.5, latitude: 20.5937 }); // default: India
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number; ts: number } | null>(null);
  const mouseCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const coordsDisplayRef = useRef<HTMLDivElement>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [activeCamera, setActiveCamera] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'office'|'security'|'operations'|'intel'|null>(null);
  // ── Right-panel tab: security | operations | intel ──
  const [rightTab, setRightTab] = useState<'security'|'operations'|'intel'>('security');
  const [mapProjection, setMapProjection] = useState<'globe'|'mercator'>('globe');
  const [mapStyle, setMapStyle] = useState<'dark'|'satellite'>('dark');
  // ── Adani enterprise ──
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [dashConfig, setDashConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);

  const isMobile = useIsMobile();
  const startTime = useRef(Date.now());
  const geocodeCache = useRef<Map<string, string>>(new Map());
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGeocodedPos = useRef<{ lat: number; lng: number } | null>(null);

  // ── Enterprise layers only ──
  const [activeLayers, setActiveLayers] = useState({
    security_alerts: true,
    system_health:   true,
    employees:       true,
    flights:         false,  // company aircraft
    cctv:            false,  // facility cameras (heavy, off by default)
  });

  // Splash screen
  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(splashTimer);
  }, []);

  // URL state: parse on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    const lat = parseFloat(p.get('lat') || '');
    const lon = parseFloat(p.get('lon') || '');
    const zoom = parseFloat(p.get('zoom') || '');
    if (!isNaN(lat) && !isNaN(lon)) {
      setFlyToLocation({ lat, lng: lon, ts: Date.now() });
      if (!isNaN(zoom)) setMapView(v => ({ ...v, zoom }));
    }
    const layers = p.get('layers');
    if (layers) {
      const active = layers.split(',');
      setActiveLayers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { (next as any)[k] = active.includes(k); });
        return next;
      });
    }
  }, []);

  // URL state: update URL on view change (debounced)
  const urlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (urlTimer.current) clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(() => {
      const p = new URLSearchParams();
      p.set('lat', (mapView.latitude ?? 20).toFixed(4));
      p.set('lon', '0');
      p.set('zoom', mapView.zoom.toFixed(2));
      const active = Object.entries(activeLayers).filter(([,v]) => v).map(([k]) => k).join(',');
      p.set('layers', active);
      const url = `${window.location.pathname}?${p.toString()}`;
      window.history.replaceState(null, '', url);
    }, 1500);
  }, [mapView, activeLayers]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as Element)?.tagName)) return;
      if (e.key === 'f' && !e.ctrlKey) {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
      }
      if (e.key === 'r') setFlyToLocation({ lat: 20.5937, lng: 78.9629, ts: Date.now() });
      if (e.key === 'g') setMapProjection(p => p === 'globe' ? 'mercator' : 'globe');
    };
    const fsHandler = () => setIsFullscreen(!!document.fullscreenElement);
    window.addEventListener('keydown', handler);
    document.addEventListener('fullscreenchange', fsHandler);
    return () => { window.removeEventListener('keydown', handler); document.removeEventListener('fullscreenchange', fsHandler); };
  }, []);

  // Mouse coords + reverse geocode (Zero-Render)
  const handleMouseCoords = useCallback((coords: { lat: number; lng: number }) => {
    mouseCoordsRef.current = coords;
    if (coordsDisplayRef.current) {
      coordsDisplayRef.current.innerText = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
    }
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      if (lastGeocodedPos.current) {
        const d = Math.abs(coords.lat - lastGeocodedPos.current.lat) + Math.abs(coords.lng - lastGeocodedPos.current.lng);
        if (d < 0.5) return; // increased threshold — fewer geocode calls
      }
      const gk = `${coords.lat.toFixed(1)},${coords.lng.toFixed(1)}`; // coarser grid = more cache hits
      if (geocodeCache.current.has(gk)) { setLocationLabel(geocodeCache.current.get(gk)!); lastGeocodedPos.current = coords; return; }
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&zoom=10&addressdetails=1`, { headers: { 'Accept-Language': 'en' } });
        if (res.ok) {
          const d = await res.json();
          const a = d.address || {};
          const label = [a.city||a.town||a.village||a.county, a.state||a.region, a.country].filter(Boolean).join(', ') || 'Unknown';
          if (geocodeCache.current.size > 500) { const it = geocodeCache.current.keys(); for (let i=0;i<100;i++) { const k = it.next().value; if(k) geocodeCache.current.delete(k); }}
          geocodeCache.current.set(gk, label);
          setLocationLabel(label);
          lastGeocodedPos.current = coords;
        }
      } catch (e) { console.warn('[NAKIME] Suppressed error:', e instanceof Error ? e.message : e); }
    }, 3000); // 3s debounce (was 1.5s)
  }, []);


  const handleEntityClick = useCallback((entity: any) => {
    if (entity?.type === 'cctv')        setActiveCamera(entity);
    if (entity?.type === 'adani_asset') setSelectedAssetId(entity.id);
  }, []);

  // ── SHARED FETCH UTILITY (Fixes #107 — single definition, not 3 copies) ──
  const fetchEndpoint = useCallback(async (url: string, transform?: (d: any) => any, options?: RequestInit) => {
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        const json = await res.json();
        const d = transform ? transform(json) : json;
        dataRef.current = { ...dataRef.current, ...d };
        setDataVersion(v => v + 1);
        setBackendStatus('connected');
      }
    } catch (e) {
      console.warn('[NAKIME] Suppressed error:', e instanceof Error ? e.message : e);
      setBackendStatus('error');
    }
  }, []);

  // ── Inject static Adani asset data into the map data ref ──
  useEffect(() => {
    const features = ADANI_ASSETS.map(a => ({
      ...a, color: ASSET_TYPE_META[a.type].color,
    }));
    dataRef.current = { ...dataRef.current, adani_assets: features };
    setDataVersion(v => v + 1);
  }, []);  // run once — static data

  // ── ENTERPRISE DATA: initial load + polling ──
  useEffect(() => {
    // Initial fetch on mount
    fetchEndpoint('/api/volt/alerts',    d => ({ volt_alerts: d.alerts, volt_alert_stats: d.stats }));
    fetchEndpoint('/api/volt/agents',    d => ({ volt_agents: d.agents, volt_agent_counts: d.counts }));
    fetchEndpoint('/api/volt/employees', d => ({ volt_employees: d.employees }));
    const ivs = [
      setInterval(() => fetchEndpoint('/api/volt/alerts',    d => ({ volt_alerts: d.alerts, volt_alert_stats: d.stats })),  10_000),
      setInterval(() => fetchEndpoint('/api/volt/agents',    d => ({ volt_agents: d.agents, volt_agent_counts: d.counts })), 30_000),
      setInterval(() => fetchEndpoint('/api/volt/employees', d => ({ volt_employees: d.employees })), 15_000),
    ];
    return () => ivs.forEach(clearInterval);
  }, [fetchEndpoint]);

  // ── ON-DEMAND LAYER LOADING (enterprise only) ──
  const layerFetchedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (activeLayers.flights && !layerFetchedRef.current.has('flights')) {
      fetchEndpoint('/api/flights');
      layerFetchedRef.current.add('flights');
    }
    if (activeLayers.cctv && !layerFetchedRef.current.has('cctv')) {
      fetchEndpoint('/api/cctv?region=all&v=2');
      layerFetchedRef.current.add('cctv');
    }
  }, [activeLayers, fetchEndpoint]);



  return (
    <main className="fixed inset-0 w-full h-full bg-[var(--bg-void)] overflow-hidden">

      {/* ── SPLASH ── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at center, #0a0a14 0%, var(--bg-void) 70%)' }}
          >
            {/* ── Scanline CRT overlay ── */}
            <div className="absolute inset-0 pointer-events-none z-[1]" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(212,175,55,0.015) 2px, rgba(212,175,55,0.015) 4px)',
              animation: 'splashScanDrift 8s linear infinite',
            }} />

            {/* ── V4.2 badge — top-left ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute top-6 left-6 z-[2] font-mono text-[10px] tracking-[0.3em] text-[var(--gold-primary)]"
            >
              V4.2
            </motion.div>



            {/* ── Geometric tactical logo ── */}
            <div className="relative w-40 h-40 mb-8 flex items-center justify-center z-[2]">
              {/* Outer ring — slow clockwise */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                transition={{ opacity: { duration: 0.6 }, scale: { duration: 0.8, ease: 'easeOut' }, rotate: { duration: 20, repeat: Infinity, ease: 'linear' } }}
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: 'var(--gold-primary)', boxShadow: '0 0 12px var(--gold-primary), 0 0 24px rgba(212,175,55,0.3)' }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 rounded-full" style={{ background: 'rgba(212,175,55,0.5)', boxShadow: '0 0 6px rgba(212,175,55,0.3)' }} />
              </motion.div>

              {/* Middle ring — faster counter-clockwise */}
              <motion.div
                initial={{ opacity: 0, scale: 0.4, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: -360 }}
                transition={{ opacity: { duration: 0.6, delay: 0.15 }, scale: { duration: 0.8, delay: 0.15, ease: 'easeOut' }, rotate: { duration: 12, repeat: Infinity, ease: 'linear' } }}
                className="absolute rounded-full"
                style={{ inset: '18px', border: '1px solid rgba(0,229,255,0.15)' }}
              >
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyan-primary)', boxShadow: '0 0 10px var(--cyan-primary), 0 0 20px rgba(0,229,255,0.2)' }} />
                <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-1 h-1 rounded-full" style={{ background: 'rgba(0,229,255,0.4)' }} />
              </motion.div>

              {/* Inner ring — fastest clockwise */}
              <motion.div
                initial={{ opacity: 0, scale: 0.2, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                transition={{ opacity: { duration: 0.6, delay: 0.3 }, scale: { duration: 0.8, delay: 0.3, ease: 'easeOut' }, rotate: { duration: 7, repeat: Infinity, ease: 'linear' } }}
                className="absolute rounded-full"
                style={{ inset: '40px', border: '1px solid rgba(212,175,55,0.25)' }}
              >
                <div className="absolute top-0 left-1/4 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold-primary)', boxShadow: '0 0 8px var(--gold-primary)' }} />
              </motion.div>

              {/* Core circle + crosshair */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative w-12 h-12 rounded-full flex items-center justify-center"
                style={{ border: '2px solid var(--gold-primary)', boxShadow: '0 0 20px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.05)' }}
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-5 h-5 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(212,175,55,0.05) 70%)' }}
                />
                {/* Crosshair lines */}
                <div className="absolute w-[1px] h-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.3), transparent)' }} />
                <div className="absolute w-full h-[1px]" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent)' }} />
              </motion.div>

              {/* Faint pulsing radar sweep */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0], rotate: [0, 360] }}
                transition={{ opacity: { duration: 3, repeat: Infinity }, rotate: { duration: 3, repeat: Infinity, ease: 'linear' }, delay: 0.6 }}
                className="absolute inset-[10px] rounded-full"
                style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(212,175,55,0.15) 40deg, transparent 80deg)' }}
              />
            </div>

            {/* ── OSIRIS title — letter-by-letter stagger ── */}
            <div className="flex items-center gap-[2px] mb-3 z-[2]">
              {'NAKIME'.split('').map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                  className="text-4xl md:text-5xl font-bold tracking-[0.5em] font-mono"
                  style={{ color: 'var(--text-heading)', textShadow: '0 0 30px rgba(212,175,55,0.2)' }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* ── Subtitle — typewriter reveal ── */}
            <div className="overflow-hidden mb-8 z-[2]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.2, duration: 0.8, ease: 'easeInOut' }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-[10px] md:text-[11px] font-mono tracking-[0.5em] text-[var(--gold-primary)]" style={{ opacity: 0.8 }}>
                  ENTERPRISE SECURITY MONITORING
                </p>
              </motion.div>
            </div>

            {/* ── Multi-stage progress bar ── */}
            <div className="w-64 md:w-80 z-[2]">
              {/* Thin progress track */}
              <div className="relative w-full h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(212,175,55,0.1)' }}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: ['0%', '25%', '50%', '78%', '100%'] }}
                  transition={{ duration: 2.2, delay: 0.5, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeInOut' }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--gold-primary), var(--cyan-primary), var(--gold-primary))', boxShadow: '0 0 12px rgba(212,175,55,0.4)' }}
                />
              </div>

              {/* Status messages — cycling */}
              <div className="mt-3 h-4 flex items-center justify-center">
                {[
                  { text: 'ESTABLISHING SECURE CONNECTION...', delay: 0.5 },
                  { text: 'INITIALIZING FEEDS...', delay: 1.1 },
                  { text: 'CALIBRATING SENSORS...', delay: 1.7 },
                  { text: 'SYSTEM READY', delay: 2.2 },
                ].map((stage, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ delay: stage.delay, duration: 0.6, times: [0, 0.1, 0.7, 1] }}
                    className="absolute text-[9px] font-mono tracking-[0.25em]"
                    style={{ color: i === 3 ? 'var(--cyan-primary)' : 'var(--text-muted)' }}
                  >
                    {stage.text}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* ── Decorative grid lines ── */}
            <div className="absolute inset-0 pointer-events-none z-[0]" style={{ opacity: 0.03 }}>
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }} />
            </div>

            {/* ── Corner frame accents ── */}
            {[
              { t: '10px', l: '10px', bw: '2px 0 0 2px' },
              { t: '10px', r: '10px', bw: '2px 2px 0 0' },
              { b: '10px', l: '10px', bw: '0 0 2px 2px' },
              { b: '10px', r: '10px', bw: '0 2px 2px 0' },
            ].map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                className="absolute w-8 h-8 z-[2]"
                style={{ top: pos.t, bottom: pos.b, left: pos.l, right: pos.r, borderWidth: pos.bw, borderStyle: 'solid', borderColor: 'var(--gold-primary)' }}
              />
            ))}



            {/* ── Inline keyframe for scanline drift ── */}

          </motion.div>
        )}
      </AnimatePresence>



      {/* ── MAP ── */}
      <ErrorBoundary name="Map">
        <NakimeMap 
          data={data} 
          activeLayers={activeLayers} 
          projection={mapProjection} 
          mapStyle={mapStyle === 'satellite' ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' : 'dark'} 
          onEntityClick={handleEntityClick} 
          onMouseCoords={handleMouseCoords} 
          onViewStateChange={setMapView}
          flyToLocation={flyToLocation}
        />
      </ErrorBoundary>


      {/* ── MAP VIEW CONTROLS (3D/2D + SATELLITE TOGGLE) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.5 }}
        className="absolute bottom-[75px] md:bottom-6 left-3 md:left-[315px] z-[200] flex items-center gap-2 pointer-events-none"
      >
        {/* 3D/2D Toggle */}
        <button
          onClick={() => setMapProjection(p => p === 'globe' ? 'mercator' : 'globe')}
          className="glass-panel p-2.5 pointer-events-auto hover:border-[var(--gold-primary)]/40 transition-colors group relative"
          title={mapProjection === 'globe' ? 'Switch to 2D Map' : 'Switch to 3D Globe'}
        >
          {mapProjection === 'globe' ? (
            <MapPinned className="w-4 h-4 text-[var(--gold-primary)] group-hover:scale-110 transition-transform" />
          ) : (
            <Globe className="w-4 h-4 text-[var(--cyan-primary)] group-hover:scale-110 transition-transform" />
          )}
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[var(--text-muted)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity glass-panel px-2 py-1 z-[300]">
            {mapProjection === 'globe' ? '2D MAP' : '3D GLOBE'}
          </span>
        </button>

        {/* Map Style Toggle */}
        <button
          onClick={() => setMapStyle(s => s === 'dark' ? 'satellite' : 'dark')}
          className="glass-panel p-2.5 pointer-events-auto hover:border-[var(--gold-primary)]/40 transition-colors group relative"
          title={mapStyle === 'dark' ? 'Satellite View' : 'Night View'}
        >
          {mapStyle === 'dark' ? (
            <Satellite className="w-4 h-4 text-[var(--alert-green)] group-hover:scale-110 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--cyan-primary)] group-hover:scale-110 transition-transform" />
          )}
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[var(--text-muted)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity glass-panel px-2 py-1 z-[300]">
            {mapStyle === 'dark' ? 'SATELLITE' : 'NIGHT MODE'}
          </span>
        </button>
      </motion.div>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 2.5 }} className={`absolute top-3 left-3 md:top-5 md:left-5 z-[200] pointer-events-none flex items-center gap-2 md:gap-3`}>
        <div className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center relative">
          {/* Ambient glow ring — slow rotating */}
          <div className="absolute inset-[-4px] md:inset-[-5px] rounded-full border border-[var(--gold-primary)]/20" style={{ animation: 'osiris-rotate 12s linear infinite' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[var(--gold-primary)] shadow-[0_0_6px_var(--gold-primary)]" />
          </div>
          <div className="absolute inset-[-8px] md:inset-[-10px] rounded-full border border-[var(--gold-primary)]/10" style={{ animation: 'osiris-rotate 20s linear infinite reverse' }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0.5 h-0.5 rounded-full bg-[var(--gold-primary)]/60" />
          </div>
          <div className="w-5 h-5 md:w-7 md:h-7 rounded-full border-2 border-[var(--gold-primary)] flex items-center justify-center animate-glow-pulse">
            <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-[var(--gold-primary)]/30 border border-[var(--gold-primary)]/60" />
          </div>
          <div className="absolute w-[1px] h-full bg-[var(--gold-primary)]/30" />
          <div className="absolute w-full h-[1px] bg-[var(--gold-primary)]/30" />
        </div>
        {/* Horizontal rule extending from logo */}
        <div className="hidden md:block absolute top-1/2 left-[52px] w-[200px] h-[1px] bg-gradient-to-r from-[var(--gold-primary)]/40 via-[var(--gold-primary)]/15 to-transparent" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base md:text-xl font-bold tracking-[0.4em] md:tracking-[0.5em] text-[var(--text-heading)] font-mono">NAKIME</h1>
            <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-[1px] rounded-sm border border-(--alert-red)/40 bg-(--alert-red)/10 text-[7px] font-mono font-bold tracking-[0.15em] text-(--alert-red) uppercase" style={{ lineHeight: '1.4' }}>
              <Shield className="w-2.5 h-2.5" />
              VOLT
            </span>
          </div>
          <span className="text-[8px] md:text-[9px] text-[var(--gold-primary)] font-mono tracking-[0.2em] md:tracking-[0.3em] opacity-80">ENTERPRISE CYBERSECURITY MONITORING</span>
        </div>
      </motion.div>

      {/* ── TOP-RIGHT STATUS (desktop) ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }}
        className="absolute top-3 right-3 md:top-4 md:right-5 z-200 pointer-events-none flex items-center gap-1.5 md:gap-3 text-[9px] md:text-[10px] font-mono tracking-widest text-(--text-muted)">
        <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-(--border-primary) bg-black/30">
          <ZuluClock />
        </span>
        <span className="hidden lg:inline text-(--border-primary)">│</span>
        <span className="flex items-center gap-1">SYS: <span className={backendStatus === 'connected' ? 'text-(--alert-green)' : 'text-(--alert-red)'}>{backendStatus.toUpperCase()}</span></span>
        {(data as any).volt_alert_stats?.critical > 0 && (
          <span className="hidden lg:inline-flex items-center gap-1 text-(--alert-red) font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-(--alert-red) animate-osiris-pulse" />
            {(data as any).volt_alert_stats.critical} CRITICAL
          </span>
        )}
        {(data as any).volt_agent_counts?.active > 0 && (
          <span className="hidden lg:inline text-(--alert-green)">
            {(data as any).volt_agent_counts.active} AGENTS
          </span>
        )}
        <UptimeClock />
      </motion.div>



      {/* ── LEFT HUD: Asset browser + office maps + layers ── */}
      <div className="desktop-panel absolute left-5 top-20 bottom-24 w-72 flex flex-col gap-3 z-[200] pointer-events-auto overflow-y-auto styled-scrollbar pr-1">
        {/* Enterprise stats strip */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="glass-panel px-3 py-2 shrink-0">
          <div className="grid grid-cols-5 gap-1 text-center">
            <div>
              <div className="hud-label">AGENTS</div>
              <div className="hud-value text-[10px] animate-data-pulse" style={{ color: 'var(--alert-green)' }}>
                {(data as any).volt_agent_counts?.active ?? '—'}
              </div>
            </div>
            <div>
              <div className="hud-label">ALERTS</div>
              <div className="hud-value text-[10px]" style={{ color: (data as any).volt_alert_stats?.critical > 0 ? 'var(--alert-red)' : 'var(--gold-primary)' }}>
                {(data as any).volt_alert_stats?.total ?? '—'}
              </div>
            </div>
            <div>
              <div className="hud-label">STAFF</div>
              <div className="hud-value text-[10px]" style={{ color: 'var(--cyan-primary)' }}>
                {Array.isArray((data as any).volt_employees) ? (data as any).volt_employees.filter((e: any) => e.checked_in).length : '—'}
              </div>
            </div>
            <div>
              <div className="hud-label">ASSETS</div>
              <div className="hud-value text-[10px]" style={{ color: 'var(--gold-primary)' }}>{ADANI_ASSETS.length}</div>
            </div>
            <div>
              <div className="hud-label">SITES</div>
              <div className="hud-value text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {Array.from(new Set(ADANI_ASSETS.map(a => a.country))).length}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Asset browser — search/filter Adani assets + fly to */}
        {dashConfig.showAssetBrowser && (
          <AssetBrowserPanel
            selectedAssetId={selectedAssetId}
            onSelectAsset={id => {
              setSelectedAssetId(id);
              const a = ADANI_ASSETS.find(x => x.id === id);
              if (a) setFlyToLocation({ lat: a.lat, lng: a.lng, ts: Date.now() });
            }}
            onFlyTo={(lat, lng, zoom) => {
              setFlyToLocation({ lat, lng, ts: Date.now() });
              if (zoom) setMapView(v => ({ ...v, zoom }));
            }}
          />
        )}

        {/* Office floor plan navigator */}
        {dashConfig.showOfficeMap && (
          <OfficePanel
            onFlyTo={(lat, lng, zoom) => {
              setFlyToLocation({ lat, lng, ts: Date.now() });
              if (zoom) setMapView(v => ({ ...v, zoom }));
            }}
            onCameraOpen={setActiveCamera}
          />
        )}

        {/* Enterprise layer toggles */}
        {dashConfig.showLayerPanel && (
          <LayerPanel data={data} activeLayers={activeLayers} setActiveLayers={setActiveLayers} />
        )}
      </div>

      {/* ── RIGHT HUD (desktop): Enterprise tabs + customiser ── */}
      <div className="desktop-panel absolute right-5 top-20 bottom-24 w-80 flex flex-col gap-3 z-[200] pointer-events-auto overflow-y-auto styled-scrollbar pr-1">

        {/* Search + customiser button in a row */}
        <div className="flex gap-2 items-start shrink-0">
          <div className="flex-1"><SearchBar onLocate={(lat, lng) => setFlyToLocation({ lat, lng, ts: Date.now() })} /></div>
          <DashboardCustomizer config={dashConfig} onChange={setDashConfig} />
        </div>

        {/* Tab switcher — only show enabled tabs */}
        {(() => {
          const tabs = [
            dashConfig.showSecurityTab   && { id: 'security'   as const, label: 'SECURITY',   active: 'rgba(255,59,48,0.18)',  text: '#ff3b30' },
            dashConfig.showOperationsTab && { id: 'operations' as const, label: 'OPERATIONS', active: 'rgba(0,229,255,0.14)',  text: '#00e5ff' },
            dashConfig.showIntelTab      && { id: 'intel'      as const, label: 'INTEL',      active: 'rgba(212,175,55,0.14)', text: '#d4af37' },
          ].filter(Boolean) as Array<{ id: typeof rightTab; label: string; active: string; text: string }>;

          if (!tabs.length) return null;
          // Auto-switch to first available tab if current is hidden
          const activeTab = tabs.find(t => t.id === rightTab) ? rightTab : tabs[0].id;
          if (activeTab !== rightTab) setRightTab(activeTab);

          return (
            <div className="glass-panel p-0.5 flex gap-0.5 shrink-0">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setRightTab(tab.id)}
                  className="flex-1 py-1.5 rounded text-[9px] font-mono font-bold tracking-[0.15em] transition-all relative"
                  style={{
                    background: rightTab === tab.id ? tab.active : 'transparent',
                    color: rightTab === tab.id ? tab.text : 'var(--text-muted)',
                    border: `1px solid ${rightTab === tab.id ? tab.text + '50' : 'transparent'}`,
                  }}>
                  {tab.label}
                  {tab.id === 'security' && ((data as any).volt_alert_stats?.critical > 0) && (
                    <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-(--alert-red) animate-osiris-pulse" />
                  )}
                </button>
              ))}
            </div>
          );
        })()}

        {/* SECURITY tab */}
        {rightTab === 'security' && dashConfig.showSecurityTab && (
          <>
            <SecurityAlertPanel />
            <SystemHealthPanel />
          </>
        )}

        {/* OPERATIONS tab */}
        {rightTab === 'operations' && dashConfig.showOperationsTab && (
          <>
            <EmployeePanel onLocate={(lat, lng) => setFlyToLocation({ lat, lng, ts: Date.now() })} />
            <NetworkTrafficPanel />
          </>
        )}

        {/* INTEL tab */}
        {rightTab === 'intel' && dashConfig.showIntelTab && <CyberNewsPanel />}
      </div>

      {/* ── ASSET DETAIL MODAL ── */}
      <AssetDetailModal
        assetId={selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
        onFlyTo={(lat, lng, zoom) => {
          setFlyToLocation({ lat, lng, ts: Date.now() });
          if (zoom) setMapView(v => ({ ...v, zoom }));
        }}
        onCameraOpen={setActiveCamera}
      />

      {/* ═══ MOBILE UI ═══ */}
      {isMobile && (
        <>
          <div className="mobile-nav">
            <div className="glass-panel mobile-nav-inner">
              {([
                { id: 'office'     as const, icon: Globe,    label: 'OFFICE'  },
                { id: 'security'   as const, icon: Shield,   label: 'SECURITY'},
                { id: 'operations' as const, icon: Activity, label: 'OPS'     },
                { id: 'intel'      as const, icon: Activity, label: 'INTEL'   },
              ]).map(tab => (
                <button key={tab.id} onClick={() => setMobilePanel(mobilePanel === tab.id ? null : tab.id)}
                  className={`mobile-nav-btn ${mobilePanel === tab.id ? 'active' : ''}`}>
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence>
            {mobilePanel && (
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-[52px] left-0 right-0 z-[400] glass-panel rounded-b-none overflow-y-auto styled-scrollbar"
                style={{ maxHeight: 'min(60vh, calc(100dvh - 100px))' }}
              >
                <div className="mobile-drawer-handle" />
                <div className="px-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono text-foreground uppercase tracking-widest">{mobilePanel}</span>
                    <button onClick={() => setMobilePanel(null)} className="text-(--text-muted) p-1"><X className="w-4 h-4" /></button>
                  </div>
                  {mobilePanel === 'office'     && <OfficePanel onFlyTo={(lat, lng, zoom) => { setFlyToLocation({ lat, lng, ts: Date.now() }); if (zoom) setMapView(v => ({ ...v, zoom })); setMobilePanel(null); }} onCameraOpen={setActiveCamera} />}
                  {mobilePanel === 'security'   && <><SecurityAlertPanel /><SystemHealthPanel /></>}
                  {mobilePanel === 'operations' && <><EmployeePanel onLocate={(lat, lng) => { setFlyToLocation({ lat, lng, ts: Date.now() }); setMobilePanel(null); }} /><NetworkTrafficPanel /></>}
                  {mobilePanel === 'intel'      && <CyberNewsPanel />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── BOTTOM CENTER HUD (desktop) ── */}
      {!isMobile && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3, duration: 0.8 }}
          className="desktop-only absolute bottom-5 left-1/2 -translate-x-1/2 z-200 pointer-events-none">
          <div className="glass-panel px-5 py-2.5 flex items-center gap-0 osiris-glow relative overflow-hidden"
            style={{ borderImage: 'linear-gradient(90deg, rgba(212,175,55,0.05), rgba(212,175,55,0.2), rgba(212,175,55,0.05)) 1', borderImageSlice: 1, borderWidth: '1px', borderStyle: 'solid' }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              <div className="absolute top-0 bottom-0 w-15 bg-linear-to-r from-transparent via-(--gold-primary)/7 to-transparent" style={{ animation: 'hud-scanline 4s ease-in-out infinite' }} />
            </div>
            <div className="flex flex-col items-center min-w-27.5 px-3">
              <div className="hud-label">COORDINATES</div>
              <div ref={coordsDisplayRef} className="text-[10px] font-mono font-bold text-(--gold-primary) tracking-wide tabular-nums">—</div>
            </div>
            <div className="w-px h-8 bg-linear-to-b from-transparent via-(--border-primary) to-transparent shrink-0" />
            <div className="flex flex-col items-center min-w-40 max-w-70 px-3">
              <div className="hud-label">LOCATION</div>
              <div className="text-[9px] text-(--text-secondary) font-mono truncate max-w-70">{locationLabel || 'Hover over map...'}</div>
            </div>
            <div className="w-px h-8 bg-linear-to-b from-transparent via-(--border-primary) to-transparent shrink-0" />
            <div className="flex flex-col items-center px-3">
              <div className="hud-label">ZOOM</div>
              <div className="text-[10px] font-mono font-bold text-(--gold-primary) tabular-nums">{mapView.zoom.toFixed(1)}</div>
            </div>
            <div className="w-px h-8 bg-linear-to-b from-transparent via-(--border-primary) to-transparent shrink-0" />
            <div className="flex flex-col items-center px-3 min-w-20">
              <div className="hud-label">ALERTS</div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-(--alert-red)" />
                <span className="text-[10px] font-mono font-bold text-(--alert-red) tabular-nums">
                  {(data as any).volt_alert_stats?.total ?? '—'}
                </span>
              </div>
            </div>
            <div className="w-px h-8 bg-linear-to-b from-transparent via-(--border-primary) to-transparent shrink-0" />
            <div className="flex flex-col items-center px-3 min-w-20">
              <div className="hud-label">AGENTS</div>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-(--alert-green)" />
                <span className="text-[10px] font-mono font-bold text-(--alert-green) tabular-nums">
                  {(data as any).volt_agent_counts?.active ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Scale Bar (desktop) ── */}
      <div className="desktop-only absolute bottom-18 left-80 z-201 pointer-events-none">
        <ScaleBar zoom={mapView.zoom} latitude={mapView.latitude} />
      </div>

      {/* ── Camera Viewer ── */}
      <CameraViewer
        camera={activeCamera}
        onClose={() => setActiveCamera(null)}
        onLocate={(lat, lng) => setFlyToLocation({ lat, lng, ts: Date.now() })}
      />

      {/* ── OVERLAYS ── */}
      <div className="vignette absolute inset-0 pointer-events-none z-2" />
      <div className="crt-scanlines absolute inset-0 pointer-events-none z-3 opacity-[0.02]" />
      {[
        { pos: 'top-0 left-0',    vAnchor: 'top-0',    hAnchor: 'left-0',  hGrad: 'bg-linear-to-r', vGrad: 'bg-linear-to-b' },
        { pos: 'top-0 right-0',   vAnchor: 'top-0',    hAnchor: 'right-0', hGrad: 'bg-linear-to-l', vGrad: 'bg-linear-to-b' },
        { pos: 'bottom-0 left-0', vAnchor: 'bottom-0', hAnchor: 'left-0',  hGrad: 'bg-linear-to-r', vGrad: 'bg-linear-to-t' },
        { pos: 'bottom-0 right-0',vAnchor: 'bottom-0', hAnchor: 'right-0', hGrad: 'bg-linear-to-l', vGrad: 'bg-linear-to-t' },
      ].map((c, i) => (
        <div key={i} className={`absolute ${c.pos} w-16 h-16 pointer-events-none z-1`}>
          <div className={`absolute ${c.vAnchor} ${c.hAnchor} w-full h-px ${c.hGrad} from-(--gold-primary)/30 to-transparent`} />
          <div className={`absolute ${c.vAnchor} ${c.hAnchor} w-px h-full ${c.vGrad} from-(--gold-primary)/30 to-transparent`} />
        </div>
      ))}

      <KeyboardShortcuts />

      {/* Shortcut hint */}
      <div className="desktop-only absolute bottom-6.5 right-5 z-200 pointer-events-none text-[6px] font-mono text-(--text-muted)/40 tracking-widest">
        [F] FULLSCREEN · [G] GLOBE/2D · [R] RESET VIEW
      </div>


    </main>
  );
}
