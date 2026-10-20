import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxy";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return proxyToBackend(req, `/role/${id}/permissions`, {
    method: "PUT",
    requiredRole: "admin",
  });
}
