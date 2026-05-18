import nodemailer from 'nodemailer';

function makeTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function buildHtmlEmail({ name, email, tempPassword, courseSlug, activationUrl }) {
  const portalUrl    = process.env.STUDENT_PORTAL_URL || `${process.env.CLIENT_URL || 'http://localhost:5173'}/student`;
  const courseName   = courseSlug && courseSlug !== 'general' ? courseSlug : 'Your enrolled programme';

  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:32px auto;background:#0A192F;border-radius:16px;overflow:hidden;border:1px solid rgba(100,255,218,.12);">

    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#0A192F 0%,#112240 100%);padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(100,255,218,.15);">
        <h1 style="margin:0;color:#64FFDA;font-size:26px;font-weight:700;letter-spacing:-0.5px;">🌍 Anmel Study Abroad</h1>
        <p style="margin:8px 0 0;color:#8892b0;font-size:14px;">Learning Management System</p>
      </td>
    </tr>

    <!-- Greeting -->
    <tr>
      <td style="padding:36px 40px 0;">
        <h2 style="margin:0 0 12px;color:#ccd6f6;font-size:22px;font-weight:600;">
          Welcome aboard, ${name || 'Student'}! 🎓
        </h2>
        <p style="margin:0;color:#8892b0;font-size:15px;line-height:1.65;">
          Your LMS account has been created and you can now access your study materials, assignments, and resources.
          ${tempPassword ? 'Use the temporary password below to log in for the first time.' : 'Log in with your existing credentials.'}
        </p>
      </td>
    </tr>

    <!-- Credentials box -->
    <tr>
      <td style="padding:28px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(100,255,218,.05);border:1px solid rgba(100,255,218,.2);border-radius:12px;padding:0;">
          <tr><td style="padding:22px 24px 6px;">
            <p style="margin:0 0 4px;color:#64FFDA;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">🔐 Your Login Credentials</p>
          </td></tr>
          <tr>
            <td style="padding:6px 24px;">
              <p style="margin:0 0 2px;color:#8892b0;font-size:11px;text-transform:uppercase;letter-spacing:.8px;">Email / Username</p>
              <p style="margin:0;color:#ccd6f6;font-size:15px;font-weight:600;font-family:monospace;">${email}</p>
            </td>
          </tr>
          ${tempPassword ? `
          <tr>
            <td style="padding:12px 24px;">
              <p style="margin:0 0 2px;color:#8892b0;font-size:11px;text-transform:uppercase;letter-spacing:.8px;">Temporary Password</p>
              <p style="margin:0;color:#64FFDA;font-size:22px;font-weight:700;font-family:monospace;letter-spacing:2px;">${tempPassword}</p>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:6px 24px 22px;">
              <p style="margin:0 0 2px;color:#8892b0;font-size:11px;text-transform:uppercase;letter-spacing:.8px;">Programme</p>
              <p style="margin:0;color:#ccd6f6;font-size:14px;">${courseName}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${tempPassword ? `
    <!-- Security warning -->
    <tr>
      <td style="padding:16px 40px 0;">
        <p style="margin:0;color:#e2c07d;font-size:13px;line-height:1.5;">
          ⚠️ <strong>Important:</strong> This is a temporary password. Please change it immediately after your first login to keep your account secure.
        </p>
      </td>
    </tr>` : ''}

    ${activationUrl ? `
    <!-- Set password CTA -->
    <tr>
      <td style="padding:24px 40px 0;text-align:center;">
        <a href="${activationUrl}"
           style="display:inline-block;background:#64FFDA;color:#0A192F;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;letter-spacing:.3px;">
          Set My Password &amp; Activate Account →
        </a>
        <p style="margin:10px 0 0;color:#8892b0;font-size:12px;">This link expires in 72 hours.</p>
      </td>
    </tr>` : ''}

    <!-- Access portal CTA -->
    <tr>
      <td style="padding:20px 40px 0;text-align:center;">
        <a href="${portalUrl}"
           style="display:inline-block;border:1px solid rgba(100,255,218,.35);color:#64FFDA;text-decoration:none;font-weight:600;font-size:14px;padding:12px 32px;border-radius:8px;background:rgba(100,255,218,.06);">
          Go to Student Portal →
        </a>
      </td>
    </tr>

    <!-- Help -->
    <tr>
      <td style="padding:28px 40px 0;">
        <p style="margin:0;color:#8892b0;font-size:13px;line-height:1.65;">
          If you have any questions or need assistance, please reach out to us at
          <a href="mailto:${process.env.SMTP_USER || 'support@anmel.com'}" style="color:#64FFDA;text-decoration:none;">${process.env.SMTP_USER || 'support@anmel.com'}</a>.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:28px 40px;border-top:1px solid rgba(255,255,255,.06);margin-top:24px;">
        <p style="margin:0;color:#4a5568;font-size:12px;text-align:center;">
          © ${new Date().getFullYear()} Anmel Study Abroad. All rights reserved.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}

function buildPlainText({ name, email, tempPassword, courseSlug, activationUrl }) {
  const portalUrl = process.env.STUDENT_PORTAL_URL || `${process.env.CLIENT_URL || 'http://localhost:5173'}/student`;
  return [
    `Hello ${name || 'Student'},`,
    '',
    'Your Anmel Study Abroad LMS account has been created.',
    '',
    `Email:    ${email}`,
    tempPassword ? `Password: ${tempPassword}  (temporary — please change on first login)` : 'Use your existing credentials.',
    courseSlug && courseSlug !== 'general' ? `Course: ${courseSlug}` : null,
    activationUrl ? `\nActivate account / set password (link expires in 72h):\n${activationUrl}` : null,
    `\nStudent portal: ${portalUrl}`,
    '',
    'Anmel Study Abroad Team',
  ].filter(l => l !== null).join('\n');
}

async function sendEmailNotification({ name, email, tempPassword, courseSlug, activationUrl }) {
  const from = `"Anmel Study Abroad" <${process.env.SMTP_USER || 'noreply@anmel.com'}>`;

  if (!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)) {
    console.log('[notify][email][dry-run] LMS credentials for', email, tempPassword ? `pwd: ${tempPassword}` : '(existing user)');
    return { sent: false, dryRun: true };
  }

  await makeTransporter().sendMail({
    from,
    to:      email,
    subject: '🎓 Your Anmel LMS Account is Ready — Login Details',
    html:    buildHtmlEmail({ name, email, tempPassword, courseSlug, activationUrl }),
    text:    buildPlainText({ name, email, tempPassword, courseSlug, activationUrl }),
  });
  return { sent: true, dryRun: false };
}

async function sendSmsNotification({ phone, name, email, tempPassword }) {
  const sid  = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!phone) return { sent: false, skipped: true };
  if (!(sid && token && from)) {
    console.log('[notify][sms][dry-run]', { phone, email });
    return { sent: false, dryRun: true };
  }

  const body = `Hi ${name || 'Student'}, your Anmel LMS account is ready. Email: ${email}${tempPassword ? ` | Temp password: ${tempPassword}` : ''}. Log in at the student portal.`;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const params = new URLSearchParams({ To: phone, From: from, Body: body });
  const r = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params }
  );
  if (!r.ok) throw new Error(`SMS send failed: ${await r.text()}`);
  return { sent: true, dryRun: false };
}

export async function notifyStudentProvisioned({ name, email, phone, tempPassword, courseSlug, activationUrl }) {
  const [emailResult, smsResult] = await Promise.allSettled([
    sendEmailNotification({ name, email, tempPassword, courseSlug, activationUrl }),
    sendSmsNotification({ phone, name, email, tempPassword }),
  ]);
  return {
    emailResult: emailResult.status === 'fulfilled' ? emailResult.value : { sent: false, error: emailResult.reason?.message },
    smsResult:   smsResult.status   === 'fulfilled' ? smsResult.value   : { sent: false, error: smsResult.reason?.message },
  };
}
