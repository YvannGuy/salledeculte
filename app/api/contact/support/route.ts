import { NextResponse } from "next/server";

import { sendSupportContactEmail } from "@/lib/email";

const HELP_TYPES = new Set([
  "Recherche de salle",
  "Publier ma salle",
  "Réservation et paiement",
  "Compte et connexion",
  "Autre demande",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const helpType = String(formData.get("helpType") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !helpType || !message) {
      return NextResponse.redirect(new URL("/centre-aide?error=missing", request.url), 303);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.redirect(new URL("/centre-aide?error=email", request.url), 303);
    }
    if (!HELP_TYPES.has(helpType)) {
      return NextResponse.redirect(new URL("/centre-aide?error=type", request.url), 303);
    }

    const result = await sendSupportContactEmail({
      name,
      email,
      helpType,
      message,
    });

    if (!result.success) {
      return NextResponse.redirect(new URL("/centre-aide?error=send", request.url), 303);
    }

    return NextResponse.redirect(new URL("/centre-aide?sent=1", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/centre-aide?error=server", request.url), 303);
  }
}
