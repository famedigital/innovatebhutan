/**
 * 🤖 RESPONSE GENERATION SYSTEM
 * Human-like conversation generation with Bhutanese context and personality
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { IntentType, IntentClassification } from './intentClassifier';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Bot personality configuration
 */
const BOT_PERSONALITY = {
  name: 'Support Assistant',
  traits: [
    'friendly and approachable',
    'helpful and knowledgeable',
    'patient and understanding',
    'professional yet casual',
    'Bhutanese context-aware',
    'solution-oriented',
  ],
  communicationStyle: {
    useEmojis: true,
    useCasualLanguage: true,
    beConcise: true,
    showEmpathy: true,
    provideClearSteps: true,
    personalizeResponses: true,
  },
};

/**
 * Response context
 */
export interface ResponseContext {
  clientName: string;
  clientId: number;
  intent: IntentClassification;
  conversationHistory?: Array<{ role: string; content: string }>;
  clientData?: {
    hasActiveAMC: boolean;
    daysRemainingForSupport: number;
    rancelabCode?: string;
    assignedSupportGroup?: string;
    lastProblemSolved?: string;
  };
}

/**
 * Generated response
 */
export interface GeneratedResponse {
  message: string;
  confidence: number;
  suggestedActions?: Array<{
    type: 'button' | 'list' | 'text';
    label: string;
    action: string;
  }>;
  metadata: {
    responseType: 'automated' | 'assisted' | 'human';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    requiresHumanIntervention: boolean;
    estimatedResolutionTime?: string;
  };
}

/**
 * Generate human-like response for client request
 */
export async function generateResponse(context: ResponseContext): Promise<GeneratedResponse> {
  try {
    // Check if we should use AI or templates
    const useAI = shouldUseAIResponse(context.intent);

    if (useAI && process.env.GEMINI_API_KEY) {
      return await generateAIResponse(context);
    } else {
      return generateTemplateResponse(context);
    }
  } catch (error) {
    console.error('Response generation error:', error);
    // Fallback to template response
    return generateTemplateResponse(context);
  }
}

/**
 * Determine if AI response should be used
 */
function shouldUseAIResponse(intent: IntentClassification): boolean {
  // Use AI for complex or ambiguous intents
  if (intent.confidence < 0.7) {
    return true;
  }

  // Use templates for high-confidence routine requests
  const templateIntents = [
    IntentType.CREDENTIAL_REQUEST,
    IntentType.CONFIG_REQUEST,
    IntentType.AMC_ENQUIRY,
  ];

  if (templateIntents.includes(intent.intent) && intent.confidence > 0.8) {
    return false;
  }

  return true;
}

/**
 * Generate AI-powered response
 */
async function generateAIResponse(context: ResponseContext): Promise<GeneratedResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = buildResponsePrompt(context);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return parseAIResponse(text, context);
}

/**
 * Build response generation prompt
 */
