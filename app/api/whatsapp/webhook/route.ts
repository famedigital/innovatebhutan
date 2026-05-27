/**
 * 📱 WHATSAPP WEBHOOK HANDLER
 * Real-time message processing for bot automation and client support
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/integrations/whatsapp';
import { createClient } from '@/utils/supabase/server';

/**
 * GET - Verify webhook (WhatsApp requires this for webhook setup)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Verify token from environment variables
    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WhatsApp webhook verified successfully');
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    console.warn('❌ WhatsApp webhook verification failed');
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
    return NextResponse.json(
      { error: 'Verification error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Handle incoming WhatsApp messages
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature for security
    const signature = request.headers.get('x-hub-signature-256');
    const body = await request.text();

    if (signature && process.env.WHATSAPP_APP_SECRET) {
      const isValid = verifyWebhookSignature(
        body,
        signature,
        process.env.WHATSAPP_APP_SECRET
      );

      if (!isValid) {
        console.warn('❌ Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        );
      }
    }

    const data = JSON.parse(body);

    // Process webhook payload
    const entries = data.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        await processWebhookChange(change);
      }
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent WhatsApp from retrying
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

/**
 * Process webhook change event
 */
async function processWebhookChange(change: any) {
  try {
    const value = change.value;

    // Handle messages
    if (value.messages && Array.isArray(value.messages)) {
      for (const message of value.messages) {
        await processIncomingMessage(message, value.metadata);
      }
    }

    // Handle message status updates (sent/delivered/read)
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const status of value.statuses) {
        await processMessageStatus(status);
      }
    }

    // Handle group changes
    if (value?.field === 'changes') {
      // Process group-related changes
      await processGroupChanges(value);
    }
  } catch (error) {
    console.error('Error processing webhook change:', error);
  }
}

/**
 * Process incoming message from WhatsApp
 */
