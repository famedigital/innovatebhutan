// Service 3D Configuration System
// Defines unified engineering theme with service-specific variations

export interface FloatingElement {
  type: string;
  position: { x: number; y: number; z: number };
  animation: 'float' | 'pulse' | 'rotate' | 'scan';
}

export interface Service3DConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;      // Service-specific color
  secondaryColor: string;    // Accent color
  buildingType: 'datacenter' | 'retail' | 'hotel' | 'office' | 'server-room' | 'network-hub' | 'service-center';
  floatingElements: FloatingElement[];
  animationIntensity: 'subtle' | 'moderate' | 'dynamic';
  cameraAngle: { rotateX: number; rotateY: number };
}

export const serviceConfigs: Record<string, Service3DConfig> = {
  pos: {
    id: 'pos',
    name: 'POS Solutions',
    description: 'Enterprise point-of-sale systems for modern retail operations',
    primaryColor: '#10B981',           // Emerald green
    secondaryColor: '#39FF14',         // Brand neon green
    buildingType: 'retail',
    floatingElements: [
      { type: 'cash-register', position: { x: -30, y: 20, z: 0 }, animation: 'float' },
      { type: 'barcode-scanner', position: { x: 30, y: -20, z: 10 }, animation: 'pulse' },
      { type: 'receipt-printer', position: { x: 0, y: 30, z: -10 }, animation: 'rotate' }
    ],
    animationIntensity: 'dynamic',
    cameraAngle: { rotateX: 55, rotateY: -45 }
  },

  hotel: {
    id: 'hotel',
    name: 'Hotel Management',
    description: 'Complete property management solutions for hospitality',
    primaryColor: '#3B82F6',           // Blue
    secondaryColor: '#60A5FA',         // Light blue
    buildingType: 'hotel',
    floatingElements: [
      { type: 'bed', position: { x: -20, y: 10, z: 0 }, animation: 'float' },
      { type: 'key-card', position: { x: 20, y: -10, z: 15 }, animation: 'pulse' },
      { type: 'calendar', position: { x: 0, y: 25, z: -5 }, animation: 'rotate' }
    ],
    animationIntensity: 'moderate',
    cameraAngle: { rotateX: 55, rotateY: -45 }
  },

  security: {
    id: 'security',
    name: 'Security Systems',
    description: 'Advanced surveillance and access control',
    primaryColor: '#EF4444',           // Red
    secondaryColor: '#F87171',         // Light red
    buildingType: 'server-room',
    floatingElements: [
      { type: 'camera', position: { x: -25, y: 15, z: 0 }, animation: 'scan' },
      { type: 'shield', position: { x: 25, y: -15, z: 10 }, animation: 'pulse' },
      { type: 'lock', position: { x: 0, y: 30, z: -10 }, animation: 'float' }
    ],
    animationIntensity: 'dynamic',
    cameraAngle: { rotateX: 55, rotateY: -45 }
  },

  infrastructure: {
    id: 'infrastructure',
    name: 'IT Infrastructure',
    description: 'Robust data center and server solutions',
    primaryColor: '#8B5CF6',           // Purple
    secondaryColor: '#A78BFA',         // Light purple
    buildingType: 'datacenter',
    floatingElements: [
      { type: 'server', position: { x: -25, y: 20, z: 5 }, animation: 'pulse' },
      { type: 'database', position: { x: 25, y: -15, z: 10 }, animation: 'float' },
      { type: 'cloud', position: { x: 0, y: 30, z: -5 }, animation: 'float' }
    ],
    animationIntensity: 'dynamic',
    cameraAngle: { rotateX: 55, rotateY: -45 }
  },

  web: {
    id: 'web',
    name: 'Web Development',
    description: 'Modern web applications and digital experiences',
    primaryColor: '#F97316',           // Orange
    secondaryColor: '#FB923C',         // Light orange
    buildingType: 'office',
    floatingElements: [
      { type: 'code', position: { x: -20, y: 15, z: 0 }, animation: 'float' },
      { type: 'browser', position: { x: 20, y: -10, z: 15 }, animation: 'pulse' },
      { type: 'smartphone', position: { x: 0, y: 25, z: -10 }, animation: 'rotate' }
    ],
    animationIntensity: 'moderate',
    cameraAngle: { rotateX: 55, rotateY: -45 }
  },

  network: {
    id: 'network',
    name: 'Network Solutions',
    description: 'Connectivity and network infrastructure',
    primaryColor: '#06B6D4',           // Cyan
    secondaryColor: '#22D3EE',         // Light cyan
    buildingType: 'network-hub',
    floatingElements: [
      { type: 'wifi', position: { x: -20, y: 20, z: 5 }, animation: 'pulse' },
      { type: 'ethernet', position: { x: 20, y: -15, z: 10 }, animation: 'float' },
      { type: 'router', position: { x: 0, y: 30, z: -5 }, animation: 'rotate' }
    ],
    animationIntensity: 'moderate',
    cameraAngle: { rotateX: 55, rotateY: -45 }
  },

  support: {
    id: 'support',
    name: 'Complete Support',
    description: '24/7 technical support and maintenance services',
    primaryColor: '#EC4899',           // Pink
    secondaryColor: '#F472B6',         // Light pink
    buildingType: 'service-center',
    floatingElements: [
      { type: 'wrench', position: { x: -25, y: 15, z: 0 }, animation: 'rotate' },
      { type: 'gear', position: { x: 25, y: -15, z: 10 }, animation: 'rotate' },
      { type: 'headset', position: { x: 0, y: 30, z: -5 }, animation: 'pulse' }
    ],
    animationIntensity: 'moderate',
    cameraAngle: { rotateX: 55, rotateY: -45 }
  },

  innovate: {
    id: 'innovate',
    name: 'Innovate Bhutan',
    description: 'Transforming businesses through technology innovation',
    primaryColor: '#39FF14',           // Brand neon green
    secondaryColor: '#10B981',         // Emerald green
    buildingType: 'datacenter',
    floatingElements: [
      { type: 'lightbulb', position: { x: -20, y: 20, z: 5 }, animation: 'pulse' },
      { type: 'rocket', position: { x: 20, y: -15, z: 10 }, animation: 'float' },
      { type: 'star', position: { x: 0, y: 30, z: -5 }, animation: 'rotate' }
    ],
    animationIntensity: 'dynamic',
    cameraAngle: { rotateX: 55, rotateY: -45 }
  }
};

// Helper function to get config by ID
export function getServiceConfig(id: string): Service3DConfig | undefined {
  return serviceConfigs[id];
}

// Helper function to get all service IDs
export function getAllServiceIds(): string[] {
  return Object.keys(serviceConfigs);
}

// Helper function to get services array
export function getServicesArray(): Service3DConfig[] {
  return Object.values(serviceConfigs);
}