function buildResponsePrompt(context: ResponseContext): string {
  const { clientName, intent, clientData, conversationHistory } = context;

  return `
You are ${BOT_PERSONALITY.name}, a helpful support assistant for a software company in Bhutan.

YOUR PERSONALITY:
- ${BOT_PERSONALITY.traits.join('\n- ')}
- Communication style: ${JSON.stringify(BOT_PERSONALITY.communicationStyle, null, 2)}

CLIENT INFORMATION:
- Name: ${clientName}
- Client ID: ${context.clientId}
- Active AMC: ${clientData?.hasActiveAMC ? 'Yes' : 'No'}
- Support Days Remaining: ${clientData?.daysRemainingForSupport || 0}
- Rancelab Code: ${clientData?.ralcodelabCode || 'N/A'}

CLIENT REQUEST ANALYSIS:
- Intent: ${intent.intent}
- Confidence: ${intent.confidence}
- Urgency: ${intent.entities.urgency}
- Keywords: ${intent.entities.keywords.join(', ')}
- Reasoning: ${intent.reasoning}

${conversationHistory && conversationHistory.length > 0 ? `
CONVERSATION HISTORY:
${conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
` : ''}

INSTRUCTIONS:
1. Generate a helpful, friendly response that addresses the client's request
2. Use emojis where appropriate 🎉
3. Keep responses concise but informative
4. Show empathy for problems or issues
5. Provide clear next steps when needed
6. If you need more information, ask specific questions
7. Use Bhutanese context where relevant
8. Always end with a helpful question or offer of further assistance

IMPORTANT SECURITY RULES:
- Never share actual passwords or API keys in messages
- For credential requests, explain the verification process
- For sensitive data, use secure delivery methods
- Always verify client identity before sharing sensitive information

Generate your response in this JSON format:
{
  "message": "Your response message here",
  "confidence": 0.0-1.0,
  "suggestedActions": [
    {
      "type": "button|list|text",
      "label": "Action label",
      "action": "Action description"
    }
  ],
  "metadata": {
    "responseType": "automated|assisted|human",
    "urgency": "low|medium|high|critical",
    "requiresHumanIntervention": true/false,
    "estimatedResolutionTime": "Optional time estimate"
  }
}

Focus on being helpful, friendly, and solution-oriented.
`;
}

/**
 * Parse AI response
 */
function parseAIResponse(text: string, context: ResponseContext): GeneratedResponse {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      message: parsed.message || "I'm here to help! How can I assist you today?",
      confidence: parsed.confidence || 0.8,
      suggestedActions: parsed.suggestedActions || [],
      metadata: {
        responseType: parsed.metadata?.responseType || 'automated',
        urgency: parsed.metadata?.urgency || 'medium',
        requiresHumanIntervention: parsed.metadata?.requiresHumanIntervention || false,
        estimatedResolutionTime: parsed.metadata?.estimatedResolutionTime,
      },
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return generateTemplateResponse(context);
  }
}

/**
 * Generate template-based response
 */
function generateTemplateResponse(context: ResponseContext): GeneratedResponse {
  const { clientName, intent } = context;

  switch (intent.intent) {
    case IntentType.CREDENTIAL_REQUEST:
      return generateCredentialRequestResponse(context);
    case IntentType.CONFIG_REQUEST:
      return generateConfigRequestResponse(context);
    case IntentType.AMC_ENQUIRY:
      return generateAMCEnquiryResponse(context);
    case IntentType.PROBLEM_REPORT:
      return generateProblemReportResponse(context);
    case IntentType.HUMAN_REQUEST:
      return generateHumanHandoffResponse(context);
    default:
      return generateGeneralResponse(context);
  }
}

/**
 * Credential request response
 */
function generateCredentialRequestResponse(context: ResponseContext): GeneratedResponse {
  const { clientName, intent, clientData } = context;
  const credentialType = intent.entities.credentialType || 'system';

  return {
    message: `Hi ${clientName}! 👋

I can help you with your ${credentialType} credentials. 🔐

Before I share your credentials, I need to verify your identity for security purposes.

Could you please provide:
✅ Your registered mobile number
✅ Your company name or client ID

Once verified, I'll securely share your credentials through our encrypted system. Your security is our top priority! 🛡️

Is there anything specific about the credentials you need help with?`,
    confidence: 0.9,
    suggestedActions: [
      {
        type: 'text',
        label: 'Provide Verification Details',
        action: 'Share mobile number and client ID',
      },
      {
        type: 'text',
        label: 'Login Issues?',
        action: 'Get help with login problems',
      },
    ],
    metadata: {
      responseType: 'assisted',
      urgency: intent.entities.urgency,
      requiresHumanIntervention: true,
      estimatedResolutionTime: '5-10 minutes',
    },
  };
}

/**
 * Config request response
 */