async function processIncomingMessage(message: any, metadata: any) {
  const supabase = createClient();

  try {
    const messageId = message.id;
    const from = message.from; // Phone number
    const timestamp = message.timestamp;
    const type = message.type; // text, image, audio, video, document, interactive
    const context = message.context; // For replies/quoted messages

    // Extract message content based on type
    let messageContent: any = {
      type,
      from,
      timestamp,
      messageId,
    };

    if (type === 'text') {
      messageContent.text = message.text.body;
    } else if (type === 'image') {
      messageContent.imageUrl = message.image.image_url;
      messageContent.caption = message.image?.caption;
    } else if (type === 'audio') {
      messageContent.audioUrl = message.audio.audio_url;
    } else if (type === 'video') {
      messageContent.videoUrl = message.video.video_url;
      messageContent.caption = message.video?.caption;
    } else if (type === 'document') {
      messageContent.documentUrl = message.document.document_url;
      messageContent.fileName = message.document?.filename;
      messageContent.caption = message.document?.caption;
    } else if (type === 'interactive') {
      messageContent.interactiveType = message.interactive.type;
      messageContent.interactiveResponse = message.interactive;
    }

    // Find client by phone number
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('contactNumber', from)
      .single();

    if (clientError || !client) {
      console.warn(`Client not found for phone number: ${from}`);
      // Could still store the message for later processing
      return;
    }

    // Find WhatsApp group for this client
    const { data: whatsappGroup, error: groupError } = await supabase
      .from('client_whatsapp_groups')
      .select('*')
      .eq('clientId', client.id)
      .single();

    if (groupError || !whatsappGroup) {
      console.warn(`WhatsApp group not found for client: ${client.id}`);
      return;
    }

    // Check if this is a bot-automated conversation or needs human intervention
    const shouldProcessWithBot = await shouldProcessWithBotAutomation(client.id, messageContent);

    if (shouldProcessWithBot) {
      // Store message in bot_conversations table
      await storeBotConversation(client.id, whatsappGroup.id, messageContent, 'client');

      // Process with bot automation
      // This will be handled by the bot service (to be implemented)
      console.log(`📱 Message from client ${client.name} queued for bot processing`);

      // Update last activity timestamp
      await supabase
        .from('client_whatsapp_groups')
        .update({
          lastActivityAt: new Date().toISOString(),
        })
        .eq('id', whatsappGroup.id);
    } else {
      // Notify support staff of new message
      await notifySupportStaffOfMessage(client.id, whatsappGroup.id, messageContent);
    }

    // Store message in communications table
    await supabase
      .from('communications')
      .insert({
        clientId: client.id,
        employeeId: null, // Will be assigned when support staff responds
        type: 'whatsapp',
        direction: 'inbound',
        subject: `WhatsApp Message - ${type}`,
        message: messageContent.text || JSON.stringify(messageContent),
        whatsappMessageId: messageId,
        whatsappGroupId: whatsappGroup.id,
        status: 'received',
        sentAt: new Date(parseInt(timestamp) * 1000),
      });

  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
}

/**
 * Process message status updates
 */
async function processMessageStatus(status: any) {
  const supabase = createClient();

  try {
    const messageId = status.id;
    const statusType = status.status; // sent, delivered, read
    const timestamp = status.timestamp;

    // Update communication record
    await supabase
      .from('communications')
      .update({
        status: statusType,
        updatedAt: new Date(),
      })
      .eq('whatsappMessageId', messageId);

    console.log(`📤 Message ${messageId} status: ${statusType}`);
  } catch (error) {
    console.error('Error processing message status:', error);
  }
}

/**
 * Process group-related changes
 */
async function processGroupChanges(value: any) {
  const supabase = createClient();

  try {
    // Handle participant added/removed
    if (value?.added_participants) {
      for (const participant of value.added_participants) {
        console.log(`➕ Participant added to group: ${participant.phone_number}`);
        // Could trigger welcome message or other actions
      }
    }

    if (value?.removed_participants) {
      for (const participant of value.removed_participants) {
        console.log(`➖ Participant removed from group: ${participant.phone_number}`);
        // Could update database or notify support
      }
    }

  } catch (error) {
    console.error('Error processing group changes:', error);
  }
}

/**
 * Determine if message should be processed with bot automation
 */
async function shouldProcessWithBotAutomation(clientId: number, messageContent: any): Promise<boolean> {
  const supabase = createClient();

  try {
    // Check if client has active support and is within business hours
    const { data: client } = await supabase
      .from('clients')
      .select('*, amc_contracts(*)')
      .eq('id', clientId)
      .single();

    if (!client?.isActive) {
      return false;
    }

    // Check if there's an active problem that needs human attention
    const { data: activeProblems } = await supabase
      .from('problems')
      .select('*')
      .eq('clientId', clientId)
      .in('status', ['open', 'in_progress'])
      .limit(1);

    if (activeProblems && activeProblems.length > 0) {
      // There's an active problem, let human support handle it
      return false;
    }

    // Check recent bot performance for this client
    const { data: recentConversations } = await supabase
      .from('bot_conversations')
      .select('*')
      .eq('clientId', clientId)
      .order('createdAt', { ascending: false })
      .limit(10);

    if (recentConversations && recentConversations.length > 0) {
      // Calculate success rate
      const successCount = recentConversations.filter(c => c.resolutionStatus === 'bot_resolved').length;
      const successRate = successCount / recentConversations.length;

      // If success rate is below 50%, prefer human intervention
      if (successRate < 0.5) {
        return false;
      }
    }

    // Default to bot automation
    return true;
  } catch (error) {
    console.error('Error checking bot automation eligibility:', error);
    return true; // Default to bot on error
  }
}

/**
 * Store message in bot_conversations table
 */
async function storeBotConversation(
  clientId: number,
  whatsappGroupId: number,
  messageContent: any,
  sender: 'client' | 'bot'
) {
  const supabase = createClient();

  try {
    await supabase
      .from('bot_conversations')
      .insert({
        clientId,
        whatsappGroupId,
        conversationType: 'message',
        clientMessage: sender === 'client' ? JSON.stringify(messageContent) : null,
        botResponse: sender === 'bot' ? JSON.stringify(messageContent) : null,
        confidenceScore: sender === 'bot' ? 0.8 : null,
        wasHandedToHuman: false,
        resolutionStatus: 'pending',
        createdAt: new Date(),
      });
  } catch (error) {
    console.error('Error storing bot conversation:', error);
  }
}

/**
 * Notify support staff of new message that needs human attention
 */
async function notifySupportStaffOfMessage(
  clientId: number,
  whatsappGroupId: number,
  messageContent: any
) {
  const supabase = createClient();

  try {
    // Get assigned support group for this client
    const { data: mapping } = await supabase
      .from('client_support_group_mapping')
      .select('*, support_group_members(*)')
      .eq('clientId', clientId)
      .eq('isActive', true)
      .single();

    if (mapping && mapping.support_group_members) {
      // Get focal person/admin for the WhatsApp group
      const { data: whatsappGroup } = await supabase
        .from('client_whatsapp_groups')
        .select('*, admin:employees(*), focalPerson:employees(*)')
        .eq('id', whatsappGroupId)
        .single();

      if (whatsappGroup?.admin || whatsappGroup?.focalPerson) {
        const recipient = whatsappGroup.focalPerson || whatsappGroup.admin;

        // Send notification (you could implement email, SMS, or in-app notification)
        console.log(`🔔 Support notification sent to ${recipient?.name} for client ${clientId}`);

        // Create communication log for this notification
        await supabase
          .from('communications')
          .insert({
            clientId,
            employeeId: recipient?.id,
            type: 'notification',
            direction: 'internal',
            subject: 'New WhatsApp Message Requires Attention',
            message: `Client sent a WhatsApp message that requires human intervention. Message content: ${messageContent.text || JSON.stringify(messageContent)}`,
            status: 'sent',
            sentAt: new Date(),
          });
      }
    }
  } catch (error) {
    console.error('Error notifying support staff:', error);
  }
}
