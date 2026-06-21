import { NextRequest } from "next/server";
import { handlePreviewOptions, handlePreviewRequest } from "@/lib/preview-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  return handlePreviewOptions(request, params.brand);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { brand: string } }
) {
  return handlePreviewRequest(request, params.brand);
}
