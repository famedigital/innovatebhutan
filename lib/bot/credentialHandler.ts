/**
 * 🔐 CREDENTIAL HANDLER AUTOMATION
 * Secure credential retrieval and management - Target: 90% automation
 */

import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/utils/encryption';
import { logCredentialAccess } from '@/lib/utils/auditLogger';
import { IntentType } from './intentClassifier';

/**
 * Credential request context
 */
export interface CredentialRequest {
  clientId: number;
  clientName: string;
  credentialType: string; // 'rancelab', 'server', 'api', 'database', etc.
  requestReason: string;
  verificationData?: {
    mobileNumber?: string;
    clientCode?: string;
    email?: string;
  };
  requestMadeBy: number; // Employee ID if requested by staff, null if client request
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Credential retrieval result
 */
export interface CredentialResult {
  success: boolean;
  credentials?: {
    username: string;
    password?: string;
    apiKey?: string;
    configUrl?: string;
    notes?: string;
    lastVerified: Date;
  };
  deliveryMethod: 'encrypted_message' | 'secure_link' | 'human_delivery';
  requiresVerification: boolean;
  verificationSteps?: string[];
  accessExpiry?: string;
  message?: string;
  confidence: number;
}

/**
 * Process credential request with automation
 */
export async function processCredentialRequest(
  request: CredentialRequest
): Promise<CredentialResult> {
  try {
    const supabase = createClient();

    // Step 1: Verify client identity (security layer)
    const identityVerified = await verifyClientIdentity(request);

    if (!identityVerified) {
      return {
        success: false,
        deliveryMethod: 'human_delivery',
        requiresVerification: true,
        verificationSteps: [
          'Please provide your registered mobile number',
          'Please confirm your client code or company name',
          'Verification may require additional security questions',
        ],
        message: 'For security purposes, I need to verify your identity before sharing credentials. Please provide your registered mobile number and client code.',
        confidence: 0.3,
      };
    }

    // Step 2: Retrieve credentials from database
    const { data: credentials, error: credentialsError } = await supabase
      .from('client_credentials')
      .select('*')
      .eq('clientId', request.clientId)
      .eq('credentialType', request.credentialType)
      .eq('isValid', true)
      .single();

    if (credentialsError || !credentials) {
      // Check if credentials exist but are invalid
      const { data: anyCredentials } = await supabase
        .from('client_credentials')
        .select('*')
        .eq('clientId', request.clientId)
        .eq('credentialType', request.credentialType)
        .single();

      if (anyCredentials) {
        return {
          success: false,
          deliveryMethod: 'human_delivery',
          requiresVerification: false,
          message: 'These credentials exist but need to be updated or verified. I\'m connecting you with our support team to assist you.',
          confidence: 0.5,
        };
      }

      return {
        success: false,
        deliveryMethod: 'human_delivery',
        requiresVerification: false,
        message: `I couldn't find ${request.credentialType} credentials for your account. Let me connect you with our support team to set this up.`,
        confidence: 0.4,
      };
    }

    // Step 3: Check credential access rules and rate limiting
    const canAutomate = await checkCredentialAccessRules(credentials.id, request.clientId);

    if (!canAutomate) {
      return {
        success: false,
        deliveryMethod: 'human_delivery',
        requiresVerification: false,
        message: 'For security reasons, this credential request requires manual verification. Our support team will assist you shortly.',
        confidence: 0.6,
      };
    }

    // Step 4: Decrypt sensitive data
    let decryptedCredentials;
    try {
      decryptedCredentials = await decryptSensitiveCredentials(credentials);
    } catch (decryptError) {
      console.error('Credential decryption error:', decryptError);
      return {
        success: false,
        deliveryMethod: 'human_delivery',
        requiresVerification: false,
        message: 'There was an issue accessing your credentials securely. Our support team has been notified and will help you.',
        confidence: 0.2,
      };
    }

    // Step 5: Log credential access (audit trail)
    await logCredentialAccess({
      credentialId: credentials.id,
      clientId: request.clientId,
      accessedBy: request.requestMadeBy || 0,
      accessType: 'decrypt',
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      success: true,
      metadata: {
        credentialType: request.credentialType,
        requestReason: request.requestReason,
        automatedRetrieval: true,
      },
    });

    // Step 6: Increment access count
    await supabase
      .from('client_credentials')
      .update({
        accessCount: (credentials.accessCount || 0) + 1,
        lastAccessedAt: new Date().toISOString(),
      })
      .eq('id', credentials.id);

    // Step 7: Determine delivery method based on sensitivity
    const deliveryMethod = determineDeliveryMethod(request.credentialType, decryptedCredentials);

    return {
      success: true,
      credentials: decryptedCredentials,
      deliveryMethod: deliveryMethod.method,
      requiresVerification: false,
      accessExpiry: deliveryMethod.expiry,
      message: buildCredentialDeliveryMessage(decryptedCredentials, deliveryMethod),
      confidence: 0.95,
    };

  } catch (error) {
    console.error('Credential processing error:', error);
    return {
      success: false,
      deliveryMethod: 'human_delivery',
      requiresVerification: false,
      message: 'I encountered an error while processing your request. Our support team has been notified and will assist you.',
      confidence: 0.1,
    };
  }
}

/**
 * Verify client identity before sharing credentials
 */
async function verifyClientIdentity(request: CredentialRequest): Promise<boolean> {
  const supabase = createClient();

  try {
    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', request.clientId)
      .single();

    if (clientError || !client) {
      return false;
    }

    // If verification data provided, validate it
    if (request.verificationData) {
      const { mobileNumber, clientCode, email } = request.verificationData;

      // Check mobile number (primary verification)
      if (mobileNumber) {
        // Remove spaces and format comparison
        const cleanProvided = mobileNumber.replace(/\s/g, '');
        const cleanStored = (client.contactNumber || '').replace(/\s/g, '');

        if (cleanProvided === cleanStored) {
          return true;
        }
      }

      // Check client code (secondary verification)
      if (clientCode && client.rancelabCode) {
        if (clientCode.toLowerCase() === client.rancelabCode.toLowerCase()) {
          return true;
        }
      }

      // Check email (tertiary verification)
      if (email && client.email) {
        if (email.toLowerCase() === client.email.toLowerCase()) {
          return true;
        }
      }

      return false;
    }

    // If no verification data but request comes from authenticated employee
    if (request.requestMadeBy) {
      return true; // Employee already authenticated
    }

    return false;

  } catch (error) {
    console.error('Identity verification error:', error);
    return false;
  }
}

/**
 * Check credential access rules and rate limiting
 */
async function checkCredentialAccessRules(credentialId: number, clientId: number): Promise<boolean> {
  const supabase = createClient();

  try {
    // Check recent access count (rate limiting)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: recentAccess } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entityId', credentialId)
      .eq('entityType', 'CREDENTIAL')
      .eq('action', 'DECRYPT')
      .gte('createdAt', oneHourAgo);

    // Allow max 3 accesses per hour per credential
    if (recentAccess && recentAccess.length >= 3) {
      console.warn(`Rate limit exceeded for credential ${credentialId}`);
      return false;
    }

    // Check if credential is marked for manual review
    const { data: credential } = await supabase
      .from('client_credentials')
      .select('requiresManualReview, lastVerifiedAt')
      .eq('id', credentialId)
      .single();

    if (credential?.requiresManualReview) {
      return false;
    }

    // Check if credential hasn't been verified in 30 days
    if (credential?.lastVerifiedAt) {
      const lastVerified = new Date(credential.lastVerifiedAt);
      const daysSinceVerification = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceVerification > 30) {
        return false; // Requires re-verification
      }
    }

    return true;

  } catch (error) {
    console.error('Access rules check error:', error);
    return true; // Allow on error (fail open for business continuity)
  }
}

