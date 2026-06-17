/**
 * 📁 GOOGLE DRIVE API INTEGRATION
 * Secure file storage for 300+ clients with organized folder structure
 *
 * SETUP REQUIREMENTS:
 * 1. Google Cloud Console project
 * 2. Drive API enabled
 * 3. OAuth 2.0 credentials (client ID, client secret)
 * 4. Service account for server-side operations
 * 5. Redirect URI: /api/auth/google/callback
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Environment variables (set these in .env.local)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '/api/auth/google/callback';
const GOOGLE_SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

/**
 * OAuth 2.0 client for user authentication
 */
export function getOAuth2Client(): OAuth2Client {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  return new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Generate OAuth authorization URL
 */
export function generateAuthUrl(state?: string): string {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state,
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  return {
    accessToken: credentials.access_token,
    expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined,
  };
}

/**
 * Get authenticated Drive client
 */
export async function getDriveClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Add automatic token refresh listener
  if (refreshToken) {
    oauth2Client.on('tokens', async (tokens) => {
      // Tokens were refreshed - update in database
      console.log('Google tokens refreshed, updating database...');
      try {
        // Note: This would need to be called from an API endpoint that can update the database
        // For now, we log it. In production, this should trigger a database update.
      } catch (error) {
        console.error('Failed to update refreshed tokens:', error);
      }
    });
  }

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Get authenticated Drive client with service account
 */
export async function getDriveClientServiceAccount() {
  if (!GOOGLE_SERVICE_ACCOUNT_KEY) {
    throw new Error('Google service account key not configured');
  }

  const serviceAccountKey = JSON.parse(GOOGLE_SERVICE_ACCOUNT_KEY);

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Validate and refresh access token if needed
 * This function checks if the current token is expired and refreshes it automatically
 */
export async function getValidAccessToken(
  accessToken: string,
  refreshToken: string,
  tokenExpiry: Date | null | undefined
): Promise<{ accessToken: string; expiryDate: Date | null; wasRefreshed: boolean }> {
  try {
    // Check if token is expired or will expire in next 5 minutes
    const now = new Date();
    const expiryDate = tokenExpiry ? new Date(tokenExpiry) : null;
    const isExpired = !expiryDate || expiryDate <= new Date(now.getTime() + 5 * 60 * 1000);

    if (!isExpired) {
      // Token is still valid, return as-is
      return {
        accessToken,
        expiryDate: expiryDate || null,
        wasRefreshed: false
      };
    }

    if (!refreshToken) {
      throw new Error('Token is expired but no refresh token available');
    }

    // Refresh the token
    console.log('Access token expired, refreshing...');
    const newTokens = await refreshAccessToken(refreshToken);

    return {
      accessToken: newTokens.accessToken,
      expiryDate: newTokens.expiryDate || null,
      wasRefreshed: true
    };
  } catch (error) {
    console.error('Token validation error:', error);
    throw new Error('Failed to validate or refresh access token');
  }
}

/**
 * Folder structure for client files
 */
export const CLIENT_FOLDER_STRUCTURE = {
  CREDENTIALS: '01_Credentials',
  CREDENTIALS_RANCELAB: '01_Credentials/Rancelab',
  CREDENTIALS_SERVER: '01_Credentials/Server_Access',
  CREDENTIALS_API: '01_Credentials/API_Keys',

  CONFIGURATIONS: '02_Configurations',
  CONFIG_DATABASE: '02_Configurations/Database_Configs',
  CONFIG_APPLICATION: '02_Configurations/Application_Configs',
  CONFIG_NETWORK: '02_Configurations/Network_Configs',

  DOCUMENTS: '03_Documents',
  DOCUMENTS_AMC: '03_Documents/AMC_Contracts',
  DOCUMENTS_INVOICES: '03_Documents/Invoices',
  DOCUMENTS_CORRESPONDENCE: '03_Documents/Correspondence',

  IMAGES: '04_Images',
  IMAGES_QR_CODES: '04_Images/QR_Codes',
  IMAGES_GROUP_PROFILES: '04_Images/Group_Profiles',
  IMAGES_SCREENSHOTS: '04_Images/Screenshots',

  EXPORTS: '05_Exports',
  EXPORTS_SUPPORT_HISTORY: '05_Exports/Support_History',
  EXPORTS_PROBLEM_REPORTS: '05_Exports/Problem_Reports',
  EXPORTS_COMMUNICATION_LOGS: '05_Exports/Communication_Logs',
};

/**
 * Create complete folder structure for a client
 */
export async function createClientFolderStructure(
  drive: any,
  rootFolderId: string,
  clientName: string,
  clientId: number
): Promise<{ rootFolderId: string; folderIds: Record<string, string> }> {
  try {
    // Create main client folder
    const clientFolder = await drive.files.create({
      resource: {
        name: `${clientName} [${clientId}]`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId],
      },
    });

    const folderIds: Record<string, string> = {
      root: clientFolder.data.id,
    };

    // Create subfolders in parallel
    const foldersToCreate = [
      { name: CLIENT_FOLDER_STRUCTURE.CREDENTIALS, parent: clientFolder.data.id, key: 'credentials' },
      { name: CLIENT_FOLDER_STRUCTURE.CREDENTIALS_RANCELAB, parent: null, key: 'credentials_rancelab', dependsOn: 'credentials' },
      { name: CLIENT_FOLDER_STRUCTURE.CREDENTIALS_SERVER, parent: null, key: 'credentials_server', dependsOn: 'credentials' },
      { name: CLIENT_FOLDER_STRUCTURE.CREDENTIALS_API, parent: null, key: 'credentials_api', dependsOn: 'credentials' },

      { name: CLIENT_FOLDER_STRUCTURE.CONFIGURATIONS, parent: clientFolder.data.id, key: 'configurations' },
      { name: CLIENT_FOLDER_STRUCTURE.CONFIG_DATABASE, parent: null, key: 'config_database', dependsOn: 'configurations' },
      { name: CLIENT_FOLDER_STRUCTURE.CONFIG_APPLICATION, parent: null, key: 'config_application', dependsOn: 'configurations' },
      { name: CLIENT_FOLDER_STRUCTURE.CONFIG_NETWORK, parent: null, key: 'config_network', dependsOn: 'configurations' },

      { name: CLIENT_FOLDER_STRUCTURE.DOCUMENTS, parent: clientFolder.data.id, key: 'documents' },
      { name: CLIENT_FOLDER_STRUCTURE.DOCUMENTS_AMC, parent: null, key: 'documents_amc', dependsOn: 'documents' },
      { name: CLIENT_FOLDER_STRUCTURE.DOCUMENTS_INVOICES, parent: null, key: 'documents_invoices', dependsOn: 'documents' },
      { name: CLIENT_FOLDER_STRUCTURE.DOCUMENTS_CORRESPONDENCE, parent: null, key: 'documents_correspondence', dependsOn: 'documents' },

      { name: CLIENT_FOLDER_STRUCTURE.IMAGES, parent: clientFolder.data.id, key: 'images' },
      { name: CLIENT_FOLDER_STRUCTURE.IMAGES_QR_CODES, parent: null, key: 'images_qr', dependsOn: 'images' },
      { name: CLIENT_FOLDER_STRUCTURE.IMAGES_GROUP_PROFILES, parent: null, key: 'images_group_profiles', dependsOn: 'images' },
      { name: CLIENT_FOLDER_STRUCTURE.IMAGES_SCREENSHOTS, parent: null, key: 'images_screenshots', dependsOn: 'images' },

      { name: CLIENT_FOLDER_STRUCTURE.EXPORTS, parent: clientFolder.data.id, key: 'exports' },
      { name: CLIENT_FOLDER_STRUCTURE.EXPORTS_SUPPORT_HISTORY, parent: null, key: 'exports_support', dependsOn: 'exports' },
      { name: CLIENT_FOLDER_STRUCTURE.EXPORTS_PROBLEM_REPORTS, parent: null, key: 'exports_problems', dependsOn: 'exports' },
      { name: CLIENT_FOLDER_STRUCTURE.EXPORTS_COMMUNICATION_LOGS, parent: null, key: 'exports_communications', dependsOn: 'exports' },
    ];

    // Create folders with dependency resolution
    for (const folder of foldersToCreate) {
      if (folder.dependsOn) {
        folder.parent = folderIds[folder.dependsOn];
      }

      const createdFolder = await drive.files.create({
        resource: {
          name: folder.name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: folder.parent ? [folder.parent] : undefined,
        },
      });

      folderIds[folder.key] = createdFolder.data.id;
    }

    return {
      rootFolderId: clientFolder.data.id,
      folderIds,
    };
  } catch (error) {
    console.error('Failed to create client folder structure:', error);
    throw new Error(`Google Drive folder creation failed: ${error.message}`);
  }
}

/**
 * Upload file to Google Drive
 */
export async function uploadFile(
  drive: any,
  file: Buffer | Uint8Array,
  fileName: string,
  folderId: string,
  mimeType: string,
  description?: string
): Promise<{
  fileId: string;
  webViewLink: string;
  webContentLink: string;
}> {
  try {
    // Create file metadata
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
      description: description,
    };

    // Create media object
    const media = {
      mimeType: mimeType,
      body: Buffer.from(file),
    };

    // Upload file
    const uploadedFile = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,webViewLink,webContentLink,name,size',
    });

    return {
      fileId: uploadedFile.data.id,
      webViewLink: uploadedFile.data.webViewLink,
      webContentLink: uploadedFile.data.webContentLink,
    };
  } catch (error) {
    console.error('Failed to upload file to Google Drive:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
}

/**
 * Download file from Google Drive
 */
export async function downloadFile(
  drive: any,
  fileId: string
): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
  try {
    // Get file metadata
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'name,mimeType',
    });

    // Download file content
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    return {
      buffer: Buffer.from(response.data),
      mimeType: fileMetadata.data.mimeType,
      fileName: fileMetadata.data.name,
    };
  } catch (error) {
    console.error('Failed to download file from Google Drive:', error);
    throw new Error(`File download failed: ${error.message}`);
  }
}

