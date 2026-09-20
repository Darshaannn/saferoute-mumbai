import officialMedicalFacilities from './mumbaiMedicalFacilities.json';

const PHARMACIES_AND_TRANSIT = [
  // 24/7 Staffed Pharmacies (Lit Safe Pitstops)
  {
    id: 'pharm-1',
    name: 'Wellness Forever 24/7 Pharmacy (Bandra)',
    type: 'pharmacy',
    category: '24/7 Staffed Pharmacy & Haven',
    area: 'Bandra West',
    address: 'Turner Road, Near Waterfield Junction, Bandra West, Mumbai',
    coordinates: [19.0583, 72.8335],
    phone: '1800-102-4247',
    open24x7: true,
    services: ['Brightly Lit 24/7 Store', 'Security Staff', 'First Aid']
  },
  {
    id: 'pharm-2',
    name: 'Wellness Forever 24/7 Pharmacy (Lokhandwala)',
    type: 'pharmacy',
    category: '24/7 Staffed Pharmacy & Haven',
    area: 'Andheri West',
    address: 'Main Market Road, Lokhandwala Complex, Andheri West, Mumbai',
    coordinates: [19.1415, 72.8276],
    phone: '1800-102-4247',
    open24x7: true,
    services: ['24/7 Open', 'CCTV Monitored', 'First Aid']
  },
  {
    id: 'pharm-3',
    name: 'Wellness Forever 24/7 Pharmacy (Dadar TT)',
    type: 'pharmacy',
    category: '24/7 Staffed Pharmacy & Haven',
    area: 'Dadar East',
    address: 'Near Dadar TT Circle, Dr. Ambedkar Road, Dadar East, Mumbai',
    coordinates: [19.0195, 72.8465],
    phone: '1800-102-4247',
    open24x7: true,
    services: ['24/7 Open Store', 'Staffed & Lit']
  },
  {
    id: 'pharm-4',
    name: 'Apollo 24/7 Pharmacy (Hiranandani Powai)',
    type: 'pharmacy',
    category: '24/7 Staffed Pharmacy & Haven',
    area: 'Powai',
    address: 'Central Avenue, Hiranandani Business Park, Powai, Mumbai',
    coordinates: [19.1175, 72.9080],
    phone: '1860-500-0101',
    open24x7: true,
    services: ['24/7 Open', 'Well-Lit Hub']
  },
  {
    id: 'transit-1',
    name: 'Andheri Metro Interchange Hub',
    type: 'transit',
    category: 'Metro & Railway Transit Hub',
    area: 'Andheri East/West',
    address: 'Andheri Station Area, Mumbai',
    coordinates: [19.1197, 72.8464],
    phone: '022-26848888',
    open24x7: false,
    services: ['CCTV Network', 'Metro Security Staff', 'RPF Outpost']
  },
  {
    id: 'transit-2',
    name: 'Ghatkopar Metro Hub',
    type: 'transit',
    category: 'Metro & Railway Interchange',
    area: 'Ghatkopar East/West',
    address: 'LBS Marg / Ghatkopar Station, Mumbai',
    coordinates: [19.0858, 72.9080],
    phone: '022-26848888',
    open24x7: false,
    services: ['CCTV Network', 'Guarded Platforms', 'Emergency Assistance Button']
  }
];

export const MUMBAI_SAFE_HAVENS = [
  ...officialMedicalFacilities,
  ...PHARMACIES_AND_TRANSIT
];