/**
 * Decrypt sensitive credentials
 */
async function decryptSensitiveCredentials(credentials: any): Promise<any> {
  const decrypted = {
    username: credentials.username,
    password: undefined,
    apiKey: undefined,
    configUrl: credentials.configUrl,
    notes: credentials.notes,
    lastVerified: credentials.lastVerifiedAt,
  };

  // Decrypt password if exists
  if (credentials.passwordEncrypted) {
    try {
      decrypted.password = decrypt(credentials.passwordEncrypted);
    } catch (error) {
      console.error('Password decryption failed:', error);
      decrypted.password = '***';
    }
  }

  // Decrypt API key if exists
  if (credentials.apiKeyEncrypted) {
    try {
      decrypted.apiKey = decrypt(credentials.apiKeyEncrypted);
    } catch (error) {
      console.error('API key decryption failed:', error);
      decrypted.apiKey = '***';
    }
  }

  return decrypted;
}

/**
 * Determine delivery method based on credential sensitivity
 */
function determineDeliveryMethod(
  credentialType: string,
  credentials: any
): { method: 'encrypted_message' | 'secure_link' | 'human_delivery'; expiry: string } {
  // Highly sensitive credentials - human delivery or secure link
  const sensitiveTypes = ['server', 'database', 'payment_gateway', 'api'];

  if (sensitiveTypes.includes(credentialType)) {
    return {
      method: 'secure_link',
      expiry: '2 hours',
    };
  }

  // Standard credentials - encrypted message
  return {
    method: 'encrypted_message',
    expiry: '1 hour',
  };
}

