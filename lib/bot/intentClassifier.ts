/**
 * 🤖 INTENT CLASSIFICATION SYSTEM
 * AI-powered conversation understanding using Gemini AI
 * Determines what the client wants and routes to appropriate handler
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Intent categories for client requests
 */
export enum IntentType {
  CREDENTIAL_REQUEST = 'credential_request',
  CONFIG_REQUEST = 'config_request',
  PROBLEM_REPORT = 'problem_report',
  AMC_ENQUIRY = 'amc_enquiry',
  GENERAL_QUESTION = 'general_question',
  LOGIN_ISSUE = 'login_issue',
  SERVER_ISSUE = 'server_issue',
  BILLING_ENQUIRY = 'billing_enquiry',
  FEATURE_REQUEST = 'feature_request',
  TECHNICAL_SUPPORT = 'technical_support',
  HUMAN_REQUEST = 'human_request',
  UNKNOWN = 'unknown',
}

/**
 * Client request context
 */
export interface RequestContext {
  clientId: number;
  clientName: string;
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  clientContext?: {
    hasActiveAMC: boolean;
    daysRemainingForSupport: number;
    lastProblemSolved?: string;
    assignedSupportGroup?: string;
  };
}

/**
 * Intent classification result
 */
export interface IntentClassification {
  intent: IntentType;
  confidence: number; // 0 to 1
  entities: {
    credentialType?: string; // 'rancelab', 'server', 'api', etc.
    configType?: string; // 'database', 'application', 'network', etc.
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    keywords: string[];
  };
  reasoning: string;
  suggestedResponseType: 'automated' | 'assisted' | 'human';
}

/**
 * Training examples for intent classification
 */
const INTENT_TRAINING_DATA = {
  [IntentType.CREDENTIAL_REQUEST]: [
    "I need my Rancelab credentials",
    "What are my login credentials?",
    "Forgot my password",
    "Can you send me my username and password?",
    "Need access to my account",
    "How do I login to the system?",
    "I need my database credentials",
    "Server password please",
  ],
  [IntentType.CONFIG_REQUEST]: [
    "I need the config file",
    "Configuration file please",
    "Where can I download the database config?",
    "Server configuration needed",
    "Need the latest config files",
    "Application config file",
    "Network configuration",
  ],
  [IntentType.PROBLEM_REPORT]: [
    "Server is down",
    "Application not working",
    "Can't login to my account",
    "Database connection failed",
    "Getting error message",
    "System is slow",
    "Website not loading",
  ],
  [IntentType.AMC_ENQUIRY]: [
    "When does my AMC expire?",
    "How many days of support remaining?",
    "Renewal date for support",
    "Support validity",
    "AMC expiry date",
    "Need to renew my contract",
  ],
  [IntentType.LOGIN_ISSUE]: [
    "Can't login to Rancelab",
    "Login page not working",
    "Getting authentication error",
    "Password not working",
    "Username incorrect",
  ],
  [IntentType.SERVER_ISSUE]: [
    "Server is not responding",
    "Server down",
    "Can't connect to server",
    "Server timeout",
    "Database server not working",
  ],
  [IntentType.BILLING_ENQUIRY]: [
    "Invoice status",
    "Payment due",
    "Bill amount",
    "Need to pay invoice",
    "Billing inquiry",
  ],
  [IntentType.HUMAN_REQUEST]: [
    "I want to talk to a person",
    "Connect me to support",
    "Need human assistance",
    "Not satisfied with bot",
    "Transfer to agent",
    "Real person please",
  ],
};

/**
 * Classify client intent using Gemini AI
 */
export async function classifyIntent(context: RequestContext): Promise<IntentClassification> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set, using rule-based classification');
      return ruleBasedClassification(context);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build classification prompt
    const prompt = buildClassificationPrompt(context);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse AI response
    const classification = parseAIResponse(text, context);

    return classification;
  } catch (error) {
    console.error('Gemini AI classification error:', error);
    // Fallback to rule-based classification
    return ruleBasedClassification(context);
  }
}

/**
 * Build classification prompt for Gemini AI
 */
function buildClassificationPrompt(context: RequestContext): string {
  return `
You are an intent classifier for a support system. Analyze the client's message and classify their intent.

CLIENT INFORMATION:
- Client Name: ${context.clientName}
- Has Active AMC: ${context.clientContext?.hasActiveAMC ? 'Yes' : 'No'}
- Support Days Remaining: ${context.clientContext?.daysRemainingForSupport || 0}
- Last Problem Solved: ${context.clientContext?.lastProblemSolved || 'N/A'}

CLIENT MESSAGE: "${context.message}"

${context.conversationHistory && context.conversationHistory.length > 0 ? `
CONVERSATION HISTORY:
${context.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
` : ''}

Classify the intent into one of these categories:
${Object.values(IntentType).join(', ')}

Provide your response in this JSON format:
{
  "intent": "intent_category",
  "confidence": 0.0-1.0,
  "entities": {
    "credentialType": "rancelab|server|api|null",
    "configType": "database|application|network|null",
    "urgency": "low|medium|high|critical",
    "keywords": ["keyword1", "keyword2"]
  },
  "reasoning": "Brief explanation of why you classified this way",
  "suggestedResponseType": "automated|assisted|human"
}

Focus on understanding what the client wants and how urgent it is.
`;
}

/**
 * Parse AI response into IntentClassification
 */
function parseAIResponse(text: string, context: RequestContext): IntentClassification {
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      intent: parsed.intent || IntentType.UNKNOWN,
      confidence: parsed.confidence || 0.5,
      entities: {
        credentialType: parsed.entities?.credentialType,
        configType: parsed.entities?.configType,
        urgency: parsed.entities?.urgency || 'medium',
        keywords: parsed.entities?.keywords || [],
      },
      reasoning: parsed.reasoning || '',
      suggestedResponseType: parsed.suggestedResponseType || 'automated',
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return ruleBasedClassification(context);
  }
}

