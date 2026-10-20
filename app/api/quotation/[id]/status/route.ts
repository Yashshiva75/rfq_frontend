import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(req, `/quotation/${id}/status`, { method: "PATCH" });
}
