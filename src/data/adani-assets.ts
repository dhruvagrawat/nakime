// Adani Enterprises — Corporate Asset Registry
// Sources: APSEZ, AAHL, Adani Green, Adani Power public disclosures.
// For customisation: add / remove assets here and they appear on the map automatically.

export type AssetType =
  | 'port' | 'airport' | 'power_thermal' | 'power_solar' | 'power_wind'
  | 'hq' | 'office' | 'datacenter' | 'mine' | 'warehouse' | 'special_economic_zone';

export type AssetRegion = 'india' | 'international';

export interface AssetCamera {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  stream_url?: string;
  location?: string;
}

export interface AdaniAsset {
  id: string;
  name: string;
  short: string;           // abbreviated name for map label
  type: AssetType;
  region: AssetRegion;
  country: string;
  state?: string;
  city: string;
  lat: number;
  lng: number;
  address?: string;
  status: 'operational' | 'maintenance' | 'construction' | 'offline';
  capacity?: string;       // MW, MT/year, MTPA etc
  description: string;
  cameras: AssetCamera[];
  employee_count?: number;
  established?: string;
  website?: string;
}

// ─── Colour + display per asset type ──────────────────────────────────────
export const ASSET_TYPE_META: Record<AssetType, { label: string; color: string; icon: string }> = {
  port:                 { label: 'Port',         color: '#00BCD4', icon: '⚓' },
  airport:              { label: 'Airport',       color: '#00E5FF', icon: '✈' },
  power_thermal:        { label: 'Thermal Power', color: '#FF9800', icon: '⚡' },
  power_solar:          { label: 'Solar Power',   color: '#FFD700', icon: '☀' },
  power_wind:           { label: 'Wind Power',    color: '#B2FF59', icon: '💨' },
  hq:                   { label: 'Headquarters',  color: '#CE93D8', icon: '🏛' },
  office:               { label: 'Office',        color: '#9C27B0', icon: '🏢' },
  datacenter:           { label: 'Data Centre',   color: '#2196F3', icon: '🖥' },
  mine:                 { label: 'Mine',           color: '#8D6E63', icon: '⛏' },
  warehouse:            { label: 'Warehouse',      color: '#607D8B', icon: '🏭' },
  special_economic_zone:{ label: 'SEZ',           color: '#4CAF50', icon: '🏗' },
};

export const STATUS_COLOR: Record<AdaniAsset['status'], string> = {
  operational:  '#4caf50',
  maintenance:  '#ff9800',
  construction: '#2196f3',
  offline:      '#f44336',
};

