/**
 * 🤖 BOT CONVERSATION API
 * Main bot automation endpoint - orchestrates intent classification, response generation, and automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { classifyIntent, RequestContext } from '@/lib/bot/intentClassifier';
import { generateResponse, ResponseContext } from '@/lib/bot/responseGenerator';
import { processCredentialRequest } from '@/lib/bot/credentialHandler';
import { processConfigRequest } from '@/lib/bot/configHandler';
import { sendTextMessage, sendMediaMessage } from '@/lib/integrations/whatsapp';

/**
 * POST - Process bot conversation and return response
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const {
      clientId,
      message,
      conversationHistory,
      whatsappGroupId,
    } = body;

    if (!clientId || !message) {
      return NextResponse.json(
        { error: 'clientId and message are required' },
        { status: 400 }
      );
    }

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        amc_contracts(*)
      `)
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Step 1: Classify Intent
    const requestContext: RequestContext = {
      clientId,
      clientName: client.name,
      message,
      conversationHistory,
      clientContext: {
        hasActiveAMC: !!client.amc_contracts && client.amc_contracts.length > 0,
        daysRemainingForSupport: client.daysRemainingForSupport || 0,
        lastProblemSolved: client.lastProblemSolved,
      },
    };

    const intentClassification = await classifyIntent(requestContext);

    // Step 2: Generate Response
    const responseContext: ResponseContext = {
      clientName: client.name,
      clientId,
      intent: intentClassification,
      conversationHistory,
      clientData: {
        hasActiveAMC: !!client.amc_contracts && client.amc_contracts.length > 0,
        daysRemainingForSupport: client.daysRemainingForSupport || 0,
        rancelabCode: client.rancelabCode,
        assignedSupportGroup: client.assignedSupportGroup,
        lastProblemSolved: client.lastProblemSolved,
      },
    };

    let botResponse = await generateResponse(responseContext);

    // Step 3: Handle Automation (if applicable)
    if (intentClassification.intent === 'credential_request' && intentClassification.confidence > 0.7) {
      const credentialResult = await processCredentialRequest({
        clientId,
        clientName: client.name,
        credentialType: intentClassification.entities.credentialType || 'rancelab',
        requestReason: message,
        requestMadeBy: 0, // Client request
      });

      if (credentialResult.success) {
        botResponse.message = credentialResult.message || botResponse.message;
      } else {
        botResponse.message = credentialResult.message || botResponse.message;
      }
    }

    if (intentClassification.intent === 'config_request' && intentClassification.confidence > 0.7) {
      const configResult = await processConfigRequest({
        clientId,
        clientName: client.name,
        configType: intentClassification.entities.configType || 'application',
        requestReason: message,
        requestMadeBy: 0,
      });

      if (configResult.success) {
        botResponse.message = configResult.message || botResponse.message;
      } else {
        botResponse.message = configResult.message || botResponse.message;
      }
    }

    // Step 4: Store conversation in database
    await storeBotConversation(clientId, whatsappGroupId, message, botResponse, intentClassification);

    // Step 5: Check for human handoff
    if (botResponse.metadata.requiresHumanIntervention) {
      await triggerHumanHandoff(clientId, whatsappGroupId, message, botResponse);
    }

    return NextResponse.json({
      success: true,
      response: botResponse,
      intent: intentClassification,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Bot conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to process conversation', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Store bot conversation in database
 */
async function storeBotConversation(
  clientId: number,
  whatsappGroupId: number | undefined,
  clientMessage: string,
  botResponse: any,
  intent: any
) {
  try {
    const supabase = createClient();

    await supabase
      .from('bot_conversations')
      .insert({
        clientId,
        whatsappGroupId,
        conversationType: intent.intent,
        clientMessage,
        botResponse: JSON.stringify(botResponse),
        confidenceScore: intent.confidence,
        wasHandedToHuman: botResponse.metadata.requiresHumanIntervention,
        resolutionStatus: botResponse.metadata.requiresHumanIntervention ? 'pending' : 'bot_resolved',
        createdAt: new Date(),
      });

    // Update bot training data for continuous learning
    await updateBotTrainingData(intent.intent, clientMessage, botResponse.message);

  } catch (error) {
    console.error('Error storing bot conversation:', error);
  }
}

/**
 * Update bot training data based on conversations
 */
async function updateBotTrainingData(intent: string, question: string, answer: string) {
  try {
    const supabase = createClient();

    // Check if similar training data exists
    const { data: existing } = await supabase
      .from('bot_training_data')
      .select('*')
      .eq('category', intent)
      .ilike('question', `%${question.substring(0, 50)}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      // Update success rate
      await supabase
        .from('bot_training_data')
        .update({
          timesUsed: (existing[0].timesUsed || 0) + 1,
          updatedAt: new Date(),
        })
        .eq('id', existing[0].id);
    } else {
      // Add new training data
      await supabase
        .from('bot_training_data')
        .insert({
          category: intent,
          question,
          answer,
          context: {
            source: 'live_conversation',
            createdAt: new Date().toISOString(),
          },
          isActive: true,
          successRate: 1.0,
          timesUsed: 1,
          createdAt: new Date(),
        });
    }

  } catch (error) {
    console.error('Error updating training data:', error);
  }
}

/**
 * Trigger human handoff
 */
async function triggerHumanHandoff(
  clientId: number,
  whatsappGroupId: number | undefined,
  clientMessage: string,
  botResponse: any
) {
  try {
    const supabase = createClient();

    // Get support group assignment
    const { data: mapping } = await supabase
      .from('client_support_group_mapping')
      .select('*, support_group_members(*, employee:employees(*))')
      .eq('clientId', clientId)
      .eq('isActive', true)
      .single();

    if (mapping && mapping.support_group_members && mapping.support_group_members.length > 0) {
      // Find available support staff
      const availableStaff = mapping.support_group_members.filter(
        (member: any) => member.employee?.isAvailableForChat
      );

      if (availableStaff.length > 0) {
        // Assign to first available staff
        const assignedStaff = availableStaff[0].employee;

        // Send notification to support staff
        if (assignedStaff.whatsappNumber) {
          await sendTextMessage(
            assignedStaff.whatsappNumber,
            `🔔 **New Support Request**\n\nClient ID: ${clientId}\nMessage: ${clientMessage}\n\nPlease respond to assist the client.`
          );
        }

        // Update bot conversation with handoff info
        await supabase
          .from('bot_conversations')
          .update({
            handedToEmployeeId: assignedStaff.id,
            wasHandedToHuman: true,
          })
          .eq('clientId', clientId)
          .order('createdAt', { ascending: false })
          .limit(1);

        console.log(`Human handoff triggered for client ${clientId} -> staff ${assignedStaff.name}`);
      }
    }

  } catch (error) {
    console.error('Human handoff error:', error);
  }
}

/**
 * GET - Get bot conversation history
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    const { data: conversations, error } = await supabase
      .from('bot_conversations')
      .select('*')
      .eq('clientId', parseInt(clientId))
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch bot conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversations,
    });

  } catch (error) {
    console.error('Bot conversations fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations', message: error.message },
      { status: 500 }
    );
  }
}
