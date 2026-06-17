/**
 * 📦 Product Catalog for Innovate Bhutan
 *
 * Comprehensive IT products and supplies for the Bhutan market.
 * Organized by category with pricing in Ngultrum (Nu.).
 */

export type ProductCategory =
  | 'POS'
  | 'SECURITY'
  | 'NETWORKING'
  | 'POWER'
  | 'COMPUTERS'
  | 'SOFTWARE'
  | 'ACCESSORIES'

export type ProductBrand =
  | 'Innovate'
  | 'Generic'
  | 'Cisco'
  | 'TP-Link'
  | 'Mikrotik'
  | 'Dell'
  | 'HP'
  | 'Lenovo'
  | 'Samsung'
  | 'Hikvision'
  | 'Dahua'
  | 'APC'
  | 'Eaton'
  | 'Epson'
  | 'Canon'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  brand: ProductBrand
  tagline: string
  description: string

  // Pricing
  price: number
  currency: string // 'Nu.' for Ngultrum

  // Images
  images: {
    cloudinaryId?: string
    url?: string
    alt: string
  }[]

  // Specifications
  specifications: Record<string, string>

  // Inventory
  inStock: boolean
  stockQuantity?: number

  // Product details
  featured: boolean
  popular?: boolean
  new?: boolean

  // Categories for filtering
  tags: string[]

  // Service mapping
  relatedServices: string[]

  // Delivery
  deliveryTime?: string
  warranty?: string
}

/**
 * Product Catalog Data
 */
