// Static enterprise office data — 3 India offices, 3 floors each.
// In production this would come from a backend API / database.

export type RoomType =
  | 'office' | 'meeting' | 'server' | 'datacenter'
  | 'security' | 'soc' | 'noc' | 'reception'
  | 'cafeteria' | 'storage' | 'network';

export interface Room {
  id: string;
  name: string;
  x: number; y: number; w: number; h: number; // SVG coords in 400×280 space
  type: RoomType;
}

export interface Camera {
  id: string;
  name: string;
  room_id: string;
  floor: number;
  status: 'online' | 'offline';
  stream_url?: string;
}

export interface OfficeEmployee {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  floor: number;
  room_id: string;
  status: 'active' | 'away' | 'busy' | 'offline';
  color: string;
}

export interface FloorPlan {
  floor: number;
  label: string;
  rooms: Room[];
}

export interface Office {
  id: string;
  name: string;
  short: string;
  city: string;
  state: string;
  type: 'hq' | 'datacenter' | 'office';
  lat: number;
  lng: number;
  address: string;
  floors: FloorPlan[];
  cameras: Camera[];
  employees: OfficeEmployee[];
}

// ─── Room colour by type ───────────────────────────────────────────────────
export const ROOM_STYLE: Record<RoomType, { fill: string; stroke: string; label: string }> = {
  office:     { fill: 'rgba(0,229,255,0.10)',   stroke: 'rgba(0,229,255,0.40)',   label: '#00e5ff' },
  meeting:    { fill: 'rgba(212,175,55,0.12)',  stroke: 'rgba(212,175,55,0.45)',  label: '#d4af37' },
  server:     { fill: 'rgba(100,120,255,0.14)', stroke: 'rgba(100,120,255,0.45)', label: '#6478ff' },
  datacenter: { fill: 'rgba(100,120,255,0.18)', stroke: 'rgba(100,120,255,0.60)', label: '#6478ff' },
  security:   { fill: 'rgba(255,59,48,0.12)',   stroke: 'rgba(255,59,48,0.45)',   label: '#ff3b30' },
  soc:        { fill: 'rgba(255,59,48,0.14)',   stroke: 'rgba(255,59,48,0.55)',   label: '#ff3b30' },
  noc:        { fill: 'rgba(255,107,53,0.14)',  stroke: 'rgba(255,107,53,0.55)',  label: '#ff6b35' },
  reception:  { fill: 'rgba(76,175,80,0.12)',   stroke: 'rgba(76,175,80,0.40)',   label: '#4caf50' },
  cafeteria:  { fill: 'rgba(255,152,0,0.12)',   stroke: 'rgba(255,152,0,0.40)',   label: '#ff9800' },
  storage:    { fill: 'rgba(120,120,120,0.10)', stroke: 'rgba(120,120,120,0.35)', label: '#888' },
  network:    { fill: 'rgba(0,188,212,0.14)',   stroke: 'rgba(0,188,212,0.50)',   label: '#00bcd4' },
};

const STATUS_COLOR: Record<string, string> = {
  active:  '#4caf50',
  away:    '#d4af37',
  busy:    '#ff6b35',
  offline: '#555',
};

