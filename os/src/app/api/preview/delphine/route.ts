import { NextRequest } from "next/server";
import { handlePreviewOptions, handlePreviewRequest } from "@/lib/preview-api";

/**
 * P1E: The Delphine static route is retained ONLY as a thin delegate to the
 * shared, brand-generic preview handler. It could not be removed because the
 * sandbox mount blocks file deletion. As a static segment it still serves
 * /api/preview/delphine (taking precedence over [brand]) with byte-identical
 * behaviour — both paths now run the exact same audited handler.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function OPTIONS(request: NextRequest) {
  return handlePreviewOptions(request, "delphine");
}

export async function GET(request: NextRequest) {
  return handlePreviewRequest(request, "delphine");
}
