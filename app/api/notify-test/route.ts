import { Resend } from "resend";

export const runtime = "nodejs";

const reqEnv = (k: string) => {
  const v = process.env[k];
  if (!v?.trim()) throw new Error(`Missing env: ${k}`);
  return v.trim();
};

/** Test béton : 1 email Resend + 1 message Telegram. À appeler en prod pour vérifier env / domaine / token. */
export async function GET() {
  const correlationId = crypto.randomUUID();

  try {
    const resend = new Resend(reqEnv("RESEND_API_KEY"));
    const from =
      process.env.RESEND_FROM_EMAIL?.trim() ||
      "salledeculte.com <onboarding@resend.dev>";
    const to = reqEnv("RESEND_TO_TEST");

    const email = await resend.emails.send({
      from,
      to: [to],
      subject: `Notify test ${correlationId}`,
      html: `<p>OK - ${correlationId}</p>`,
    });

    const botToken = reqEnv("TELEGRAM_BOT_TOKEN");
    const chatId =
      process.env.TELEGRAM_CHAT_ID?.trim() ||
      process.env.TELEGRAM_ADMIN_CHAT_ID?.trim() ||
      (process.env.TELEGRAM_ADMIN_CHAT_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean)[0];
    if (!chatId) throw new Error("Missing env: TELEGRAM_CHAT_ID or TELEGRAM_ADMIN_CHAT_ID(S)");

    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Notify test OK - ${correlationId}`,
        }),
      }
    );
    const tgBody = await tgRes.text();

    return Response.json({
      ok: true,
      correlationId,
      email,
      telegram: { status: tgRes.status, body: tgBody.slice(0, 500) },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json(
      { ok: false, correlationId, error: message },
      { status: 500 }
    );
  }
}
