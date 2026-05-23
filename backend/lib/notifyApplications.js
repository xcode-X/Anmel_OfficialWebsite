/**
 * Application notification emails — sent via Resend (or SMTP fallback).
 * Covers: contact inquiries, scholarship applications, student registrations.
 */
import { sendEmail } from './mailer.js';

const SITE_NAME = 'Anmel Study Abroad';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || '';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function year() { return new Date().getFullYear(); }

function footer() {
  return `
    <tr>
      <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,.06);text-align:center;">
        <p style="margin:0;color:#4a5568;font-size:12px;">© ${year()} ${SITE_NAME}. All rights reserved.</p>
      </td>
    </tr>`;
}

function header(title, subtitle = '') {
  return `
    <tr>
      <td style="background:linear-gradient(135deg,#0A192F 0%,#112240 100%);padding:40px;text-align:center;border-bottom:1px solid rgba(100,255,218,.15);">
        <h1 style="margin:0;color:#64FFDA;font-size:26px;font-weight:700;">🌍 ${SITE_NAME}</h1>
        ${subtitle ? `<p style="margin:8px 0 0;color:#8892b0;font-size:14px;">${subtitle}</p>` : ''}
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px 0;">
        <h2 style="margin:0;color:#ccd6f6;font-size:20px;font-weight:600;">${title}</h2>
      </td>
    </tr>`;
}

function wrap(rows) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="max-width:600px;margin:32px auto;background:#0A192F;border-radius:16px;overflow:hidden;border:1px solid rgba(100,255,218,.12);">
    ${rows}
  </table>
</body></html>`;
}

function infoRow(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:4px 0;color:#8892b0;font-size:13px;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:4px 0;color:#ccd6f6;font-size:13px;">${value}</td>
  </tr>`;
}

// ─── Contact Inquiry ──────────────────────────────────────────────────────────

/** Email to the person who submitted the inquiry */
export async function sendContactConfirmation({ name, email, subject, message, company, phone }) {
  const html = wrap(`
    ${header('Thank you for reaching out! ✉️', 'Contact Form')}
    <tr><td style="padding:20px 40px 0;">
      <p style="margin:0;color:#8892b0;font-size:15px;line-height:1.65;">
        Hi <strong style="color:#ccd6f6;">${name}</strong>,<br/><br/>
        We've received your message and a member of our team will get back to you within 1–2 business days.
      </p>
    </td></tr>
    <tr><td style="padding:24px 40px 0;">
      <div style="background:rgba(100,255,218,.05);border:1px solid rgba(100,255,218,.15);border-radius:12px;padding:20px 24px;">
        <p style="margin:0 0 12px;color:#64FFDA;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Your Message</p>
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Subject:', subject || 'General Inquiry')}
          ${company ? infoRow('Company:', company) : ''}
          ${phone ? infoRow('Phone:', phone) : ''}
        </table>
        <p style="margin:12px 0 0;color:#8892b0;font-size:13px;line-height:1.6;white-space:pre-line;">${message}</p>
      </div>
    </td></tr>
    <tr><td style="padding:20px 40px 32px;">
      <p style="margin:0;color:#8892b0;font-size:13px;">
        Questions? Reply to this email or contact us at
        <a href="mailto:info@anmel.com" style="color:#64FFDA;text-decoration:none;">info@anmel.com</a>.
      </p>
    </td></tr>
    ${footer()}
  `);

  return sendEmail({
    to: email,
    subject: `We received your inquiry — ${SITE_NAME}`,
    html,
    text: `Hi ${name},\n\nThank you for contacting ${SITE_NAME}. We'll respond within 1–2 business days.\n\nYour message:\n${message}\n\n— ${SITE_NAME} Team`,
  });
}

