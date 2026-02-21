import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|auth|_next/static|_next/image|favicon|.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|json)$).*)",
  ],
};