// ─── Mumbai HQ ────────────────────────────────────────────────────────────
const MUMBAI: Office = {
  id: 'mumbai-hq',
  name: 'Mumbai Headquarters',
  short: 'MUM HQ',
  city: 'Mumbai',
  state: 'Maharashtra',
  type: 'hq',
  lat: 19.1197,
  lng: 72.8472,
  address: 'Andheri East, Mumbai, Maharashtra 400069',
  floors: [
    {
      floor: 1,
      label: 'F1 — Public',
      rooms: [
        { id: 'mum-f1-rec',   name: 'Reception & Lobby',  x: 0,   y: 0,   w: 400, h: 60,  type: 'reception' },
        { id: 'mum-f1-sec',   name: 'Security Desk',      x: 0,   y: 60,  w: 90,  h: 100, type: 'security'  },
        { id: 'mum-f1-ws',    name: 'Open Workspace',     x: 90,  y: 60,  w: 185, h: 100, type: 'office'    },
        { id: 'mum-f1-conf1', name: 'Conference A',       x: 275, y: 60,  w: 125, h: 50,  type: 'meeting'   },
        { id: 'mum-f1-conf2', name: 'Conference B',       x: 275, y: 110, w: 125, h: 50,  type: 'meeting'   },
        { id: 'mum-f1-it',    name: 'IT Support',         x: 0,   y: 160, w: 135, h: 120, type: 'server'    },
        { id: 'mum-f1-cafe',  name: 'Cafeteria',          x: 135, y: 160, w: 265, h: 120, type: 'cafeteria' },
      ],
    },
    {
      floor: 2,
      label: 'F2 — Engineering',
      rooms: [
        { id: 'mum-f2-eng',   name: 'Engineering Hub',   x: 0,   y: 0,   w: 230, h: 140, type: 'office'  },
        { id: 'mum-f2-devops',name: 'DevOps Room',       x: 230, y: 0,   w: 170, h: 80,  type: 'server'  },
        { id: 'mum-f2-meet1', name: 'Sprint Room 1',     x: 230, y: 80,  w: 85,  h: 60,  type: 'meeting' },
        { id: 'mum-f2-meet2', name: 'Sprint Room 2',     x: 315, y: 80,  w: 85,  h: 60,  type: 'meeting' },
        { id: 'mum-f2-prod',  name: 'Product Team',      x: 0,   y: 140, w: 230, h: 90,  type: 'office'  },
        { id: 'mum-f2-svr',   name: 'Server Closet',     x: 230, y: 140, w: 80,  h: 90,  type: 'server'  },
        { id: 'mum-f2-stor',  name: 'Storage',           x: 310, y: 140, w: 90,  h: 90,  type: 'storage' },
        { id: 'mum-f2-break', name: 'Break Room',        x: 0,   y: 230, w: 400, h: 50,  type: 'cafeteria'},
      ],
    },
    {
      floor: 3,
      label: 'F3 — Executive',
      rooms: [
        { id: 'mum-f3-ceo',   name: 'CEO Office',         x: 0,   y: 0,   w: 110, h: 120, type: 'office'  },
        { id: 'mum-f3-exec',  name: 'Executive Suite',    x: 110, y: 0,   w: 175, h: 120, type: 'office'  },
        { id: 'mum-f3-board', name: 'Board Room',         x: 285, y: 0,   w: 115, h: 120, type: 'meeting' },
        { id: 'mum-f3-fin',   name: 'Finance',            x: 0,   y: 120, w: 200, h: 90,  type: 'office'  },
        { id: 'mum-f3-hr',    name: 'HR & Legal',         x: 200, y: 120, w: 200, h: 90,  type: 'office'  },
        { id: 'mum-f3-conf',  name: 'Executive Conference',x: 0,  y: 210, w: 400, h: 70,  type: 'meeting' },
      ],
    },
  ],
  cameras: [
    { id: 'mum-cam-01', name: 'Lobby Main',         room_id: 'mum-f1-rec',   floor: 1, status: 'online' },
    { id: 'mum-cam-02', name: 'Lobby Side',         room_id: 'mum-f1-rec',   floor: 1, status: 'online' },
    { id: 'mum-cam-03', name: 'Security Desk',      room_id: 'mum-f1-sec',   floor: 1, status: 'online' },
    { id: 'mum-cam-04', name: 'Conference A',       room_id: 'mum-f1-conf1', floor: 1, status: 'online' },
    { id: 'mum-cam-05', name: 'Cafeteria',          room_id: 'mum-f1-cafe',  floor: 1, status: 'offline' },
    { id: 'mum-cam-06', name: 'Engineering Hub',    room_id: 'mum-f2-eng',   floor: 2, status: 'online' },
    { id: 'mum-cam-07', name: 'DevOps Room',        room_id: 'mum-f2-devops',floor: 2, status: 'online' },
    { id: 'mum-cam-08', name: 'Server Closet',      room_id: 'mum-f2-svr',   floor: 2, status: 'online' },
    { id: 'mum-cam-09', name: 'Executive Suite',    room_id: 'mum-f3-exec',  floor: 3, status: 'online' },
    { id: 'mum-cam-10', name: 'Board Room',         room_id: 'mum-f3-board', floor: 3, status: 'online' },
  ],
  employees: [
    { id: 'mum-emp-01', name: 'Arjun Sharma',   initials: 'AS', role: 'CTO',            department: 'Executive',    floor: 3, room_id: 'mum-f3-exec',   status: 'active', color: '#9c27b0' },
    { id: 'mum-emp-02', name: 'Priya Mehta',    initials: 'PM', role: 'Backend Lead',   department: 'Engineering',  floor: 2, room_id: 'mum-f2-eng',    status: 'active', color: '#00e5ff' },
    { id: 'mum-emp-03', name: 'Rohan Gupta',    initials: 'RG', role: 'DevOps Eng.',    department: 'Engineering',  floor: 2, room_id: 'mum-f2-devops', status: 'busy',   color: '#ff6b35' },
    { id: 'mum-emp-04', name: 'Sneha Joshi',    initials: 'SJ', role: 'Product Manager',department: 'Product',      floor: 2, room_id: 'mum-f2-prod',   status: 'active', color: '#4caf50' },
    { id: 'mum-emp-05', name: 'Vikram Patel',   initials: 'VP', role: 'IT Support',     department: 'IT Ops',       floor: 1, room_id: 'mum-f1-it',     status: 'active', color: '#d4af37' },
    { id: 'mum-emp-06', name: 'Kavya Nair',     initials: 'KN', role: 'HR Manager',     department: 'HR',           floor: 3, room_id: 'mum-f3-hr',     status: 'away',   color: '#ff9800' },
  ],
};

