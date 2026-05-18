// Service-specific icon library for 3D rendering
// Provides SVG icons for floating elements in 3D scenes

'use client';

import { LucideIcon } from 'lucide-react';
import {
  ShoppingBasket,
  Barcode,
  Printer,
  Bed,
  CreditCard,
  Calendar,
  Camera,
  Shield,
  Lock,
  Server,
  Database,
  Cloud,
  Code,
  Globe,
  Smartphone,
  Wifi,
  Cable,
  Router,
  Wrench,
  Settings,
  Headphones,
  Lightbulb,
  Rocket,
  Star
} from 'lucide-react';

export const serviceIcons: Record<string, LucideIcon> = {
  'cash-register': ShoppingBasket,
  'barcode-scanner': Barcode,
  'receipt-printer': Printer,
  'bed': Bed,
  'key-card': CreditCard,
  'calendar': Calendar,
  'camera': Camera,
  'shield': Shield,
  'lock': Lock,
  'server': Server,
  'database': Database,
  'cloud': Cloud,
  'code': Code,
  'browser': Globe,
  'smartphone': Smartphone,
  'wifi': Wifi,
  'ethernet': Cable,
  'router': Router,
  'wrench': Wrench,
  'gear': Settings,
  'headset': Headphones,
  'lightbulb': Lightbulb,
  'rocket': Rocket,
  'star': Star
};

export function getServiceIcon(type: string): LucideIcon {
  return serviceIcons[type] || Star;
}