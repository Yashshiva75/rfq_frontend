import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/v1";

/**
 * Clean proxy utility forwarding requests from Next.js API Route Handlers to the Express backend.
 */
export async function proxyToBackend(
  req: NextRequest,
  backendPath: string,
  options?: {
    method?: string;
    overrideBody?: any;
    isFormData?: boolean;
    requiredRole?: string | string[];
  }
) {
  try {
    const url = new URL(req.url);
    const targetUrl = new URL(`${BACKEND_BASE_URL}${backendPath}`);

    // Forward query search parameters
    url.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value);
    });

    const headers: Record<string, string> = {};

    // Forward authorization header or cookie
    const authHeader =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      req.cookies.get("auth_token")?.value;

    if (authHeader) {
      headers["Authorization"] = authHeader.startsWith("Bearer ")
        ? authHeader
        : `Bearer ${authHeader}`;
    }

    // Role-based authorization guard
    if (options?.requiredRole) {
      const allowedRoles = (
        Array.isArray(options.requiredRole)
          ? options.requiredRole
          : [options.requiredRole]
      ).map((r) => r.toLowerCase().trim());

      let userRole =
        req.cookies.get("user_role")?.value?.toLowerCase() || "";

      if (!userRole && authHeader) {
        try {
          const rawToken = authHeader.replace("Bearer ", "");
          const payloadPart = rawToken.split(".")[1];
          if (payloadPart) {
            const decoded = JSON.parse(atob(payloadPart));
            userRole = (
              decoded.roles?.[0] ||
              decoded.role ||
              ""
            ).toLowerCase();
          }
        } catch {}
      }

      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.json(
          {
            status: "error",
            message: `Forbidden: Access requires role: ${allowedRoles.join(", ")}`,
          },
          { status: 403 }
        );
      }
    }

    const method = options?.method || req.method;
    let body: any = undefined;

    if (method !== "GET" && method !== "HEAD") {
      if (options?.overrideBody !== undefined) {
        body =
          typeof options.overrideBody === "string"
            ? options.overrideBody
            : JSON.stringify(options.overrideBody);
        headers["Content-Type"] = "application/json";
      } else if (options?.isFormData) {
        body = await req.formData();
      } else {
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const jsonBody = await req.json().catch(() => null);
          if (jsonBody) {
            body = JSON.stringify(jsonBody);
            headers["Content-Type"] = "application/json";
          }
        } else if (contentType.includes("multipart/form-data")) {
          body = await req.formData();
        } else {
          const rawText = await req.text().catch(() => null);
          if (rawText) {
            body = rawText;
            if (contentType) headers["Content-Type"] = contentType;
          }
        }
      }
    }

    const backendRes = await fetch(targetUrl.toString(), {
      method,
      headers,
      body,
    });

    const data = await backendRes.json().catch(() => null);

    if (!data) {
      return NextResponse.json(
        {
          status: "error",
          message:
            backendRes.statusText || `Backend responded with HTTP ${backendRes.status}`,
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    console.error(`[Proxy Error] ${backendPath}:`, error);
    return NextResponse.json(
      {
        status: "error",
        message:
          error.message ||
          `Failed to communicate with backend service at ${BACKEND_BASE_URL}`,
      },
      { status: 502 }
    );
  }
}
