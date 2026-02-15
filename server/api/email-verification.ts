import { Router } from "express";
import admin from "firebase-admin";
import { Resend } from "resend";

const router = Router();

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[Email] RESEND_API_KEY not set in .env");
    return null;
  }
  return new Resend(apiKey);
}

// ─── Send welcome / verification email ───────────────────
router.post("/send-verification", async (req, res) => {
  try {
    const { email, displayName } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate Firebase verification link
    const actionCodeSettings = {
      url: "https://ymovies.yerradouani.me/verify-success",
      handleCodeInApp: true,
    };

    let verificationLink: string;
    try {
      verificationLink = await admin
        .auth()
        .generateEmailVerificationLink(email, actionCodeSettings);
    } catch (err) {
      console.error("[Email Verification] Failed to generate link:", err);
      return res.status(500).json({ error: "Failed to generate verification link" });
    }

    // Send via Resend
    const resend = getResend();
    if (!resend) {
      return res.status(500).json({ error: "Email service not configured" });
    }

    const firstName = displayName ? displayName.split(" ")[0] : "there";

    const { data, error } = await resend.emails.send({
      from: "YMovies <onboarding@ymovies.yerradouani.me>",
      to: [email],
      subject: "Welcome to YMovies! Verify your email",
      html: buildEmailTemplate({ firstName, verificationLink }),
    });

    if (error) {
      console.error("[Email Verification] Resend error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    console.log(`[Email Verification] Sent to ${email} (id: ${data?.id})`);
    res.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error("[Email Verification] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function buildEmailTemplate({ firstName, verificationLink }: { firstName: string; verificationLink: string }) {
  return buildBaseTemplate({
    title: "Verify your email address",
    greeting: `Hey ${firstName},`,
    body: "Thanks for signing up for YMovies. To get started, please verify your email address by clicking the button below.",
    ctaText: "Verify Email Address",
    ctaLink: verificationLink,
    footer: "If you didn't create a YMovies account, you can safely ignore this email. This link will expire in 24 hours.",
  });
}

// ─── Send password reset email ───────────────────────────
router.post("/send-password-reset", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate Firebase password reset link
    const actionCodeSettings = {
      url: "https://ymovies.yerradouani.me/auth/action",
      handleCodeInApp: false,
    };

    let resetLink: string;
    try {
      resetLink = await admin
        .auth()
        .generatePasswordResetLink(email, actionCodeSettings);
    } catch (err: any) {
      // If user not found, still return success to prevent email enumeration
      if (err.code === "auth/user-not-found") {
        return res.json({ success: true });
      }
      console.error("[Password Reset] Failed to generate link:", err);
      return res.status(500).json({ error: "Failed to generate reset link" });
    }

    const resend = getResend();
    if (!resend) {
      return res.status(500).json({ error: "Email service not configured" });
    }

    const { data, error } = await resend.emails.send({
      from: "YMovies <onboarding@ymovies.yerradouani.me>",
      to: [email],
      subject: "Reset your YMovies password",
      html: buildPasswordResetTemplate({ resetLink }),
    });

    if (error) {
      console.error("[Password Reset] Resend error:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }

    console.log(`[Password Reset] Sent to ${email} (id: ${data?.id})`);
    res.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error("[Password Reset] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function buildPasswordResetTemplate({ resetLink }: { resetLink: string }) {
  return buildBaseTemplate({
    title: "Reset your password",
    greeting: "Hi,",
    body: "We received a request to reset your YMovies password. Click the button below to choose a new password.",
    ctaText: "Reset Password",
    ctaLink: resetLink,
    footer: "If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged. This link will expire in 1 hour.",
  });
}

// ─── Shared email template ───────────────────────────────
interface EmailTemplateProps {
  title: string;
  greeting: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  footer: string;
}

function buildBaseTemplate({ title, greeting, body, ctaText, ctaLink, footer }: EmailTemplateProps) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:40px 40px 24px;">
              <span style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">YMovies</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 8px;">
              <h1 style="margin:0;font-size:22px;font-weight:600;color:#ffffff;line-height:1.3;">
                ${title}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#a1a1a1;">
                ${greeting}
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#a1a1a1;">
                ${body}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#dc2626;border-radius:8px;">
                    <a href="${ctaLink}"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#666666;">
                If the button above doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:8px 0 0;font-size:13px;line-height:1.5;word-break:break-all;">
                <a href="${ctaLink}" style="color:#dc2626;text-decoration:underline;">${ctaLink}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #1a1a1a;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:#525252;">
                ${footer}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 40px 40px;">
              <p style="margin:0;font-size:12px;color:#404040;">
                &copy; ${new Date().getFullYear()} YMovies &middot; Built by
                <a href="https://yerradouani.me" style="color:#666666;text-decoration:underline;">Yassine Erradouani</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default router;
