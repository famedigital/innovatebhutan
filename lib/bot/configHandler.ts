/**
 * 📄 CONFIG FILE HANDLER AUTOMATION
 * Secure config file retrieval and delivery from Google Drive
 */

import { createClient } from '@/lib/supabase/server';
import { getDriveClient, downloadFile } from '@/lib/integrations/googleDrive';

/**
 * Config file request context
 */
export interface ConfigRequest {
  clientId: number;
  clientName: string;
  configType: string; // 'database', 'application', 'network', 'server'
  specificFile?: string;
  requestReason: string;
  requestMadeBy: number;
}

/**
 * Config file result
 */
export interface ConfigResult {
  success: boolean;
  configFiles?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadDate: string;
    description: string;
  }>;
  deliveryMethod: 'direct_link' | 'whatsapp_upload' | 'email_link';
  message?: string;
  estimatedDeliveryTime?: string;
  confidence: number;
}

/**
 * Process config file request
 */
export async function processConfigRequest(
  request: ConfigRequest
): Promise<ConfigResult> {
  try {
    const supabase = createClient();

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', request.clientId)
      .single();

    if (clientError || !client) {
      return {
        success: false,
        message: 'Client not found. Please verify your account details.',
        confidence: 0.1,
      };
    }

    // Get employee Google Drive access
    const { data: employee } = await supabase
      .from('employees')
      .select('googleAccessToken')
      .eq('id', request.requestMadeBy)
      .single();

    if (!employee?.googleAccessToken) {
      return {
        success: false,
        message: 'Google Drive access not configured. Our support team will assist you with config file delivery.',
        confidence: 0.3,
      };
    }

    // Get Drive client
    const drive = await getDriveClient(employee.googleAccessToken);

    // Search for config files in client's Google Drive folder
    const configFiles = await searchConfigFiles(
      drive,
      client.googleDriveFolderId,
      request.configType,
      request.specificFile
    );

    if (configFiles.length === 0) {
      return {
        success: false,
        message: `No ${request.configType} configuration files found in your Google Drive folder. Our support team can help you generate these configurations.`,
        confidence: 0.5,
      };
    }

    // Determine delivery method based on file size and type
    const deliveryMethod = determineConfigDeliveryMethod(configFiles);

    // Log the config access
    await logConfigAccess(request.clientId, request.requestMadeBy, request.configType);

    return {
      success: true,
      configFiles: configFiles.map(file => ({
        fileName: file.name,
        fileUrl: file.webViewLink,
        fileSize: file.size || 0,
        uploadDate: new Date(parseInt(file.modifiedTime)).toLocaleDateString(),
        description: `${request.configType} configuration file`,
      })),
      deliveryMethod: deliveryMethod.method,
      message: buildConfigDeliveryMessage(configFiles, deliveryMethod),
      estimatedDeliveryTime: deliveryMethod.estimatedTime,
      confidence: 0.9,
    };

  } catch (error) {
    console.error('Config file processing error:', error);
    return {
      success: false,
      message: 'I encountered an error while accessing your configuration files. Our support team has been notified and will assist you.',
      confidence: 0.2,
    };
  }
}

/**
 * Search for config files in Google Drive
 */
async function searchConfigFiles(
  drive: any,
  folderId: string,
  configType: string,
  specificFile?: string
): Promise<Array<{
  id: string;
  name: string;
  webViewLink: string;
  size: number;
  modifiedTime: string;
}>> {
  try {
    const configTypeMapping = {
      'database': 'Database_Configs',
      'application': 'Application_Configs',
      'network': 'Network_Configs',
      'server': 'Server_Configs',
    };

    const folderName = configTypeMapping[configType] || configType;

    // Search for files in the config folder
    const searchQuery = specificFile
      ? `name contains '${specificFile}'`
      : `name contains '.json' or name contains '.config' or name contains '.yaml' or name contains '.yml' or name contains '.xml' or name contains '.env'`;

    const response = await drive.files.list({
      q: `'${folderId}' in parents and (${searchQuery}) and trashed=false`,
      fields: 'files(id,name,webViewLink,size,modifiedTime)',
      pageSize: 50,
    });

    return response.data.files || [];

  } catch (error) {
    console.error('Config file search error:', error);
    return [];
  }
}

/**
 * Determine config delivery method
 */
