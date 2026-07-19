import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validations/validation";
import {
  createInvoiceTemplateSchema,
  productKeySchema,
} from "@/lib/validations/invoiceTemplate";
import { invoiceTemplateService } from "@/lib/services/invoiceTemplateService";
import type { ProductKey } from "@/lib/invoices/templateDefaults";

export async function GET(req: NextRequest) {
  try {
    await requireApiAuth(req).then((c) => requireStaffOrAdmin(c.profile));
    const product = productKeySchema.parse(
      req.nextUrl.searchParams.get("product") || "rancelab"
    ) as ProductKey;
    const activeOnly = req.nextUrl.searchParams.get("active") === "true";

    if (activeOnly) {
      const active = await invoiceTemplateService.getActiveOrSeed(product);
      return NextResponse.json({ success: true, data: active });
    }

    const list = await invoiceTemplateService.list(product);
    if (list.length === 0) {
      const seeded = await invoiceTemplateService.getActiveOrSeed(product);
      return NextResponse.json({ success: true, data: [seeded] });
    }
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    const status = isApiError(error)
      ? (error as { statusCode: number }).statusCode
      : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiAuth(req);
    requireStaffOrAdmin(auth.profile);
    const body = await req.json();
    const validated = validateRequest(createInvoiceTemplateSchema, body);
    const created = await invoiceTemplateService.createVersion({
      ...validated,
      createdBy: auth.profile.userId,
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    const status = isApiError(error)
      ? (error as { statusCode: number }).statusCode
      : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}
