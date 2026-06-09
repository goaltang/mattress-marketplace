import { NextRequest } from "next/server";

const DEVICE_ID_COOKIE = "device_id";

export function getDeviceIdFromCookie(request: NextRequest): string | null {
  return request.cookies.get(DEVICE_ID_COOKIE)?.value || null;
}

export function requireDeviceId(request: NextRequest): string | {
  error: Response;
} {
  const deviceId = getDeviceIdFromCookie(request);
  if (!deviceId) {
    return {
      error: new Response(JSON.stringify({ success: false, error: "Unauthorized: missing device_id" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return deviceId;
}
