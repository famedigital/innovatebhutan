/**
 * Product catalog — source of truth for ERP product desks.
 * Keys are stored on tickets/invoices/AMC meta; DB `products` table mirrors this (migration 0013).
 */

export type ProductBillingType =
  | "amc"
  | "one_time"
  | "training"
  | "development";

export type ProductKey =
  | "rancelab"
  | "pelbu_pos"
  | "website"
  | "cctv"
  | "networking";

export type ProductDefinition = {
  key: ProductKey;
  name: string;
  shortName: string;
  description: string;
  href: string;
  billingTypes: ProductBillingType[];
  supportsAmc: boolean;
  sortOrder: number;
};

export const PRODUCT_CATALOG: ProductDefinition[] = [
  {
    key: "rancelab",
    name: "RanceLab",
    shortName: "RanceLab",
    description: "POS & retail AMC, renewals, support tickets",
    href: "/admin/products/rancelab",
    billingTypes: ["amc", "training", "one_time"],
    supportsAmc: true,
    sortOrder: 1,
  },
  {
    key: "pelbu_pos",
    name: "Pelbu POS",
    shortName: "Pelbu",
    description: "Pelbu point-of-sale licenses, AMC, and training",
    href: "/admin/products/pelbu-pos",
    billingTypes: ["amc", "training", "one_time"],
    supportsAmc: true,
    sortOrder: 2,
  },
  {
    key: "website",
    name: "Website Design",
    shortName: "Website",
    description: "Website builds, hosting AMC, and redesign fees",
    href: "/admin/products/website",
    billingTypes: ["development", "amc", "one_time"],
    supportsAmc: true,
    sortOrder: 3,
  },
  {
    key: "cctv",
    name: "CCTV",
    shortName: "CCTV",
    description: "CCTV install, maintenance contracts, and service calls",
    href: "/admin/products/cctv",
    billingTypes: ["one_time", "amc", "development"],
    supportsAmc: true,
    sortOrder: 4,
  },
  {
    key: "networking",
    name: "Networking",
    shortName: "Network",
    description: "Network setup, AMC, and on-site support",
    href: "/admin/products/networking",
    billingTypes: ["development", "amc", "one_time"],
    supportsAmc: true,
    sortOrder: 5,
  },
];

export function getProduct(key: string | null | undefined): ProductDefinition | undefined {
  if (!key) return undefined;
  return PRODUCT_CATALOG.find((p) => p.key === key);
}

export function isProductKey(value: string): value is ProductKey {
  return PRODUCT_CATALOG.some((p) => p.key === value);
}

export const DEFAULT_PRODUCT_KEY: ProductKey = "rancelab";
