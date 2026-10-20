import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(req, `/user/${id}/role`, {
    method: "PUT",
    requiredRole: "admin",
  });
}
