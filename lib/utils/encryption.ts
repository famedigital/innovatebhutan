import crypto from 'crypto';

/**
 * 🔐 ENCRYPTION UTILITIES
 * AES-256 encryption for secure credential storage
 *
 * SECURITY REQUIREMENTS:
 * - ENCRYPTION_KEY: 32-byte hex string (generate with: crypto.randomBytes(32).toString('hex'))
 * - Store ENCRYPTION_KEY in environment variables, never commit to git
 * - Each deployment should have its own unique key
 * - Key rotation requires re-encrypting all existing data
 */

const ENCRYPTION_KEY = process.env.CREDENTIAL_ENCRYPTION_KEY;
const IV_LENGTH = 16; // AES block size
const AUTH_TAG_LENGTH = 16; // GCM authentication tag length
const ALGORITHM = 'aes-256-gcm'; // Authenticated encryption

/**
 * Validate encryption key is present and correct length
 */
function validateEncryptionKey(): void {
  if (!ENCRYPTION_KEY) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY environment variable is not set');
  }

  // Remove '0x' prefix if present and validate length
  const cleanKey = ENCRYPTION_KEY.replace('0x', '');
  if (cleanKey.length !== 64) { // 32 bytes = 64 hex chars
    throw new Error('CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }
}

/**
 * Encrypt plaintext using AES-256-GCM
 * @param plaintext - Text to encrypt
 * @returns Encrypted string with IV and auth tag (format: iv:encrypted:tag)
 */
export function encrypt(plaintext: string): string {
  try {
    validateEncryptionKey();

    if (!plaintext || plaintext.length === 0) {
      throw new Error('Cannot encrypt empty string');
    }

    // Generate random IV (never reuse IV with same key)
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher with key, IV, and additional authenticated data
    const key = Buffer.from(ENCRYPTION_KEY.replace('0x', ''), 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the plaintext
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag for integrity verification
    const authTag = cipher.getAuthTag();

    // Return format: iv:encrypted:authtag (all in hex)
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error(`Failed to encrypt data: ${error.message}`);
  }
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param ciphertext - Encrypted string (format: iv:encrypted:tag)
 * @returns Decrypted plaintext
 */
export function decrypt(ciphertext: string): string {
  try {
    validateEncryptionKey();

    if (!ciphertext || ciphertext.length === 0) {
      throw new Error('Cannot decrypt empty string');
    }

    // Split the encrypted string into components
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format. Expected: iv:encrypted:tag');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');

    // Validate IV length
    if (iv.length !== IV_LENGTH) {
      throw new Error(`Invalid IV length. Expected ${IV_LENGTH} bytes, got ${iv.length}`);
    }

    // Validate auth tag length
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error(`Invalid auth tag length. Expected ${AUTH_TAG_LENGTH} bytes, got ${authTag.length}`);
    }

    // Create decipher with key, IV, and auth tag
    const key = Buffer.from(ENCRYPTION_KEY.replace('0x', ''), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Log the error without exposing sensitive data
    if (error.message.includes('Unsupported state')) {
      throw new Error('Decryption failed: Authentication tag mismatch - data may be corrupted or tampered');
    }
    throw new Error(`Failed to decrypt data: ${error.message}`);
  }
}

/**
 * Generate a secure random encryption key
 * Run this once per deployment and set the output as CREDENTIAL_ENCRYPTION_KEY env variable
 * @returns 32-byte encryption key in hex format
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate encryption key format without using it
 * @param key - Encryption key to validate
 * @returns true if valid
 */
export function isValidEncryptionKey(key: string): boolean {
  try {
    const cleanKey = key.replace('0x', '');
    return cleanKey.length === 64 && /^[0-9a-fA-F]+$/.test(cleanKey);
  } catch {
    return false;
  }
}

/**
 * Hash sensitive data for comparison (one-way hash)
 * Use this for verification instead of storing actual values
 * @param data - Data to hash
 * @returns SHA-256 hash in hex format
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify data against a hash
 * @param data - Plain text data
 * @param hash - Hash to compare against
 * @returns true if hash matches
 */
export function verifyHash(data: string, hash: string): boolean {
  const dataHash = hashData(data);
  return crypto.timingSafeEqual(
    Buffer.from(dataHash, 'hex'),
    Buffer.from(hash, 'hex')
  );
}

/**
 * Generate a secure random password
 * @param length - Password length (default: 16)
 * @returns Random password with mixed case, numbers, and symbols
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const all = uppercase + lowercase + numbers + symbols;
  let password = '';

  // Ensure at least one character from each category
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += symbols[crypto.randomInt(0, symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[crypto.randomInt(0, all.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Securely compare two strings in constant time
 * Prevents timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns true if strings match
 */
export function secureCompare(a: string, b: string): boolean {
  try {
    return crypto.timingSafeEqual(
      Buffer.from(a, 'utf8'),
      Buffer.from(b, 'utf8')
    );
  } catch {
    return false;
  }
}

/**
 * Generate a unique ID for sensitive operations
 * @returns Random ID in hex format
 */
export function generateSecureId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate secure state parameter for OAuth flows
 * @returns Random state string for CSRF protection
 */
export function generateStateParameter(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Sanitize log output to prevent sensitive data leakage
 * @param data - Data to sanitize
 * @param sensitiveFields - Array of field names to redact
 * @returns Sanitized object for logging
 */
export function sanitizeForLogging(data: any, sensitiveFields: string[] = ['password', 'apiKey', 'token', 'secret']): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      const value = sanitized[field];
      if (typeof value === 'string' && value.length > 0) {
        // Show first 4 and last 4 characters, mask the middle
        if (value.length <= 8) {
          sanitized[field] = '****';
        } else {
          sanitized[field] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
        }
      } else {
        sanitized[field] = '[REDACTED]';
      }
    }
  }

  return sanitized;
}