// ─── Bangalore Data Centre ─────────────────────────────────────────────────
const BANGALORE: Office = {
  id: 'bangalore-dc',
  name: 'Bangalore Data Centre',
  short: 'BLR DC',
  city: 'Bangalore',
  state: 'Karnataka',
  type: 'datacenter',
  lat: 12.8456,
  lng: 77.6603,
  address: 'Electronic City Phase 1, Bangalore, Karnataka 560100',
  floors: [
    {
      floor: 1,
      label: 'F1 — Primary Hall',
      rooms: [
        { id: 'blr-f1-dha',  name: 'Data Hall A',          x: 0,   y: 0,   w: 260, h: 180, type: 'datacenter' },
        { id: 'blr-f1-noc',  name: 'Network Ops Centre',   x: 260, y: 0,   w: 140, h: 120, type: 'noc'        },
        { id: 'blr-f1-soc',  name: 'Security Ops Centre',  x: 260, y: 120, w: 140, h: 60,  type: 'soc'        },
        { id: 'blr-f1-rec',  name: 'Reception',            x: 0,   y: 180, w: 200, h: 100, type: 'reception'  },
        { id: 'blr-f1-stor', name: 'Storage & Spares',     x: 200, y: 180, w: 200, h: 100, type: 'storage'    },
      ],
    },
    {
      floor: 2,
      label: 'F2 — Secondary Hall',
      rooms: [
        { id: 'blr-f2-dhb',  name: 'Data Hall B',          x: 0,   y: 0,   w: 260, h: 180, type: 'datacenter' },
        { id: 'blr-f2-ups',  name: 'UPS Room',             x: 260, y: 0,   w: 140, h: 60,  type: 'server'     },
        { id: 'blr-f2-gen',  name: 'Generator Room',       x: 260, y: 60,  w: 140, h: 60,  type: 'server'     },
        { id: 'blr-f2-cool', name: 'Cooling Plant',        x: 260, y: 120, w: 140, h: 60,  type: 'server'     },
        { id: 'blr-f2-net',  name: 'Network Exchange',     x: 0,   y: 180, w: 400, h: 100, type: 'network'    },
      ],
    },
    {
      floor: 3,
      label: 'F3 — Management',
      rooms: [
        { id: 'blr-f3-mgmt', name: 'Management Office',   x: 0,   y: 0,   w: 200, h: 130, type: 'office'  },
        { id: 'blr-f3-mon',  name: 'Monitoring Room',     x: 200, y: 0,   w: 200, h: 130, type: 'noc'     },
        { id: 'blr-f3-lab',  name: 'Customer Lab',        x: 0,   y: 130, w: 200, h: 100, type: 'office'  },
        { id: 'blr-f3-test', name: 'Test Environment',    x: 200, y: 130, w: 200, h: 100, type: 'server'  },
        { id: 'blr-f3-break',name: 'Break Room',          x: 0,   y: 230, w: 400, h: 50,  type: 'cafeteria'},
      ],
    },
  ],
  cameras: [
    { id: 'blr-cam-01', name: 'Data Hall A — East',   room_id: 'blr-f1-dha',  floor: 1, status: 'online'  },
    { id: 'blr-cam-02', name: 'Data Hall A — West',   room_id: 'blr-f1-dha',  floor: 1, status: 'online'  },
    { id: 'blr-cam-03', name: 'NOC Floor',            room_id: 'blr-f1-noc',  floor: 1, status: 'online'  },
    { id: 'blr-cam-04', name: 'SOC Floor',            room_id: 'blr-f1-soc',  floor: 1, status: 'online'  },
    { id: 'blr-cam-05', name: 'Reception',            room_id: 'blr-f1-rec',  floor: 1, status: 'online'  },
    { id: 'blr-cam-06', name: 'Data Hall B — North',  room_id: 'blr-f2-dhb',  floor: 2, status: 'online'  },
    { id: 'blr-cam-07', name: 'Data Hall B — South',  room_id: 'blr-f2-dhb',  floor: 2, status: 'offline' },
    { id: 'blr-cam-08', name: 'Generator Room',       room_id: 'blr-f2-gen',  floor: 2, status: 'online'  },
    { id: 'blr-cam-09', name: 'Network Exchange',     room_id: 'blr-f2-net',  floor: 2, status: 'online'  },
    { id: 'blr-cam-10', name: 'Monitoring Room',      room_id: 'blr-f3-mon',  floor: 3, status: 'online'  },
    { id: 'blr-cam-11', name: 'Test Environment',     room_id: 'blr-f3-test', floor: 3, status: 'online'  },
  ],
  employees: [
    { id: 'blr-emp-01', name: 'Rahul Krishnan',  initials: 'RK', role: 'DC Manager',     department: 'IT Ops',    floor: 3, room_id: 'blr-f3-mgmt', status: 'active', color: '#9c27b0' },
    { id: 'blr-emp-02', name: 'Deepa Iyer',      initials: 'DI', role: 'SOC Analyst',    department: 'Security',  floor: 1, room_id: 'blr-f1-soc',  status: 'active', color: '#ff3b30' },
    { id: 'blr-emp-03', name: 'Suresh Babu',     initials: 'SB', role: 'NOC Engineer',   department: 'Network',   floor: 1, room_id: 'blr-f1-noc',  status: 'busy',   color: '#ff6b35' },
    { id: 'blr-emp-04', name: 'Lakshmi Rao',     initials: 'LR', role: 'Net. Engineer',  department: 'Network',   floor: 2, room_id: 'blr-f2-net',  status: 'active', color: '#00bcd4' },
    { id: 'blr-emp-05', name: 'Anand Kumar',     initials: 'AK', role: 'SysAdmin',       department: 'IT Ops',    floor: 3, room_id: 'blr-f3-mon',  status: 'away',   color: '#d4af37' },
  ],
};

