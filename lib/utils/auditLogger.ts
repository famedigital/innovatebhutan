import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { sanitizeForLogging, generateSecureId } from "./encryption";

/**
 * 📋 AUDIT LOGGING UTILITIES
 * Comprehensive audit trail for security compliance and access tracking
 */

export interface AuditLogEntry {
  credentialId?: number;
  accessedBy: number; // Employee ID who performed the action
  clientId: number;
  accessType: 'view' | 'decrypt' | 'create' | 'update' | 'delete' | 'export' | 'rotate';
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface ClientAuditLogEntry {
  clientId: number;
  accessedBy: number; // Employee ID
  action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'assign_group' | 'remove_group';
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SupportGroupAuditLogEntry {
  supportGroupId: number;
  accessedBy: number; // Employee ID
  action: 'create' | 'update' | 'delete' | 'assign_client' | 'remove_client' | 'add_member' | 'remove_member';
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Log credential access for security monitoring
 */
export async function logCredentialAccess(entry: AuditLogEntry): Promise<void> {
  try {
    // Generate unique audit ID
    const auditId = generateSecureId();

    // Prepare log data (sanitize sensitive information)
    const logData = {
      operatorId: entry.accessedBy,
      action: entry.accessType.toUpperCase(),
      entityType: 'CREDENTIAL',
      entityId: entry.credentialId,
      details: {
        auditId,
        clientId: entry.clientId,
        accessType: entry.accessType,
        success: entry.success,
        failureReason: entry.failureReason,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        metadata: entry.metadata ? sanitizeForLogging(entry.metadata, ['password', 'apiKey', 'secret']) : undefined,
        timestamp: new Date().toISOString(),
      },
    };

    await db.insert(auditLogs).values(logData);

    // If failed access, also log to console for monitoring
    if (!entry.success) {
      console.warn('SECURITY: Failed credential access', {
        auditId,
        accessedBy: entry.accessedBy,
        clientId: entry.clientId,
        accessType: entry.accessType,
        failureReason: entry.failureReason,
        ipAddress: entry.ipAddress,
      });
    }
  } catch (error) {
    console.error('Failed to log credential access:', error);
    // Don't throw - audit logging failures shouldn't break the application
  }
}

/**
 * Log client data access/changes
 */
export async function logClientAccess(entry: ClientAuditLogEntry): Promise<void> {
  try {
    const auditId = generateSecureId();

    const logData = {
      operatorId: entry.accessedBy,
      action: entry.action.toUpperCase(),
      entityType: 'CLIENT',
      entityId: entry.clientId,
      details: {
        auditId,
        action: entry.action,
        success: entry.success,
        failureReason: entry.failureReason,
        oldValues: entry.oldValues ? sanitizeForLogging(entry.oldValues) : undefined,
        newValues: entry.newValues ? sanitizeForLogging(entry.newValues) : undefined,
        metadata: entry.metadata ? sanitizeForLogging(entry.metadata) : undefined,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    await db.insert(auditLogs).values(logData);

    if (!entry.success) {
      console.warn('SECURITY: Failed client access', {
        auditId,
        accessedBy: entry.accessedBy,
        clientId: entry.clientId,
        action: entry.action,
        failureReason: entry.failureReason,
      });
    }
  } catch (error) {
    console.error('Failed to log client access:', error);
  }
}

/**
 * Log support group changes
 */
export async function logSupportGroupAccess(entry: SupportGroupAuditLogEntry): Promise<void> {
  try {
    const auditId = generateSecureId();

    const logData = {
      operatorId: entry.accessedBy,
      action: entry.action.toUpperCase(),
      entityType: 'SUPPORT_GROUP',
      entityId: entry.supportGroupId,
      details: {
        auditId,
        action: entry.action,
        success: entry.success,
        failureReason: entry.failureReason,
        oldValues: entry.oldValues ? sanitizeForLogging(entry.oldValues) : undefined,
        newValues: entry.newValues ? sanitizeForLogging(entry.newValues) : undefined,
        metadata: entry.metadata ? sanitizeForLogging(entry.metadata) : undefined,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    await db.insert(auditLogs).values(logData);

    if (!entry.success) {
      console.warn('SECURITY: Failed support group access', {
        auditId,
        accessedBy: entry.accessedBy,
        supportGroupId: entry.supportGroupId,
        action: entry.action,
        failureReason: entry.failureReason,
      });
    }
  } catch (error) {
    console.error('Failed to log support group access:', error);
  }
}

/**
 * Get IP address from request
 */
export function getIpAddress(request: Request): string {
  // Check various headers for the real IP (accounting for proxies)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Extract client information from request for audit logging
 */
export function extractRequestInfo(request: Request) {
  return {
    ipAddress: getIpAddress(request),
    userAgent: getUserAgent(request),
  };
}

/**
 * Audit log helper class for common operations
 */
export class AuditLogger {
  /**
   * Log credential decryption event
   */
  static async logCredentialDecryption(
    credentialId: number,
    clientId: number,
    accessedBy: number,
    request: Request
  ): Promise<void> {
    await logCredentialAccess({
      credentialId,
      clientId,
      accessedBy,
      accessType: 'decrypt',
      ...extractRequestInfo(request),
      success: true,
    });
  }

  /**
   * Log credential decryption failure
   */
  static async logCredentialDecryptionFailure(
    credentialId: number,
    clientId: number,
    accessedBy: number,
    request: Request,
    reason: string
  ): Promise<void> {
    await logCredentialAccess({
      credentialId,
      clientId,
      accessedBy,
      accessType: 'decrypt',
      ...extractRequestInfo(request),
      success: false,
      failureReason: reason,
    });
  }

  /**
   * Log credential rotation
   */
  static async logCredentialRotation(
    credentialId: number,
    clientId: number,
    rotatedBy: number,
    request: Request,
    oldCredential?: any,
    newCredential?: any
  ): Promise<void> {
    await logCredentialAccess({
      credentialId,
      clientId,
      accessedBy: rotatedBy,
      accessType: 'rotate',
      ...extractRequestInfo(request),
      success: true,
      metadata: {
        oldCredential: oldCredential ? { ...oldCredential, password: '***', apiKey: '***' } : undefined,
        newCredential: newCredential ? { ...newCredential, password: '***', apiKey: '***' } : undefined,
      },
    });
  }

  /**
   * Log bulk data export
   */
  static async logDataExport(
    entityType: 'clients' | 'credentials' | 'communications' | 'problems',
    entityIds: number[],
    exportedBy: number,
    request: Request,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Log each entity export
    for (const entityId of entityIds) {
      await db.insert(auditLogs).values({
        operatorId: exportedBy,
        action: 'EXPORT',
        entityType: entityType.toUpperCase(),
        entityId: entityId,
        details: {
          exportId: generateSecureId(),
          entityType,
          exportedCount: entityIds.length,
          metadata: sanitizeForLogging(metadata || {}),
          ...extractRequestInfo(request),
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Log failed authentication attempt
   */
  static async logFailedAuth(
    username: string,
    ipAddress: string,
    userAgent: string,
    reason: string
  ): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        operatorId: null, // No user ID for failed auth
        action: 'AUTH_FAILED',
        entityType: 'AUTH',
        entityId: null,
        details: {
          username: sanitizeForLogging({ username }).username,
          ipAddress,
          userAgent,
          reason,
          timestamp: new Date().toISOString(),
        },
      });

      console.warn('SECURITY: Failed authentication attempt', {
        username,
        ipAddress,
        reason,
      });
    } catch (error) {
      console.error('Failed to log auth failure:', error);
    }
  }

  /**
   * Log permission denial
   */
  static async logPermissionDenied(
    accessedBy: number,
    resource: string,
    action: string,
    request: Request,
    reason: string
  ): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        operatorId: accessedBy,
        action: 'PERMISSION_DENIED',
        entityType: 'PERMISSION',
        entityId: null,
        details: {
          resource,
          attemptedAction: action,
          reason,
          ...extractRequestInfo(request),
          timestamp: new Date().toISOString(),
        },
      });

      console.warn('SECURITY: Permission denied', {
        accessedBy,
        resource,
        action,
        reason,
      });
    } catch (error) {
      console.error('Failed to log permission denial:', error);
    }
  }

  /**
   * Query audit logs for a specific entity
   */
  static async queryAuditLogs(filters: {
    entityType?: string;
    entityId?: number;
    operatorId?: number;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    try {
      const query = db.select().from(auditLogs);

      if (filters.entityType) {
        // @ts-ignore - dynamic filtering
        query.where(eq(auditLogs.entityType, filters.entityType.toUpperCase()));
      }

      if (filters.entityId) {
        // @ts-ignore
        query.where(eq(auditLogs.entityId, filters.entityId));
      }

      if (filters.operatorId) {
        // @ts-ignore
        query.where(eq(auditLogs.operatorId, filters.operatorId));
      }

      if (filters.action) {
        // @ts-ignore
        query.where(eq(auditLogs.action, filters.action.toUpperCase()));
      }

      if (filters.limit) {
        // @ts-ignore
        query.limit(filters.limit);
      }

      return await query.orderBy(auditLogs.createdAt);
    } catch (error) {
      console.error('Failed to query audit logs:', error);
      return [];
    }
  }
}

/**
 * Initialize audit logging system
 * This should be called on application startup
 */
export async function initializeAuditLogging(): Promise<void> {
  try {
    // Check if encryption key is set
    if (!process.env.CREDENTIAL_ENCRYPTION_KEY) {
      console.warn('SECURITY: CREDENTIAL_ENCRYPTION_KEY not set - audit logs will be plain text');
      console.warn('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    } else {
      console.log('✅ Audit logging initialized with encryption');
    }

    // Log system startup
    await db.insert(auditLogs).values({
      operatorId: null,
      action: 'SYSTEM_STARTUP',
      entityType: 'SYSTEM',
      entityId: null,
      details: {
        message: 'Enterprise support system audit logging initialized',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      },
    });

    console.log('✅ Audit logging system ready');
  } catch (error) {
    console.error('Failed to initialize audit logging:', error);
  }
}

export default {
  logCredentialAccess,
  logClientAccess,
  logSupportGroupAccess,
  getIpAddress,
  getUserAgent,
  extractRequestInfo,
  AuditLogger,
  initializeAuditLogging,
};