import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";

// GET /api/clients - List all clients
export async function GET() {
  try {
    let allClients: Array<{
      id: number;
      name: string;
      active?: boolean | null;
      logoUrl?: string | null;
    }> = [];

    try {
      allClients = await db
        .select({
          id: clients.id,
          name: clients.name,
          active: clients.active,
          logoUrl: clients.logoUrl,
        })
        .from(clients)
        .orderBy(clients.name);
    } catch (queryError) {
      // Backward compatibility for older schemas missing logo_url.
      const message = queryError instanceof Error ? queryError.message : "";
      if (!message.includes('column "logo_url" does not exist')) {
        throw queryError;
      }

      allClients = await db
        .select({
          id: clients.id,
          name: clients.name,
          active: clients.active,
        })
        .from(clients)
        .orderBy(clients.name);
    }

    return NextResponse.json({
      success: true,
      data: allClients,
    });
  } catch (error) {
    console.error("Clients fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: "Client name is required" },
        { status: 400 }
      );
    }

    const [newClient] = await db
      .insert(clients)
      .values({ name: name.trim() })
      .returning();

    return NextResponse.json({
      success: true,
      data: newClient,
    }, { status: 201 });
  } catch (error) {
    console.error("Client creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create client" },
      { status: 500 }
    );
  }
}
