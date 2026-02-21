import { NextResponse } from "next/server";
import { getAttachmentSignedUrl } from "@/app/actions/messagerie";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "path manquant" }, { status: 400 });
  }

  const decodedPath = decodeURIComponent(path);
  const url = await getAttachmentSignedUrl(decodedPath);
  if (!url) {
    return NextResponse.json({ error: "Accès refusé ou fichier introuvable" }, { status: 403 });
  }

  return NextResponse.redirect(url);
}
