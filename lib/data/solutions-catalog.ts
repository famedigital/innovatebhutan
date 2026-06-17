/**
 * Solutions Catalog Data Structure
 *
 * Organizes IT products by solution type rather than just category.
 * Each solution addresses specific business challenges with proven outcomes.
 */

import { PRODUCTS_CATALOG, type Product } from './products-catalog';

export interface SolutionProduct {
  productId: string;
  name: string;
  price: number;
  category: string;
}

export interface SolutionBenefit {
  metric: string;
  value: string;
  description: string;
}

export interface Solution {
  id: string;
  name: string;
  icon: string;
  problem: string;
  solution: string;
  products: SolutionProduct[];
  benefits: SolutionBenefit[];
  caseStudy?: string;
  ctaText: string;
  featured: boolean;
}

/**
 * Solutions organized by business problem
 */
export const SOLUTIONS_CATALOG: Record<string, Solution> = {
  retail: {
    id: 'retail',
    name: 'Retail Solutions',
    icon: '🛒',
    problem: 'Manual inventory tracking, slow checkout process, and no sales insights for business decisions.',
    solution: 'Complete POS and inventory management system that streamlines operations and provides real-time business intelligence.',
    products: [
      { productId: 'pos-touch-15', name: 'Touch Screen POS 15"', price: 45000, category: 'POS' },
      { productId: 'barcode-scanner-2d', name: '2D Barcode Scanner', price: 8500, category: 'POS' },
      { productId: 'thermal-printer-80', name: 'Thermal Receipt Printer 80mm', price: 12000, category: 'POS' },
      { productId: 'cash-drawer-medium', name: 'Cash Drawer Medium', price: 6500, category: 'POS' },
      { productId: 'pos-software-premium', name: 'POS Software Premium License', price: 25000, category: 'POS' }
    ],
    benefits: [
      { metric: 'Checkout Speed', value: '75% faster', description: 'Reduce customer wait time significantly' },
      { metric: 'Inventory Accuracy', value: '98%', description: 'Real-time stock tracking eliminates shrinkage' },
      { metric: 'Sales Analytics', value: 'Real-time', description: 'Instant business insights for decisions' },
      { metric: 'Error Reduction', value: '90%', description: 'Automated calculations eliminate human error' }
    ],
    caseStudy: 'city-mart',
    ctaText: 'Transform Your Retail Operations',
    featured: true
  },
  hospitality: {
    id: 'hospitality',
    name: 'Hospitality Solutions',
    icon: '🏨',
    problem: 'Inefficient booking processes, manual billing operations, and disconnected guest management.',
    solution: 'Integrated Hotel PMS with room management, automated billing, and seamless guest experience.',
    products: [
      { productId: 'hotel-pms-enterprise', name: 'Hotel PMS Enterprise', price: 180000, category: 'COMPUTERS' },
      { productId: 'key-card-locks', name: 'Key Card Lock System', price: 35000, category: 'SECURITY' },
      { productId: 'room-display-unit', name: 'Room Display Unit', price: 12000, category: 'COMPUTERS' },
      { productId: 'billing-kiosk', name: 'Self-Service Billing Kiosk', price: 45000, category: 'COMPUTERS' },
      { productId: 'reservation-module', name: 'Reservation Management Module', price: 35000, category: 'COMPUTERS' }
    ],
    benefits: [
      { metric: 'Check-in Time', value: '80% faster', description: 'Guests start enjoying their stay sooner' },
      { metric: 'Billing Accuracy', value: '99.8%', description: 'Eliminate billing disputes and errors' },
      { metric: 'Guest Satisfaction', value: '+51%', description: 'Improved guest experience and returns' },
      { metric: 'Staff Efficiency', value: '+40%', description: 'Team focuses on service, not paperwork' }
    ],
    caseStudy: 'taj-tashi',
    ctaText: 'Elevate Guest Experience',
    featured: true
  },
  security: {
    id: 'security',
    name: 'Security Solutions',
    icon: '🔒',
    problem: 'Inadequate surveillance, manual access control, and security blind spots.',
    solution: 'Comprehensive security ecosystem with CCTV monitoring, biometric access, and centralized control.',
    products: [
      { productId: 'cctv-dome-4mp', name: '4MP Dome Camera', price: 8500, category: 'SECURITY' },
      { productId: 'cctv-bullet-8mp', name: '8MP Bullet Camera', price: 15000, category: 'SECURITY' },
      { productId: 'nvr-32ch', name: '32CH NVR System', price: 45000, category: 'SECURITY' },
      { productId: 'biometric-attendance', name: 'Biometric Attendance System', price: 28000, category: 'SECURITY' },
      { productId: 'face-recognition-terminal', name: 'Face Recognition Terminal', price: 65000, category: 'SECURITY' }
    ],
    benefits: [
      { metric: 'Security Incidents', value: '80% reduction', description: 'Deterrence through comprehensive monitoring' },
      { metric: 'Monitoring Coverage', value: '98%', description: 'Complete facility visibility' },
      { metric: 'Access Control', value: '2 seconds', description: 'Fast, secure, tracked access' },
      { metric: 'Investigation Time', value: '90% faster', description: 'Quick video review and evidence' }
    ],
    caseStudy: 'thimphu-tech-park',
    ctaText: 'Secure Your Facility',
    featured: true
  },
  infrastructure: {
    id: 'infrastructure',
    name: 'Infrastructure Solutions',
    icon: '🖥️',
    problem: 'Unreliable network connectivity, slow data transfer, and frequent system downtime.',
    solution: 'Enterprise-grade networking infrastructure with optimized cabling, reliable hardware, and expert configuration.',
    products: [
      { productId: 'router-cisco-2921', name: 'Cisco Router 2921', price: 85000, category: 'NETWORKING' },
      { productId: 'switch-cisco-catalyst', name: 'Cisco Catalyst Switch 24PT', price: 45000, category: 'NETWORKING' },
      { productId: 'ap-ubiquiti-unifi', name: 'Ubiquiti UniFi Access Point', price: 12000, category: 'NETWORKING' },
      { productId: 'rack-cabinet-42u', name: 'Server Rack Cabinet 42U', price: 35000, category: 'NETWORKING' },
      { productId: 'cabling-cat6', name: 'Cat6 Cabling (per drop)', price: 850, category: 'NETWORKING' }
    ],
    benefits: [
      { metric: 'Network Uptime', value: '99.95%', description: 'Reliable connectivity for operations' },
      { metric: 'Data Transfer Speed', value: '1 Gbps', description: 'Fast file sharing and collaboration' },
      { metric: 'Support Response', value: '30 min', description: 'Rapid issue resolution' },
      { metric: 'Scalability', value: 'Unlimited', description: 'Growth-ready infrastructure' }
    ],
    caseStudy: 'druk-air',
    ctaText: 'Upgrade Your Infrastructure',
    featured: true
  },
  power: {
    id: 'power',
    name: 'Power Solutions',
    icon: '⚡',
    problem: 'Frequent power outages causing data loss, equipment damage, and operational disruptions.',
    solution: 'Comprehensive power protection with UPS systems, voltage stabilizers, and automated backup management.',
    products: [
      { productId: 'ups-apc-10kva', name: 'APC UPS 10kVA Online', price: 125000, category: 'POWER' },
      { productId: 'stabilizer-10kva', name: 'Voltage Stabilizer 10kVA', price: 45000, category: 'POWER' },
      { productId: 'inverter-luminous-5kva', name: 'Luminous Inverter 5kVA', price: 65000, category: 'POWER' },
      { productId: 'battery-tubular-200ah', name: 'Tubular Battery 200Ah', price: 28000, category: 'POWER' },
      { productId: 'power-manager', name: 'Power Management Software', price: 15000, category: 'POWER' }
    ],
    benefits: [
      { metric: 'Power Downtime', value: '100% eliminated', description: 'Zero disruptions to operations' },
      { metric: 'Data Protection', value: '100%', description: 'Safe shutdown during extended outages' },
      { metric: 'Equipment Life', value: '+3 years', description: 'Protected from voltage fluctuations' },
      { metric: 'ROI Period', value: '18 months', description: 'Payback through prevented losses' }
    ],
    caseStudy: 'bhutan-power-corp',
    ctaText: 'Protect Your Equipment',
    featured: false
  },
  business: {
    id: 'business',
    name: 'Business Operations',
    icon: '💼',
    problem: 'Outdated computers, slow printers, and inefficient office equipment hampering productivity.',
    solution: 'Modern computing solutions with reliable hardware, efficient peripherals, and optimized workstations.',
    products: [
      { productId: 'desktop-dell-optiplex', name: 'Dell Optiplex Desktop i5', price: 55000, category: 'COMPUTERS' },
      { productId: 'laptop-hp-probook', name: 'HP ProBook Laptop i5', price: 65000, category: 'COMPUTERS' },
      { productId: 'monitor-dell-24', name: 'Dell 24" Monitor', price: 12500, category: 'COMPUTERS' },
      { productId: 'printer-hp-laser', name: 'HP LaserJet Pro Printer', price: 28000, category: 'COMPUTERS' },
      { productId: 'projector-epson', name: 'Epson Business Projector', price: 45000, category: 'COMPUTERS' }
    ],
    benefits: [
      { metric: 'System Boot Time', value: '85% faster', description: 'Users start working immediately' },
      { metric: 'Print Speed', value: '40 ppm', description: 'High-volume printing efficiency' },
      { metric: 'Downtime Reduction', value: '87%', description: 'Reliable equipment minimizes disruptions' },
      { metric: 'User Satisfaction', value: '78%', description: 'Team appreciates modern tools' }
    ],
    caseStudy: 'royal-university',
    ctaText: 'Modernize Your Office',
    featured: false
  }
};

/**
 * Get featured solutions for homepage
 */
export function getFeaturedSolutions(): Solution[] {
  return Object.values(SOLUTIONS_CATALOG).filter(s => s.featured);
}

/**
 * Get solution by ID
 */
export function getSolutionById(id: string): Solution | undefined {
  return SOLUTIONS_CATALOG[id];
}

/**
 * Get all solutions
 */
export function getAllSolutions(): Solution[] {
  return Object.values(SOLUTIONS_CATALOG);
}

/**
 * Get solution IDs
 */
export function getSolutionIds(): string[] {
  return Object.keys(SOLUTIONS_CATALOG);
}

export default SOLUTIONS_CATALOG;