// ─── India — Ports (APSEZ) ─────────────────────────────────────────────────
const INDIA_PORTS: AdaniAsset[] = [
  {
    id: 'mundra-port', name: 'Mundra Port & SEZ', short: 'MUNDRA', type: 'port',
    region: 'india', country: 'India', state: 'Gujarat', city: 'Mundra',
    lat: 22.8394, lng: 69.7214,
    address: 'Mundra Port, Kutch District, Gujarat 370421',
    status: 'operational', capacity: '210 MT/year',
    description: 'Largest commercial port in India and the largest private sector port in Asia. Handles containers, coal, crude oil, fertilisers, and agri-commodities. Home to Adani\'s flagship SEZ with integrated logistics.',
    employee_count: 15000,
    established: '1998',
    cameras: [
      { id: 'mun-cam-01', name: 'Container Terminal North',  status: 'online', location: 'CT-N' },
      { id: 'mun-cam-02', name: 'Container Terminal South',  status: 'online', location: 'CT-S' },
      { id: 'mun-cam-03', name: 'Coal Berth 1',             status: 'online', location: 'Bulk' },
      { id: 'mun-cam-04', name: 'Coal Berth 2',             status: 'maintenance', location: 'Bulk' },
      { id: 'mun-cam-05', name: 'Crude Oil Terminal',       status: 'online', location: 'Liquid' },
      { id: 'mun-cam-06', name: 'Main Gate Security',       status: 'online', location: 'Gate' },
      { id: 'mun-cam-07', name: 'SEZ Operations Centre',    status: 'online', location: 'SEZ' },
      { id: 'mun-cam-08', name: 'Vessel Traffic Services',  status: 'online', location: 'VTS' },
    ],
  },
  {
    id: 'krishnapatnam-port', name: 'Krishnapatnam Port', short: 'KPCL', type: 'port',
    region: 'india', country: 'India', state: 'Andhra Pradesh', city: 'Krishnapatnam',
    lat: 14.2596, lng: 80.1136,
    status: 'operational', capacity: '64 MT/year',
    description: 'Deep-water multipurpose port on the eastern coast of India. Handles bulk cargo, containers, and motor vehicles. 5th largest port in India by volume.',
    employee_count: 3000,
    cameras: [
      { id: 'kpcl-cam-01', name: 'Bulk Terminal',    status: 'online' },
      { id: 'kpcl-cam-02', name: 'Auto Terminal',    status: 'online' },
      { id: 'kpcl-cam-03', name: 'Main Entrance',    status: 'online' },
    ],
  },
  {
    id: 'dhamra-port', name: 'Dhamra Port', short: 'DHAMRA', type: 'port',
    region: 'india', country: 'India', state: 'Odisha', city: 'Dhamra',
    lat: 20.4762, lng: 86.9098,
    status: 'operational', capacity: '45 MT/year',
    description: 'All-weather, deep draught, multi-cargo port serving Odisha and the eastern industrial belt. Connected to Paradip Refinery and integrated with local rail network.',
    cameras: [
      { id: 'dham-cam-01', name: 'Cargo Berth',      status: 'online' },
      { id: 'dham-cam-02', name: 'Control Tower',    status: 'online' },
      { id: 'dham-cam-03', name: 'Rail Yard',        status: 'online' },
    ],
  },
  {
    id: 'gangavaram-port', name: 'Gangavaram Port', short: 'GVMPTL', type: 'port',
    region: 'india', country: 'India', state: 'Andhra Pradesh', city: 'Visakhapatnam',
    lat: 17.7147, lng: 83.2879,
    status: 'operational', capacity: '64 MT/year',
    description: 'Deep-draft port near Visakhapatnam handling coal, iron ore, fertilisers, and general cargo. Strategically located for Vizag steel and power industries.',
    cameras: [
      { id: 'gang-cam-01', name: 'Iron Ore Yard',    status: 'online' },
      { id: 'gang-cam-02', name: 'Coal Stockpile',   status: 'online' },
    ],
  },
  {
    id: 'vizhinjam-port', name: 'Vizhinjam International Seaport', short: 'VZSM', type: 'port',
    region: 'india', country: 'India', state: 'Kerala', city: 'Thiruvananthapuram',
    lat: 8.3791, lng: 76.9787,
    status: 'construction', capacity: '1M TEU/year (Phase 1)',
    description: 'India\'s first dedicated international container transhipment port under construction. Natural deepwater advantage (>20 m), close to international shipping lane. First phase operational 2024.',
    cameras: [
      { id: 'vizh-cam-01', name: 'Construction Site Overview', status: 'online' },
      { id: 'vizh-cam-02', name: 'Quay Construction',          status: 'online' },
    ],
  },
  {
    id: 'kattupalli-port', name: 'Kattupalli Port', short: 'KTTPL', type: 'port',
    region: 'india', country: 'India', state: 'Tamil Nadu', city: 'Kattupalli',
    lat: 13.2684, lng: 80.3119,
    status: 'operational', capacity: '8 MT/year',
    description: 'Multi-purpose port north of Chennai handling containers, LPG, and general cargo. Integrated with an L&T shipyard.',
    cameras: [
      { id: 'katt-cam-01', name: 'LPG Terminal',    status: 'online' },
      { id: 'katt-cam-02', name: 'Main Gate',       status: 'online' },
    ],
  },
];

