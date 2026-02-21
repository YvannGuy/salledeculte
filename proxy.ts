import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Routes protégées uniquement. /api exclu pour éviter refresh concurrent avec les route handlers.
  matcher: [
    "/dashboard/:path*",
    "/proprietaire/:path*",
    "/onboarding/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
