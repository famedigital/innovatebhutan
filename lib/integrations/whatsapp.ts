/**
 * 📱 WHATSAPP BUSINESS API INTEGRATION
 * Real-time messaging, group management, and bot automation for 300+ clients
 *
 * SETUP REQUIREMENTS:
 * 1. Meta Business Suite account
 * 2. WhatsApp Business API access
 * 3. Phone number ID and access token
 * 4. Webhook URL for real-time message processing
 * 5. Cloud API or On-Premises API setup
 */

// Environment variables (set these in .env.local)
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

/**
 * Send text message to WhatsApp number
 */
export async function sendTextMessage(
  to: string,
  message: string,
  previewUrl?: boolean
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials not configured');
    }

    const response = await fetch(
      `${WHATSAPP_BASE_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: {
            body: message,
            preview_url: previewUrl || false,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send message');
    }

    return {
      success: true,
      messageId: data.messages[0]?.id,
    };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send media message (image, document, audio, video)
 */
export async function sendMediaMessage(
  to: string,
  mediaType: 'image' | 'document' | 'audio' | 'video',
  mediaUrl: string,
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials not configured');
    }

    const response = await fetch(
      `${WHATSAPP_BASE_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: mediaType,
          [mediaType]: {
            link: mediaUrl,
            caption: caption || '',
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send media message');
    }

    return {
      success: true,
      messageId: data.messages[0]?.id,
    };
  } catch (error) {
    console.error('WhatsApp media send error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send interactive message (buttons, lists, etc.)
 */
export async function sendInteractiveMessage(
  to: string,
  interactiveType: 'button' | 'list' | 'product' | 'product_list',
  interactiveContent: any,
  headerText?: string,
  bodyText?: string,
  footerText?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials not configured');
    }

    const response = await fetch(
      `${WHATSAPP_BASE_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'interactive',
          interactive: {
            type: interactiveType,
            header: headerText ? { type: 'text', text: headerText } : undefined,
            body: { text: bodyText || 'Please select an option:' },
            footer: footerText ? { text: footerText } : undefined,
            action: interactiveContent,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send interactive message');
    }

    return {
      success: true,
      messageId: data.messages[0]?.id,
    };
  } catch (error) {
    console.error('WhatsApp interactive send error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send template message (pre-approved template)
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  components?: any[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      throw new Error('WhatsApp credentials not configured');
    }

    const response = await fetch(
      `${WHATSAPP_BASE_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components || [],
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to send template message');
    }

    return {
      success: true,
      messageId: data.messages[0]?.id,
    };
  } catch (error) {
    console.error('WhatsApp template send error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create WhatsApp group for client
 * Note: This requires WhatsApp Business API with group management permissions
 */
export async function createGroup(
  groupName: string,
  participantPhoneNumbers: string[]
): Promise<{ success: boolean; groupId?: string; inviteLink?: string; error?: string }> {
  try {
    // Note: Group creation via API is limited and may require special permissions
    // This is a placeholder implementation
    // In production, you might need to create groups manually or use a different approach

    const response = await fetch(
      `${WHATSAPP_BASE_URL}/groups`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: groupName,
          participants: participantPhoneNumbers.map(phone => ({
            phone_number: phone,
          })),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to create group');
    }

    return {
      success: true,
      groupId: data.id,
      inviteLink: data.invite_link,
    };
  } catch (error) {
    console.error('WhatsApp group creation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Add participant to existing group
 */
export async function addParticipantToGroup(
  groupId: string,
  phoneNumber: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${WHATSAPP_BASE_URL}/${groupId}/participants`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error?.message || 'Failed to add participant');
    }

    return { success: true };
  } catch (error) {
    console.error('Add participant error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Remove participant from group
 */
export async function removeParticipantFromGroup(
  groupId: string,
  participantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${WHATSAPP_BASE_URL}/${groupId}/participants/${participantId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error?.message || 'Failed to remove participant');
    }

    return { success: true };
  } catch (error) {
    console.error('Remove participant error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get group info
 */
export async function getGroupInfo(
  groupId: string
): Promise<{ success: boolean; groupInfo?: any; error?: string }> {
  try {
    const response = await fetch(
      `${WHATSAPP_BASE_URL}/${groupId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get group info');
    }

    return {
      success: true,
      groupInfo: data,
    };
  } catch (error) {
    console.error('Get group info error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate group invite link
 */
export async function generateGroupInviteLink(
  groupId: string
): Promise<{ success: boolean; inviteLink?: string; error?: string }> {
  try {
    const response = await fetch(
      `${WHATSAPP_BASE_URL}/${groupId}/invite`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate invite link');
    }

    return {
      success: true,
      inviteLink: data.invite_link,
    };
  } catch (error) {
    console.error('Generate invite link error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get QR code for group (via Cloudinary)
 * Note: WhatsApp doesn't provide QR codes directly via API
 * This function generates a QR code that points to the group invite link
 */
export async function generateGroupQRCode(
  groupInviteLink: string,
  clientId: number,
  groupName: string
): Promise<{ success: boolean; qrCodeUrl?: string; error?: string }> {
  try {
    // Use QR code generation API (like qrserver.com or Cloudinary)
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(groupInviteLink)}`;

    // In production, you would upload this to Cloudinary and return that URL
    // For now, we'll return the QR code API URL
    return {
      success: true,
      qrCodeUrl: qrCodeApiUrl,
    };
  } catch (error) {
    console.error('Generate QR code error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  appSecret: string
): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', appSecret);
  const digest = hmac.update(body).digest('base64');
  return signature === `sha256=${digest}`;
}

/**
 * Format phone number for WhatsApp API
 * Ensure phone number is in correct format (with country code, no + or spaces)
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Ensure it starts with country code (for Bhutan, it's 975)
  if (!cleaned.startsWith('975') && cleaned.length === 8) {
    return `975${cleaned}`;
  }

  return cleaned;
}

/**
 * WhatsApp Business API service class
 */
export class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;

  constructor(accessToken?: string, phoneNumberId?: string) {
    this.accessToken = accessToken || WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = phoneNumberId || WHATSAPP_PHONE_NUMBER_ID;
  }

  async sendText(to: string, message: string) {
    return await sendTextMessage(to, message);
  }

  async sendMedia(to: string, mediaType: 'image' | 'document' | 'audio' | 'video', mediaUrl: string, caption?: string) {
    return await sendMediaMessage(to, mediaType, mediaUrl, caption);
  }

  async sendInteractive(to: string, interactiveType: 'button' | 'list', interactiveContent: any, headerText?: string, bodyText?: string) {
    return await sendInteractiveMessage(to, interactiveType, interactiveContent, headerText, bodyText);
  }

  async createGroup(groupName: string, participants: string[]) {
    return await createGroup(groupName, participants);
  }

  async addParticipant(groupId: string, phoneNumber: string) {
    return await addParticipantToGroup(groupId, phoneNumber);
  }

  async generateInviteLink(groupId: string) {
    return await generateGroupInviteLink(groupId);
  }

  async generateQRCode(inviteLink: string, clientId: number, groupName: string) {
    return await generateGroupQRCode(inviteLink, clientId, groupName);
  }
}

export default WhatsAppService;
