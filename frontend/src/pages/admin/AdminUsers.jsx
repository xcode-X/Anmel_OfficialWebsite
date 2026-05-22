import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, RefreshCw, Wifi, WifiOff, Shield, GraduationCap, MonitorCheck,
  Clock, CheckCircle2, XCircle, Eye,
} from 'lucide-react';
import { usersApi, agentsApi } from '../../lib/api';
import AgentReviewPanel from '../../components/admin/AgentReviewPanel';

const ROLE_STYLES = {
  admin: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  student: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  agent: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
};

const STATUS_STYLES = {
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Rejected: 'bg-red-500/15 text-red-400 border-red-500/25',
  active: 'bg-white/8 text-white/50 border-white/10',
  provisioned: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
};

function RoleIcon({ role }) {
  if (role === 'admin') return <Shield className="w-3.5 h-3.5" />;
  if (role === 'student') return <GraduationCap className="w-3.5 h-3.5" />;
  return <MonitorCheck className="w-3.5 h-3.5" />;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

function resolveAgentId(row) {
  return row.sourceId || String(row._id || '').replace(/^agent-/, '');
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [live, setLive] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loadingAgent, setLoadingAgent] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await usersApi.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      /* keep previous rows */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const cleanup = usersApi.subscribe((rows) => {
      setLive(true);
      setUsers(rows);
      setLoading(false);
    });
    const onVis = () => {
      if (document.visibilityState === 'visible') load(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [load]);

  const openAgentReview = async (row) => {
    const agentId = resolveAgentId(row);
    setLoadingAgent(true);
    try {
      const full = await agentsApi.adminGet(agentId);
      setSelectedAgent({ ...full, sourceId: agentId });
    } catch {
      setSelectedAgent({
        _id: row._id,
        sourceId: agentId,
        fullName: row.name,
        email: row.email,
        status: row.status,
        agentCode: row.agentCode,
        createdAt: row.createdAt,
      });
    } finally {
      setLoadingAgent(false);
    }
  };

  const handleRowClick = (row) => {
    if (row.role === 'agent') openAgentReview(row);
  };

  if (selectedAgent) {
    return (
      <AgentReviewPanel
        agent={selectedAgent}
        onBack={() => setSelectedAgent(null)}
        onApprove={agentsApi.adminApprove}
        onReject={agentsApi.adminReject}
        onResend={agentsApi.adminResendCredentials}
        onRefresh={() => {
          load(true);
          const agentId = resolveAgentId(selectedAgent);
          agentsApi.adminGet(agentId).then((full) => {
            setSelectedAgent({ ...full, sourceId: agentId });
          }).catch(() => {});
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-white/40">
        <RefreshCw className="w-6 h-6 animate-spin mr-3" />
        Loading users…
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 text-white max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2FA084] mb-1">Directory</p>
            <h1 className="text-2xl font-bold flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
              <Users className="w-7 h-7 text-[#2FA084]" strokeWidth={1.75} />
              Users
            </h1>
            {users.length > 0 && (
              <p className="text-sm text-white/40 mt-1">
                {users.length} account{users.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {live ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Wifi className="w-3.5 h-3.5" /> Live sync
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-white/30">
                <WifiOff className="w-3.5 h-3.5" /> Connecting…
              </span>
            )}
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <Users className="w-12 h-12 text-white/15 mx-auto mb-4" />
            <p className="text-white/40 text-lg font-medium">No users yet</p>
            <p className="text-white/25 text-sm mt-1 max-w-md mx-auto">
              Admins appear when registered, students when LMS accounts are provisioned, and agents when they apply or are approved.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/3 border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Name</th>
                  <th className="px-5 py-3.5 font-medium">Email</th>
                  <th className="px-5 py-3.5 font-medium">Role</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium hidden md:table-cell">Agent code</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => {
                  const statusKey = u.status || 'active';
                  const statusStyle = STATUS_STYLES[statusKey] || STATUS_STYLES.active;
                  const roleStyle = ROLE_STYLES[u.role] || ROLE_STYLES.admin;
                  const isAgent = u.role === 'agent';
                  return (
                    <motion.tr
                      key={u._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => isAgent && handleRowClick(u)}
                      className={`transition ${isAgent ? 'hover:bg-white/4 cursor-pointer' : ''}`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{u.name || '—'}</p>
                        {u.pendingReview && (
                          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wide mt-0.5">Needs review</p>
                        )}
                        <p className="text-[10px] text-white/25 mt-0.5 md:hidden">{formatDate(u.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4 text-white/70">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${roleStyle}`}>
                          <RoleIcon role={u.role} />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle}`}>
                          {statusKey === 'Pending' && <Clock className="w-3 h-3" />}
                          {statusKey === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {statusKey === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {statusKey}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell font-mono text-xs text-white/40">
                        {u.agentCode || '—'}
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {isAgent ? (
                          <button
                            type="button"
                            disabled={loadingAgent}
                            onClick={() => openAgentReview(u)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2FA084]/30 bg-[#2FA084]/10 px-3 py-1.5 text-xs font-semibold text-[#2FA084] hover:bg-[#2FA084]/20 transition disabled:opacity-50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {u.pendingReview ? 'Review' : 'View'}
                          </button>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </>
  );
}
