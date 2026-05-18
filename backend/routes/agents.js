import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Agent from '../models/Agent.js';
import { authMiddleware, adminOnly, signToken } from '../middleware/auth.js';
import { isDbConnected } from '../lib/dbReady.js';

const router = Router();

// ── SSE listeners ─────────────────────────────────────────────────────────────
const listeners = new Set();

function emitAgentChanged() {
  const payload = JSON.stringify({ event: 'changed', ts: Date.now() });
  for (const client of listeners) {
    client.write(`data: ${payload}\n\n`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'intelera-secret-change-in-production';

function generateAgentCode() {
  const random    = crypto.randomBytes(3).toString('hex').toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-3);
  return `AGT-${random}${timestamp}`;
}

function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
  let pass = '';
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

function makeTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendApprovalEmail(agent, tempPassword, agentCode) {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await makeTransporter().sendMail({
      from:    `"Anmel Study Abroad" <${process.env.SMTP_USER || 'noreply@anmel.com'}>`,
      to:      agent.email,
      subject: '🎉 Your Agent Application is Approved — Login Credentials',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0A192F;color:#e2e8f0;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0A192F,#112240);padding:40px;text-align:center;border-bottom:1px solid rgba(100,255,218,.2);">
            <h1 style="color:#64FFDA;font-size:28px;margin:0;">🌍 Anmel Study Abroad</h1>
            <p style="color:#94a3b8;margin-top:8px;">Agent Partnership Program</p>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#64FFDA;margin-top:0;">Congratulations, ${agent.fullName}!</h2>
            <p>Your agent application has been reviewed and <strong style="color:#64FFDA;">approved</strong>. Welcome to the Anmel Agent Network!</p>
            <div style="background:rgba(100,255,218,.05);border:1px solid rgba(100,255,218,.2);border-radius:12px;padding:24px;margin:24px 0;">
              <h3 style="color:#64FFDA;margin-top:0;">🔐 Your Login Credentials</h3>
              <table style="width:100%;">
                <tr><td style="color:#94a3b8;padding:4px 0;">Agent Code:</td><td style="color:#fff;font-weight:bold;">${agentCode}</td></tr>
                <tr><td style="color:#94a3b8;padding:4px 0;">Email:</td><td style="color:#fff;">${agent.email}</td></tr>
                <tr><td style="color:#94a3b8;padding:4px 0;">Temporary Password:</td><td style="color:#64FFDA;font-weight:bold;font-size:18px;">${tempPassword}</td></tr>
              </table>
            </div>
            <p style="color:#94a3b8;font-size:14px;">⚠️ Please log in and change your password immediately for security purposes.</p>
            <div style="text-align:center;margin-top:32px;">
              <a href="${clientUrl}/agent-portal" style="background:#64FFDA;color:#0A192F;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Access Your Agent Portal →</a>
            </div>
          </div>
          <div style="padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,.05);color:#475569;font-size:12px;">
            <p>© 2025 Anmel Study Abroad. All rights reserved.</p>
          </div>
        </div>`,
    });
  } catch (err) {
    console.warn('[agents] Approval email failed (non-fatal):', err.message);
  }
}

async function sendRejectionEmail(agent, reason) {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await makeTransporter().sendMail({
      from:    `"Anmel Study Abroad" <${process.env.SMTP_USER || 'noreply@anmel.com'}>`,
      to:      agent.email,
      subject: 'Update on Your Agent Application — Anmel Study Abroad',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0A192F;color:#e2e8f0;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0A192F,#112240);padding:40px;text-align:center;border-bottom:1px solid rgba(255,255,255,.1);">
            <h1 style="color:#64FFDA;font-size:28px;margin:0;">🌍 Anmel Study Abroad</h1>
            <p style="color:#94a3b8;margin-top:8px;">Agent Partnership Program</p>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#e2e8f0;margin-top:0;">Dear ${agent.fullName},</h2>
            <p style="line-height:1.7;">Thank you for applying to become an Anmel Study Abroad partner agent. After careful review, we are unable to approve your application at this time.</p>
            ${reason ? `<div style="background:rgba(255,255,255,.05);border-left:3px solid #64FFDA;border-radius:0 8px 8px 0;padding:16px 20px;margin:24px 0;"><p style="margin:0;color:#94a3b8;font-size:14px;"><strong style="color:#e2e8f0;">Reason:</strong> ${reason}</p></div>` : ''}
            <p style="color:#94a3b8;font-size:14px;line-height:1.7;">If you believe this decision was made in error or you would like to reapply with updated information, please contact us at <a href="mailto:${process.env.SMTP_USER || 'info@anmel.com'}" style="color:#64FFDA;">${process.env.SMTP_USER || 'info@anmel.com'}</a>.</p>
            <div style="text-align:center;margin-top:32px;">
              <a href="${clientUrl}/agent-registration" style="background:rgba(100,255,218,.1);color:#64FFDA;border:1px solid rgba(100,255,218,.3);padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Apply Again</a>
            </div>
          </div>
          <div style="padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,.05);color:#475569;font-size:12px;">
            <p>© 2025 Anmel Study Abroad. All rights reserved.</p>
          </div>
        </div>`,
    });
  } catch (err) {
    console.warn('[agents] Rejection email failed (non-fatal):', err.message);
  }
}

// ── SSE stream (admin only, token in query param) ─────────────────────────────
router.get('/stream', async (req, res) => {
  const token = req.query.token;
  if (!token || typeof token !== 'string') return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ event: 'connected', ts: Date.now() })}\n\n`);
  listeners.add(res);

  const keepAlive = setInterval(() => res.write(`: ping ${Date.now()}\n\n`), 25000);
  req.on('close', () => { clearInterval(keepAlive); listeners.delete(res); });
});

// ── Public: register new agent ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Service temporarily unavailable. Please try again shortly.' });
  const {
    fullName, gender, dateOfBirth, nationality, countryOfResidence, phone, email,
    residentialAddress, passportPhoto, idDocument, idDocumentType, organizationName,
    yearsOfExperience, areasOfRecruitment, targetCountries, studentsPerYear,
    socialMediaLinks, referralSource, personalStatement, agreedToTerms,
  } = req.body;

  if (!fullName || !email || !phone || !gender || !dateOfBirth || !nationality || !countryOfResidence || !residentialAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!agreedToTerms) return res.status(400).json({ error: 'You must agree to the terms' });

  const existing = await Agent.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'An application with this email already exists' });

  const agent = await Agent.create({
    fullName, gender, dateOfBirth: new Date(dateOfBirth), nationality, countryOfResidence,
    phone, email, residentialAddress, passportPhoto, idDocument, idDocumentType,
    organizationName, yearsOfExperience: Number(yearsOfExperience) || 0,
    areasOfRecruitment: Array.isArray(areasOfRecruitment) ? areasOfRecruitment : [areasOfRecruitment].filter(Boolean),
    targetCountries:    Array.isArray(targetCountries)    ? targetCountries    : [targetCountries].filter(Boolean),
    studentsPerYear: Number(studentsPerYear) || 0, socialMediaLinks, referralSource,
    personalStatement, agreedToTerms, status: 'Pending',
  });

  emitAgentChanged();
  res.status(201).json({ ok: true, agentId: agent._id, message: 'Application submitted successfully. You will be notified upon review.' });
});

// ── Agent portal: login ───────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Service temporarily unavailable. Please try again shortly.' });
  const { email, password, agentCode } = req.body;
  if (!password || (!email && !agentCode)) return res.status(400).json({ error: 'Email/Agent Code and password required' });

  const query = agentCode
    ? { agentCode: agentCode.trim().toUpperCase() }
    : { email: email.trim().toLowerCase() };

  const agent = await Agent.findOne(query);
  if (!agent) return res.status(401).json({ error: 'Invalid credentials' });
  if (agent.status !== 'Approved') return res.status(403).json({ error: `Account status: ${agent.status}. Please wait for admin approval.` });
  if (!agent.loginEnabled) return res.status(403).json({ error: 'Login not enabled. Contact admin.' });

  const valid = await agent.comparePassword(password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken({
    userId: String(agent._id), email: agent.email, role: 'agent',
    agentCode: agent.agentCode, name: agent.fullName,
  });

  res.json({
    token,
    agent: {
      id: agent._id, fullName: agent.fullName, email: agent.email,
      agentCode: agent.agentCode, status: agent.status,
      referredStudents: agent.referredStudents, activeApplications: agent.activeApplications,
      approvedAdmissions: agent.approvedAdmissions, commissionEarned: agent.commissionEarned,
      commissionPending: agent.commissionPending,
    },
  });
});

// ── Agent portal: own profile ─────────────────────────────────────────────────
router.get('/portal/me', authMiddleware, async (req, res) => {
  if (req.auth?.role !== 'agent') return res.status(403).json({ error: 'Agent access required' });
  const agent = await Agent.findById(req.auth.userId).select('-password -temporaryPassword');
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

// ── Agent portal: change password ─────────────────────────────────────────────
router.patch('/portal/change-password', authMiddleware, async (req, res) => {
  if (req.auth?.role !== 'agent') return res.status(403).json({ error: 'Agent access required' });
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords are required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

  const agent = await Agent.findById(req.auth.userId);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  const valid = await agent.comparePassword(currentPassword);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  agent.password = newPassword;
  agent.temporaryPassword = null;
  await agent.save();
  res.json({ ok: true, message: 'Password changed successfully' });
});

// ── Admin: list all agents ────────────────────────────────────────────────────
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'db_unavailable' });
  try {
    const agents = await Agent.find()
      .select('-password -passportPhoto -idDocument')
      .sort({ createdAt: -1 });
    res.json(agents);
  } catch (err) {
    console.warn('[agents] GET list failed:', err.message);
    res.status(503).json({ error: 'db_unavailable' });
  }
});

// ── Admin: single agent (with photos for doc preview) ────────────────────────
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'db_unavailable' });
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    res.status(503).json({ error: 'db_unavailable' });
  }
});

// ── Admin: approve ────────────────────────────────────────────────────────────
router.patch('/:id/approve', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  const agent = await Agent.findById(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  if (agent.status === 'Approved') return res.status(400).json({ error: 'Agent is already approved' });

  const agentCode   = agent.agentCode || generateAgentCode();
  const tempPassword = generateTempPassword();

  agent.agentCode       = agentCode;
  agent.temporaryPassword = tempPassword;
  agent.password        = tempPassword;   // hashed by pre-save hook
  agent.status          = 'Approved';
  agent.loginEnabled    = true;
  agent.approvedAt      = new Date();
  agent.approvedBy      = req.user?.email || 'admin';
  await agent.save();

  // Fire-and-forget — email failure must not block the API response
  sendApprovalEmail(agent, tempPassword, agentCode);
  emitAgentChanged();

  res.json({ ok: true, agentCode, tempPassword, message: 'Agent approved. Credentials are being sent to their email.' });
});

// ── Admin: reject ─────────────────────────────────────────────────────────────
router.patch('/:id/reject', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  const agent = await Agent.findById(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  if (agent.status === 'Rejected') return res.status(400).json({ error: 'Agent is already rejected' });

  const reason = req.body.notes?.trim() || '';
  agent.status       = 'Rejected';
  agent.loginEnabled = false;
  agent.adminNotes   = reason || agent.adminNotes;
  await agent.save();

  // Notify the agent by email (non-blocking)
  sendRejectionEmail(agent, reason);
  emitAgentChanged();

  res.json({ ok: true, message: 'Agent rejected. A notification email has been sent.' });
});

// ── Admin: update notes / status ──────────────────────────────────────────────
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  const allowed = ['adminNotes', 'status'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const agent = await Agent.findByIdAndUpdate(req.params.id, updates, { new: true })
    .select('-password -temporaryPassword');
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  emitAgentChanged();
  res.json(agent);
});

// ── Admin: resend credentials ─────────────────────────────────────────────────
router.post('/:id/resend-credentials', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  const agent = await Agent.findById(req.params.id).select('-password');
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  if (agent.status !== 'Approved') return res.status(400).json({ error: 'Agent is not approved' });
  if (!agent.temporaryPassword) return res.status(400).json({ error: 'No credentials to resend. Re-approve the agent to generate new ones.' });

  await sendApprovalEmail(agent, agent.temporaryPassword, agent.agentCode);
  res.json({ ok: true, message: `Credentials resent to ${agent.email}` });
});

export default router;