/** Internal alert to admin when a new contact arrives */
export async function sendContactAdminAlert({ name, email, subject, message, company, phone }) {
  if (!ADMIN_EMAIL) return { sent: false, skipped: true };
  const html = wrap(`
    ${header('📬 New Contact Inquiry')}
    <tr><td style="padding:20px 40px 0;">
      <div style="background:rgba(100,255,218,.05);border:1px solid rgba(100,255,218,.15);border-radius:12px;padding:20px 24px;">
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Name:', name)}
          ${infoRow('Email:', `<a href="mailto:${email}" style="color:#64FFDA;">${email}</a>`)}
          ${company ? infoRow('Company:', company) : ''}
          ${phone ? infoRow('Phone:', phone) : ''}
          ${infoRow('Subject:', subject || 'General Inquiry')}
        </table>
        <p style="margin:16px 0 0;color:#8892b0;font-size:13px;line-height:1.6;white-space:pre-line;">${message}</p>
      </div>
    </td></tr>
    ${footer()}
  `);
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[New Inquiry] ${name} — ${subject || 'Contact Form'}`,
    html,
    text: `New contact from ${name} (${email}):\n\n${message}`,
  });
}

// ─── Scholarship Application ──────────────────────────────────────────────────

/** Confirmation to the applicant */
export async function sendScholarshipConfirmation({
  name, email, scholarshipTitle, university, country, course, degreeLevel,
}) {
  const html = wrap(`
    ${header('Application Received! 🎓', 'Scholarship Programme')}
    <tr><td style="padding:20px 40px 0;">
      <p style="margin:0;color:#8892b0;font-size:15px;line-height:1.65;">
        Hi <strong style="color:#ccd6f6;">${name}</strong>,<br/><br/>
        Thank you for applying. Your scholarship application has been received and is currently
        <strong style="color:#64FFDA;">under review</strong>.
        The selection committee will contact you with further updates.
      </p>
    </td></tr>
    <tr><td style="padding:24px 40px 0;">
      <div style="background:rgba(100,255,218,.05);border:1px solid rgba(100,255,218,.15);border-radius:12px;padding:20px 24px;">
        <p style="margin:0 0 12px;color:#64FFDA;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Application Summary</p>
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Scholarship:', scholarshipTitle || 'N/A')}
          ${infoRow('University:', university || 'N/A')}
          ${country ? infoRow('Country:', country) : ''}
          ${course ? infoRow('Course:', course) : ''}
          ${degreeLevel ? infoRow('Degree Level:', degreeLevel) : ''}
        </table>
      </div>
    </td></tr>
    <tr><td style="padding:20px 40px 32px;">
      <p style="margin:0;color:#8892b0;font-size:13px;">
        We typically process applications within 5–10 business days. If you have questions, email us at
        <a href="mailto:scholarships@anmel.com" style="color:#64FFDA;text-decoration:none;">scholarships@anmel.com</a>.
      </p>
    </td></tr>
    ${footer()}
  `);

  return sendEmail({
    to: email,
    subject: `Application Received — ${scholarshipTitle || 'Scholarship'} | ${SITE_NAME}`,
    html,
    text: `Hi ${name},\n\nYour application for "${scholarshipTitle}" has been received and is under review.\n\nUniversity: ${university}\nCourse: ${course}\nDegree: ${degreeLevel}\n\n— ${SITE_NAME} Team`,
  });
}

/** Internal alert to admin when a scholarship application arrives */
export async function sendScholarshipAdminAlert({
  name, email, phone, scholarshipTitle, university, course, degreeLevel, country,
}) {
  if (!ADMIN_EMAIL) return { sent: false, skipped: true };
  const html = wrap(`
    ${header('📋 New Scholarship Application')}
    <tr><td style="padding:20px 40px 0;">
      <div style="background:rgba(100,255,218,.05);border:1px solid rgba(100,255,218,.15);border-radius:12px;padding:20px 24px;">
        <p style="margin:0 0 12px;color:#64FFDA;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Applicant Details</p>
        <table style="width:100%;border-collapse:collapse;">
          ${infoRow('Name:', name)}
          ${infoRow('Email:', `<a href="mailto:${email}" style="color:#64FFDA;">${email}</a>`)}
          ${phone ? infoRow('Phone:', phone) : ''}
          ${infoRow('Scholarship:', scholarshipTitle)}
          ${infoRow('University:', university)}
          ${country ? infoRow('Country:', country) : ''}
          ${course ? infoRow('Course:', course) : ''}
          ${degreeLevel ? infoRow('Degree Level:', degreeLevel) : ''}
        </table>
      </div>
    </td></tr>
    ${footer()}
  `);
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[New Application] ${name} — ${scholarshipTitle}`,
    html,
    text: `New scholarship application from ${name} (${email}) for "${scholarshipTitle}" at ${university}.`,
  });
}

// ─── Student Registration ─────────────────────────────────────────────────────

/** Confirmation to a student who submitted a general registration */
export async function sendStudentRegistrationConfirmation({ name, email, course, university }) {
  const html = wrap(`
    ${header('Application Received! 📚', 'Student Admissions')}
    <tr><td style="padding:20px 40px 32px;">
      <p style="margin:0;color:#8892b0;font-size:15px;line-height:1.65;">
        Hi <strong style="color:#ccd6f6;">${name}</strong>,<br/><br/>
        Thank you for submitting your application to ${SITE_NAME}.
        ${university ? `You have applied to <strong style="color:#ccd6f6;">${university}</strong>` : ''}
        ${course ? ` for <strong style="color:#ccd6f6;">${course}</strong>` : ''}.
        <br/><br/>
        Our admissions team will review your application and contact you within 5–7 business days.
      </p>
    </td></tr>
    ${footer()}
  `);
  return sendEmail({
    to: email,
    subject: `Application Received — ${SITE_NAME}`,
    html,
    text: `Hi ${name},\n\nYour application has been received. We'll review it and contact you within 5–7 business days.\n\n— ${SITE_NAME} Team`,
  });
}
