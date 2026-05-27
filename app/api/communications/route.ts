/**
 * 📞 COMMUNICATION API ROUTES
 * REST API for unified client communications
 */

import { NextRequest, NextResponse } from "next/server";
import { communicationService } from "@/lib/services/communicationService";

/**
 * GET /api/communications
 * Get communications with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');

    let communications;

    if (clientId) {
      communications = await communicationService.getClientCommunications(parseInt(clientId));
    } else if (type === 'scheduled') {
      communications = await communicationService.getScheduledCommunications();
    } else if (type === 'follow-up') {
      communications = await communicationService.getCommunicationsRequiringFollowUp();
    } else if (type) {
      communications = await communicationService.repository?.getCommunicationsByType(type);
    } else {
      communications = await communicationService.repository?.getCommunicationsRequiringFollowUp();
    }

    return NextResponse.json({
      success: true,
      data: communications || [],
      count: communications?.length || 0
    });
  } catch (error) {
    console.error("API error fetching communications:", error);
    return NextResponse.json(
      { error: "Failed to fetch communications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/communications
 * Create new communication with AI sentiment analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // AI sentiment analysis
    const sentiment = await communicationService.analyzeSentiment(body.content);

    const communicationData = {
      ...body,
      sentiment
    };

    const result = await communicationService.createCommunication(communicationData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      aiSentiment: sentiment,
      message: "Communication logged successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("API error creating communication:", error);
    return NextResponse.json(
      { error: "Failed to create communication" },
      { status: 500 }
    );
  }
}