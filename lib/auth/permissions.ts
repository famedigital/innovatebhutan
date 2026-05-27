/**
 * 🔐 ROLE-BASED ACCESS CONTROL (RBAC) SYSTEM
 * Enterprise-grade permissions and access control for 300+ client support system
 */

/**
 * User roles in the system
 */
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  SUPPORT_GROUP_LEAD = 'SUPPORT_GROUP_LEAD',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
  ACCOUNTANT = 'ACCOUNTANT',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  ADMIN = 'ADMIN',
}

/**
 * Permission categories
 */
export enum PermissionCategory {
  CLIENTS = 'clients',
  CREDENTIALS = 'credentials',
  SUPPORT_GROUPS = 'support_groups',
  WHATSAPP_GROUPS = 'whatsapp_groups',
  BOT = 'bot',
  AMC = 'amc',
  PROJECTS = 'projects',
  ACCOUNTS = 'accounts',
  COMMUNICATIONS = 'communications',
}

/**
 * Permission interface
 */
export interface Permissions {
  clients: {
    viewAll: boolean;
    viewAssigned: boolean;
    editAll: boolean;
    editAssigned: boolean;
    deleteAll: boolean;
    exportAll: boolean;
    exportAssigned: boolean;
  };
  credentials: {
    viewAll: boolean;
    viewAssigned: boolean;
    manageAll: boolean;
    manageAssigned: boolean;
    decryptAll: boolean;
    decryptAssigned: boolean;
    deleteAll: boolean;
    rotateAll: boolean;
    rotateAssigned: boolean;
  };
  supportGroups: {
    viewAll: boolean;
    manageAll: boolean;
    assignStaff: boolean;
    assignClients: boolean;
    viewPerformance: boolean;
  };
  whatsappGroups: {
    viewAll: boolean;
    viewAssigned: boolean;
    manageAll: boolean;
    manageAssigned: boolean;
    createAll: boolean;
    deleteAll: boolean;
  };
  bot: {
    viewAnalytics: boolean;
    manageTraining: boolean;
    viewConversations: boolean;
    retrainBot: boolean;
  };
  amc: {
    viewAll: boolean;
    viewAssigned: boolean;
    manageAll: boolean;
    manageAssigned: boolean;
    viewFinancials: boolean;
  };
  projects: {
    viewAll: boolean;
    viewAssigned: boolean;
    editAll: boolean;
    editAssigned: boolean;
    deleteAll: boolean;
  };
  accounts: {
    viewAll: boolean;
    manageAll: boolean;
    approvePayments: boolean;
    exportFinancials: boolean;
  };
  communications: {
    viewAll: boolean;
    viewAssigned: boolean;
    sendAll: boolean;
    sendAssigned: boolean;
    exportAll: boolean;
  };
}

