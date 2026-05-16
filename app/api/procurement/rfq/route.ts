import { NextRequest, NextResponse } from "next/server";
import { procurementService } from "@/lib/services/procurementService";
import { procurementRepository } from "@/lib/repositories/procurementRepository";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

// GET /api/procurement/rfq - List RFQs
export async function GET(req: NextRequest) {
  try {
    console.log('[API /api/procurement/rfq] GET request received');

    // Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/procurement/rfq] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // Require admin or staff role
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/procurement/rfq] Role check passed');

    const searchParams = req.nextUrl.searchParams;
    const filters = {
      status: searchParams.get("status") || undefined,
      projectId: searchParams.get("projectId") ? parseInt(searchParams.get("projectId")!) : undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const result = await procurementService.listRFQs(filters);

    console.log('[API /api/procurement/rfq] RFQs fetched successfully:', {
      count: result.rfqs.length,
      total: result.total,
    });

    return NextResponse.json({
      success: true,
      data: result.rfqs,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: result.total,
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/procurement/rfq] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/procurement/rfq - Create RFQ
export async function POST(req: NextRequest) {
  try {
    console.log('[API /api/procurement/rfq] POST request received');

    // Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/procurement/rfq] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // Require admin or staff role
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/procurement/rfq] Role check passed');

    const body = await req.json();

    // Create RFQ
    const rfq = await procurementService.createRFQ(body, authContext.user.id);

    // Add suppliers to RFQ
    if (body.suppliers && body.suppliers.length > 0) {
      for (const supplier of body.suppliers) {
        await procurementRepository.addSupplierToRFQ({
          rfqId: rfq.id,
          supplierId: supplier.supplierId,
          status: "pending",
        });
      }
    }

    // Add items to RFQ
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        await procurementRepository.addRFQItem({
          rfqId: rfq.id,
          itemId: item.itemId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          specifications: item.specifications,
          estimatedCost: item.estimatedCost,
        });
      }
    }

    console.log('[API /api/procurement/rfq] RFQ created successfully:', {
      rfqId: rfq.id,
      rfqNumber: rfq.rfqNumber,
    });

    return NextResponse.json(
      {
        success: true,
        message: "RFQ created successfully",
        data: rfq,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/procurement/rfq] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
