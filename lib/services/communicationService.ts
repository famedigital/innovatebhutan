/**
 * 📞 COMMUNICATION SERVICE
 * Business logic for multi-channel communication
 */

import * as repo from "@/lib/repositories/communicationRepository";
import type { Communication, NewCommunication } from "@/lib/repositories/communicationRepository";

export type CommunicationType = "whatsapp" | "email" | "ticket" | "visit" | "call";
export type CommunicationDirection = "inbound" | "outbound";

export interface CreateCommunicationDTO {
  clientId: number;
  type: CommunicationType;
  subject?: string;
  content: string;
  direction: CommunicationDirection;
  focalPersonId?: number;
  teamMemberId?: number;
  problemId?: number;
  scheduledFor?: Date;
  importance?: "low" | "normal" | "high" | "urgent";
}

/**
 * Communication Service Class
 */
export class CommunicationService {
  private repository = repo;

  async createCommunication(data: CreateCommunicationDTO): Promise<{
    success: boolean;
    data?: Communication;
    error?: string;
  }> {
    try {
      if (!data.content?.trim()) {
        return { success: false, error: "Communication content is required" };
      }

      const newComm: NewCommunication = {
        clientId: data.clientId,
        type: data.type,
        subject: data.subject,
        content: data.content.trim(),
        direction: data.direction,
        focalPersonId: data.focalPersonId,
        teamMemberId: data.teamMemberId,
        problemId: data.problemId,
        scheduledFor: data.scheduledFor,
        importance: data.importance || 'normal',
        status: data.scheduledFor ? 'pending' : 'completed',
        completedAt: data.scheduledFor ? null : new Date()
      };

      const result = await this.repository.createCommunication(newComm);

      if (!result) {
        return { success: false, error: "Failed to create communication" };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error("Service error creating communication:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  async getClientCommunications(clientId: number): Promise<Communication[]> {
    return await this.repository.getClientCommunications(clientId);
  }

  async getScheduledCommunications(): Promise<Communication[]> {
    return await this.repository.getScheduledCommunications();
  }

  async getCommunicationsRequiringFollowUp(): Promise<Communication[]> {
    return await this.repository.getCommunicationsRequiringFollowUp();
  }

  async completeCommunication(
    id: number,
    outcome: string,
    nextAction?: string
  ): Promise<{ success: boolean; data?: Communication; error?: string }> {
    const result = await this.repository.completeCommunication(id, outcome, nextAction);
    if (!result) {
      return { success: false, error: "Failed to complete communication" };
    }
    return { success: true, data: result };
  }

  async getCommunicationStatistics(): Promise<ReturnType<typeof repo.getCommunicationStatistics>> {
    return await this.repository.getCommunicationStatistics();
  }

  // AI Feature: Sentiment analysis
  async analyzeSentiment(content: string): Promise<"positive" | "neutral" | "negative"> {
    const lower = content.toLowerCase();

    const positiveWords = ['happy', 'satisfied', 'great', 'excellent', 'thank', 'appreciate', 'good', 'resolved'];
    const negativeWords = ['angry', 'frustrated', 'disappointed', 'issue', 'problem', 'error', 'failed', 'not working'];

    const positiveCount = positiveWords.filter(word => lower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lower.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Auto-follow-up scheduling
  async scheduleFollowUp(
    communicationId: number,
    delayDays: number = 7
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const comm = await this.repository.getCommunicationsByType('ticket', 1);
      const targetComm = comm.find(c => c.id === communicationId);

      if (!targetComm) {
        return { success: false, error: "Communication not found" };
      }

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + delayDays);

      await this.repository.updateCommunication(communicationId, {
        requiresFollowUp: true,
        scheduledFor: scheduledDate
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to schedule follow-up" };
    }
  }
}

export const communicationService = new CommunicationService();