// ─── India — Airports (AAHL) ───────────────────────────────────────────────
const INDIA_AIRPORTS: AdaniAsset[] = [
  {
    id: 'mumbai-airport', name: 'Chhatrapati Shivaji Maharaj International Airport', short: 'BOM', type: 'airport',
    region: 'india', country: 'India', state: 'Maharashtra', city: 'Mumbai',
    lat: 19.0896, lng: 72.8656,
    status: 'operational', capacity: '66M passengers/year',
    description: 'India\'s busiest airport by international traffic. Managed by Adani Airport Holdings since 2022. Significant expansion and upgrade program underway targeting 90M+ capacity.',
    employee_count: 35000,
    cameras: [
      { id: 'bom-cam-01', name: 'T1 International Departures', status: 'online' },
      { id: 'bom-cam-02', name: 'T2 Domestic Terminal',        status: 'online' },
      { id: 'bom-cam-03', name: 'Runway 27/09 Approach',       status: 'online' },
      { id: 'bom-cam-04', name: 'Cargo Terminal',              status: 'online' },
      { id: 'bom-cam-05', name: 'Ground Operations',           status: 'maintenance' },
    ],
  },
  {
    id: 'ahmedabad-airport', name: 'Sardar Vallabhbhai Patel International Airport', short: 'AMD', type: 'airport',
    region: 'india', country: 'India', state: 'Gujarat', city: 'Ahmedabad',
    lat: 23.0777, lng: 72.6345,
    status: 'operational', capacity: '16M passengers/year',
    description: 'International airport serving Gujarat\'s commercial capital. One of seven airports in the Adani AAHL portfolio. Major connectivity hub for western India.',
    cameras: [
      { id: 'amd-cam-01', name: 'Main Terminal Hall',      status: 'online' },
      { id: 'amd-cam-02', name: 'Runway Security',         status: 'online' },
      { id: 'amd-cam-03', name: 'Cargo & Freight',         status: 'online' },
    ],
  },
  {
    id: 'lucknow-airport', name: 'Chaudhary Charan Singh International Airport', short: 'LKO', type: 'airport',
    region: 'india', country: 'India', state: 'Uttar Pradesh', city: 'Lucknow',
    lat: 26.7606, lng: 80.8893,
    status: 'operational', capacity: '10M passengers/year',
    description: 'Primary airport serving Uttar Pradesh state. Handles international and domestic traffic across 35+ routes.',
    cameras: [
      { id: 'lko-cam-01', name: 'Terminal Entrance',       status: 'online' },
      { id: 'lko-cam-02', name: 'Apron Area',             status: 'online' },
    ],
  },
  {
    id: 'mangaluru-airport', name: 'Mangaluru International Airport', short: 'IXE', type: 'airport',
    region: 'india', country: 'India', state: 'Karnataka', city: 'Mangaluru',
    lat: 12.9613, lng: 74.8901,
    status: 'operational', capacity: '5.6M passengers/year',
    description: 'International airport serving coastal Karnataka and northern Kerala. Key NRI traffic hub for the Gulf-Karnataka corridor.',
    cameras: [
      { id: 'ixe-cam-01', name: 'International Lounge',    status: 'online' },
      { id: 'ixe-cam-02', name: 'Runway 24',               status: 'online' },
    ],
  },
  {
    id: 'guwahati-airport', name: 'Lokpriya Gopinath Bordoloi International Airport', short: 'GAU', type: 'airport',
    region: 'india', country: 'India', state: 'Assam', city: 'Guwahati',
    lat: 26.1063, lng: 91.5859,
    status: 'operational', capacity: '10M passengers/year',
    description: 'Gateway airport to northeast India. Primary hub for all eight northeastern states, handling domestic and international routes.',
    cameras: [
      { id: 'gau-cam-01', name: 'New Terminal Building',   status: 'online' },
      { id: 'gau-cam-02', name: 'Security Checkpoint',     status: 'online' },
    ],
  },
  {
    id: 'thiruvananthapuram-airport', name: 'Trivandrum International Airport', short: 'TRV', type: 'airport',
    region: 'india', country: 'India', state: 'Kerala', city: 'Thiruvananthapuram',
    lat: 8.4821, lng: 76.9201,
    status: 'operational', capacity: '5M passengers/year',
    description: 'Kerala\'s southern international airport. Heavy NRI traffic from Middle East. Connected to international routes to the Gulf, Singapore, and Colombo.',
    cameras: [
      { id: 'trv-cam-01', name: 'International Arrivals',  status: 'online' },
      { id: 'trv-cam-02', name: 'Domestic Terminal',       status: 'offline' },
    ],
  },
  {
    id: 'jaipur-airport', name: 'Jaipur International Airport', short: 'JAI', type: 'airport',
    region: 'india', country: 'India', state: 'Rajasthan', city: 'Jaipur',
    lat: 26.8242, lng: 75.8122,
    status: 'operational', capacity: '8M passengers/year',
    description: 'Primary airport for Rajasthan, the Pink City. Key hub for domestic tourism, pilgrimage traffic, and increasing international charters.',
    cameras: [
      { id: 'jai-cam-01', name: 'Main Terminal',           status: 'online' },
      { id: 'jai-cam-02', name: 'VIP Lounge',              status: 'online' },
    ],
  },
];

