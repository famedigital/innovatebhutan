/**
 * 🤝 HUMAN HANDOFF SYSTEM
 * Seamless escalation from bot to human support with learning capabilities
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Handoff trigger conditions
 */
export interface HandoffTriggers {
  lowConfidence: boolean; // Bot confidence < 0.6
  explicitHumanRequest: boolean; // Client explicitly asks for human
  multipleFailedAttempts: boolean; // Bot failed to resolve 3+ times
  urgentProblem: boolean; // Critical urgency issues
  complexTechnicalIssue: boolean; // Beyond bot capabilities
  securityConcerns: boolean; // Security-related requests
  clientFrustration: boolean; // Detected frustration in language
}

/**
 * Handoff decision result
 */
export interface HandoffDecision {
  shouldHandoff: boolean;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestedStaff?: {
    employeeId: number;
    name: string;
    whatsappNumber: string;
    specializations: string[];
  };
  estimatedWaitTime: string;
  contextToTransfer: string;
}

/**
 * Determine if conversation should be handed off to human
 */
export async function evaluateHandoffNeed(
  clientId: number,
  conversationHistory: Array<{ role: string; content: string }>,
  currentIntent: any,
  botConfidence: number
): Promise<HandoffDecision> {
  try {
    const supabase = createClient();

    // Get client support group assignment
    const { data: mapping } = await supabase
      .from('client_support_group_mapping')
      .select('*, support_group_members(*, employee:employees(*))')
      .eq('clientId', clientId)
      .eq('isActive', true)
      .single();

    // Evaluate handoff triggers
    const triggers = await evaluateHandoffTriggers(
      clientId,
      conversationHistory,
      currentIntent,
      botConfidence
    );

    // If no triggers met, no handoff needed
    if (!Object.values(triggers).some(trigger => trigger === true)) {
      return {
        shouldHandoff: false,
        reason: 'Bot handling automated response',
        priority: 'low',
        estimatedWaitTime: 'Immediate',
        contextToTransfer: buildConversationContext(conversationHistory),
      };
    }

    // Determine handoff priority and reason
    const { priority, reason } = determineHandoffPriority(triggers);

    // Find best available support staff
    const suggestedStaff = await findAvailableStaff(mapping, triggers, currentIntent);

    // Estimate wait time
    const estimatedWaitTime = estimateWaitTime(priority, suggestedStaff);

    return {
      shouldHandoff: true,
      reason,
      priority,
      suggestedStaff,
      estimatedWaitTime,
      contextToTransfer: buildConversationContext(conversationHistory),
    };

  } catch (error) {
    console.error('Handoff evaluation error:', error);
    return {
      shouldHandoff: false,
      reason: 'Error evaluating handoff - continuing with bot',
      priority: 'low',
      estimatedWaitTime: 'N/A',
      contextToTransfer: '',
    };
  }
}

/**
 * Evaluate handoff trigger conditions
 */
async function evaluateHandoffTriggers(
  clientId: number,
  conversationHistory: Array<{ role: string; content: string }>,
  currentIntent: any,
  botConfidence: number
): Promise<HandoffTriggers> {
  const triggers: HandoffTriggers = {
    lowConfidence: botConfidence < 0.6,
    explicitHumanRequest: currentIntent.intent === 'human_request',
    multipleFailedAttempts: false,
    urgentProblem: currentIntent.entities?.urgency === 'critical',
    complexTechnicalIssue: currentIntent.intent === 'problem_report' && botConfidence < 0.7,
    securityConcerns: currentIntent.intent === 'credential_request' && botConfidence < 0.5,
    clientFrustration: false,
  };

  // Check for multiple failed attempts
  const recentConversations = conversationHistory.slice(-10);
  const botFailures = recentConversations.filter(
    msg => msg.role === 'bot' && (
      msg.content.toLowerCase().includes('i don\'t understand') ||
      msg.content.toLowerCase().includes('i\'m not sure') ||
      msg.content.toLowerCase().includes('let me connect you')
    )
  );
  triggers.multipleFailedAttempts = botFailures.length >= 2;

  // Check for client frustration indicators
  const recentClientMessages = recentConversations
    .filter(msg => msg.role === 'client')
    .slice(-5)
    .map(msg => msg.content.toLowerCase());

  const frustrationKeywords = [
    'frustrating', 'annoying', 'not helpful', 'useless',
    'again and again', 'multiple times', 'tired of this',
    'just want to talk to human', 'bot is stupid'
  ];

  triggers.clientFrustration = recentClientMessages.some(msg =>
    frustrationKeywords.some(keyword => msg.includes(keyword))
  );

  return triggers;
}

/**
 * Determine handoff priority and reason
 */
