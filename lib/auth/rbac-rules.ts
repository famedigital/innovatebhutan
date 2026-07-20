/**
 * 🔐 Role-Based Access Control (RBAC) Rules
 *
 * Defines permissions for each user role in the system.
 * Used by middleware, API routes, and client-side components.
 */

export type UserRole = "ADMIN" | "STAFF" | "CLIENT" | "SUPERADMIN";
export type Permission = string
export type Resource = string

/**
 * Permission format: resource:action
 * Examples:
 * - projects:view - Can view projects
 * - projects:edit - Can edit projects
 * - projects:delete - Can delete projects
 * - * - Wildcard for all permissions
 */

export type PermissionRule = {
  role: UserRole
  permissions: Permission[]
  description?: string
}

/**
 * RBAC Rules Configuration
 *
 * ADMIN: Full system access
 * STAFF: Limited operational access
 * CLIENT: Portal and self-service access
 */
export const RBAC_RULES: Record<UserRole, Permission[]> = {
  /**
   * 👑 SUPERADMIN - Same as ADMIN (full access)
   */
  SUPERADMIN: ["*"],

  /**
   * 👑 ADMIN - Full system access
   * Can access all features, settings, and perform any action
   */
  ADMIN: [
    "*", // Wildcard - grants all permissions
  ],

  /**
   * 👨‍💻 STAFF - Operational access
   * Can manage day-to-day operations but cannot access sensitive settings
   */
  STAFF: [
    // Dashboard & Overview
    'dashboard:view',

    // Projects Module
    'projects:view',
    'projects:edit',
    'projects:create',
    'projects:delete',

    // Orders Module
    'orders:view',
    'orders:create',
    'orders:edit',

    // Support Tickets
    'tickets:view',
    'tickets:respond',
    'tickets:resolve',
    'tickets:assign',

    // Clients & Businesses
    'clients:view',
    'clients:edit',
    'businesses:view',
    'businesses:edit',

    // Services
    'services:view',

    // Expenses (staff can create and view)
    'expenses:view',
    'expenses:create',
    'expenses:edit',

    // Inventory
    'inventory:view',
    'inventory:edit',

    // Assets (view only)
    'assets:view',

    // Procurement (view and create)
    'procurement:view',
    'procurement:create',

    // Support
    'support:view',
    'support:respond',
    'whatsapp:view',
  ],

  /**
   * 👤 CLIENT - Portal access
   * Can access their own data and communicate with support
   */
  CLIENT: [
    // Portal Access
    'portal:access',
    'portal:dashboard:view',

    // Chat Support
    'portal:chat',
    'portal:chat:send',
    'portal:chat:history',

    // Support Tickets
    'portal:tickets:view',
    'portal:tickets:create',
    'portal:tickets:edit:own',

    // Orders (own only)
    'portal:orders:view',
    'portal:orders:create',

    // Invoices (own only)
    'portal:invoices:view',

    // AMC Contracts (own only)
    'portal:amc:view',

    // Projects (own only)
    'portal:projects:view',

    // Profile
    'portal:profile:view',
    'portal:profile:edit',
  ],
}

/**
 * Role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, { label: string; description: string; color: string }> = {
  SUPERADMIN: {
    label: "Super Administrator",
    description: "Full system access with all permissions",
    color: "red",
  },
  ADMIN: {
    label: "Administrator",
    description: "Full system access with all permissions",
    color: "red",
  },
  STAFF: {
    label: "Staff Member",
    description: "Operational access for daily tasks",
    color: "blue",
  },
  CLIENT: {
    label: "Client",
    description: "Portal access for self-service",
    color: "green",
  },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = RBAC_RULES[role]

  // Check for wildcard
  if (permissions.includes('*')) {
    return true
  }

  // Check for exact permission match
  if (permissions.includes(permission)) {
    return true
  }

  // Check for resource wildcard (e.g., "projects:*")
  const [resource] = permission.split(':')
  if (permissions.includes(`${resource}:*`)) {
    return true
  }

  return false
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return RBAC_RULES[role]
}

/**
 * Filter routes based on role permissions
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  // Normalize trailing slash (next.config trailingSlash: true)
  const path = route.replace(/\/+$/, "") || "/";

  // Only ADMIN and STAFF may access any /admin route
  if (path.startsWith("/admin")) {
    if (role !== "ADMIN" && role !== "STAFF" && role !== "SUPERADMIN") {
      return false;
    }

    // Admin-only routes
    const adminOnlyRoutes = [
      "/admin/settings",
      "/admin/employees",
      "/admin/attendance",
      "/admin/hr",
      "/admin/invoice",
      "/admin/accounts",
      "/admin/expenses",
      "/admin/transactions",
      "/admin/finance",
      "/admin/notifications",
      "/admin/audit",
      "/admin/website",
      "/admin/blog",
      "/admin/media",
      "/admin/marketing",
      "/admin/hero",
      "/admin/users",
    ];

    if (
      adminOnlyRoutes.some((r) => path === r || path.startsWith(r + "/"))
    ) {
      return role === "ADMIN" || role === "SUPERADMIN";
    }

    return true;
  }

  // Portal routes (all authenticated users)
  if (path.startsWith("/portal") || path.startsWith("/client")) {
    return true;
  }

  // Public routes
  return true;
}

/**
 * Authorization hook for React components
 */
export function useAuthorization() {
  const checkPermission = (role: UserRole, permission: Permission): boolean => {
    return hasPermission(role, permission)
  }

  const checkRouteAccess = (role: UserRole, route: string): boolean => {
    return canAccessRoute(role, route)
  }

  return {
    hasPermission: checkPermission,
    canAccessRoute: checkRouteAccess,
    getPermissions: getRolePermissions,
  }
}

/**
 * Server-side authorization helper
 * Used in API routes and server components
 */
export async function authorizeUser(
  userId: string,
  requiredPermission: Permission
): Promise<boolean> {
  try {
    const { createClient } = await import('@/utils/supabase/server')
    const supabase = createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('userId', userId)
      .single()

    if (error || !data) {
      return false
    }

    return hasPermission(data.role as UserRole, requiredPermission)
  } catch (error) {
    console.error('Authorization error:', error)
    return false
  }
}