/**
 * Rule-based classification fallback
 */
function ruleBasedClassification(context: RequestContext): IntentClassification {
  const message = context.message.toLowerCase();
  let intent = IntentType.UNKNOWN;
  let confidence = 0.5;
  const keywords: string[] = [];

  // Check for human request first (highest priority)
  if (message.includes('human') || message.includes('person') || message.includes('agent') || message.includes('talk to someone')) {
    intent = IntentType.HUMAN_REQUEST;
    confidence = 0.9;
    keywords.push('human_request');
  }
  // Check for credential requests
  else if (message.includes('credential') || message.includes('password') || message.includes('username') || message.includes('login')) {
    intent = IntentType.CREDENTIAL_REQUEST;
    confidence = 0.8;

    if (message.includes('rancelab')) {
      keywords.push('rancelab');
    }
    if (message.includes('server') || message.includes('database')) {
      keywords.push('server_credentials');
    }
  }
  // Check for config requests
  else if (message.includes('config') || message.includes('configuration')) {
    intent = IntentType.CONFIG_REQUEST;
    confidence = 0.8;

    if (message.includes('database')) {
      keywords.push('database_config');
    }
    if (message.includes('application')) {
      keywords.push('application_config');
    }
    if (message.includes('network')) {
      keywords.push('network_config');
    }
  }
  // Check for problem reports
  else if (message.includes('problem') || message.includes('issue') || message.includes('error') || message.includes('not working') || message.includes('down')) {
    intent = IntentType.PROBLEM_REPORT;
    confidence = 0.7;

    if (message.includes('server')) {
      keywords.push('server_issue');
    }
    if (message.includes('login') || message.includes('authentication')) {
      keywords.push('login_issue');
    }
    if (message.includes('database')) {
      keywords.push('database_issue');
    }
  }
  // Check for AMC enquiries
  else if (message.includes('amc') || message.includes('support') || message.includes('renewal') || message.includes('expiry')) {
    intent = IntentType.AMC_ENQUIRY;
    confidence = 0.8;
    keywords.push('amc_enquiry');
  }
  // Check for billing enquiries
  else if (message.includes('invoice') || message.includes('payment') || message.includes('bill')) {
    intent = IntentType.BILLING_ENQUIRY;
    confidence = 0.7;
    keywords.push('billing');
  }

  return {
    intent,
    confidence,
    entities: {
      keywords,
      urgency: determineUrgency(message, intent),
    },
    reasoning: `Rule-based classification matched "${intent}" with ${keywords.length} keywords`,
    suggestedResponseType: determineSuggestedResponseType(intent, confidence),
  };
}

/**
 * Determine urgency from message content
 */
function determineUrgency(message: string, intent: IntentType): 'low' | 'medium' | 'high' | 'critical' {
  const criticalKeywords = ['urgent', 'emergency', 'critical', 'production down', 'business impact'];
  const highKeywords = ['asap', 'immediately', 'priority', 'important'];
  const lowKeywords = ['when you have time', 'no rush', 'whenever', 'later'];

  const lowerMessage = message.toLowerCase();

  if (criticalKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'critical';
  }
  if (highKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'high';
  }
  if (lowKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'low';
  }

  // Default urgency based on intent
  if (intent === IntentType.PROBLEM_REPORT || intent === IntentType.SERVER_ISSUE) {
    return 'high';
  }
  if (intent === IntentType.CREDENTIAL_REQUEST || intent === IntentType.CONFIG_REQUEST) {
    return 'medium';
  }

  return 'medium';
}

/**
 * Determine if request should be automated, assisted, or human
 */
function determineSuggestedResponseType(intent: IntentType, confidence: number): 'automated' | 'assisted' | 'human' {
  // Human request always goes to human
  if (intent === IntentType.HUMAN_REQUEST) {
    return 'human';
  }

  // Low confidence goes to human
  if (confidence < 0.6) {
    return 'human';
  }

  // Medium confidence gets assisted (bot with human review)
  if (confidence < 0.8) {
    return 'assisted';
  }

  // High confidence intents that are safe to automate
  const automatableIntents = [
    IntentType.CREDENTIAL_REQUEST,
    IntentType.CONFIG_REQUEST,
    IntentType.AMC_ENQUIRY,
  ];

  if (automatableIntents.includes(intent)) {
    return 'automated';
  }

  // Problem reports usually need human intervention
  if (intent === IntentType.PROBLEM_REPORT || intent === IntentType.SERVER_ISSUE) {
    return 'assisted';
  }

  return 'assisted';
}

/**
 * Get training examples for an intent
 */
export function getTrainingExamples(intent: IntentType): string[] {
  return INTENT_TRAINING_DATA[intent] || [];
}

/**
 * Add new training example
 */
export function addTrainingExample(intent: IntentType, example: string): void {
  if (!INTENT_TRAINING_DATA[intent]) {
    INTENT_TRAINING_DATA[intent] = [];
  }
  INTENT_TRAINING_DATA[intent].push(example);
}

export default {
  classifyIntent,
  getTrainingExamples,
  addTrainingExample,
  IntentType,
};
