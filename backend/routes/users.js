import { Router } from 'express';
import User from '../models/User.js';
import Agent from '../models/Agent.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { sendRouteError } from '../lib/asyncHandler.js';

const router = Router();

function mapAgentToDirectoryRow(agent) {
  return {
    _id: `agent-${agent._id || agent.id}`,
    sourceId: agent._id || agent.id,
    email: agent.email,
    name: agent.fullName || agent.name || agent.email,
    role: 'agent',
    status: agent.status || 'Pending',
    createdAt: agent.createdAt,
    agentCode: agent.agentCode || null,
    loginEnabled: agent.loginEnabled === true,
    pendingReview: agent.status === 'Pending',
  };
}

function mapUserToDirectoryRow(user) {
  return {
    _id: user._id || user.id,
    sourceId: user._id || user.id,
    email: user.email,
    name: user.name || user.email,
    role: user.role || 'admin',
    status: user.status || (user.role === 'student' ? 'active' : 'active'),
    createdAt: user.createdAt,
    agentCode: user.agentCode || null,
    loginEnabled: user.loginEnabled !== false,
    pendingReview: false,
  };
}

export async function buildUsersDirectory() {
  const [users, agents] = await Promise.all([
    withDbQuery(
      () => User.find().select('-password').sort({ createdAt: -1 }).maxTimeMS(8000).lean(),
      { fallback: [], label: 'users list', timeoutMs: 10000 },
    ),
    withDbQuery(
      () =>
        Agent.find()
          .select('-password -passportPhoto -idDocument')
          .sort({ createdAt: -1 })
          .maxTimeMS(8000)
          .lean(),
      { fallback: [], label: 'agents list', timeoutMs: 10000 },
    ),
  ]);

  const byEmail = new Map();

  for (const a of agents || []) {
    const email = String(a.email || '').toLowerCase();
    if (email) byEmail.set(email, mapAgentToDirectoryRow(a));
  }

  for (const u of users || []) {
    const email = String(u.email || '').toLowerCase();
    if (!email) continue;
    const userRow = mapUserToDirectoryRow(u);
    if (u.role === 'admin' || u.role === 'student') {
      byEmail.set(email, userRow);
      continue;
    }
    const agentRow = byEmail.get(email);
    if (u.role === 'agent' && agentRow?.status === 'Approved') {
      byEmail.set(email, {
        ...userRow,
        status: 'Approved',
        pendingReview: false,
        sourceId: agentRow.sourceId,
        agentCode: userRow.agentCode || agentRow.agentCode,
      });
    } else if (!agentRow) {
      byEmail.set(email, userRow);
    }
  }

  return [...byEmail.values()].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  try {
    const directory = await buildUsersDirectory();
    res.json(directory);
  } catch (err) {
    return sendRouteError(res, err, { scope: 'users/list' });
  }
});

export default router;