function generateConfigRequestResponse(context: ResponseContext): GeneratedResponse {
  const { clientName, intent } = context;
  const configType = intent.entities.configType || 'system';

  return {
    message: `Hello ${clientName}! 👋

I understand you need the ${configType} configuration file. 📄

Let me pull that up for you from your secure Google Drive folder.

📋 **Configuration Details:**
- File Type: ${configType} Configuration
- Location: Your Google Drive folder
- Access: Secure delivery

I'll upload the configuration file to your WhatsApp group shortly. The file will contain all necessary settings and parameters.

⚠️ **Security Reminder:** This file contains sensitive information. Please store it securely and don't share it outside your authorized team.

Would you like me to:
1. Explain the configuration parameters?
2. Help with setup/installation?
3. Troubleshoot any issues?`,
    confidence: 0.9,
    suggestedActions: [
      {
        type: 'button',
        label: 'Explain Parameters',
        action: 'Get configuration parameter explanations',
      },
      {
        type: 'button',
        label: 'Setup Help',
        action: 'Get installation and setup assistance',
      },
      {
        type: 'button',
        label: 'Troubleshoot',
        action: 'Get troubleshooting assistance',
      },
    ],
    metadata: {
      responseType: 'automated',
      urgency: intent.entities.urgency,
      requiresHumanIntervention: false,
      estimatedResolutionTime: '2-5 minutes',
    },
  };
}

/**
 * AMC enquiry response
 */
function generateAMCEnquiryResponse(context: ResponseContext): GeneratedResponse {
  const { clientName, clientData } = context;
  const daysRemaining = clientData?.daysRemainingForSupport || 0;
  const hasActiveAMC = clientData?.hasActiveAMC || false;

  if (!hasActiveAMC) {
    return {
      message: `Hi ${clientName}! 👋

I notice that your Annual Maintenance Contract (AMC) has expired. ⚠️

**Current Status:**
- AMC Status: Expired
- Support: Not Active

To continue receiving support services, you'll need to renew your AMC. I can connect you with our accounts team to discuss renewal options.

Would you like me to:
1. Connect you with the accounts team?
2. Provide information about AMC plans?
3. Calculate renewal costs?`,
      confidence: 0.9,
      suggestedActions: [
        {
          type: 'button',
          label: 'Talk to Accounts',
          action: 'Connect with accounts team for renewal',
        },
        {
          type: 'button',
          label: 'AMC Plans Info',
          action: 'Get information about available AMC plans',
        },
      ],
      metadata: {
        responseType: 'assisted',
        urgency: 'high',
        requiresHumanIntervention: true,
        estimatedResolutionTime: '1-2 business days',
      },
    };
  }

  let urgencyMessage = '';
  if (daysRemaining <= 7) {
    urgencyMessage = '⚠️ **Action Required:** Your AMC is expiring soon! Please consider renewal to avoid service disruption.';
  } else if (daysRemaining <= 30) {
    urgencyMessage = '📅 **Upcoming:** Your AMC will expire in the coming weeks. Our team will contact you regarding renewal.';
  }

  return {
    message: `Hello ${clientName}! 👋

Great news! Your Annual Maintenance Contract (AMC) is active. ✅

**Support Status:**
- AMC Status: Active
- Days Remaining: ${daysRemaining} days
- Support Level: Standard

${urgencyMessage}

You have full access to:
✅ Technical support via WhatsApp
✅ Configuration and credential assistance
✅ Problem resolution and troubleshooting
✅ Software updates and patches
✅ Priority response times

Is there anything specific you need help with today?`,
    confidence: 0.9,
    suggestedActions: [
      {
        type: 'button',
        label: 'Technical Support',
        action: 'Get technical assistance',
      },
      {
        type: 'button',
        label: 'Credentials',
        action: 'Request credentials or config files',
      },
      {
        type: 'button',
        label: 'Renewal Info',
        action: 'Get AMC renewal information',
      },
    ],
    metadata: {
      responseType: 'automated',
      urgency: daysRemaining <= 7 ? 'high' : 'low',
      requiresHumanIntervention: false,
      estimatedResolutionTime: 'Immediate',
    },
  };
}

