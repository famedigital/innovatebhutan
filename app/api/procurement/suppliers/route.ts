import { NextRequest, NextResponse } from "next/server";
import { procurementService } from "@/lib/services/procurementService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

// GET /api/procurement/suppliers - List suppliers
export async function GET(req: NextRequest) {
  try {
    console.log('[API /api/procurement/suppliers] GET request received');

    // Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/procurement/suppliers] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // Require admin or staff role
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/procurement/suppliers] Role check passed');

    const searchParams = req.nextUrl.searchParams;
    const filters = {
      search: searchParams.get("search") || undefined,
      city: searchParams.get("city") || undefined,
      district: searchParams.get("district") || undefined,
      isActive: searchParams.get("isActive") === "true" ? true : searchParams.get("isActive") === "false" ? false : undefined,
      isPreferred: searchParams.get("isPreferred") === "true" ? true : searchParams.get("isPreferred") === "false" ? false : undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const result = await procurementService.listSuppliers(filters);

    console.log('[API /api/procurement/suppliers] Suppliers fetched successfully:', {
      count: result.suppliers.length,
      total: result.total,
    });

    return NextResponse.json({
      success: true,
      data: result.suppliers,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: result.total,
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/procurement/suppliers] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/procurement/suppliers - Create supplier
export async function POST(req: NextRequest) {
  try {
    console.log('[API /api/procurement/suppliers] POST request received');

    // Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/procurement/suppliers] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // Require admin or staff role
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/procurement/suppliers] Role check passed');

    const body = await req.json();

    const supplier = await procurementService.createSupplier(body, authContext.user.id);

    console.log('[API /api/procurement/suppliers] Supplier created successfully:', {
      supplierId: supplier.id,
      supplierName: supplier.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Supplier created successfully",
        data: supplier,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/procurement/suppliers] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