/**
 * Role permissions configuration
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  // SUPERADMIN - Full access to everything
  [UserRole.SUPERADMIN]: {
    clients: {
      viewAll: true,
      viewAssigned: true,
      editAll: true,
      editAssigned: true,
      deleteAll: true,
      exportAll: true,
      exportAssigned: true,
    },
    credentials: {
      viewAll: true,
      viewAssigned: true,
      manageAll: true,
      manageAssigned: true,
      decryptAll: true,
      decryptAssigned: true,
      deleteAll: true,
      rotateAll: true,
      rotateAssigned: true,
    },
    supportGroups: {
      viewAll: true,
      manageAll: true,
      assignStaff: true,
      assignClients: true,
      viewPerformance: true,
    },
    whatsappGroups: {
      viewAll: true,
      viewAssigned: true,
      manageAll: true,
      manageAssigned: true,
      createAll: true,
      deleteAll: true,
    },
    bot: {
      viewAnalytics: true,
      manageTraining: true,
      viewConversations: true,
      retrainBot: true,
    },
    amc: {
      viewAll: true,
      viewAssigned: true,
      manageAll: true,
      manageAssigned: true,
      viewFinancials: true,
    },
    projects: {
      viewAll: true,
      viewAssigned: true,
      editAll: true,
      editAssigned: true,
      deleteAll: true,
    },
    accounts: {
      viewAll: true,
      manageAll: true,
      approvePayments: true,
      exportFinancials: true,
    },
    communications: {
      viewAll: true,
      viewAssigned: true,
      sendAll: true,
      sendAssigned: true,
      exportAll: true,
    },
  },

  // SUPPORT_GROUP_LEAD - Manage their own group and clients
  [UserRole.SUPPORT_GROUP_LEAD]: {
    clients: {
      viewAll: false,
      viewAssigned: true,
      editAll: false,
      editAssigned: true,
      deleteAll: false,
      exportAll: false,
      exportAssigned: true,
    },
    credentials: {
      viewAll: false,
      viewAssigned: true,
      manageAll: false,
      manageAssigned: true,
      decryptAll: false,
      decryptAssigned: true,
      deleteAll: false,
      rotateAll: false,
      rotateAssigned: true,
    },
    supportGroups: {
      viewAll: true,
      manageAll: false,
      assignStaff: false,
      assignClients: true,
      viewPerformance: true,
    },
    whatsappGroups: {
      viewAll: false,
      viewAssigned: true,
      manageAll: false,
      manageAssigned: true,
      createAll: false,
      deleteAll: false,
    },
    bot: {
      viewAnalytics: true,
      manageTraining: true,
      viewConversations: true,
      retrainBot: true,
    },
    amc: {
      viewAll: false,
      viewAssigned: true,
      manageAll: false,
      manageAssigned: true,
      viewFinancials: false,
    },
    projects: {
      viewAll: false,
      viewAssigned: true,
      editAll: false,
      editAssigned: true,
      deleteAll: false,
    },
    accounts: {
      viewAll: false,
      manageAll: false,
      approvePayments: false,
      exportFinancials: false,
    },
    communications: {
      viewAll: false,
      viewAssigned: true,
      sendAll: false,
      sendAssigned: true,
      exportAll: false,
    },
  },

  // SUPPORT_STAFF - Limited to assigned clients only
  [UserRole.SUPPORT_STAFF]: {
    clients: {
      viewAll: false,
      viewAssigned: true,
      editAll: false,
      editAssigned: true,
      deleteAll: false,
      exportAll: false,
      exportAssigned: true,
    },
    credentials: {
      viewAll: false,
      viewAssigned: true,
      manageAll: false,
      manageAssigned: false,
      decryptAll: false,
      decryptAssigned: true,
      deleteAll: false,
      rotateAll: false,
      rotateAssigned: false,
    },
    supportGroups: {
      viewAll: false,
      manageAll: false,
      assignStaff: false,
      assignClients: false,
      viewPerformance: false,
    },
    whatsappGroups: {
      viewAll: false,
      viewAssigned: true,
      manageAll: false,
      manageAssigned: true,
      createAll: false,
      deleteAll: false,
    },
    bot: {
      viewAnalytics: false,
      manageTraining: false,
      viewConversations: false,
      retrainBot: false,
    },
    amc: {
      viewAll: false,
      viewAssigned: true,
      manageAll: false,
      manageAssigned: false,
      viewFinancials: false,
    },
    projects: {
      viewAll: false,
      viewAssigned: true,
      editAll: false,
      editAssigned: true,
      deleteAll: false,
    },
    accounts: {
      viewAll: false,
      manageAll: false,
      approvePayments: false,
      exportFinancials: false,
    },
    communications: {
      viewAll: false,
      viewAssigned: true,
      sendAll: false,
      sendAssigned: true,
      exportAll: false,
    },
  },

  // ACCOUNTANT - Financial access only
  [UserRole.ACCOUNTANT]: {
    clients: {
      viewAll: true,
      viewAssigned: true,
      editAll: false,
      editAssigned: false,
      deleteAll: false,
      exportAll: true,
      exportAssigned: true,
    },
    credentials: {
      viewAll: false,
      viewAssigned: false,
      manageAll: false,
      manageAssigned: false,
      decryptAll: false,
      decryptAssigned: false,
      deleteAll: false,
      rotateAll: false,
      rotateAssigned: false,
    },
    supportGroups: {
      viewAll: false,
      manageAll: false,
      assignStaff: false,
      assignClients: false,
      viewPerformance: false,
    },
    whatsappGroups: {
      viewAll: false,
      viewAssigned: false,
      manageAll: false,
      manageAssigned: false,
      createAll: false,
      deleteAll: false,
    },
    bot: {
      viewAnalytics: false,
      manageTraining: false,
      viewConversations: false,
      retrainBot: false,
    },
    amc: {
      viewAll: true,
      viewAssigned: true,
      manageAll: false,
      manageAssigned: false,
      viewFinancials: true,
    },
    projects: {
      viewAll: false,
      viewAssigned: false,
      editAll: false,
      editAssigned: false,
      deleteAll: false,
    },
    accounts: {
      viewAll: true,
      manageAll: true,
      approvePayments: true,
      exportFinancials: true,
    },
    communications: {
      viewAll: false,
      viewAssigned: false,
      sendAll: false,
      sendAssigned: false,
      exportAll: false,
    },
  },

  // PROJECT_MANAGER - Projects access only
  [UserRole.PROJECT_MANAGER]: {
    clients: {
      viewAll: true,
      viewAssigned: true,
      editAll: false,
      editAssigned: false,
      deleteAll: false,
      exportAll: true,
      exportAssigned: true,
    },
    credentials: {
      viewAll: false,
      viewAssigned: false,
      manageAll: false,
      manageAssigned: false,
      decryptAll: false,
      decryptAssigned: false,
      deleteAll: false,
      rotateAll: false,
      rotateAssigned: false,
    },
    supportGroups: {
      viewAll: false,
      manageAll: false,
      assignStaff: false,
      assignClients: false,
      viewPerformance: false,
    },
    whatsappGroups: {
      viewAll: false,
      viewAssigned: false,
      manageAll: false,
      manageAssigned: false,
      createAll: false,
      deleteAll: false,
    },
    bot: {
      viewAnalytics: false,
      manageTraining: false,
      viewConversations: false,
      retrainBot: false,
    },
    amc: {
      viewAll: false,
      viewAssigned: false,
      manageAll: false,
      manageAssigned: false,
      viewFinancials: false,
    },
    projects: {
      viewAll: true,
      viewAssigned: true,
      editAll: true,
      editAssigned: true,
      deleteAll: true,
    },
    accounts: {
      viewAll: false,
      manageAll: false,
      approvePayments: false,
      exportFinancials: false,
    },
    communications: {
      viewAll: false,
      viewAssigned: false,
      sendAll: false,
      sendAssigned: false,
      exportAll: false,
    },
  },

  // ADMIN - General admin access
  [UserRole.ADMIN]: {
    clients: {
      viewAll: true,
      viewAssigned: true,
      editAll: true,
      editAssigned: true,
      deleteAll: true,
      exportAll: true,
      exportAssigned: true,
    },
    credentials: {
      viewAll: true,
      viewAssigned: true,
      manageAll: true,
      manageAssigned: true,
      decryptAll: true,
      decryptAssigned: true,
      deleteAll: true,
      rotateAll: true,
      rotateAssigned: true,
    },
    supportGroups: {
      viewAll: true,
      manageAll: true,
      assignStaff: true,
      assignClients: true,
      viewPerformance: true,
    },
    whatsappGroups: {
      viewAll: true,
      viewAssigned: true,
      manageAll: true,
      manageAssigned: true,
      createAll: true,
      deleteAll: true,
    },
    bot: {
      viewAnalytics: true,
      manageTraining: true,
      viewConversations: true,
      retrainBot: true,
    },
    amc: {
      viewAll: true,
      viewAssigned: true,
      manageAll: true,
      manageAssigned: true,
      viewFinancials: true,
    },
    projects: {
      viewAll: true,
      viewAssigned: true,
      editAll: true,
      editAssigned: true,
      deleteAll: true,
    },
    accounts: {
      viewAll: true,
      manageAll: true,
      approvePayments: true,
      exportFinancials: true,
    },
    communications: {
      viewAll: true,
      viewAssigned: true,
      sendAll: true,
      sendAssigned: true,
      exportAll: true,
    },
  },
};

/**
 * Get user role with fallback
 */
