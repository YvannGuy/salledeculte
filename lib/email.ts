import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const from =
  process.env.RESEND_FROM_EMAIL ?? "salledeculte.com <onboarding@resend.dev>";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function sendWelcomeSeekerEmail(to: string, fullName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY non configuré, email non envoyé");
    return { success: false };
  }
  const firstName = fullName?.trim().split(/\s+/)[0] || "Bonjour";
  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Bienvenue sur salledeculte.com",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;line-height:1.6;color:#333;max-width:560px;margin:0 auto;padding:24px;}a{color:#213398;text-decoration:none;}a:hover{text-decoration:underline;}.btn{display:inline-block;background:#213398;color:#fff!important;padding:12px 24px;border-radius:8px;margin:16px 0;}p{margin:0 0 1em;}</style></head>
<body>
  <h1>Bienvenue ${firstName} !</h1>
  <p>Votre compte organisateur sur <strong>salledeculte.com</strong> est créé.</p>
  <p>Vous pouvez dès maintenant rechercher des salles adaptées à vos événements cultuels en Île-de-France.</p>
  <p><a href="${siteUrl}/rechercher" class="btn">Rechercher une salle</a></p>
  <p>Bonne recherche,<br>L'équipe salledeculte.com</p>
</body>
</html>`,
  });
  return { success: !error, error: error?.message };
}

export async function sendWelcomeOwnerEmail(to: string, fullName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY non configuré, email non envoyé");
    return { success: false };
  }
  const firstName = fullName?.trim().split(/\s+/)[0] || "Bonjour";
  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Bienvenue sur salledeculte.com",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;line-height:1.6;color:#333;max-width:560px;margin:0 auto;padding:24px;}a{color:#213398;text-decoration:none;}a:hover{text-decoration:underline;}.btn{display:inline-block;background:#213398;color:#fff!important;padding:12px 24px;border-radius:8px;margin:16px 0;}p{margin:0 0 1em;}</style></head>
<body>
  <h1>Bienvenue ${firstName} !</h1>
  <p>Votre compte propriétaire sur <strong>salledeculte.com</strong> est créé.</p>
  <p>Prochaine étape : ajoutez votre salle pour recevoir des demandes de réservation.</p>
  <p><a href="${siteUrl}/onboarding/salle" class="btn">Ajouter ma salle</a></p>
  <p>À bientôt,<br>L'équipe salledeculte.com</p>
</body>
</html>`,
  });
  return { success: !error, error: error?.message };
}

export async function sendNewMessageNotification(
  to: string,
  senderName: string,
  preview: string,
  messagerieUrl: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY non configuré, email non envoyé");
    return { success: false };
  }
  const safePreview =
    preview.length > 120 ? preview.slice(0, 117) + "..." : preview;
  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Nouveau message de ${senderName} sur salledeculte.com`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;line-height:1.6;color:#333;max-width:560px;margin:0 auto;padding:24px;}a{color:#213398;text-decoration:none;}a:hover{text-decoration:underline;}.btn{display:inline-block;background:#213398;color:#fff!important;padding:12px 24px;border-radius:8px;margin:16px 0;}.preview{background:#f5f5f5;padding:12px;border-radius:8px;margin:16px 0;font-style:italic;}p{margin:0 0 1em;}</style></head>
<body>
  <h1>Nouveau message</h1>
  <p><strong>${senderName}</strong> vous a envoyé un message :</p>
  <div class="preview">${escapeHtml(safePreview)}</div>
  <p><a href="${messagerieUrl}" class="btn">Voir la discussion</a></p>
  <p>Cordialement,<br>L'équipe salledeculte.com</p>
</body>
</html>`,
  });
  return { success: !error, error: error?.message };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
