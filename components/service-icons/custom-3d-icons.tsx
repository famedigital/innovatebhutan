"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassIcon3D, IconPresets } from "@/components/ui/3d-glass-icon";

/**
 * 🎨 Custom 3D Service Icons
 *
 * Premium, custom-designed icons for each service.
 * Each icon is crafted with specific animations and visual elements.
 */

// SVG Icon Components

/**
 * POS Solutions Icon - Cash register with animated coin
 */
const POSIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="6" width="20" height="14" rx="2" />
    <path d="M6 10h12" />
    <path d="M8 14h2" />
    <path d="M14 14h2" />
    <path d="M12 6V4" />
    <circle cx="12" cy="2" r="1" fill="currentColor" />
  </svg>
);

/**
 * Hotel PMS Icon - Building with key card
 */
const HotelPMSIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4 8 4v14" />
    <path d="M13 11h4" />
    <path d="M13 15h4" />
    <rect x="7" y="10" width="4" height="6" rx="1" />
  </svg>
);

/**
 * Web Development Icon - Code brackets with cursor
 */
const WebDevIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <motion.path
      d="M13 6l-4 12"
      animate={{
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    />
  </svg>
);

/**
 * SaaS Development Icon - Cloud with sync icons
 */
const SaaSIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19" />
    <circle cx="12" cy="12" r="3" />
    <motion.path
      d="M12 2v2"
      animate={{
        translateY: [0, -3, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    />
    <path d="M6 12H4" />
    <path d="M18 12h2" />
    <path d="M19.07 4.93L17.66 6.34" />
    <path d="M4.93 19.07L6.34 17.66" />
  </svg>
);

/**
 * ERP Development Icon - Grid layout with chart
 */
const ERPIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    <path d="M9 3v18" />
    <path d="M15 3v18" />
    <path d="M9 9h6v6H9z" fill="currentColor" fillOpacity={0.2} />
  </svg>
);

/**
 * Mobile Apps Icon - Phone with app grid
 */
const MobileAppsIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M12 18h.01" />
    <rect x="8" y="5" width="2" height="2" rx="0.5" fill="currentColor" />
    <rect x="11" y="5" width="2" height="2" rx="0.5" fill="currentColor" />
    <rect x="14" y="5" width="2" height="2" rx="0.5" fill="currentColor" />
    <rect x="8" y="8" width="2" height="2" rx="0.5" fill="currentColor" />
    <rect x="11" y="8" width="2" height="2" rx="0.5" fill="currentColor" />
    <rect x="14" y="8" width="2" height="2" rx="0.5" fill="currentColor" />
  </svg>
);

/**
 * Infrastructure Icon - Server rack with lights
 */
const InfrastructureIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M4 6h16" />
    <path d="M4 10h16" />
    <path d="M4 14h16" />
    <path d="M4 18h16" />
    <motion.circle
      cx="18"
      cy="4"
      r="1"
      fill="currentColor"
      animate={{
        opacity: [1, 0.3, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay: 0,
      }}
    />
    <motion.circle
      cx="18"
      cy="8"
      r="1"
      fill="currentColor"
      animate={{
        opacity: [1, 0.3, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay: 0.3,
      }}
    />
    <motion.circle
      cx="18"
      cy="12"
      r="1"
      fill="currentColor"
      animate={{
        opacity: [1, 0.3, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay: 0.6,
      }}
    />
  </svg>
);

/**
 * Security Systems Icon - Shield with camera lens
 */
const SecurityIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

/**
 * Technical Maintenance Icon - Wrench with gear
 */
const MaintenanceIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <motion.circle
      cx="12"
      cy="12"
      r="3"
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
    <path d="M12 8v4" />
  </svg>
);

/**
 * Payroll & HR Icon - Users with salary icon
 */
const PayrollIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <circle cx="19" cy="7" r="3" fill="currentColor" fillOpacity={0.2} />
    <path d="M23 21v-2a3 3 0 0 0-2.18-2.89" />
  </svg>
);

/**
 * GST Services Icon - Document with tax stamp
 */
const GSTIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
    <circle cx="16" cy="13" r="1" fill="currentColor" />
  </svg>
);