export function getUserRole(userRole?: string | null): UserRole {
  if (!userRole) {
    return UserRole.SUPPORT_STAFF; // Default to most restrictive
  }

  // Validate role exists
  if (!Object.values(UserRole).includes(userRole as UserRole)) {
    console.warn(`Invalid role: ${userRole}, defaulting to SUPPORT_STAFF`);
    return UserRole.SUPPORT_STAFF;
  }

  return userRole as UserRole;
}

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): Permissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[UserRole.SUPPORT_STAFF];
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  role: UserRole,
  category: PermissionCategory,
  permission: keyof Permissions[typeof category]
): boolean {
  const permissions = getRolePermissions(role);
  return permissions[category]?.[permission] || false;
}

/**
 * Check if user can access all clients
 */
export function canViewAllClients(role: UserRole): boolean {
  return hasPermission(role, PermissionCategory.CLIENTS, 'viewAll');
}

/**
 * Check if user can access all credentials
 */
export function canViewAllCredentials(role: UserRole): boolean {
  return hasPermission(role, PermissionCategory.CREDENTIALS, 'viewAll');
}

/**
 * Check if user can decrypt credentials
 */
export function canDecryptCredentials(role: UserRole, allCredentials: boolean = false): boolean {
  const permission = allCredentials ? 'decryptAll' : 'decryptAssigned';
  return hasPermission(role, PermissionCategory.CREDENTIALS, permission);
}

