import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

// Normalise SUPABASE_URL — strip ALL whitespace (hidden chars from copy-paste),
// add https:// if user pasted the bare domain
function normaliseUrl(raw: string): string {
  // Remove every whitespace/control character, not just leading/trailing
  const s = raw.replace(/\s/g, "").replace(/[^\x20-\x7E]/g, "").replace(/\/+$/, "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}
// VITE_SUPABASE_URL is already a verified plain env var — use it as primary source.
// SUPABASE_URL secret is accepted as an override only if VITE_SUPABASE_URL is absent.
const SUPABASE_URL         = normaliseUrl(
  process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"] ?? ""
);
const SUPABASE_SERVICE_KEY = (process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "").trim();
const RESEND_API_KEY       = (process.env["RESEND_API_KEY"]           ?? "").trim();
const FROM_EMAIL           = (process.env["NOTIFY_FROM_EMAIL"]        ?? "onboarding@resend.dev").trim();
const APP_NAME                = "كُتُبي";

// ── Email HTML builder ────────────────────────────────────────────────────────
function buildHtml({
  senderName,
  bookTitle,
  messagePreview,
  chatUrl,
}: {
  senderName: string;
  bookTitle: string;
  messagePreview: string;
  chatUrl: string;
}) {
  return /* html */ `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>رسالة جديدة على كُتُبي</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Tahoma,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:32px 40px;text-align:right;">
            <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">📚 كُتُبي</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;">منصة تبادل الكتب المدرسية</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;">
              💬 لديك رسالة جديدة!
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
              أرسل إليك <strong style="color:#0f172a;">${senderName}</strong>
              رسالة بخصوص كتابك
              <strong style="color:#0d9488;">"${bookTitle}"</strong>
            </p>

            <!-- Message bubble -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-right:4px solid #0d9488;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
              <div style="font-size:11px;font-weight:600;color:#94a3b8;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">محتوى الرسالة</div>
              <p style="margin:0;font-size:15px;color:#334155;line-height:1.7;">${messagePreview}${messagePreview.length >= 120 ? "..." : ""}</p>
            </div>

            <!-- CTA button -->
            <div style="text-align:right;margin-bottom:32px;">
              <a href="${chatUrl}"
                 style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;box-shadow:0 4px 12px rgba(13,148,136,.35);">
                رد على الرسالة ←
              </a>
            </div>

            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;" />

            <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
              وصلتك هذه الرسالة لأنك مسجّل كبائع على منصة كُتُبي.
              إذا لم تنشر هذا الكتاب، تجاهل هذه الرسالة.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              ${APP_NAME} · منصة تبادل الكتب المدرسية في مصر
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Route ─────────────────────────────────────────────────────────────────────
// Validate SUPABASE_URL once at module load so we catch bad values early
let supabaseUrlValid = false;
try {
  if (SUPABASE_URL) {
    new URL(SUPABASE_URL);
    supabaseUrlValid = true;
  }
} catch {
  logger.error(
    { urlLength: SUPABASE_URL.length, urlPrefix: SUPABASE_URL.slice(0, 8) },
    "SUPABASE_URL secret is not a valid URL — check the value in Replit Secrets"
  );
}

router.post("/notify-seller", async (req, res) => {
  // Silently succeed if not configured — don't block the user's chat flow
  if (!RESEND_API_KEY || !SUPABASE_SERVICE_KEY || !SUPABASE_URL || !supabaseUrlValid) {
    logger.info({ supabaseUrlValid, hasResend: !!RESEND_API_KEY, hasServiceKey: !!SUPABASE_SERVICE_KEY },
      "notify-seller: skipped (not configured or invalid URL)");
    return res.json({ ok: false, reason: supabaseUrlValid ? "not_configured" : "invalid_supabase_url" });
  }

  const { recipientId, senderName, bookTitle, messagePreview, chatUrl } =
    req.body as {
      recipientId: string;
      senderName: string;
      bookTitle: string;
      messagePreview: string;
      chatUrl: string;
    };

  if (!recipientId) {
    return res.status(400).json({ ok: false, reason: "missing recipientId" });
  }

  try {
    // 1. Get recipient email from Supabase auth admin API
    const userRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users/${recipientId}`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!userRes.ok) {
      logger.warn({ recipientId, status: userRes.status }, "Supabase admin user fetch failed");
      return res.json({ ok: false, reason: "user_not_found" });
    }

    const userData = await userRes.json() as { email?: string };
    const recipientEmail = userData.email;

    if (!recipientEmail) {
      return res.json({ ok: false, reason: "no_email" });
    }

    // 2. Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [recipientEmail],
        subject: `📚 رسالة جديدة من ${senderName} على كُتُبي`,
        html: buildHtml({ senderName, bookTitle, messagePreview, chatUrl }),
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      logger.error({ errText }, "Resend API error");
      return res.json({ ok: false, reason: "resend_error" });
    }

    logger.info({ recipientEmail, bookTitle }, "Notification email sent");
    return res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "notify-seller unexpected error");
    return res.json({ ok: false, reason: "internal_error" });
  }
});

export default router;