/**
 * IT Consulting Icon - Lightbulb with gears
 */
const ConsultingIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <motion.path
      d="M15.09 14c.18-.975.26-1.65.26-2A5.07 5.07 0 0 0 5.12 7a5 5 0 0 0 4.93 4.93c.35 0 .69.03 1.03.1"
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    />
    <path d="M8.5 10c.28-.66.63-1.28 1.04-1.85a7 7 0 1 1 4.92 2.85" />
    <circle cx="12" cy="5" r="1" fill="currentColor" />
  </svg>
);

// Icon mapping with color presets

export const SERVICE_ICONS: Record<
  string,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    preset: keyof typeof IconPresets;
  }
> = {
  "POS Solutions": {
    icon: POSIcon,
    color: "#0A5F4E",
    preset: "emerald",
  },
  "Hotel PMS": {
    icon: HotelPMSIcon,
    color: "#0F766E",
    preset: "jade",
  },
  "Web Development": {
    icon: WebDevIcon,
    color: "#3B82F6",
    preset: "blue",
  },
  "SaaS Development": {
    icon: SaaSIcon,
    color: "#8B5CF6",
    preset: "purple",
  },
  "ERP Development": {
    icon: ERPIcon,
    color: "#0A5F4E",
    preset: "emerald",
  },
  "Mobile App Development": {
    icon: MobileAppsIcon,
    color: "#EC4899",
    preset: "pink",
  },
  "Infrastructure": {
    icon: InfrastructureIcon,
    color: "#6366F1",
    preset: "blue",
  },
  "Security Systems": {
    icon: SecurityIcon,
    color: "#0F766E",
    preset: "jade",
  },
  "Technical Maintenance": {
    icon: MaintenanceIcon,
    color: "#F97316",
    preset: "orange",
  },
  "Payroll & HR": {
    icon: PayrollIcon,
    color: "#3B82F6",
    preset: "blue",
  },
  "GST Services": {
    icon: GSTIcon,
    color: "#0A5F4E",
    preset: "emerald",
  },
  "IT Consulting": {
    icon: ConsultingIcon,
    color: "#F59E0B",
    preset: "orange",
  },
};

/**
 * 🎨 Service Icon Component
 *
 * Renders a 3D glass icon for a specific service.
 */
export function ServiceIcon3D({
  serviceName,
  size = 80,
  className = "",
}: {
  serviceName: string;
  size?: number;
  className?: string;
}) {
  const iconConfig = SERVICE_ICONS[serviceName];

  if (!iconConfig) {
    console.warn(`No icon found for service: ${serviceName}`);
    return null;
  }

  const IconComponent = iconConfig.icon;
  const PresetComponent = IconPresets[iconConfig.preset];

  return (
    <PresetComponent
      size={size}
      className={className}
      icon={<IconComponent size={size * 0.4} />}
      glowing={true}
    />
  );
}

/**
 * 🎨 Service Icon Grid
 *
 * Renders all service icons in a grid layout.
 */
export function ServiceIconGrid({
  iconSize = 64,
  className = "",
}: {
  iconSize?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 ${className}`}>
      {Object.entries(SERVICE_ICONS).map(([serviceName, config], index) => {
        const IconComponent = config.icon;
        const PresetComponent = IconPresets[config.preset];

        return (
          <motion.div
            key={serviceName}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="flex flex-col items-center gap-2"
          >
            <PresetComponent
              size={iconSize}
              icon={<IconComponent size={iconSize * 0.4} />}
              glowing={false}
            />
            <span className="text-xs text-center text-muted-foreground">
              {serviceName.replace(/\s+/g, " ")}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * 🎨 Animated Service Icon
 *
 * Service icon with entrance animation and hover effects.
 */
export function AnimatedServiceIcon({
  serviceName,
  size = 80,
  delay = 0,
}: {
  serviceName: string;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.1, rotateZ: 5 }}
      className="inline-block"
    >
      <ServiceIcon3D serviceName={serviceName} size={size} />
    </motion.div>
  );
}

export default ServiceIcon3D;