// ─── India — Power Plants ──────────────────────────────────────────────────
const INDIA_POWER: AdaniAsset[] = [
  {
    id: 'mundra-thermal', name: 'Mundra Thermal Power Plant', short: 'MPSEZ PWR', type: 'power_thermal',
    region: 'india', country: 'India', state: 'Gujarat', city: 'Mundra',
    lat: 22.7833, lng: 69.7167,
    status: 'operational', capacity: '4,620 MW',
    description: 'One of the largest thermal power plants in India. Ultra-supercritical 5×660 MW + 5×330 MW units. Primary fuel: imported coal from Australia. Supplies power to Gujarat, Haryana, Punjab, and Rajasthan under long-term PPAs.',
    cameras: [
      { id: 'mtp-cam-01', name: 'Control Room',        status: 'online' },
      { id: 'mtp-cam-02', name: 'Cooling Towers',      status: 'online' },
      { id: 'mtp-cam-03', name: 'Coal Stockyard',      status: 'online' },
    ],
  },
  {
    id: 'tirora-thermal', name: 'Tirora Thermal Power Plant', short: 'TIRORA', type: 'power_thermal',
    region: 'india', country: 'India', state: 'Maharashtra', city: 'Tirora',
    lat: 21.4177, lng: 80.2945,
    status: 'operational', capacity: '3,300 MW',
    description: 'Super-critical coal-based power plant in the Gondia district of Maharashtra. 5×660 MW units supplying power to Maharashtra and Rajasthan.',
    cameras: [
      { id: 'tir-cam-01', name: 'Plant Overview',     status: 'online' },
      { id: 'tir-cam-02', name: 'Transmission Yard',  status: 'online' },
    ],
  },
  {
    id: 'kawai-thermal', name: 'Kawai Thermal Power Plant', short: 'KAWAI', type: 'power_thermal',
    region: 'india', country: 'India', state: 'Rajasthan', city: 'Kawai',
    lat: 25.8833, lng: 76.5833,
    status: 'operational', capacity: '1,320 MW',
    description: 'Supercritical 2×660 MW units serving Rajasthan\'s growing industrial load. Adjacent to coal handling and water intake infrastructure.',
    cameras: [
      { id: 'kaw-cam-01', name: 'Main Plant Gate',     status: 'online' },
      { id: 'kaw-cam-02', name: 'Water Reservoir',     status: 'online' },
    ],
  },
  {
    id: 'kamuthi-solar', name: 'Kamuthi Solar Power Project', short: 'KAMUTHI', type: 'power_solar',
    region: 'india', country: 'India', state: 'Tamil Nadu', city: 'Kamuthi',
    lat: 9.3667, lng: 78.4167,
    status: 'operational', capacity: '648 MW',
    description: 'One of the world\'s largest single-location solar farms. Built in just 8 months. Spans 2,500 acres, generating enough power for 150,000 homes. Equipped with automated panel-cleaning robots.',
    cameras: [
      { id: 'sol-cam-01', name: 'North Array Overview',  status: 'online' },
      { id: 'sol-cam-02', name: 'Substation',            status: 'online' },
      { id: 'sol-cam-03', name: 'Inverter Station',      status: 'online' },
    ],
  },
  {
    id: 'raipur-thermal', name: 'Raipur Power Plant', short: 'RAIPUR', type: 'power_thermal',
    region: 'india', country: 'India', state: 'Chhattisgarh', city: 'Raipur',
    lat: 21.2514, lng: 81.6296,
    status: 'operational', capacity: '600 MW',
    description: 'Coal-based power station supplying Chhattisgarh state grid. Pit-head location adjacent to Korba coal belt ensures fuel security.',
    cameras: [
      { id: 'rai-cam-01', name: 'Plant Operations',    status: 'online' },
    ],
  },
];

