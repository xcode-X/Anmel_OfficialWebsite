import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { createAdminSseRoute } from '../lib/streamRoute.js';
import { broadcastSse } from '../lib/sse.js';
import nodemailer from 'nodemailer';
import Agent from '../models/Agent.js';
import User from '../models/User.js';
import { authMiddleware, adminOnly, createCustomToken } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { sendRouteError } from '../lib/asyncHandler.js';
import { persistMediaFields, resolvePublicMediaUrl } from '../lib/fileStorage.js';
import { AGENT_DOC_FIELDS } from '../lib/mediaFields.js';
import { publishContentChange } from '../lib/contentStreamHub.js';
import { updateDoc, COLLECTIONS } from '../lib/firestoreDb.js';

const router = Router();

// ── SSE listeners ─────────────────────────────────────────────────────────────
const listeners = new Set();

function emitAgentChanged() {
  broadcastSse(listeners, { event: 'changed', ts: Date.now() });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const loginUrl = `${clientUrl}/agent-portal`;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[agents] SMTP not configured — credentials email skipped');
    return { sent: false, error: 'SMTP not configured', loginUrl };
  }
  try {
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
                <tr><td style="color:#94a3b8;padding:4px 0;">Login ID (username):</td><td style="color:#fff;font-weight:bold;">${agentCode}</td></tr>
                <tr><td style="color:#94a3b8;padding:4px 0;">Email:</td><td style="color:#fff;">${agent.email}</td></tr>
                <tr><td style="color:#94a3b8;padding:4px 0;">Temporary Password:</td><td style="color:#64FFDA;font-weight:bold;font-size:18px;">${tempPassword}</td></tr>
              </table>
            </div>
            <p style="color:#94a3b8;font-size:14px;">⚠️ Please log in and change your password immediately for security purposes.</p>
            <p style="color:#94a3b8;font-size:14px;margin-top:16px;">Login link: <a href="${loginUrl}" style="color:#64FFDA;">${loginUrl}</a></p>
            <div style="text-align:center;margin-top:32px;">
              <a href="${loginUrl}" style="background:#64FFDA;color:#0A192F;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Access Your Agent Portal →</a>
            </div>
          </div>
          <div style="padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,.05);color:#475569;font-size:12px;">
            <p>© 2025 Anmel Study Abroad. All rights reserved.</p>
          </div>
        </div>`,
    });
    return { sent: true, loginUrl };
  } catch (err) {
    console.warn('[agents] Approval email failed:', err.message);
    return { sent: false, error: err.message, loginUrl };
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
router.get('/stream', createAdminSseRoute(listeners));

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

  const storedDocs = await persistMediaFields(
    { passportPhoto, idDocument },
    AGENT_DOC_FIELDS,
    'agents',
  );

  const agentCode = generateAgentCode();

  const agent = await Agent.create({
    fullName, gender, dateOfBirth: new Date(dateOfBirth), nationality, countryOfResidence,
    phone, email: email.toLowerCase(), residentialAddress,
    passportPhoto: storedDocs.passportPhoto || '',
    idDocument: storedDocs.idDocument || '',
    idDocumentType,
    organizationName, yearsOfExperience: Number(yearsOfExperience) || 0,
    areasOfRecruitment: Array.isArray(areasOfRecruitment) ? areasOfRecruitment : [areasOfRecruitment].filter(Boolean),
    targetCountries:    Array.isArray(targetCountries)    ? targetCountries    : [targetCountries].filter(Boolean),
    studentsPerYear: Number(studentsPerYear) || 0, socialMediaLinks, referralSource,
    personalStatement, agreedToTerms, status: 'Pending', agentCode, loginEnabled: false,
  });

  emitAgentChanged();
  publishContentChange('agents');
  publishContentChange('users');
  res.status(201).json({
    ok: true,
    agentId: agent._id,
    agentCode,
    message: 'Application submitted successfully. You will be notified upon review.',
  });
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

  const valid = await Agent.comparePassword(password, agent);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = await createCustomToken(String(agent.id || agent._id), {
    role: 'agent',
    agent: true,
    email: agent.email,
    agentCode: agent.agentCode,
    name: agent.fullName,
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
    const agents = await withDbQuery(
      () =>
        Agent.find()
          .select('-password -passportPhoto -idDocument')
          .sort({ createdAt: -1 })
          .maxTimeMS(10000)
          .lean(),
      { fallback: [], label: 'agents list', timeoutMs: 12000 },
    );
    res.json(agents);
  } catch (err) {
    return sendRouteError(res, err, { scope: 'agents/list' });
  }
});

// ── Admin: single agent (with photos for doc preview) ────────────────────────
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'db_unavailable' });
  try {
    const agent = await Agent.findById(req.params.id).select('-password').lean();
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    if (agent.passportPhoto) agent.passportPhoto = resolvePublicMediaUrl(req, agent.passportPhoto);
    if (agent.idDocument) agent.idDocument = resolvePublicMediaUrl(req, agent.idDocument);
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

  const agentCode = agent.agentCode || generateAgentCode(); // assigned at application; kept on approval
  const tempPassword = generateTempPassword();
  const hashed = await bcrypt.hash(tempPassword, 12);
  const agentId = String(agent.id || agent._id);
  const approvedBy = req.auth?.email || 'admin';

  await updateDoc(COLLECTIONS.agents, agentId, {
    agentCode,
    temporaryPassword: tempPassword,
    password: hashed,
    status: 'Approved',
    loginEnabled: true,
    approvedAt: new Date().toISOString(),
    approvedBy,
  });

  const email = String(agent.email || '').toLowerCase();
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    await User.create({
      email,
      name: agent.fullName,
      password: tempPassword,
      role: 'agent',
      agentId,
      agentCode,
      loginEnabled: true,
      status: 'active',
    });
  } else if (existingUser.role !== 'agent') {
    return res.status(400).json({ error: 'This email belongs to a non-agent account.' });
  } else {
    await User.findByIdAndUpdate(existingUser._id || existingUser.id, {
      $set: {
        name: agent.fullName,
        password: await bcrypt.hash(tempPassword, 12),
        agentCode,
        agentId,
        loginEnabled: true,
        status: 'active',
      },
    });
  }

  const emailResult = await sendApprovalEmail(
    { ...agent, agentCode, fullName: agent.fullName, email },
    tempPassword,
    agentCode,
  );

  emitAgentChanged();
  publishContentChange('agents');
  publishContentChange('users');

  res.json({
    ok: true,
    agentCode,
    tempPassword,
    loginUrl: emailResult.loginUrl,
    emailSent: emailResult.sent,
    emailError: emailResult.error || null,
    message: emailResult.sent
      ? 'Agent approved. Login link and password sent to their email.'
      : 'Agent approved. Email could not be sent — share credentials manually.',
  });
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
  publishContentChange('agents');
  publishContentChange('users');

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