/**
 * Encryption utility class for credential management
 */
export class CredentialEncryption {
  /**
   * Encrypt a credential object
   * @param credential - Credential object with sensitive fields
   * @returns Encrypted credential object
   */
  static encryptCredential(credential: {
    username?: string;
    password?: string;
    apiKey?: string;
    secret?: string;
    [key: string]: any;
  }): any {
    const encrypted = { ...credential };

    if (credential.password) {
      encrypted.passwordEncrypted = encrypt(credential.password);
      delete encrypted.password;
    }

    if (credential.apiKey) {
      encrypted.apiKeyEncrypted = encrypt(credential.apiKey);
      delete encrypted.apiKey;
    }

    if (credential.secret) {
      encrypted.secretEncrypted = encrypt(credential.secret);
      delete encrypted.secret;
    }

    return encrypted;
  }

  /**
   * Decrypt a credential object
   * @param encryptedCredential - Encrypted credential object
   * @returns Decrypted credential object
   */
  static decryptCredential(encryptedCredential: {
    username?: string;
    passwordEncrypted?: string;
    apiKeyEncrypted?: string;
    secretEncrypted?: string;
    [key: string]: any;
  }): any {
    const decrypted = { ...encryptedCredential };

    if (encryptedCredential.passwordEncrypted) {
      decrypted.password = decrypt(encryptedCredential.passwordEncrypted);
      delete decrypted.passwordEncrypted;
    }

    if (encryptedCredential.apiKeyEncrypted) {
      decrypted.apiKey = decrypt(encryptedCredential.apiKeyEncrypted);
      delete decrypted.apiKeyEncrypted;
    }

    if (encryptedCredential.secretEncrypted) {
      decrypted.secret = decrypt(encryptedCredential.secretEncrypted);
      delete decrypted.secretEncrypted;
    }

    return decrypted;
  }
}

// Export default encryption functions
export default {
  encrypt,
  decrypt,
  generateEncryptionKey,
  isValidEncryptionKey,
  hashData,
  verifyHash,
  generateSecurePassword,
  secureCompare,
  generateSecureId,
  sanitizeForLogging,
  CredentialEncryption
};