export const PRODUCTS_CATALOG: Product[] = [
  // ============================================
  // POS SYSTEMS
  // ============================================
  {
    id: 'pos-touch-15',
    name: '15" Touch Screen POS Terminal',
    category: 'POS',
    brand: 'Innovate',
    tagline: 'Modern Point of Sale',
    description: '15-inch capacitive touch screen POS terminal with integrated card reader. Perfect for retail and hospitality businesses.',
    price: 45000,
    currency: 'Nu.',
    images: [
      { alt: 'POS Touch Screen Front View' },
      { alt: 'POS Touch Screen Side View' },
    ],
    specifications: {
      'Screen Size': '15" LED Capacitive Touch',
      'Resolution': '1920 x 1080',
      'Processor': 'Intel Celeron J4125',
      'RAM': '8GB DDR4',
      'Storage': '256GB SSD',
      'OS': 'Windows 10/11 Pro',
      'Card Reader': 'Integrated Magstripe/EMV',
    },
    inStock: true,
    stockQuantity: 15,
    featured: true,
    popular: true,
    tags: ['pos', 'retail', 'touchscreen', 'payment'],
    relatedServices: ['POS Solutions', 'Technical Maintenance'],
    deliveryTime: '3-5 business days',
    warranty: '2 Years',
  },
  {
    id: 'pos-touch-17',
    name: '17" Touch Screen POS Terminal',
    category: 'POS',
    brand: 'Innovate',
    tagline: 'Large Display POS',
    description: '17-inch multi-touch POS terminal with enhanced performance for busy retail environments.',
    price: 65000,
    currency: 'Nu.',
    images: [{ alt: '17" POS Terminal' }],
    specifications: {
      'Screen Size': '17" IPS Multi-Touch',
      'Resolution': '1920 x 1080',
      'Processor': 'Intel Core i3-10110U',
      'RAM': '16GB DDR4',
      'Storage': '512GB SSD',
      'OS': 'Windows 11 Pro',
    },
    inStock: true,
    stockQuantity: 8,
    featured: true,
    tags: ['pos', 'retail', 'touchscreen', 'large-screen'],
    relatedServices: ['POS Solutions'],
    deliveryTime: '3-5 business days',
    warranty: '2 Years',
  },
  {
    id: 'pos-receipt-80',
    name: '80mm Thermal Receipt Printer',
    category: 'POS',
    brand: 'Epson',
    tagline: 'Fast Receipt Printing',
    description: 'High-speed thermal receipt printer with auto-cutter. USB, Ethernet, and Bluetooth connectivity.',
    price: 12000,
    currency: 'Nu.',
    images: [{ alt: 'Thermal Receipt Printer' }],
    specifications: {
      'Print Width': '80mm',
      'Print Speed': '300mm/sec',
      'Interface': 'USB, Ethernet, Bluetooth',
      'Auto-cutter': 'Yes',
      'Paper Size': '80mm x 80mm diameter',
    },
    inStock: true,
    stockQuantity: 25,
    featured: true,
    popular: true,
    tags: ['printer', 'receipt', 'thermal', 'bluetooth'],
    relatedServices: ['POS Solutions'],
    deliveryTime: '2-3 business days',
    warranty: '1 Year',
  },
  {
    id: 'pos-receipt-58',
    name: '58mm Thermal Receipt Printer',
    category: 'POS',
    brand: 'Innovate',
    tagline: 'Compact Receipt Printer',
    description: 'Compact 58mm thermal printer for small businesses. USB and Bluetooth connectivity.',
    price: 7500,
    currency: 'Nu.',
    images: [{ alt: '58mm Receipt Printer' }],
    specifications: {
      'Print Width': '58mm',
      'Print Speed': '220mm/sec',
      'Interface': 'USB, Bluetooth',
      'Paper Size': '58mm x 60mm diameter',
    },
    inStock: true,
    stockQuantity: 30,
    tags: ['printer', 'receipt', 'thermal', 'compact'],
    relatedServices: ['POS Solutions'],
    deliveryTime: '2-3 business days',
    warranty: '1 Year',
  },
  {
    id: 'pos-scanner-2d',
    name: '2D QR Barcode Scanner',
    category: 'POS',
    brand: 'Innovate',
    tagline: 'Advanced Barcode Scanning',
    description: '2D imaging barcode scanner supporting QR codes, PDF417, and all standard 1D barcodes.',
    price: 8500,
    currency: 'Nu.',
    images: [{ alt: '2D Barcode Scanner' }],
    specifications: {
      'Scan Type': '2D Imager',
      'Supported Codes': 'QR, PDF417, DataMatrix, all 1D',
      'Interface': 'USB 2.0',
      'Scan Rate': '60 scans/sec',
      'Depth of Field': '0-250mm',
    },
    inStock: true,
    stockQuantity: 20,
    popular: true,
    tags: ['scanner', 'barcode', 'qr', '2d'],
    relatedServices: ['POS Solutions'],
    deliveryTime: '2-3 business days',
    warranty: '1 Year',
  },
  {
    id: 'pos-cash-drawer',
    name: 'Medium Cash Drawer',
    category: 'POS',
    brand: 'Innovate',
    tagline: 'Secure Cash Storage',
    description: 'Medium-sized cash drawer with bill and coin compartments. RJ11/USB interface.',
    price: 9500,
    currency: 'Nu.',
    images: [{ alt: 'Cash Drawer' }],
    specifications: {
      'Size': 'Medium (420mm x 410mm)',
      'Interface': 'RJ11, USB',
      'Bill Compartments': '4',
      'Coin Compartments': '8',
      'Lock': 'Electronic/Mechanical',
    },
    inStock: true,
    stockQuantity: 18,
    tags: ['cash-drawer', 'pos', 'payment', 'security'],
    relatedServices: ['POS Solutions'],
    deliveryTime: '2-3 business days',
    warranty: '1 Year',
  },
  {
    id: 'pos-software-license',
    name: 'POS Software License (Annual)',
    category: 'SOFTWARE',
    brand: 'Innovate',
    tagline: 'Complete POS Management',
    description: 'Annual subscription for Innovate POS software with inventory, sales, and reporting features.',
    price: 18000,
    currency: 'Nu.',
    images: [{ alt: 'POS Software Dashboard' }],
    specifications: {
      'License Type': 'Annual Subscription',
      'Users': 'Up to 5 terminals',
      'Features': 'Inventory, Sales, Reports, CRM',
      'Support': 'Email & Phone',
      'Updates': 'Free updates included',
    },
    inStock: true,
    tags: ['software', 'pos', 'license', 'subscription'],
    relatedServices: ['POS Solutions', 'Web Development'],
    deliveryTime: 'Instant (Digital)',
    warranty: 'N/A',
  },

  // ============================================
  // SECURITY & SURVEILLANCE
  // ============================================
  {
    id: 'cctv-dome-2mp',
    name: '2MP Dome CCTV Camera',
    category: 'SECURITY',
    brand: 'Hikvision',
    tagline: 'Indoor Surveillance',
    description: '2MP dome camera with night vision, motion detection, and remote viewing support.',
    price: 5500,
    currency: 'Nu.',
    images: [{ alt: 'Dome CCTV Camera' }],
    specifications: {
      'Resolution': '2MP (1920x1080)',
      'Type': 'Dome',
      'Night Vision': 'Up to 30m',
      'Lens': '3.6mm fixed',
      'Weather Rating': 'Indoor',
      'Power': '12V DC / PoE',
    },
    inStock: true,
    stockQuantity: 40,
    featured: true,
    popular: true,
    tags: ['cctv', 'camera', 'security', 'indoor'],
    relatedServices: ['Security Systems', 'Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '2 Years',
  },
  {
    id: 'cctv-bullet-5mp',
    name: '5MP Bullet CCTV Camera',
    category: 'SECURITY',
    brand: 'Dahua',
    tagline: 'Outdoor Surveillance',
    description: '5MP bullet camera for outdoor use with weatherproof housing and long-range night vision.',
    price: 9500,
    currency: 'Nu.',
    images: [{ alt: 'Bullet CCTV Camera' }],
    specifications: {
      'Resolution': '5MP (2592x1944)',
      'Type': 'Bullet',
      'Night Vision': 'Up to 50m',
      'Lens': '2.8-12mm varifocal',
      'Weather Rating': 'IP67',
      'Power': '12V DC / PoE',
    },
    inStock: true,
    stockQuantity: 25,
    featured: true,
    tags: ['cctv', 'camera', 'security', 'outdoor', 'waterproof'],
    relatedServices: ['Security Systems'],
    deliveryTime: '3-5 business days',
    warranty: '2 Years',
  },
  {
    id: 'cctv-ptz-4mp',
    name: '4MP PTZ Camera',
    category: 'SECURITY',
    brand: 'Hikvision',
    tagline: 'Pan-Tilt-Zoom Control',
    description: '4MP PTZ camera with 20x optical zoom, 360° pan, and intelligent tracking.',
    price: 25000,
    currency: 'Nu.',
    images: [{ alt: 'PTZ Camera' }],
    specifications: {
      'Resolution': '4MP (2688x1520)',
      'Type': 'PTZ Dome',
      'Zoom': '20x optical, 16x digital',
      'Pan Range': '360° endless',
      'Tilt Range': '-15° to 90°',
      'Night Vision': 'Up to 100m',
    },
    inStock: true,
    stockQuantity: 10,
    new: true,
    tags: ['cctv', 'camera', 'ptz', 'zoom', 'premium'],
    relatedServices: ['Security Systems'],
    deliveryTime: '5-7 business days',
    warranty: '2 Years',
  },
  {
    id: 'dvr-4ch',
    name: '4CH DVR System',
    category: 'SECURITY',
    brand: 'Hikvision',
    tagline: 'Basic Surveillance Recording',
    description: '4-channel DVR with 1TB HDD. Supports up to 4 cameras with remote viewing.',
    price: 15000,
    currency: 'Nu.',
    images: [{ alt: '4CH DVR' }],
    specifications: {
      'Channels': '4',
      'Storage': '1TB HDD (expandable to 4TB)',
      'Resolution': 'Up to 1080p',
      'Output': 'HDMI, VGA',
      'Remote View': 'Yes (mobile app)',
      'Backup': 'USB, Network',
    },
    inStock: true,
    stockQuantity: 15,
    popular: true,
    tags: ['dvr', 'recorder', 'storage', 'surveillance'],
    relatedServices: ['Security Systems'],
    deliveryTime: '3-5 business days',
    warranty: '2 Years',
  },
  {
    id: 'dvr-8ch',
    name: '8CH DVR System',
    category: 'SECURITY',
    brand: 'Hikvision',
    tagline: 'Extended Recording',
    description: '8-channel DVR with 2TB HDD. Professional grade for business surveillance.',
    price: 25000,
    currency: 'Nu.',
    images: [{ alt: '8CH DVR' }],
    specifications: {
      'Channels': '8',
      'Storage': '2TB HDD (expandable to 8TB)',
      'Resolution': 'Up to 1080p',
      'Output': 'HDMI, VGA',
      'Remote View': 'Yes (mobile app)',
    },
    inStock: true,
    stockQuantity: 12,
    featured: true,
    tags: ['dvr', 'recorder', 'storage', 'business'],
    relatedServices: ['Security Systems'],
    deliveryTime: '3-5 business days',
    warranty: '2 Years',
  },
  {
    id: 'nvr-16ch',
    name: '16CH NVR System',
    category: 'SECURITY',
    brand: 'Hikvision',
    tagline: 'IP Camera Recording',
    description: '16-channel NVR with 4TB HDD for IP camera systems with advanced analytics.',
    price: 45000,
    currency: 'Nu.',
    images: [{ alt: '16CH NVR' }],
    specifications: {
      'Channels': '16 (IP)',
      'Storage': '4TB HDD (expandable)',
      'Resolution': 'Up to 4K',
      'PoE Ports': '16',
      'Analytics': 'Motion, line crossing, intrusion',
    },
    inStock: true,
    stockQuantity: 8,
    featured: true,
    tags: ['nvr', 'ip-camera', 'recorder', 'analytics'],
    relatedServices: ['Security Systems'],
    deliveryTime: '5-7 business days',
    warranty: '2 Years',
  },
  {
    id: 'biometric-attendance',
    name: 'Biometric Attendance System',
    category: 'SECURITY',
    brand: 'Innovate',
    tagline: 'Fingerprint Time Attendance',
    description: 'Fingerprint and RFID card attendance system with software for up to 1000 employees.',
    price: 18500,
    currency: 'Nu.',
    images: [{ alt: 'Biometric Attendance Device' }],
    specifications: {
      'Capacity': '1000 fingerprints, 100,000 records',
      'Recognition Time': '< 1 second',
      'Interfaces': 'Fingerprint, RFID, Password',
      'Connectivity': 'TCP/IP, USB',
      'Display': '2.4" TFT LCD',
      'Software': 'Included (Windows)',
    },
    inStock: true,
    stockQuantity: 20,
    popular: true,
    tags: ['biometric', 'attendance', 'fingerprint', 'hr'],
    relatedServices: ['Security Systems', 'Payroll & HR'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },
  {
    id: 'face-recognition-terminal',
    name: 'Face Recognition Terminal',
    category: 'SECURITY',
    brand: 'Hikvision',
    tagline: 'Advanced Face Recognition',
    description: 'Face recognition terminal with mask detection and temperature screening.',
    price: 32000,
    currency: 'Nu.',
    images: [{ alt: 'Face Recognition Terminal' }],
    specifications: {
      'Face Capacity': 'Up to 10,000',
      'Recognition Speed': '< 0.3 seconds',
      'Features': 'Face detection, mask detection, temperature',
      'Display': '8" LCD',
      'Connectivity': 'TCP/IP, Wi-Fi',
    },
    inStock: true,
    stockQuantity: 8,
    new: true,
    tags: ['face-recognition', 'biometric', 'temperature', 'access-control'],
    relatedServices: ['Security Systems'],
    deliveryTime: '5-7 business days',
    warranty: '2 Years',
  },
  {
    id: 'access-control-kit',
    name: 'Access Control Kit',
    category: 'SECURITY',
    brand: 'Innovate',
    tagline: 'Door Access Control',
    description: 'Complete access control kit with 1 door controller, RFID reader, and 5 key cards.',
    price: 12000,
    currency: 'Nu.',
    images: [{ alt: 'Access Control Kit' }],
    specifications: {
      'Doors': '1',
      'Readers': '1 RFID reader',
      'Key Cards': '5 RFID cards included',
      'Unlock Methods': 'Card, PIN, Card+PIN',
      'Connectivity': 'TCP/IP',
      'Software': 'Included',
    },
    inStock: true,
    stockQuantity: 15,
    tags: ['access-control', 'security', 'rfid', 'door-lock'],
    relatedServices: ['Security Systems'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },

  // ============================================
  // NETWORKING & INFRASTRUCTURE
  // ============================================
  {
    id: 'router-cisco',
    name: 'Cisco Router (ISR 4000 Series)',
    category: 'NETWORKING',
    brand: 'Cisco',
    tagline: 'Enterprise Router',
    description: 'Cisco ISR 4000 series router for enterprise networks with advanced security features.',
    price: 125000,
    currency: 'Nu.',
    images: [{ alt: 'Cisco Router' }],
    specifications: {
      'Model': 'ISR 4451-X',
      'Throughput': 'Up to 1 Gbps',
      'Interfaces': '3x GE, 2x NME, 2x SMA',
      'Security': 'Firewall, VPN, IPS',
      'RAM': '4GB DDR4',
      'Storage': '4GB Flash',
    },
    inStock: true,
    stockQuantity: 5,
    featured: true,
    tags: ['router', 'cisco', 'enterprise', 'vpn'],
    relatedServices: ['Infrastructure', 'Security Systems'],
    deliveryTime: '7-10 business days',
    warranty: '1 Year',
  },
  {
    id: 'router-tplink',
    name: 'TP-Link Wireless Router',
    category: 'NETWORKING',
    brand: 'TP-Link',
    tagline: 'SMB Wireless Router',
    description: 'TP-Link AC1750 wireless router with gigabit ports for small business.',
    price: 6500,
    currency: 'Nu.',
    images: [{ alt: 'TP-Link Router' }],
    specifications: {
      'Standard': 'Wi-Fi 5 (802.11ac)',
      'Speed': '1750 Mbps (1300 Mbps 5GHz + 450 Mbps 2.4GHz)',
      'Ports': '4x Gigabit LAN, 1x Gigabit WAN',
      'Antennas': '3x external',
      'USB': '1x USB 2.0',
    },
    inStock: true,
    stockQuantity: 25,
    popular: true,
    tags: ['router', 'wireless', 'wifi', 'small-business'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '2-3 business days',
    warranty: '1 Year',
  },
  {
    id: 'router-mikrotik',
    name: 'Mikrotik RouterBoard',
    category: 'NETWORKING',
    brand: 'Mikrotik',
    tagline: 'Pro Router',
    description: 'Mikrotik RouterBoard with Level 5 license for advanced routing and hotspot.',
    price: 9500,
    currency: 'Nu.',
    images: [{ alt: 'Mikrotik Router' }],
    specifications: {
      'Model': 'RB750Gr3',
      'CPU': 'Atheros AR7161 680MHz',
      'RAM': '256MB',
      'Ports': '5x Gigabit Ethernet',
      'License': 'Level 5',
      'OS': 'RouterOS v7',
    },
    inStock: true,
    stockQuantity: 15,
    tags: ['router', 'mikrotik', 'hotspot', 'routing'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },
  {
    id: 'switch-managed-24',
    name: '24-Port Managed Switch',
    category: 'NETWORKING',
    brand: 'TP-Link',
    tagline: 'Managed Network Switch',
    description: '24-port Gigabit managed switch with 4 SFP slots for uplinks.',
    price: 18000,
    currency: 'Nu.',
    images: [{ alt: 'Managed Switch' }],
    specifications: {
      'Ports': '24x 10/100/1000Mbps',
      'SFP Slots': '4x SFP',
      'Management': 'Web, CLI, SNMP',
      'Features': 'VLAN, QoS, Link Aggregation',
      'Bandwidth': '48 Gbps switching capacity',
    },
    inStock: true,
    stockQuantity: 12,
    featured: true,
    tags: ['switch', 'managed', 'gigabit', 'network'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '2 Years',
  },
  {
    id: 'switch-unmanaged-8',
    name: '8-Port Unmanaged Switch',
    category: 'NETWORKING',
    brand: 'TP-Link',
    tagline: 'Basic Network Switch',
    description: '8-port Gigabit unmanaged switch for office network expansion.',
    price: 3500,
    currency: 'Nu.',
    images: [{ alt: '8-Port Switch' }],
    specifications: {
      'Ports': '8x 10/100/1000Mbps',
      'Type': 'Unmanaged',
      'Speed': 'Auto-negotiation',
      'LED Indicators': 'Per port',
      'Plug & Play': 'Yes',
    },
    inStock: true,
    stockQuantity: 30,
    popular: true,
    tags: ['switch', 'unmanaged', 'gigabit', 'office'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '2-3 business days',
    warranty: '1 Year',
  },
  {
    id: 'wif-ap-unifi',
    name: 'UniFi Access Point',
    category: 'NETWORKING',
    brand: 'Innovate',
    tagline: 'Enterprise WiFi',
    description: 'UniFi AC Access Point for seamless WiFi coverage in offices and hotels.',
    price: 14500,
    currency: 'Nu.',
    images: [{ alt: 'UniFi Access Point' }],
    specifications: {
      'Standard': 'Wi-Fi 5 (802.11ac)',
      'Speed': '1300 Mbps on 5GHz',
      'MIMO': '2x2 MIMO',
      'Ports': '2x Gigabit Ethernet',
      'Power': '802.3af PoE',
      'Mounting': 'Wall/Ceiling mount included',
    },
    inStock: true,
    stockQuantity: 20,
    featured: true,
    tags: ['wifi', 'access-point', 'unifi', 'wireless'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '2 Years',
  },
  {
    id: 'cabling-cat6',
    name: 'Cat6 Network Cable (Box)',
    category: 'NETWORKING',
    brand: 'Generic',
    tagline: 'Network Cabling',
    description: '305m box of Cat6 UTP network cable for structured cabling.',
    price: 4500,
    currency: 'Nu.',
    images: [{ alt: 'Cat6 Cable Box' }],
    specifications: {
      'Length': '305 meters (1000 feet)',
      'Type': 'UTP (Unshielded Twisted Pair)',
      'Category': 'Cat6',
      'Speed Rating': 'Up to 10 Gbps',
      'Certification': 'EIA/TIA',
    },
    inStock: true,
    stockQuantity: 50,
    popular: true,
    tags: ['cable', 'cabling', 'network', 'cat6'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '2-3 business days',
    warranty: 'N/A',
  },
  {
    id: 'rack-42u',
    name: '42U Server Rack',
    category: 'NETWORKING',
    brand: 'Generic',
    tagline: 'Full Height Server Cabinet',
    description: '42U server rack cabinet with tempered glass door and side panels.',
    price: 38000,
    currency: 'Nu.',
    images: [{ alt: '42U Server Rack' }],
    specifications: {
      'Height': '42U (2000mm)',
      'Width': '600mm',
      'Depth': '1000mm',
      'Door': 'Front tempered glass, rear perforated',
      'Cable Entry': 'Top and bottom',
      'Weight Capacity': '800kg',
    },
    inStock: true,
    stockQuantity: 6,
    featured: true,
    tags: ['rack', 'server', 'cabinet', 'mounting'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '5-7 business days',
    warranty: '1 Year',
  },
  {
    id: 'rack-24u',
    name: '24U Server Rack',
    category: 'NETWORKING',
    brand: 'Generic',
    tagline: 'Wall Mount Rack',
    description: '24U wall-mount server rack for smaller installations.',
    price: 14500,
    currency: 'Nu.',
    images: [{ alt: '24U Wall Mount Rack' }],
    specifications: {
      'Height': '24U (1100mm)',
      'Width': '600mm',
      'Depth': '450mm',
      'Mounting': 'Wall mount with rails',
      'Load Capacity': '100kg',
      'Type': 'Open frame or enclosed',
    },
    inStock: true,
    stockQuantity: 15,
    tags: ['rack', 'server', 'wall-mount', 'network'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },

  // ============================================
  // POWER SOLUTIONS
  // ============================================
  {
    id: 'ups-1kva',
    name: '1kVA Online UPS',
    category: 'POWER',
    brand: 'APC',
    tagline: 'Basic Power Protection',
    description: '1kVA online UPS for computers and small servers. Battery backup and surge protection.',
    price: 12000,
    currency: 'Nu.',
    images: [{ alt: '1kVA UPS' }],
    specifications: {
      'Capacity': '1000 VA / 700 Watts',
      'Type': 'Online Double Conversion',
      'Backup Time': '15-20 mins (typical load)',
      'Outlets': '6x UPS outlets',
      'Interface': 'USB, RS232',
      'Battery': 'Maintenance-free lead-acid',
    },
    inStock: true,
    stockQuantity: 20,
    popular: true,
    tags: ['ups', 'power', 'backup', 'protection'],
    relatedServices: ['Infrastructure', 'Technical Maintenance'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },
  {
    id: 'ups-3kva',
    name: '3kVA Online UPS',
    category: 'POWER',
    brand: 'APC',
    tagline: 'Server Power Protection',
    description: '3kVA online UPS for servers and network equipment with extended runtime.',
    price: 35000,
    currency: 'Nu.',
    images: [{ alt: '3kVA UPS' }],
    specifications: {
      'Capacity': '3000 VA / 2700 Watts',
      'Type': 'Online Double Conversion',
      'Backup Time': '20-30 mins (typical load)',
      'Outlets': '8x UPS outlets',
      'Interface': 'USB, RS232, SNMP slot',
      'Battery': 'Hot-swappable batteries',
    },
    inStock: true,
    stockQuantity: 10,
    featured: true,
    tags: ['ups', 'power', 'server', 'backup'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '2 Years',
  },
  {
    id: 'ups-10kva',
    name: '10kVA UPS System',
    category: 'POWER',
    brand: 'Eaton',
    tagline: 'Data Center Power',
    description: '10kVA UPS for data centers and critical infrastructure with parallel capability.',
    price: 185000,
    currency: 'Nu.',
    images: [{ alt: '10kVA UPS' }],
    specifications: {
      'Capacity': '10000 VA / 9000 Watts',
      'Type': 'Online Double Conversion',
      'Input': '3-Phase',
      'Output': '3-Phase',
      'Runtime': 'Scalable with battery packs',
      'Efficiency': '> 95% at full load',
    },
    inStock: true,
    stockQuantity: 3,
    featured: true,
    tags: ['ups', 'power', 'data-center', '3-phase'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '7-10 business days',
    warranty: '1 Year',
  },
  {
    id: 'stabilizer-5kva',
    name: '5kVA Voltage Stabilizer',
    category: 'POWER',
    brand: 'Generic',
    tagline: 'Voltage Regulation',
    description: '5kVA servo voltage stabilizer for protection against voltage fluctuations.',
    price: 15000,
    currency: 'Nu.',
    images: [{ alt: 'Voltage Stabilizer' }],
    specifications: {
      'Capacity': '5000 VA',
      'Input Range': '130V-270V',
      'Output Accuracy': '±1%',
      'Type': 'Servo controlled',
      'Display': 'Digital voltmeter',
      'Protection': 'Overload, short-circuit',
    },
    inStock: true,
    stockQuantity: 15,
    tags: ['stabilizer', 'voltage', 'protection', 'power'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },
  {
    id: 'inverter-5kw',
    name: '5kW Solar Inverter',
    category: 'POWER',
    brand: 'Generic',
    tagline: 'Solar Power Conversion',
    description: '5kW pure sine wave inverter for solar power systems with MPPT charge controller.',
    price: 45000,
    currency: 'Nu.',
    images: [{ alt: 'Solar Inverter' }],
    specifications: {
      'Power': '5000 Watts',
      'Type': 'Pure Sine Wave',
      'Solar Input': 'MPPT charge controller built-in',
      'Battery': '48V system',
      'Output': '220V AC, 50Hz',
      'Display': 'LCD with data logging',
    },
    inStock: true,
    stockQuantity: 8,
    new: true,
    tags: ['inverter', 'solar', 'renewable', 'power'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '5-7 business days',
    warranty: '2 Years',
  },
  {
    id: 'battery-150ah',
    name: '150Ah Tubular Battery',
    category: 'POWER',
    brand: 'Generic',
    tagline: 'Deep Cycle Battery',
    description: '150Ah tubular battery for UPS and inverter applications. Long life design.',
    price: 22000,
    currency: 'Nu.',
    images: [{ alt: 'Tubular Battery' }],
    specifications: {
      'Capacity': '150 Ah',
      'Voltage': '12V',
      'Type': 'Tubular Lead Acid',
      'Design': 'Deep cycle',
      'Life': '5+ years',
      'Warranty': '36 months',
    },
    inStock: true,
    stockQuantity: 25,
    popular: true,
    tags: ['battery', 'ups', 'inverter', 'power-storage'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '2-3 business days',
    warranty: '3 Years',
  },

  // ============================================
  // COMPUTER SYSTEMS
  // ============================================
  {
    id: 'desktop-i3',
    name: 'Core i3 Business Desktop',
    category: 'COMPUTERS',
    brand: 'HP',
    tagline: 'Office Desktop PC',
    description: 'Intel Core i3 desktop with 8GB RAM and 256GB SSD. Ready for office work.',
    price: 42000,
    currency: 'Nu.',
    images: [{ alt: 'Business Desktop PC' }],
    specifications: {
      'Processor': 'Intel Core i3-12100',
      'RAM': '8GB DDR4 3200MHz',
      'Storage': '256GB NVMe SSD',
      'Graphics': 'Intel UHD Graphics',
      'OS': 'Windows 11 Pro',
      'Case': 'Micro-ATX Tower',
    },
    inStock: true,
    stockQuantity: 12,
    popular: true,
    tags: ['desktop', 'pc', 'office', 'intel'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },
  {
    id: 'desktop-i5',
    name: 'Core i5 Business Desktop',
    category: 'COMPUTERS',
    brand: 'Dell',
    tagline: 'Performance Desktop',
    description: 'Intel Core i5 desktop with 16GB RAM and 512GB SSD. Ideal for power users.',
    price: 65000,
    currency: 'Nu.',
    images: [{ alt: 'Performance Desktop' }],
    specifications: {
      'Processor': 'Intel Core i5-12400',
      'RAM': '16GB DDR4 3200MHz',
      'Storage': '512GB NVMe SSD',
      'Graphics': 'Intel UHD Graphics 730',
      'OS': 'Windows 11 Pro',
      'Case': 'Micro-ATX Tower',
    },
    inStock: true,
    stockQuantity: 10,
    featured: true,
    tags: ['desktop', 'pc', 'performance', 'intel'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },
  {
    id: 'desktop-i7',
    name: 'Core i7 Workstation',
    category: 'COMPUTERS',
    brand: 'HP',
    tagline: 'High Performance Workstation',
    description: 'Intel Core i7 with 32GB RAM and 1TB SSD. For demanding applications.',
    price: 125000,
    currency: 'Nu.',
    images: [{ alt: 'High Performance Workstation' }],
    specifications: {
      'Processor': 'Intel Core i7-12700',
      'RAM': '32GB DDR4 3200MHz',
      'Storage': '1TB NVMe SSD',
      'Graphics': 'NVIDIA GTX 1660 Super',
      'OS': 'Windows 11 Pro',
      'Case': 'ATX Tower with cooling',
    },
    inStock: true,
    stockQuantity: 5,
    featured: true,
    tags: ['desktop', 'workstation', 'performance', 'gaming'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '5-7 business days',
    warranty: '1 Year',
  },
  {
    id: 'laptop-business',
    name: '15" Business Laptop',
    category: 'COMPUTERS',
    brand: 'Lenovo',
    tagline: 'Professional Laptop',
    description: '15" business laptop with AMD Ryzen 5, 16GB RAM, and 512GB SSD.',
    price: 75000,
    currency: 'Nu.',
    images: [{ alt: 'Business Laptop' }],
    specifications: {
      'Processor': 'AMD Ryzen 5 5625U',
      'RAM': '16GB DDR4',
      'Storage': '512GB NVMe SSD',
      'Display': '15.6" FHD (1920x1080)',
      'Graphics': 'AMD Radeon Graphics',
      'Battery': 'Up to 8 hours',
      'OS': 'Windows 11 Pro',
    },
    inStock: true,
    stockQuantity: 8,
    featured: true,
    tags: ['laptop', 'business', 'portable', 'amd'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },
  {
    id: 'monitor-24',
    name: '24" Full HD Monitor',
    category: 'COMPUTERS',
    brand: 'Samsung',
    tagline: 'Professional Display',
    description: '24" IPS monitor with Full HD resolution. VESA mount compatible.',
    price: 12500,
    currency: 'Nu.',
    images: [{ alt: '24" Monitor' }],
    specifications: {
      'Size': '24 inch',
      'Resolution': '1920 x 1080 (Full HD)',
      'Panel': 'IPS',
      'Refresh Rate': '75Hz',
      'Connectivity': 'HDMI, DisplayPort, VGA',
      'VESA Mount': '100x100mm',
    },
    inStock: true,
    stockQuantity: 20,
    popular: true,
    tags: ['monitor', 'display', 'hd', 'ips'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '2-3 business days',
    warranty: '2 Years',
  },
  {
    id: 'monitor-27',
    name: '27" QHD Monitor',
    category: 'COMPUTERS',
    brand: 'Samsung',
    tagline: 'High Resolution Display',
    description: '27" QHD (2560x1440) IPS monitor with 75Hz refresh rate.',
    price: 22000,
    currency: 'Nu.',
    images: [{ alt: '27" QHD Monitor' }],
    specifications: {
      'Size': '27 inch',
      'Resolution': '2560 x 1440 (QHD)',
      'Panel': 'IPS',
      'Refresh Rate': '75Hz',
      'Connectivity': '2x HDMI, DisplayPort',
      'VESA Mount': '100x100mm',
    },
    inStock: true,
    stockQuantity: 12,
    featured: true,
    tags: ['monitor', 'display', 'qhd', 'high-resolution'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '2 Years',
  },
  {
    id: 'printer-laser',
    name: 'Laser Printer (Mono)',
    category: 'COMPUTERS',
    brand: 'HP',
    tagline: 'Fast Laser Printing',
    description: 'Mono laser printer with network connectivity. Perfect for office documents.',
    price: 18500,
    currency: 'Nu.',
    images: [{ alt: 'Laser Printer' }],
    specifications: {
      'Type': 'Mono Laser',
      'Speed': 'Up to 40 ppm',
      'Resolution': '1200 dpi',
      'Paper Size': 'A4, Letter',
      'Connectivity': 'USB, Ethernet, Wi-Fi',
      'Duplex': 'Automatic',
      'Input Tray': '250 sheets',
    },
    inStock: true,
    stockQuantity: 15,
    popular: true,
    tags: ['printer', 'laser', 'office', 'network'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },
  {
    id: 'printer-inkjet',
    name: 'Inkjet Printer (Color)',
    category: 'COMPUTERS',
    brand: 'Epson',
    tagline: 'Color Inkjet Printing',
    description: 'Color inkjet printer with scanning and copying functions.',
    price: 14500,
    currency: 'Nu.',
    images: [{ alt: 'Inkjet Printer' }],
    specifications: {
      'Type': 'Color Inkjet',
      'Functions': 'Print, Scan, Copy',
      'Speed': 'Up to 15 ppm (color)',
      'Connectivity': 'USB, Wi-Fi',
      'Paper Size': 'A4, A3, Letter',
      'Display': '2.7" LCD',
    },
    inStock: true,
    stockQuantity: 18,
    tags: ['printer', 'inkjet', 'color', 'scanner'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },
  {
    id: 'projector',
    name: '3500 Lumen Projector',
    category: 'COMPUTERS',
    brand: 'Innovate',
    tagline: 'Business Projector',
    description: '3500 lumen projector with HDMI and VGA inputs. Ideal for presentations.',
    price: 32000,
    currency: 'Nu.',
    images: [{ alt: 'Projector' }],
    specifications: {
      'Brightness': '3500 Lumens',
      'Resolution': '1080p Full HD',
      'Contrast': '15000:1',
      'Connectivity': '2x HDMI, VGA, USB',
      'Keystone': 'Vertical ±30°',
      'Lamp Life': 'Up to 10,000 hours',
    },
    inStock: true,
    stockQuantity: 8,
    tags: ['projector', 'presentation', 'display', 'meeting'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '3-5 business days',
    warranty: '1 Year',
  },

  // ============================================
  // ACCESSORIES
  // ============================================
  {
    id: 'keyboard-mouse-wireless',
    name: 'Wireless Keyboard & Mouse Set',
    category: 'ACCESSORIES',
    brand: 'Generic',
    tagline: 'Wireless Desktop Combo',
    description: 'Wireless keyboard and mouse combo with 2.4GHz connectivity.',
    price: 2500,
    currency: 'Nu.',
    images: [{ alt: 'Wireless Keyboard and Mouse' }],
    specifications: {
      'Connectivity': '2.4GHz Wireless',
      'Battery': 'AAA x 2 (keyboard), AA x 1 (mouse)',
      'Range': 'Up to 10 meters',
      'Features': 'Multimedia keys, ergonomic mouse',
    },
    inStock: true,
    stockQuantity: 40,
    popular: true,
    tags: ['keyboard', 'mouse', 'wireless', 'accessories'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '2-3 business days',
    warranty: '6 Months',
  },
  {
    id: 'webcam-hd',
    name: 'HD Webcam 1080p',
    category: 'ACCESSORIES',
    brand: 'Generic',
    tagline: 'HD Video Conference',
    description: '1080p HD webcam with built-in microphone for video conferencing.',
    price: 4500,
    currency: 'Nu.',
    images: [{ alt: 'HD Webcam' }],
    specifications: {
      'Resolution': '1920 x 1080 (1080p)',
      'Frame Rate': '30 fps',
      'Microphone': 'Built-in stereo',
      'Connectivity': 'USB 2.0',
      'Mount': 'Clip stand with tripod thread',
    },
    inStock: true,
    stockQuantity: 25,
    tags: ['webcam', 'camera', 'video-conference', 'zoom'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '2-3 business days',
    warranty: '6 Months',
  },
  {
    id: 'headset-usb',
    name: 'USB Headset with Microphone',
    category: 'ACCESSORIES',
    brand: 'Generic',
    tagline: 'Communication Headset',
    description: 'USB headset with noise-cancelling microphone for calls and meetings.',
    price: 3500,
    currency: 'Nu.',
    images: [{ alt: 'USB Headset' }],
    specifications: {
      'Connectivity': 'USB',
      'Drivers': '40mm',
      'Microphone': 'Noise-cancelling boom mic',
      'Controls': 'Volume, mute on ear cup',
      'Cord Length': '2 meters',
    },
    inStock: true,
    stockQuantity: 30,
    tags: ['headset', 'microphone', 'usb', 'audio'],
    relatedServices: ['Infrastructure'],
    deliveryTime: '2-3 business days',
    warranty: '6 Months',
  },
]

/**
 * Get products by category
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS_CATALOG.filter(p => p.category === category)
}

/**
 * Get featured products
 */
export function getFeaturedProducts(): Product[] {
  return PRODUCTS_CATALOG.filter(p => p.featured)
}

/**
 * Get popular products
 */
export function getPopularProducts(): Product[] {
  return PRODUCTS_CATALOG.filter(p => p.popular)
}

/**
 * Get new products
 */
export function getNewProducts(): Product[] {
  return PRODUCTS_CATALOG.filter(p => p.new)
}

/**
 * Search products by keyword
 */
export function searchProducts(keyword: string): Product[] {
  const lowerKeyword = keyword.toLowerCase()
  return PRODUCTS_CATALOG.filter(p =>
    p.name.toLowerCase().includes(lowerKeyword) ||
    p.description.toLowerCase().includes(lowerKeyword) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  )
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return PRODUCTS_CATALOG.find(p => p.id === id)
}

/**
 * Get related products
 */
export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const product = getProductById(productId)
  if (!product) return []

  const related = PRODUCTS_CATALOG.filter(p =>
    p.id !== productId &&
    (p.category === product.category || p.tags.some(t => product.tags.includes(t)))
  )

  return related.slice(0, limit)
}

/**
 * Product categories with metadata
 */
export const PRODUCT_CATEGORIES: Record<
  ProductCategory,
  { label: string; icon: string; description: string; color: string }
> = {
  POS: {
    label: 'POS Systems',
    icon: '💳',
    description: 'Point of Sale terminals, printers, and accessories',
    color: 'emerald',
  },
  SECURITY: {
    label: 'Security & Surveillance',
    icon: '🔒',
    description: 'CCTV cameras, DVRs, access control, and biometrics',
    color: 'blue',
  },
  NETWORKING: {
    label: 'Networking',
    icon: '🌐',
    description: 'Routers, switches, WiFi, and cabling',
    color: 'purple',
  },
  POWER: {
    label: 'Power Solutions',
    icon: '⚡',
    description: 'UPS, stabilizers, inverters, and batteries',
    color: 'yellow',
  },
  COMPUTERS: {
    label: 'Computer Systems',
    icon: '💻',
    description: 'Desktops, laptops, monitors, and peripherals',
    color: 'indigo',
  },
  SOFTWARE: {
    label: 'Software',
    icon: '💾',
    description: 'POS software, licenses, and subscriptions',
    color: 'cyan',
  },
  ACCESSORIES: {
    label: 'Accessories',
    icon: '🎧',
    description: 'Keyboards, mice, webcams, and more',
    color: 'pink',
  },
}
