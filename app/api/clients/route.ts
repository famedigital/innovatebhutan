import { NextRequest, NextResponse } from "next/server";
import { clientService } from "@/lib/services/clientService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const allClients = await clientService.listClients();

    return NextResponse.json({
      success: true,
      data: allClients,
      count: allClients.length,
    });
  } catch (error) {
    console.error("[API /api/clients] Fetch error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const body = await req.json();
    const {
      name,
      contactPerson,
      email,
      phone,
      whatsapp,
      whatsappGroupLink,
      address,
      address2,
      city,
      state,
      country,
      businessName,
      businessType,
      notes,
      active,
    } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Client name is required" },
        { status: 400 }
      );
    }

    if (email && typeof email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    const newClient = await clientService.createClient({
      name: name.trim(),
      contactPerson: contactPerson?.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      whatsapp: whatsapp?.trim(),
      whatsappGroupLink: whatsappGroupLink?.trim(),
      address: address?.trim(),
      address2: address2?.trim(),
      city: city?.trim(),
      state: state?.trim(),
      country: country?.trim(),
      businessName: businessName?.trim(),
      businessType: businessType?.trim(),
      notes: notes?.trim(),
      active: active !== undefined ? active : true,
    });

    return NextResponse.json(
      {
        success: true,
        data: newClient,
        message: "Client created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/clients] Creation error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}
