import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Search, Eye, EyeOff, RefreshCw, X,
  User, Mail, Phone, MapPin, Briefcase, Calendar, Globe,
  Copy, Send, Clock, ChevronDown, ChevronUp, AlertTriangle,
  FileText, Shield, Wifi, WifiOff,
} from 'lucide-react';
import { agentsApi, auth } from '../../lib/api';

function isNew(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

const STATUS_COLORS = {
  Pending:   'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Approved:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Rejected:  'bg-red-500/15 text-red-400 border-red-500/25',
  Suspended: 'bg-stone-500/15 text-stone-400 border-stone-500/25',
};

function PasswordCell({ password }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!password) return <span className="text-white/20 text-xs italic">not set</span>;
  const copy = () => {
    navigator.clipboard.writeText(password).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-amber-300 tracking-wider">
        {visible ? password : '••••••••••'}
      </span>
      <button type="button" onClick={() => setVisible(v => !v)} className="text-white/30 hover:text-white/70 transition" title={visible ? 'Hide' : 'Show'}>
        {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button type="button" onClick={copy} className="text-white/30 hover:text-[#2FA084] transition" title="Copy">
        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function AgentDrawer({ agent, onClose, onApprove, onReject, onResend, onRefresh }) {
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const doApprove = async () => {
    setLoading(true); setMsg('');
    try {
      const result = await onApprove(agent._id);
      // Show credentials immediately — don't wait for the background refresh
      setMsg(`✓ Approved! Credentials emailed to ${agent.email}. Agent Code: ${result.agentCode}`);
      onRefresh();
    }
    catch (e) { setMsg(`Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  const doReject = async () => {
    setLoading(true); setMsg('');
    try {
      await onReject(agent._id, rejectNotes);
      setMsg('✓ Application rejected. A notification email has been sent to the agent.');
      setShowRejectForm(false);
      onRefresh();
    }
    catch (e) { setMsg(`Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  const doResend = async () => {
    setLoading(true); setMsg('');
    try { await onResend(agent._id); setMsg('✓ Credentials email resent.'); }
    catch (e) { setMsg(`Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  const Field = ({ label, value, mono }) => value ? (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-white/35 mb-0.5">{label}</p>
      <p className={`text-sm text-white/80 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-full w-full max-w-lg bg-[#0A0F1A] border-l border-white/8 overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0A0F1A] border-b border-white/8">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{agent.fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${STATUS_COLORS[agent.status]}`}>{agent.status}</span>
              {agent.agentCode && <span className="text-xs font-mono text-[#2FA084]">{agent.agentCode}</span>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-white/40 hover:text-white/80 transition rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Credentials box (approved agents) */}
          {agent.status === 'Approved' && (
            <div className="rounded-xl border border-[#2FA084]/25 bg-[#2FA084]/5 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#2FA084]">Login Credentials</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase text-white/35 mb-0.5">Email</p>
                  <p className="text-sm text-white/80 font-mono">{agent.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-white/35 mb-0.5">Agent Code</p>
                  <p className="text-sm text-[#2FA084] font-mono">{agent.agentCode || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase text-white/35 mb-1">Password (temporary)</p>
                  <PasswordCell password={agent.temporaryPassword} />
                </div>
              </div>
              <button
                type="button"
                onClick={doResend}
                disabled={loading}
                className="mt-1 w-full flex items-center justify-center gap-2 rounded-lg border border-[#2FA084]/30 py-2 text-xs font-semibold text-[#2FA084] hover:bg-[#2FA084]/10 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Resend credentials to agent email
              </button>
            </div>
          )}

          {/* Approval/Rejection actions */}
          {agent.status === 'Pending' && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-white/50">Review Actions</p>
              {msg && <p className={`text-xs rounded-lg px-3 py-2 ${msg.startsWith('Error') ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{msg}</p>}
              {!showRejectForm ? (
                <div className="flex gap-2">
                  <button type="button" onClick={doApprove} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2FA084] text-white text-sm font-bold hover:bg-[#3CD1AD] transition disabled:opacity-50">
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Send Credentials
                  </button>
                  <button type="button" onClick={() => setShowRejectForm(true)} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 text-sm font-bold hover:bg-red-500/25 transition disabled:opacity-50">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={rejectNotes}
                    onChange={e => setRejectNotes(e.target.value)}
                    placeholder="Reason for rejection (optional)..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-red-400/40 resize-none"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={doReject} disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-50">
                      Confirm Rejection
                    </button>
                    <button type="button" onClick={() => setShowRejectForm(false)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Personal Information */}
          <section className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2"><User className="w-3 h-3" /> Personal Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Full Name" value={agent.fullName} />
              <Field label="Gender" value={agent.gender} />
              <Field label="Date of Birth" value={agent.dateOfBirth ? new Date(agent.dateOfBirth).toLocaleDateString() : null} />
              <Field label="Nationality" value={agent.nationality} />
              <Field label="Country of Residence" value={agent.countryOfResidence} />
              <Field label="Phone" value={agent.phone} />
              <div className="col-span-2"><Field label="Residential Address" value={agent.residentialAddress} /></div>
            </div>
          </section>

          {/* Professional Information */}
          <section className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2"><Briefcase className="w-3 h-3" /> Professional Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Field label="Organisation" value={agent.organizationName} />
              <Field label="Experience" value={agent.yearsOfExperience != null ? `${agent.yearsOfExperience} years` : null} />
              <Field label="Students/Year" value={agent.studentsPerYear != null ? `${agent.studentsPerYear}` : null} />
              <Field label="Referral Source" value={agent.referralSource} />
            </div>
            {agent.areasOfRecruitment?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase text-white/35 mb-1">Areas of Recruitment</p>
                <div className="flex flex-wrap gap-1.5">{agent.areasOfRecruitment.map(a => <span key={a} className="px-2 py-0.5 text-xs rounded-full bg-white/5 border border-white/10 text-white/60">{a}</span>)}</div>
              </div>
            )}
            {agent.targetCountries?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase text-white/35 mb-1">Target Countries</p>
                <div className="flex flex-wrap gap-1.5">{agent.targetCountries.map(c => <span key={c} className="px-2 py-0.5 text-xs rounded-full bg-white/5 border border-white/10 text-white/60">{c}</span>)}</div>
              </div>
            )}
            {agent.personalStatement && (
              <div>
                <p className="text-[10px] uppercase text-white/35 mb-1">Personal Statement</p>
                <p className="text-sm text-white/60 leading-relaxed">{agent.personalStatement}</p>
              </div>
            )}
          </section>

          {/* Admin Notes */}
          <section className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Admin Notes</p>
            <AdminNotesEditor agentId={agent._id} initial={agent.adminNotes || ''} onRefresh={onRefresh} />
          </section>

          {/* Timestamps */}
          <div className="text-xs text-white/25 space-y-1 pt-2 border-t border-white/5">
            <p>Registered: {new Date(agent.createdAt).toLocaleString()}</p>
            {agent.approvedAt && <p>Approved: {new Date(agent.approvedAt).toLocaleString()} by {agent.approvedBy}</p>}
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function AdminNotesEditor({ agentId, initial, onRefresh }) {
  const [notes, setNotes] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try { await agentsApi.adminUpdate(agentId, { adminNotes: notes }); setSaved(true); setTimeout(() => setSaved(false), 2000); onRefresh(); }
    catch (e) { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-2">
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add private notes about this agent..."
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/40 resize-none" />
      <button type="button" onClick={save} disabled={saving}
        className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-50">
        {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save notes'}
      </button>
    </div>
  );
}

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Suspended'];

export default function AdminAgents() {
  const [agents, setAgents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected]   = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sseOk, setSseOk]         = useState(false);
  const pollRef    = useRef(null);
  const selectedRef = useRef(null);  // ref so load() never captures a stale selected

  // Keep the ref in sync with the state on every render
  selectedRef.current = selected;

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await agentsApi.adminList();
      const list = Array.isArray(data) ? data : [];
      setAgents(list);
      // Update the open drawer if the agent's record changed — uses ref to avoid
      // stale closure problems when called from the SSE callback or setInterval
      const cur = selectedRef.current;
      if (cur) {
        const updated = list.find(a => a._id === cur._id);
        if (updated) setSelected(updated);
      }
    } catch { /* ignore — DB may be briefly unavailable */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []); // no deps — selectedRef is always current

  useEffect(() => {
    load();

    // SSE: push notification whenever any agent record changes
    const token = auth.getToken();
    let sseSource;
    if (token) {
      sseSource = new EventSource(
        `/api/agents/stream?token=${encodeURIComponent(token)}`
      );
      sseSource.addEventListener('open', () => setSseOk(true));
      sseSource.onmessage = (e) => {
        try { if (JSON.parse(e.data).event === 'changed') load(true); } catch { /* ignore */ }
      };
      sseSource.onerror = () => setSseOk(false);
    }

    // Fallback poll every 30 s — catches any event the SSE might miss
    pollRef.current = setInterval(() => load(true), 30000);

    return () => {
      sseSource?.close();
      clearInterval(pollRef.current);
    };
  }, [load]);

  const filtered = agents.filter(a => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || a.fullName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.agentCode?.toLowerCase().includes(q) || a.countryOfResidence?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'All' ? agents.length : agents.filter(a => a.status === s).length;
    return acc;
  }, {});

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-white/40">
      <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading agents...
    </div>
  );

  return (
    <>
      <div className="space-y-6 text-white">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
              Agent Applications
              {counts.Pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                  {counts.Pending} pending
                </span>
              )}
            </h1>
            <p className="text-sm text-white/40 mt-1">{agents.length} total · {counts.Pending} pending review</p>
          </div>
          <div className="flex items-center gap-3">
            {sseOk ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Wifi className="w-3.5 h-3.5" /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-white/30">
                <WifiOff className="w-3.5 h-3.5" /> Polling
              </span>
            )}
            <button type="button" onClick={() => load(true)} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Pending alert */}
        {counts.Pending > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              <strong>{counts.Pending} agent application{counts.Pending > 1 ? 's' : ''}</strong> waiting for your review.
              Click a row to open the detail drawer and approve or reject.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, agent code..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50" />
          </div>
          <div className="flex gap-1.5">
            {STATUSES.map(s => (
              <button key={s} type="button" onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${statusFilter === s ? 'bg-[#2FA084] text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>
                {s} {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/8 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/3 border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-medium">Agent</th>
                <th className="px-5 py-3.5 font-medium hidden md:table-cell">Location</th>
                <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Experience</th>
                <th className="px-5 py-3.5 font-medium">Password</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(agent => (
                <tr key={agent._id} onClick={() => setSelected(agent)}
                  className="hover:bg-white/4 cursor-pointer transition group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white group-hover:text-[#2FA084] transition">{agent.fullName}</p>
                      {isNew(agent.createdAt) && agent.status === 'Pending' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wide">New</span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{agent.email}</p>
                    {agent.organizationName && <p className="text-[#2FA084]/70 text-xs mt-0.5">{agent.organizationName}</p>}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-white/70">{agent.countryOfResidence}</p>
                    <p className="text-white/35 text-xs mt-0.5">{agent.nationality}</p>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <p className="text-white/70">{agent.yearsOfExperience} yrs</p>
                    <p className="text-white/35 text-xs mt-0.5">{agent.studentsPerYear} students/yr</p>
                  </td>
                  <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                    <PasswordCell password={agent.temporaryPassword} />
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${STATUS_COLORS[agent.status]}`}>{agent.status}</span>
                    {agent.agentCode && <p className="text-xs font-mono text-white/30 mt-1">{agent.agentCode}</p>}
                  </td>
                  <td className="px-5 py-4 text-right text-white/35 text-xs whitespace-nowrap">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-white/30">
                  {search || statusFilter !== 'All' ? 'No agents match your filters.' : 'No agent applications yet.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <AgentDrawer
            agent={selected}
            onClose={() => setSelected(null)}
            onApprove={agentsApi.adminApprove}
            onReject={agentsApi.adminReject}
            onResend={agentsApi.adminResendCredentials}
            onRefresh={() => load(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
