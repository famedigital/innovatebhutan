/**
 * Case Studies Data Structure
 *
 * Real success stories from Innovate Bhutan's client projects.
 * Each case study demonstrates problem-solving capabilities and proven results.
 */

export interface CaseStudyResult {
  metric: string;
  before: string;
  after: string;
  improvement: string;
}

export interface CaseStudy {
  id: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: CaseStudyResult[];
  testimonial?: string;
  logo?: string;
  tags: string[];
  featured: boolean;
}

/**
 * Complete case studies collection
 */
export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'silverpine-boutique',
    client: 'Silverpine Boutique',
    industry: 'Hospitality',
    challenge: 'Manual reservation management, inefficient check-in process, and lack of integrated billing system.',
    solution: 'Complete Hotel PMS implementation with room management, automated billing, and guest experience enhancement.',
    results: [
      { metric: 'Check-in Time', before: '12 min', after: '2 min', improvement: '83% faster' },
      { metric: 'Booking Efficiency', before: 'Base', after: '+60%', improvement: '60% increase' },
      { metric: 'Billing Errors', before: '6%', after: '0.1%', improvement: '98% reduction' },
      { metric: 'Guest Satisfaction', before: '70%', after: '92%', improvement: '31% increase' }
    ],
    testimonial: 'The PMS solution transformed our boutique operations. Our guests love the seamless check-in experience, and our staff can now focus on delivering personalized hospitality.',
    tags: ['Hotel PMS', 'Digital Transformation', 'Guest Experience'],
    featured: true
  },
  {
    id: 'yeshey-tshogyal',
    client: 'Yeshey Tshogyal',
    industry: 'Web Design',
    challenge: 'Outdated website with poor mobile experience, slow loading times, and difficulty updating content.',
    solution: 'Modern responsive website design with CMS integration, SEO optimization, and fast loading performance.',
    results: [
      { metric: 'Page Load Speed', before: '6.5s', after: '1.2s', improvement: '82% faster' },
      { metric: 'Mobile Traffic', before: '35%', after: '68%', improvement: '94% increase' },
      { metric: 'Inquiry Rate', before: '2.5%', after: '8.3%', improvement: '232% increase' },
      { metric: 'Update Time', before: '2 days', after: '5 min', improvement: 'Instant updates' }
    ],
    testimonial: 'Our new website has significantly boosted our online presence. We receive more inquiries and can now update content ourselves in minutes.',
    tags: ['Web Design', 'Responsive Design', 'CMS', 'SEO'],
    featured: true
  },
  {
    id: 'w-tours',
    client: 'W Tours',
    industry: 'Web Design',
    challenge: 'Static brochure website unable to showcase tour packages dynamically or accept online bookings.',
    solution: 'Dynamic booking platform with interactive tour gallery, online reservation system, and payment integration.',
    results: [
      { metric: 'Online Bookings', before: '0', after: '75%', improvement: '75% of total bookings' },
      { metric: 'Page Views', before: '450/day', after: '1,800/day', improvement: '300% increase' },
      { metric: 'Booking Time', before: '45 min (phone)', after: '5 min (online)', improvement: '89% faster' },
      { metric: 'Customer Engagement', before: '1.2 min', after: '4.5 min', improvement: '275% increase' }
    ],
    testimonial: 'Moving to an online booking system revolutionized our tour operations. Customers can now book instantly 24/7, and our conversion rate has skyrocketed.',
    tags: ['Web Design', 'Booking System', 'Payment Integration', 'E-commerce'],
    featured: true
  },
  {
    id: 'silverpine-tours',
    client: 'Silverpine Tours',
    industry: 'Web Design',
    challenge: 'Limited online visibility, no e-commerce capability, and manual booking management.',
    solution: 'Complete digital transformation with e-commerce website, automated booking system, and customer portal.',
    results: [
      { metric: 'Online Revenue', before: '15%', after: '68%', improvement: '353% increase' },
      { metric: 'Booking Efficiency', before: 'Manual', after: 'Automated', improvement: '100% automated' },
      { metric: 'Search Ranking', before: 'Page 5', after: 'Page 1', improvement: 'Top 3 results' },
      { metric: 'Return Customers', before: '22%', after: '45%', improvement: '105% increase' }
    ],
    testimonial: 'The e-commerce platform opened new markets for our tour business. We now reach customers globally and handle bookings automatically.',
    tags: ['Web Design', 'E-commerce', 'Booking System', 'Digital Marketing'],
    featured: true
  },
  {
    id: 'yolo',
    client: 'YOLO',
    industry: 'Security',
    challenge: 'Inadequate surveillance coverage, manual security monitoring, and frequent incidents in retail establishment.',
    solution: 'Comprehensive CCTV system with 24/7 monitoring, mobile app access, and intrusion detection integration.',
    results: [
      { metric: 'Security Incidents', before: '12/month', after: '2/month', improvement: '83% reduction' },
      { metric: 'Monitoring Coverage', before: '55%', after: '98%', improvement: '78% increase' },
      { metric: 'Response Time', before: 'Unknown', after: '30 seconds', improvement: 'Instant alerts' },
      { metric: 'Theft Reduction', before: 'Base', after: '-75%', improvement: '75% reduction' }
    ],
    testimonial: 'The security system gave us complete peace of mind. We can monitor our business remotely and have seen a dramatic reduction in incidents.',
    tags: ['Security Systems', 'CCTV', 'Monitoring', 'Intrusion Detection'],
    featured: false
  },
  {
    id: 'ydf',
    client: 'Youth Development Fund',
    industry: 'Security',
    challenge: 'Multiple facility locations requiring centralized access control and visitor management.',
    solution: 'Integrated biometric access control system with visitor management, centralized monitoring, and audit trails.',
    results: [
      { metric: 'Unauthorized Access', before: '8/year', after: '0', improvement: '100% eliminated' },
      { metric: 'Check-in Time', before: '5 min', after: '30 seconds', improvement: '90% faster' },
      { metric: 'Central Monitoring', before: 'Manual', after: 'Real-time', improvement: 'Instant visibility' },
      { metric: 'Visitor Processing', before: '8 min', after: '2 min', improvement: '75% faster' }
    ],
    testimonial: 'The biometric access control system streamlined our facility management across all locations. Security and efficiency improved dramatically.',
    tags: ['Security Systems', 'Biometrics', 'Access Control', 'Visitor Management'],
    featured: false
  },
  {
    id: 'silverpine-infrastructure',
    client: 'Silverpine Group',
    industry: 'Infrastructure',
    challenge: 'Unreliable network connectivity across multiple business locations and frequent downtime.',
    solution: 'Enterprise networking infrastructure with site-to-site VPN, redundant connections, and centralized management.',
    results: [
      { metric: 'Network Uptime', before: '89%', after: '99.8%', improvement: '12% increase' },
      { metric: 'Data Transfer Speed', before: '50 Mbps', after: '500 Mbps', improvement: '10x faster' },
      { metric: 'Inter-site Latency', before: '120ms', after: '8ms', improvement: '93% reduction' },
      { metric: 'Downtime Incidents', before: '15/month', after: '1/month', improvement: '93% reduction' }
    ],
    testimonial: 'Our business operations depend on reliable connectivity. The new infrastructure has eliminated network issues and enabled seamless operations across all locations.',
    tags: ['Networking', 'VPN', 'Infrastructure', 'Business Continuity'],
    featured: false
  },
  {
    id: 'retail-pos',
    client: 'Local Retail Clients',
    industry: 'Retail',
    challenge: 'Manual inventory tracking, slow checkout process, and no sales analytics for business decisions.',
    solution: 'End-to-end POS system with barcode scanners, thermal printers, and real-time inventory management.',
    results: [
      { metric: 'Checkout Time', before: '8 min', after: '2 min', improvement: '75% faster' },
      { metric: 'Inventory Accuracy', before: '78%', after: '98%', improvement: '26% increase' },
      { metric: 'Shrinkage', before: '5%', after: '1.2%', improvement: '76% reduction' },
      { metric: 'Sales Insights', before: 'Next day', after: 'Real-time', improvement: 'Instant analytics' }
    ],
    testimonial: 'The POS system transformed our retail operations. We now have complete visibility into sales and inventory with real-time data for better decision making.',
    tags: ['POS Systems', 'Inventory Management', 'Retail Analytics'],
    featured: false
  }
];

/**
 * Get featured case studies for homepage showcase
 */
export function getFeaturedCaseStudies(limit: number = 3): CaseStudy[] {
  return CASE_STUDIES.filter(cs => cs.featured).slice(0, limit);
}

/**
 * Get case studies by industry
 */
export function getCaseStudiesByIndustry(industry: string): CaseStudy[] {
  return CASE_STUDIES.filter(cs => cs.industry === industry);
}

/**
 * Get case studies by tag
 */
export function getCaseStudiesByTag(tag: string): CaseStudy[] {
  return CASE_STUDIES.filter(cs => cs.tags.includes(tag));
}

/**
 * Get all unique industries
 */
export function getIndustries(): string[] {
  return Array.from(new Set(CASE_STUDIES.map(cs => cs.industry)));
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const tags = CASE_STUDIES.flatMap(cs => cs.tags);
  return Array.from(new Set(tags)).sort();
}

export default CASE_STUDIES;