function determineHandoffPriority(triggers: HandoffTriggers): { priority: string; reason: string } {
  if (triggers.urgentProblem || triggers.securityConcerns) {
    return {
      priority: 'critical',
      reason: 'Urgent or security-related issue requires immediate human attention',
    };
  }

  if (triggers.clientFrustration) {
    return {
      priority: 'high',
      reason: 'Client showing signs of frustration - priority handoff recommended',
    };
  }

  if (triggers.explicitHumanRequest) {
    return {
      priority: 'high',
      reason: 'Client explicitly requested human assistance',
    };
  }

  if (triggers.multipleFailedAttempts) {
    return {
      priority: 'medium',
      reason: 'Multiple unsuccessful bot attempts - human intervention needed',
    };
  }

  if (triggers.lowConfidence || triggers.complexTechnicalIssue) {
    return {
      priority: 'medium',
      reason: 'Complex issue requiring human expertise',
    };
  }

  return {
    priority: 'low',
    reason: 'Human assistance requested',
  };
}

/**
 * Find available support staff
 */
async function findAvailableStaff(
  mapping: any,
  triggers: HandoffTriggers,
  currentIntent: any
): Promise<{ employeeId: number; name: string; whatsappNumber: string; specializations: string[] } | undefined> {
  if (!mapping?.support_group_members || mapping.support_group_members.length === 0) {
    return undefined;
  }

  // Filter available staff
  const availableStaff = mapping.support_group_members
    .filter((member: any) => member.employee?.isAvailableForChat)
    .map((member: any) => ({
      employeeId: member.employee.id,
      name: member.employee.name,
      whatsappNumber: member.employee.whatsappNumber,
      specializations: member.employee.skills || [],
      role: member.role,
    }));

  if (availableStaff.length === 0) {
    return undefined;
  }

  // Score staff based on specializations and trigger type
  const scoredStaff = availableStaff.map((staff: any) => {
    let score = 0;

    // Prefer senior/lead staff for critical issues
    if (triggers.urgentProblem || triggers.securityConcerns) {
      if (staff.role === 'lead') score += 10;
      if (staff.role === 'senior') score += 5;
    }

    // Match specializations to intent
    if (currentIntent.intent === 'credential_request' && staff.specializations.includes('credentials')) {
      score += 5;
    }
    if (currentIntent.intent === 'problem_report' && staff.specializations.includes('troubleshooting')) {
      score += 5;
    }

    return { ...staff, score };
  });

  // Sort by score and return highest scored staff
  scoredStaff.sort((a, b) => b.score - a.score);
  return scoredStaff[0];
}

/**
 * Estimate wait time based on priority and staff availability
 */
function estimateWaitTime(
  priority: string,
  suggestedStaff: any
): string {
  if (!suggestedStaff) {
    return '30 minutes - 1 hour';
  }

  switch (priority) {
    case 'critical':
      return '5-10 minutes';
    case 'high':
      return '10-15 minutes';
    case 'medium':
      return '15-30 minutes';
    case 'low':
      return '20-40 minutes';
    default:
      return '15-30 minutes';
  }
}

/**
 * Build conversation context for transfer
 */
function buildConversationContext(
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const recentHistory = conversationHistory.slice(-10);

  let context = '**CONVERSATION HISTORY:**\n\n';
  recentHistory.forEach((msg, index) => {
    const speaker = msg.role === 'client' ? 'CLIENT' : 'BOT';
    context += `${speaker}: ${msg.content}\n\n`;
  });

  context += '**CONTEXT:** Bot encountered limitations and human assistance is required.\n';
  context += '**HANDOFF REASON:** Ensuring client receives appropriate support.';

  return context;
}

/**
 * Execute handoff process
 */