// ─── India — Offices & HQ ─────────────────────────────────────────────────
const INDIA_OFFICES: AdaniAsset[] = [
  {
    id: 'adani-hq', name: 'Adani Corporate House (HQ)', short: 'HQ AHM', type: 'hq',
    region: 'india', country: 'India', state: 'Gujarat', city: 'Ahmedabad',
    lat: 23.0225, lng: 72.5714,
    address: 'Adani Corporate House, Shantigram, Ahmedabad 382421',
    status: 'operational',
    description: 'Global headquarters of Adani Group. Campus housing Adani Enterprises Limited, Adani Ports, Adani Green Energy, Adani Power, and other group companies. 70-acre integrated campus with office towers, data centre, and corporate amenities.',
    employee_count: 12000,
    cameras: [
      { id: 'hq-cam-01', name: 'Main Atrium',         status: 'online' },
      { id: 'hq-cam-02', name: 'Executive Floor 15',  status: 'online' },
      { id: 'hq-cam-03', name: 'Server Room B1',      status: 'online' },
      { id: 'hq-cam-04', name: 'Main Gate',           status: 'online' },
      { id: 'hq-cam-05', name: 'Parking Structure',   status: 'online' },
    ],
  },
  {
    id: 'adani-mumbai-office', name: 'Adani Mumbai Office', short: 'MUM OFF', type: 'office',
    region: 'india', country: 'India', state: 'Maharashtra', city: 'Mumbai',
    lat: 19.0059, lng: 72.8272,
    address: 'Adani House, Malabar Hill, Mumbai 400006',
    status: 'operational',
    description: 'Primary Mumbai operations hub for Adani Group. Houses capital markets, treasury, investor relations, and corporate communications teams. Close proximity to BSE and RBI.',
    employee_count: 4000,
    cameras: [
      { id: 'mum-off-cam-01', name: 'Reception',      status: 'online' },
      { id: 'mum-off-cam-02', name: 'Trading Floor',  status: 'online' },
      { id: 'mum-off-cam-03', name: 'Server Room',    status: 'online' },
    ],
  },
  {
    id: 'adani-delhi-office', name: 'Adani Delhi NCR Office', short: 'DEL OFF', type: 'office',
    region: 'india', country: 'India', state: 'Delhi', city: 'New Delhi',
    lat: 28.5921, lng: 77.2270,
    address: 'Worldmark 2, Aerocity, New Delhi 110037',
    status: 'operational',
    description: 'Government relations, regulatory affairs, and policy team hub. Strategic location in Aerocity near IGI Airport facilitates frequent ministerial engagements.',
    employee_count: 800,
    cameras: [
      { id: 'del-off-cam-01', name: 'Office Entrance', status: 'online' },
      { id: 'del-off-cam-02', name: 'Conference Hub',  status: 'online' },
    ],
  },
  {
    id: 'adani-bangalore-office', name: 'Adani Technology Centre', short: 'BLR TECH', type: 'datacenter',
    region: 'india', country: 'India', state: 'Karnataka', city: 'Bengaluru',
    lat: 12.9344, lng: 77.6100,
    address: 'Prestige Tech Park, Whitefield, Bengaluru 560066',
    status: 'operational',
    description: 'Adani Digital Labs and Technology Centre. Houses the Integrated Command and Control Centre (ICCC) for port operations, AI/ML research team, and enterprise IT infrastructure.',
    employee_count: 2500,
    cameras: [
      { id: 'blr-cam-01', name: 'ICCC Floor',          status: 'online' },
      { id: 'blr-cam-02', name: 'Data Hall A',         status: 'online' },
      { id: 'blr-cam-03', name: 'Data Hall B',         status: 'online' },
      { id: 'blr-cam-04', name: 'NOC',                 status: 'online' },
    ],
  },
];