/**
 * Search files in client folder
 */
export async function searchClientFiles(
  drive: any,
  clientFolderId: string,
  query?: string
): Promise<Array<{
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink: string;
  size: number;
  modifiedTime: string;
}>> {
  try {
    // Build search query for client folder
    let searchQuery = `'${clientFolderId}' in parents`;
    if (query) {
      searchQuery += ` and name contains '${query}'`;
    }

    const response = await drive.files.list({
      q: searchQuery,
      fields: 'files(id,name,mimeType,webViewLink,webContentLink,size,modifiedTime)',
      pageSize: 100,
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Failed to search client files:', error);
    throw new Error(`File search failed: ${error.message}`);
  }
}

/**
 * Delete file from Google Drive
 */
export async function deleteFile(drive: any, fileId: string): Promise<void> {
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error('Failed to delete file from Google Drive:', error);
    throw new Error(`File deletion failed: ${error.message}`);
  }
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  drive: any,
  fileId: string,
  updates: {
    name?: string;
    description?: string;
    addParents?: string[];
    removeParents?: string[];
  }
): Promise<void> {
  try {
    await drive.files.update({
      fileId: fileId,
      resource: updates,
    });
  } catch (error) {
    console.error('Failed to update file metadata:', error);
    throw new Error(`Metadata update failed: ${error.message}`);
  }
}

/**
 * Export client data to Google Drive
 */
export async function exportClientData(
  drive: any,
  clientId: number,
  clientName: string,
  exportFolderId: string,
  dataType: 'all' | 'credentials' | 'communications' | 'problems',
  data: Record<string, any>
): Promise<string> {
  try {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `${clientName}_${dataType}_export_${timestamp}.json`;

    const fileBuffer = Buffer.from(JSON.stringify(data, null, 2), 'utf8');

    const result = await uploadFile(
      drive,
      fileBuffer,
      fileName,
      exportFolderId,
      'application/json',
      `Client ${clientName} ${dataType} export - ${timestamp}`
    );

    return result.webViewLink;
  } catch (error) {
    console.error('Failed to export client data:', error);
    throw new Error(`Data export failed: ${error.message}`);
  }
}

/**
 * Get storage usage for a client
 */
export async function getClientStorageUsage(
  drive: any,
  clientFolderId: string
): Promise<{
  fileCount: number;
  totalSize: number;
  breakdownByType: Record<string, { count: number; size: number }>;
}> {
  try {
    const files = await searchClientFiles(drive, clientFolderId);

    const breakdownByType: Record<string, { count: number; size: number }> = {};
    let totalSize = 0;

    for (const file of files) {
      const type = file.mimeType.split('/')[0] || 'unknown';
      const size = file.size || 0;

      if (!breakdownByType[type]) {
        breakdownByType[type] = { count: 0, size: 0 };
      }

      breakdownByType[type].count++;
      breakdownByType[type].size += size;
      totalSize += size;
    }

    return {
      fileCount: files.length,
      totalSize,
      breakdownByType,
    };
  } catch (error) {
    console.error('Failed to get client storage usage:', error);
    throw new Error(`Storage usage calculation failed: ${error.message}`);
  }
}

/**
 * Google Drive service class
 */
export class GoogleDriveService {
  private drive: any;
  private rootFolderId: string;

  constructor(accessToken: string, rootFolderId?: string) {
    this.rootFolderId = rootFolderId || 'root';
  }

  async initialize() {
    this.drive = await getDriveClient('');
  }

  async createClientFolders(clientName: string, clientId: number) {
    return await createClientFolderStructure(
      this.drive,
      this.rootFolderId,
      clientName,
      clientId
    );
  }

  async uploadClientFile(file: Buffer, fileName: string, folderId: string, mimeType: string, description?: string) {
    return await uploadFile(this.drive, file, fileName, folderId, mimeType, description);
  }

  async downloadClientFile(fileId: string) {
    return await downloadFile(this.drive, fileId);
  }

  async searchFiles(clientFolderId: string, query?: string) {
    return await searchClientFiles(this.drive, clientFolderId, query);
  }

  async deleteFile(fileId: string) {
    return await deleteFile(this.drive, fileId);
  }

  async exportData(clientId: number, clientName: string, exportFolderId: string, dataType: string, data: Record<string, any>) {
    return await exportClientData(this.drive, clientId, clientName, exportFolderId, dataType, data);
  }

  async getStorageUsage(clientFolderId: string) {
    return await getClientStorageUsage(this.drive, clientFolderId);
  }
}

export default GoogleDriveService;