// ─── Delhi Office ──────────────────────────────────────────────────────────
const DELHI: Office = {
  id: 'delhi-office',
  name: 'Delhi Regional Office',
  short: 'DEL',
  city: 'New Delhi',
  state: 'Delhi',
  type: 'office',
  lat: 28.6315,
  lng: 77.2167,
  address: 'Connaught Place, New Delhi, Delhi 110001',
  floors: [
    {
      floor: 1,
      label: 'F1 — Front Office',
      rooms: [
        { id: 'del-f1-rec',   name: 'Reception',           x: 0,   y: 0,   w: 400, h: 60,  type: 'reception' },
        { id: 'del-f1-sales', name: 'Sales Floor',         x: 0,   y: 60,  w: 230, h: 110, type: 'office'    },
        { id: 'del-f1-conf',  name: 'Main Conference',     x: 230, y: 60,  w: 170, h: 110, type: 'meeting'   },
        { id: 'del-f1-mkt',   name: 'Marketing',           x: 0,   y: 170, w: 200, h: 110, type: 'office'    },
        { id: 'del-f1-cs',    name: 'Customer Success',    x: 200, y: 170, w: 200, h: 110, type: 'office'    },
      ],
    },
    {
      floor: 2,
      label: 'F2 — Operations',
      rooms: [
        { id: 'del-f2-bd',    name: 'Business Dev.',       x: 0,   y: 0,   w: 200, h: 120, type: 'office'    },
        { id: 'del-f2-fin',   name: 'Finance',             x: 200, y: 0,   w: 200, h: 120, type: 'office'    },
        { id: 'del-f2-comp',  name: 'Compliance & Legal',  x: 0,   y: 120, w: 200, h: 110, type: 'office'    },
        { id: 'del-f2-meet1', name: 'Meeting Room 1',      x: 200, y: 120, w: 100, h: 55,  type: 'meeting'   },
        { id: 'del-f2-meet2', name: 'Meeting Room 2',      x: 300, y: 120, w: 100, h: 55,  type: 'meeting'   },
        { id: 'del-f2-meet3', name: 'Meeting Room 3',      x: 200, y: 175, w: 200, h: 55,  type: 'meeting'   },
        { id: 'del-f2-break', name: 'Break Room',          x: 0,   y: 230, w: 400, h: 50,  type: 'cafeteria' },
      ],
    },
    {
      floor: 3,
      label: 'F3 — Technology',
      rooms: [
        { id: 'del-f3-it',    name: 'IT Operations',       x: 0,   y: 0,   w: 200, h: 130, type: 'server'    },
        { id: 'del-f3-sec',   name: 'Security Team',       x: 200, y: 0,   w: 200, h: 130, type: 'security'  },
        { id: 'del-f3-hd',    name: 'Helpdesk',            x: 0,   y: 130, w: 200, h: 100, type: 'office'    },
        { id: 'del-f3-svr',   name: 'Server Room',         x: 200, y: 130, w: 200, h: 100, type: 'server'    },
        { id: 'del-f3-conf',  name: 'Exec. Conference',    x: 0,   y: 230, w: 400, h: 50,  type: 'meeting'   },
      ],
    },
  ],
  cameras: [
    { id: 'del-cam-01', name: 'Lobby Main',         room_id: 'del-f1-rec',   floor: 1, status: 'online'  },
    { id: 'del-cam-02', name: 'Sales Floor',         room_id: 'del-f1-sales', floor: 1, status: 'online'  },
    { id: 'del-cam-03', name: 'Main Conference',     room_id: 'del-f1-conf',  floor: 1, status: 'online'  },
    { id: 'del-cam-04', name: 'Finance',             room_id: 'del-f2-fin',   floor: 2, status: 'offline' },
    { id: 'del-cam-05', name: 'IT Operations',       room_id: 'del-f3-it',    floor: 3, status: 'online'  },
    { id: 'del-cam-06', name: 'Security Team',       room_id: 'del-f3-sec',   floor: 3, status: 'online'  },
    { id: 'del-cam-07', name: 'Server Room',         room_id: 'del-f3-svr',   floor: 3, status: 'online'  },
  ],
  employees: [
    { id: 'del-emp-01', name: 'Amit Singh',      initials: 'AS', role: 'Regional Head',  department: 'Management', floor: 2, room_id: 'del-f2-bd',   status: 'active', color: '#9c27b0' },
    { id: 'del-emp-02', name: 'Nisha Verma',     initials: 'NV', role: 'Sales Lead',     department: 'Sales',      floor: 1, room_id: 'del-f1-sales',status: 'active', color: '#4caf50' },
    { id: 'del-emp-03', name: 'Ravi Agarwal',    initials: 'RA', role: 'IT Engineer',    department: 'IT Ops',     floor: 3, room_id: 'del-f3-it',   status: 'busy',   color: '#00e5ff' },
    { id: 'del-emp-04', name: 'Pooja Kapoor',    initials: 'PK', role: 'Compliance Mgr', department: 'Legal',      floor: 2, room_id: 'del-f2-comp', status: 'active', color: '#ff9800' },
    { id: 'del-emp-05', name: 'Karan Malhotra',  initials: 'KM', role: 'Security Analyst',department: 'Security',  floor: 3, room_id: 'del-f3-sec',  status: 'active', color: '#ff3b30' },
    { id: 'del-emp-06', name: 'Meera Sharma',    initials: 'MS', role: 'Finance Head',   department: 'Finance',    floor: 2, room_id: 'del-f2-fin',  status: 'away',   color: '#d4af37' },
  ],
};

export const OFFICES: Office[] = [MUMBAI, BANGALORE, DELHI];

export const STATUS_DOT: Record<string, string> = {
  active:  '#4caf50',
  away:    '#d4af37',
  busy:    '#ff6b35',
  offline: '#444',
};