// ─── International Assets ─────────────────────────────────────────────────
const INTERNATIONAL_ASSETS: AdaniAsset[] = [
  {
    id: 'haifa-port', name: 'Haifa Port', short: 'HAIFA', type: 'port',
    region: 'international', country: 'Israel', city: 'Haifa',
    lat: 32.8194, lng: 35.0033,
    status: 'operational', capacity: '1.4M TEU/year',
    description: 'Israeli national port acquired by Adani Ports in 2023 for $1.18 billion. Handles container, bulk, and general cargo. Strategically located in the Eastern Mediterranean. Deepwater terminal capable of handling Ultra Large Container Vessels (ULCV).',
    cameras: [
      { id: 'haifa-cam-01', name: 'Container Terminal',     status: 'online' },
      { id: 'haifa-cam-02', name: 'Quay Cranes',            status: 'online' },
      { id: 'haifa-cam-03', name: 'Port Gate',              status: 'online' },
    ],
  },
  {
    id: 'colombo-terminal', name: 'Colombo West International Terminal', short: 'CWIT', type: 'port',
    region: 'international', country: 'Sri Lanka', city: 'Colombo',
    lat: 6.9544, lng: 79.8477,
    status: 'construction', capacity: '3.2M TEU/year',
    description: 'Greenfield deep-water container terminal being developed by Adani Ports in partnership with Sri Lanka Ports Authority and John Keells Holdings. One of South Asia\'s most strategically located transhipment hubs on the main East-West shipping route.',
    cameras: [
      { id: 'clmb-cam-01', name: 'Construction Site',      status: 'online' },
      { id: 'clmb-cam-02', name: 'Wharf Development',      status: 'online' },
    ],
  },
  {
    id: 'abbot-point', name: 'Abbot Point Operations', short: 'ABBOT PT', type: 'port',
    region: 'international', country: 'Australia', city: 'Bowen, Queensland',
    lat: -19.8765, lng: 148.0912,
    status: 'operational', capacity: '50 MT/year',
    description: 'Coal export terminal in Queensland. Key infrastructure asset for the Carmichael coal supply chain. Handles coal from the Bowen Basin via rail for export to Asian markets.',
    cameras: [
      { id: 'abbot-cam-01', name: 'Shiploading Terminal',  status: 'online' },
      { id: 'abbot-cam-02', name: 'Rail Receival',         status: 'online' },
    ],
  },
  {
    id: 'carmichael-mine', name: 'Carmichael Mine & Rail', short: 'CARMIC', type: 'mine',
    region: 'international', country: 'Australia', city: 'Galilee Basin, Queensland',
    lat: -21.7342, lng: 147.7823,
    status: 'operational', capacity: '10 MT/year',
    description: 'First operational coal mine in the Galilee Basin, Queensland. 447 km of purpose-built rail connecting mine to Abbot Point terminal. Thermal coal for export to Indian power plants.',
    cameras: [
      { id: 'carm-cam-01', name: 'Open Cut Overview',      status: 'online' },
      { id: 'carm-cam-02', name: 'Processing Plant',       status: 'online' },
      { id: 'carm-cam-03', name: 'Rail Loading',           status: 'online' },
    ],
  },
  {
    id: 'singapore-office', name: 'Adani Singapore Regional Office', short: 'SG OFF', type: 'office',
    region: 'international', country: 'Singapore', city: 'Singapore',
    lat: 1.2897, lng: 103.8540,
    address: 'One Raffles Quay, Singapore 048583',
    status: 'operational',
    description: 'APAC headquarters for Adani\'s international business. Hub for maritime operations, trading, capital markets (Singapore exchange listings), and Southeast Asian business development.',
    employee_count: 350,
    cameras: [
      { id: 'sg-cam-01', name: 'Office Entrance',          status: 'online' },
    ],
  },
  {
    id: 'dubai-office', name: 'Adani Dubai Office', short: 'DXB OFF', type: 'office',
    region: 'international', country: 'UAE', city: 'Dubai',
    lat: 25.2048, lng: 55.2708,
    address: 'Dubai International Financial Centre, Dubai',
    status: 'operational',
    description: 'Middle East regional office covering MENA market development, energy trading, and UAE-India trade facilitation. Close to ADNOC and major Gulf sovereign wealth funds.',
    employee_count: 120,
    cameras: [
      { id: 'dxb-cam-01', name: 'Office Floor',            status: 'online' },
    ],
  },
  {
    id: 'london-office', name: 'Adani London Office', short: 'LON OFF', type: 'office',
    region: 'international', country: 'United Kingdom', city: 'London',
    lat: 51.5074, lng: -0.1278,
    address: 'Mayfair, London W1',
    status: 'operational',
    description: 'European business development and investor relations hub. Covers European bond markets, green energy partnerships, and regulatory affairs for EU operations.',
    employee_count: 80,
    cameras: [
      { id: 'lon-cam-01', name: 'Reception',               status: 'online' },
    ],
  },
  {
    id: 'tanzania-port', name: 'Tanzania Port Development', short: 'TZ PORT', type: 'port',
    region: 'international', country: 'Tanzania', city: 'Dar es Salaam',
    lat: -6.8161, lng: 39.2845,
    status: 'construction', capacity: '1M TEU/year',
    description: 'Greenfield container terminal development at Dar es Salaam. Key foothold for Adani\'s Africa expansion strategy. JV with Tanzania Ports Authority.',
    cameras: [
      { id: 'tz-cam-01', name: 'Site Overview',            status: 'online' },
    ],
  },
];

// ─── Full registry ────────────────────────────────────────────────────────
export const ADANI_ASSETS: AdaniAsset[] = [
  ...INDIA_PORTS,
  ...INDIA_AIRPORTS,
  ...INDIA_POWER,
  ...INDIA_OFFICES,
  ...INTERNATIONAL_ASSETS,
];

// Helper lookups
export const ASSET_BY_ID = Object.fromEntries(ADANI_ASSETS.map(a => [a.id, a]));

export const ASSETS_BY_TYPE = ADANI_ASSETS.reduce<Record<string, AdaniAsset[]>>((acc, a) => {
  (acc[a.type] ??= []).push(a);
  return acc;
}, {});

export const ASSETS_BY_REGION = {
  india:         ADANI_ASSETS.filter(a => a.region === 'india'),
  international: ADANI_ASSETS.filter(a => a.region === 'international'),
};