/**
 * Problem report response
 */
function generateProblemReportResponse(context: ResponseContext): GeneratedResponse {
  const { clientName, intent } = context;

  return {
    message: `I'm sorry to hear you're experiencing issues, ${clientName}! 😔

Let me help you resolve this as quickly as possible.

🔍 **Initial Assessment:**
- Issue Type: ${intent.intent}
- Urgency: ${intent.entities.urgency}
- Keywords: ${intent.entities.keywords.join(', ')}

Based on your description, I'm creating a support ticket and connecting you with your assigned support team.

**Next Steps:**
1. Your issue has been logged in our system
2. Your support team will contact you within 15 minutes
3. I'll share your conversation history with them so you don't have to repeat anything

While you wait, could you provide:
📝 When did this issue start?
📝 What were you doing when it occurred?
📝 Any error messages you're seeing?

Your assigned support group: ${context.clientData?.assignedSupportGroup || 'General Support'}

Is there anything else I can help you with in the meantime?`,
    confidence: 0.8,
    suggestedActions: [
      {
        type: 'text',
        label: 'Provide More Details',
        action: 'Share additional information about the issue',
      },
      {
        type: 'button',
        label: 'Talk to Support',
        action: 'Immediate connection to support team',
      },
    ],
    metadata: {
      responseType: 'assisted',
      urgency: intent.entities.urgency,
      requiresHumanIntervention: true,
      estimatedResolutionTime: '15-30 minutes',
    },
  };
}

/**
 * Human handoff response
 */
function generateHumanHandoffResponse(context: ResponseContext): GeneratedResponse {
  const { clientName, clientData } = context;

  return {
    message: `Of course, ${clientName}! 👤

I completely understand you'd like to speak with a real person. Let me connect you with your support team right away.

📞 **Support Team Details:**
- Your Support Group: ${clientData?.assignedSupportGroup || 'General Support'}
- Expected Response Time: Within 10 minutes
- Contact Method: WhatsApp

I've forwarded your entire conversation history to them, so they'll have all the context and can help you without you having to repeat anything.

📋 **Ticket Created:** #TKT-${Date.now().toString().slice(-6)}

Your support team member will reach out to you shortly. In the meantime, is there anything else I can help you with?`,
    confidence: 1.0,
    suggestedActions: [],
    metadata: {
      responseType: 'human',
      urgency: 'medium',
      requiresHumanIntervention: true,
      estimatedResolutionTime: '10-15 minutes',
    },
  };
}

/**
 * General response
 */
function generateGeneralResponse(context: ResponseContext): GeneratedResponse {
  const { clientName } = context;

  return {
    message: `Hello ${clientName}! 👋

I'm your support assistant and I'm here to help you with anything you need.

I can assist you with:
🔑 **Credentials:** Rancelab login, server access, API keys
📄 **Configurations:** Database, application, or network configs
🛠️ **Technical Support:** Troubleshooting and problem resolution
📅 **AMC & Support:** Contract enquiries, renewal information
💰 **Billing:** Invoices, payments, and accounts

How can I help you today? Please feel free to ask me anything! 😊`,
    confidence: 0.7,
    suggestedActions: [
      {
        type: 'button',
        label: 'Credentials',
        action: 'Get credentials or access information',
      },
      {
        type: 'button',
        label: 'Support',
        action: 'Get technical support',
      },
      {
        type: 'button',
        label: 'AMC Status',
        action: 'Check support contract status',
      },
    ],
    metadata: {
      responseType: 'automated',
      urgency: 'low',
      requiresHumanIntervention: false,
      estimatedResolutionTime: 'Immediate',
    },
  };
}

export default {
  generateResponse,
  BOT_PERSONALITY,
};
