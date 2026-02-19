import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Exécute le proxy uniquement sur les routes qui nécessitent l'auth Supabase
  matcher: ["/dashboard/:path*"],
};