export async function executeHandoff(
  clientId: number,
  handoffDecision: HandoffDecision,
  whatsappGroupId?: number
): Promise<{ success: boolean; ticketNumber?: string; message: string }> {
  try {
    const supabase = createClient();

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

    // Create support ticket/problem record
    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .insert({
        clientId,
        title: `Bot Handoff - ${handoffDecision.reason}`,
        description: handoffDecision.contextToTransfer,
        priority: handoffDecision.priority,
        status: 'open',
        assignedTo: handoffDecision.suggestedStaff?.employeeId,
        source: 'bot_handoff',
        whatsappGroupId,
        createdAt: new Date(),
      })
      .select()
      .single();

    if (problemError) {
      console.error('Failed to create support ticket:', problemError);
      return {
        success: false,
        message: 'Failed to create support ticket. Please try again or contact support directly.',
      };
    }

    // Update bot conversation with handoff details
    await supabase
      .from('bot_conversations')
      .update({
        wasHandedToHuman: true,
        handedToEmployeeId: handoffDecision.suggestedStaff?.employeeId,
        resolutionStatus: 'pending',
      })
      .eq('clientId', clientId)
      .order('createdAt', { ascending: false })
      .limit(1);

    // Notify assigned staff
    if (handoffDecision.suggestedStaff?.whatsappNumber) {
      const { sendTextMessage } = await import('@/lib/integrations/whatsapp');

      await sendTextMessage(
        handoffDecision.suggestedStaff.whatsappNumber,
        `🔔 **NEW SUPPORT TICKET**\n\n` +
        `Ticket: ${ticketNumber}\n` +
        `Priority: ${handoffDecision.priority.toUpperCase()}\n` +
        `Client ID: ${clientId}\n` +
        `Reason: ${handoffDecision.reason}\n\n` +
        `Please respond to assist the client.\n\n` +
        `Conversation context has been shared with you.`
      );
    }

    // Learn from this handoff for future improvement
    await learnFromHandoff(clientId, handoffDecision);

    return {
      success: true,
      ticketNumber,
      message: `I've connected you with our support team. Your ticket number is ${ticketNumber}. ${handoffDecision.suggestedStaff?.name ? `${handoffDecision.suggestedStaff.name} will assist you` : 'A team member will assist you'} within ${handoffDecision.estimatedWaitTime}.`,
    };

  } catch (error) {
    console.error('Handoff execution error:', error);
    return {
      success: false,
      message: 'Failed to connect with support team. Please try again or contact support directly.',
    };
  }
}

/**
 * Learn from handoff to improve bot performance
 */
async function learnFromHandoff(clientId: number, handoffDecision: HandoffDecision) {
  try {
    const supabase = createClient();

    // Record handoff pattern for analysis
    await supabase
      .from('bot_training_data')
      .insert({
        category: 'handoff_pattern',
        question: `Handoff: ${handoffDecision.reason}`,
        answer: `Priority: ${handoffDecision.priority}, Staff Required: ${!!handoffDecision.suggestedStaff}`,
        context: {
          clientId,
          handoffTriggers: handoffDecision.reason,
          suggestedAction: 'Improve bot capabilities for this scenario',
          timestamp: new Date().toISOString(),
        },
        isActive: true,
        successRate: 0, // Low success rate since handoff was needed
        timesUsed: 1,
        createdAt: new Date(),
      });

    console.log(`Handoff learning recorded for client ${clientId}`);

  } catch (error) {
    console.error('Handoff learning error:', error);
  }
}

/**
 * Get handoff analytics
 */
export async function getHandoffAnalytics(
  days: number = 30
): Promise<{
  totalHandoffs: number;
  handoffByReason: Record<string, number>;
  handoffByPriority: Record<string, number>;
  averageResolutionTime: number;
  botImprovementAreas: string[];
}> {
  try {
    const supabase = createClient();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get recent handoffs
    const { data: handoffs } = await supabase
      .from('bot_conversations')
      .select('*')
      .eq('wasHandedToHuman', true)
      .gte('createdAt', startDate);

    const totalHandoffs = handoffs?.length || 0;

    // Analyze by conversation type
    const handoffByReason: Record<string, number> = {};
    const handoffByPriority: Record<string, number> = {};

    handoffs?.forEach(handoff => {
      const reason = handoff.conversationType || 'unknown';
      handoffByReason[reason] = (handoffByReason[reason] || 0) + 1;
    });

    // Get resolution times
    const { data: resolvedProblems } = await supabase
      .from('problems')
      .select('*')
      .eq('source', 'bot_handoff')
      .eq('status', 'resolved')
      .gte('createdAt', startDate);

    const avgResolutionTime = resolvedProblems && resolvedProblems.length > 0
      ? resolvedProblems.reduce((sum, p) => {
          const created = new Date(p.createdAt).getTime();
          const resolved = new Date(p.resolvedAt || 0).getTime();
          return sum + (resolved - created) / (1000 * 60 * 60); // hours
        }, 0) / resolvedProblems.length
      : 0;

    // Identify improvement areas
    const botImprovementAreas = Object.entries(handoffByReason)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([reason]) => reason);

    return {
      totalHandoffs,
      handoffByReason,
      handoffByPriority,
      averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      botImprovementAreas,
    };

  } catch (error) {
    console.error('Handoff analytics error:', error);
    return {
      totalHandoffs: 0,
      handoffByReason: {},
      handoffByPriority: {},
      averageResolutionTime: 0,
      botImprovementAreas: [],
    };
  }
}

export default {
  evaluateHandoffNeed,
  executeHandoff,
  getHandoffAnalytics,
};