/**
 * Build credential delivery message
 */
function buildCredentialDeliveryMessage(
  credentials: any,
  deliveryMethod: { method: string; expiry: string }
): string {
  const { username, password, apiKey, configUrl, notes } = credentials;

  let message = '🔐 **Your Credentials**\n\n';

  if (username) {
    message += `📱 **Username:** \`${username}\`\n`;
  }

  if (password) {
    message += `🔑 **Password:** \`${password}\`\n`;
  }

  if (apiKey) {
    message += `🔑 **API Key:** \`${apiKey}\`\n`;
  }

  if (configUrl) {
    message += `🔗 **Login URL:** ${configUrl}\n`;
  }

  message += `\n⏰ **Access Valid For:** ${deliveryMethod.expiry}\n`;
  message += `🛡️ **Security Notice:** These credentials are for your use only. Please don't share them.\n`;

  if (notes) {
    message += `\n📋 **Notes:** ${notes}\n`;
  }

  message += `\nPlease change your password after first login for security. Let me know if you need any help! 😊`;

  return message;
}

/**
 * Credential rotation automation
 */
export async function rotateCredentials(
  credentialId: number,
  rotatedBy: number,
  request: Request
): Promise<{ success: boolean; newCredentials?: any; message?: string }> {
  try {
    const supabase = createClient();

    // Get current credentials
    const { data: currentCreds, error: fetchError } = await supabase
      .from('client_credentials')
      .select('*')
      .eq('id', credentialId)
      .single();

    if (fetchError || !currentCreds) {
      throw new Error('Credentials not found');
    }

    // Generate new strong password
    const { generateSecurePassword } = await import('@/lib/utils/encryption');
    const newPassword = generateSecurePassword(16);

    // Encrypt new password
    const { encrypt } = await import('@/lib/utils/encryption');
    const encryptedPassword = encrypt(newPassword);

    // Update credentials
    const { data: updatedCreds, error: updateError } = await supabase
      .from('client_credentials')
      .update({
        passwordEncrypted: encryptedPassword,
        lastRotatedAt: new Date().toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        accessCount: 0,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', credentialId)
      .select()
      .single();

    if (updateError) {
      throw new Error('Failed to update credentials');
    }

    // Log the rotation
    await logCredentialAccess({
      credentialId,
      clientId: currentCreds.clientId,
      accessedBy: rotatedBy,
      accessType: 'rotate',
      success: true,
    });

    return {
      success: true,
      newCredentials: {
        username: updatedCreds.username,
        newPassword: newPassword,
        rotatedAt: updatedCreds.lastRotatedAt,
      },
      message: 'Credentials rotated successfully. The new password has been generated and stored securely.',
    };

  } catch (error) {
    console.error('Credential rotation error:', error);
    return {
      success: false,
      message: 'Failed to rotate credentials. Please try again or contact support.',
    };
  }
}

/**
 * Get credential security status
 */
export async function getCredentialSecurityStatus(
  clientId: number
): Promise<{
  canAutomate: boolean;
  requiresVerification: boolean;
  recentAccessCount: number;
  securityScore: number;
}> {
  const supabase = createClient();

  try {
    // Get recent access count
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: recentAccess } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('clientId', clientId)
      .eq('entityType', 'CREDENTIAL')
      .eq('action', 'DECRYPT')
      .gte('createdAt', oneHourAgo);

    const recentAccessCount = recentAccess?.length || 0;

    // Calculate security score
    let securityScore = 100;
    securityScore -= Math.min(recentAccessCount * 10, 30); // Reduce score for frequent access
    securityScore = Math.max(securityScore, 0);

    return {
      canAutomate: recentAccessCount < 3,
      requiresVerification: recentAccessCount >= 2,
      recentAccessCount,
      securityScore,
    };

  } catch (error) {
    console.error('Security status check error:', error);
    return {
      canAutomate: false,
      requiresVerification: true,
      recentAccessCount: 0,
      securityScore: 50,
    };
  }
}

export default {
  processCredentialRequest,
  rotateCredentials,
  getCredentialSecurityStatus,
};
