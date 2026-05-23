/**
 * Centralised email sender — uses Resend when RESEND_API_KEY is set,
 * falls back to SMTP/nodemailer otherwise, and dry-runs when neither is configured.
 */
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Anmel Study Abroad';
const FROM_ADDR = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'noreply@anmel.com';

export function getFrom() {
  return `"${FROM_NAME}" <${FROM_ADDR}>`;
}

function isResendConfigured() {
  return !!process.env.RESEND_API_KEY?.trim();
}

function isSmtpConfigured() {
  return !!(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
}

export function isEmailConfigured() {
  return isResendConfigured() || isSmtpConfigured();
}

/** Send via Resend */
async function sendViaResend({ to, subject, html, text }) {
  const resend = new Resend(process.env.RESEND_API_KEY.trim());
  const { data, error } = await resend.emails.send({
    from: getFrom(),
    to,
    subject,
    html,
    text,
  });
  if (error) throw new Error(error.message || JSON.stringify(error));
  console.log('[mailer][resend] Sent to', to, '— id:', data?.id);
  return { sent: true, provider: 'resend', id: data?.id };
}

/** Send via SMTP (nodemailer fallback) */
async function sendViaSmtp({ to, subject, html, text }) {
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({ from: getFrom(), to, subject, html, text });
  console.log('[mailer][smtp] Sent to', to);
  return { sent: true, provider: 'smtp' };
}

/**
 * Primary send function.
 * Priority: Resend → SMTP → dry-run.
 * Returns { sent, provider?, dryRun?, error? }
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!to || !subject) {
    return { sent: false, dryRun: true, error: 'Missing to/subject' };
  }

  if (isResendConfigured()) {
    try {
      return await sendViaResend({ to, subject, html, text });
    } catch (err) {
      console.error('[mailer][resend] Failed:', err.message);
      // Fall through to SMTP if available
      if (isSmtpConfigured()) {
        try {
          return await sendViaSmtp({ to, subject, html, text });
        } catch (smtpErr) {
          console.error('[mailer][smtp] Fallback also failed:', smtpErr.message);
          return { sent: false, provider: 'resend+smtp', error: smtpErr.message };
        }
      }
      return { sent: false, provider: 'resend', error: err.message };
    }
  }

  if (isSmtpConfigured()) {
    try {
      return await sendViaSmtp({ to, subject, html, text });
    } catch (err) {
      console.error('[mailer][smtp] Failed:', err.message);
      return { sent: false, provider: 'smtp', error: err.message };
    }
  }

  console.warn('[mailer] No email provider configured. Set RESEND_API_KEY in backend/.env');
  return { sent: false, dryRun: true, error: 'Email service not configured' };
}