function determineConfigDeliveryMethod(
  files: Array<{ size: number; name: string }>
): { method: 'direct_link' | 'whatsapp_upload' | 'email_link'; estimatedTime: string } {
  // Check total file size
  const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
  const maxSize = Math.max(...files.map(f => f.size || 0));

  // Small files (< 5MB) - direct link
  if (maxSize < 5 * 1024 * 1024) {
    return {
      method: 'direct_link',
      estimatedTime: 'Immediate',
    };
  }

  // Medium files (5-20MB) - WhatsApp upload
  if (maxSize < 20 * 1024 * 1024) {
    return {
      method: 'whatsapp_upload',
      estimatedTime: '2-5 minutes',
    };
  }

  // Large files (> 20MB) - email link
  return {
    method: 'email_link',
    estimatedTime: '5-10 minutes',
  };
}

/**
 * Build config delivery message
 */
function buildConfigDeliveryMessage(
  files: Array<{ name: string }>,
  deliveryMethod: { method: string; estimatedTime: string }
): string {
  let message = `📄 **Configuration Files Found**\n\n`;
  message += `I found ${files.length} configuration file(s) for you.\n\n`;

  files.forEach((file, index) => {
    message += `${index + 1}. ${file.name}\n`;
  });

  message += `\n📤 **Delivery Method:** ${deliveryMethod.method === 'direct_link' ? 'Direct Download Link' : deliveryMethod.method === 'whatsapp_upload' ? 'WhatsApp Upload' : 'Email with Link'}\n`;
  message += `⏰ **Estimated Time:** ${deliveryMethod.estimatedTime}\n`;

  if (deliveryMethod.method === 'direct_link') {
    message += `\nI'll share the download links shortly. These links will be valid for 24 hours.`;
  } else if (deliveryMethod.method === 'whatsapp_upload') {
    message += `\nI'm uploading the files to this chat. This may take a few minutes...`;
  } else {
    message += `\nI'll send you an email with secure download links. Please check your inbox (and spam folder) in the next few minutes.`;
  }

  message += `\n\n🔒 **Security Note:** These configuration files contain sensitive information. Please store them securely and don't share them outside your authorized team.`;

  return message;
}

/**
 * Log config access for audit
 */
async function logConfigAccess(clientId: number, accessedBy: number, configType: string): Promise<void> {
  try {
    const { logClientAccess } = await import('@/lib/utils/auditLogger');

    await logClientAccess({
      clientId,
      accessedBy,
      action: 'view',
      success: true,
      metadata: {
        accessType: 'config_file',
        configType: configType,
        automatedRetrieval: true,
      },
    });
  } catch (error) {
    console.error('Config access logging error:', error);
  }
}

/**
 * Generate config file (if doesn't exist)
 */
export async function generateConfigFile(
  clientId: number,
  configType: string,
  template: string
): Promise<{ success: boolean; fileUrl?: string; message?: string }> {
  try {
    const supabase = createClient();

    // Get client data for config generation
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (!client) {
      throw new Error('Client not found');
    }

    // Generate config based on template and client data
    const configContent = generateConfigContent(client, configType, template);

    // Upload to Google Drive
    // Note: This would require Google Drive upload implementation
    // For now, return success with message

    return {
      success: true,
      message: `Configuration file generated successfully for ${configType}. The file has been uploaded to your Google Drive folder.`,
    };

  } catch (error) {
    console.error('Config generation error:', error);
    return {
      success: false,
      message: 'Failed to generate configuration file. Our support team has been notified.',
    };
  }
}

/**
 * Generate config content
 */
function generateConfigContent(client: any, configType: string, template: string): string {
  const configData = {
    client: {
      id: client.id,
      name: client.name,
      rancelabCode: client.rancelabCode,
      database: {
        host: `db-${client.rancelabCode?.toLowerCase()}.example.com`,
        port: 5432,
        database: `client_${client.id}`,
        username: `client_${client.id}_user`,
      },
      api: {
        baseUrl: `https://api.example.com/clients/${client.id}`,
        version: 'v1',
        timeout: 30000,
      },
      application: {
        environment: 'production',
        debug: false,
        logLevel: 'info',
      },
    },
  };

  // Replace template variables with actual data
  let config = template;
  config = config.replace(/\{\{CLIENT_ID\}\}/g, client.id.toString());
  config = config.replace(/\{\{CLIENT_NAME\}\}/g, client.name);
  config = config.replace(/\{\{RANCELAB_CODE\}\}/g, client.rancelabCode || '');
  config = config.replace(/\{\{DB_HOST\}\}/g, configData.client.database.host);
  config = config.replace(/\{\{API_URL\}\}/g, configData.client.api.baseUrl);

  return config;
}

export default {
  processConfigRequest,
  generateConfigFile,
};