/**
 * Check if user can manage support groups
 */
export function canManageSupportGroups(role: UserRole): boolean {
  return hasPermission(role, PermissionCategory.SUPPORT_GROUPS, 'manageAll');
}

/**
 * Check if user can manage bot training
 */
export function canManageBotTraining(role: UserRole): boolean {
  return hasPermission(role, PermissionCategory.BOT, 'manageTraining');
}

/**
 * Filter client IDs based on user role and assignments
 */
export function filterClientsByRole(
  allClientIds: number[],
  assignedClientIds: number[],
  role: UserRole
): number[] {
  if (canViewAllClients(role)) {
    return allClientIds;
  }

  // Only return assigned clients
  return assignedClientIds;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Comprehensive permission check with reason
 */
export function checkPermission(
  role: UserRole,
  category: PermissionCategory,
  permission: keyof Permissions[typeof category],
  context?: {
    clientId?: number;
    isAssigned?: boolean;
    resourceType?: string;
  }
): PermissionCheckResult {
  const permissions = getRolePermissions(role);
  const categoryPermissions = permissions[category];

  if (!categoryPermissions) {
    return {
      allowed: false,
      reason: `Permission category ${category} not found for role ${role}`,
    };
  }

  // Check if permission exists
  if (!(permission in categoryPermissions)) {
    return {
      allowed: false,
      reason: `Permission ${permission} not found in category ${category}`,
    };
  }

  // Check if permission is granted
  if (!categoryPermissions[permission]) {
    // Check if there's an "assigned" version of the permission
    const assignedPermission = `${permission.toString().replace('All', '')}Assigned` as keyof typeof categoryPermissions;

    if (context?.isAssigned && categoryPermissions[assignedPermission]) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Role ${role} does not have permission ${permission} for ${category}`,
    };
  }

  return { allowed: true };
}

/**
 * Permission middleware helper
 */
export function requirePermission(
  category: PermissionCategory,
  permission: keyof Permissions[typeof category]
) {
  return (role: UserRole, context?: { isAssigned?: boolean }): boolean => {
    const result = checkPermission(role, category, permission, context);
    return result.allowed;
  };
}

/**
 * Export permission utilities
 */
export const PermissionUtils = {
  getUserRole,
  getRolePermissions,
  hasPermission,
  canViewAllClients,
  canViewAllCredentials,
  canDecryptCredentials,
  canManageSupportGroups,
  canManageBotTraining,
  filterClientsByRole,
  checkPermission,
  requirePermission,
};

export default PermissionUtils;