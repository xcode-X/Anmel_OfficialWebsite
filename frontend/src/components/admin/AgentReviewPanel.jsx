import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, User, Briefcase, Send, ArrowLeft, MonitorCheck,
  FileText, Eye, Download, Loader2,
} from 'lucide-react';
import { agentsApi } from '../../lib/api';
import {
  AGENT_DOC_FIELDS,
  resolveDocUrl,
  isImageDoc,
  viewDoc,
  downloadDoc,
} from '../../lib/docPreview';

export const STATUS_COLORS = {
  Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Rejected: 'bg-red-500/15 text-red-400 border-red-500/25',
  Suspended: 'bg-stone-500/15 text-stone-400 border-stone-500/25',
};

function resolveAgentId(agent) {
  return agent?.sourceId || String(agent?._id || '').replace(/^agent-/, '');
}

function PasswordCell({ password }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!password) return <span className="text-white/20 text-xs italic">not set</span>;
  const copy = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-amber-300 tracking-wider">
        {visible ? password : '••••••••••'}
      </span>
      <button type="button" onClick={() => setVisible((v) => !v)} className="text-white/30 hover:text-white/70 transition text-xs">
        {visible ? 'Hide' : 'Show'}
      </button>
      <button type="button" onClick={copy} className="text-white/30 hover:text-[#2FA084] transition text-xs">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function AdminNotesEditor({ agentId, initial, onRefresh }) {
  const [notes, setNotes] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await agentsApi.adminUpdate(agentId, { adminNotes: notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onRefresh();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Add private notes about this agent..."
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/40 resize-none"
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
      >
        {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save notes'}
      </button>
    </div>
  );
}

function AgentDocumentCard({ fieldKey, label, url, idType }) {
  const src = resolveDocUrl(url);
  if (!src) return null;
  const showImage = isImageDoc(src);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#2FA084] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{label}</p>
            {fieldKey === 'idDocument' && idType && (
              <p className="text-[10px] text-white/40 mt-0.5">Type: {idType}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => viewDoc(src)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button
            type="button"
            onClick={() => downloadDoc(src, label)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2FA084]/20 hover:bg-[#2FA084]/30 text-xs text-[#2FA084] transition"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>
      {showImage && (
        <div className="p-4 bg-black/20 flex justify-center">
          <img
            src={src}
            alt={label}
            className="max-h-64 max-w-full rounded-lg border border-white/10 object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default function AgentReviewPanel({ agent, onBack, onApprove, onReject, onResend, onRefresh }) {
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [detail, setDetail] = useState(agent);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const agentId = resolveAgentId(agent);

  useEffect(() => {
    let cancelled = false;
    setLoadingDetail(true);
    agentsApi
      .adminGet(agentId)
      .then((full) => {
        if (!cancelled) setDetail({ ...agent, ...full, sourceId: agent.sourceId || agentId });
      })
      .catch(() => {
        if (!cancelled) setDetail(agent);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [agentId, agent.status, agent.updatedAt]);

  const display = detail || agent;
  const uploadedDocs = AGENT_DOC_FIELDS.filter(({ key }) => resolveDocUrl(display[key]));

  const doApprove = async () => {
    setLoading(true);
    setMsg('');
    try {
      const result = await onApprove(agentId);
      const emailNote = result.emailSent
        ? `Credentials emailed to ${display.email}.`
        : `Email not sent${result.emailError ? `: ${result.emailError}` : ''} — share credentials manually.`;
      setMsg(
        `✓ Approved! ${emailNote} Login ID: ${result.agentCode || display.agentCode}. Password sent by email.`,
      );
      onRefresh();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const doReject = async () => {
    setLoading(true);
    setMsg('');
    try {
      await onReject(agentId, rejectNotes);
      setMsg('✓ Application rejected. A notification email has been sent to the agent.');
      setShowRejectForm(false);
      onRefresh();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const doResend = async () => {
    setLoading(true);
    setMsg('');
    try {
      await onResend(agentId);
      setMsg('✓ Credentials email resent.');
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value, mono }) =>
    value ? (
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/35 mb-0.5">{label}</p>
        <p className={`text-sm text-white/80 ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto text-white space-y-6"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#2FA084] transition-colors group"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 group-hover:border-[#2FA084]/30 group-hover:bg-[#2FA084]/10 transition">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.2} />
        </span>
        Back to agent applications
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2FA084]/15 border border-[#2FA084]/25">
            <MonitorCheck className="w-6 h-6 text-[#2FA084]" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {display.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${STATUS_COLORS[display.status] || STATUS_COLORS.Pending}`}>
                {display.status}
              </span>
              {display.agentCode && (
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-full border border-[#2FA084]/30 bg-[#2FA084]/10 text-[#2FA084]">
                  Login ID: {display.agentCode}
                </span>
              )}
            </div>
            <p className="text-sm text-white/40 mt-2">{display.email}</p>
          </div>
        </div>
      </div>

      {display.agentCode && (
        <div className="rounded-2xl border border-[#2FA084]/25 bg-[#2FA084]/8 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2FA084] mb-1">Agent login ID (username)</p>
          <p className="text-2xl font-mono font-bold text-white">{display.agentCode}</p>
          <p className="text-xs text-white/45 mt-2">
            Assigned when the application was submitted. After approval, the agent signs in at the portal using this ID and the password emailed to them.
          </p>
        </div>
      )}

      {display.status === 'Approved' && (
        <div className="rounded-2xl border border-[#2FA084]/25 bg-[#2FA084]/5 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2FA084]">Login credentials</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Login ID (Agent Code)" value={display.agentCode} mono />
            <Field label="Email" value={display.email} mono />
            <div className="sm:col-span-2">
              <p className="text-[10px] uppercase text-white/35 mb-1">Temporary password</p>
              <PasswordCell password={display.temporaryPassword} />
            </div>
          </div>
          <button
            type="button"
            onClick={doResend}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#2FA084]/30 px-4 py-2.5 text-sm font-semibold text-[#2FA084] hover:bg-[#2FA084]/10 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Resend credentials email
          </button>
        </div>
      )}

      {display.status === 'Pending' && (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">Review application</p>
          {msg && (
            <p className={`text-sm rounded-xl px-4 py-3 ${msg.startsWith('Error') ? 'bg-red-500/10 text-red-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
              {msg}
            </p>
          )}
          {!showRejectForm ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={doApprove}
                disabled={loading}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2FA084] text-white text-sm font-bold hover:bg-[#3CD1AD] transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve & email login details
              </button>
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 text-sm font-bold hover:bg-red-500/25 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Reason for rejection (optional)..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-red-400/40 resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={doReject}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-50"
                >
                  Confirm rejection
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 space-y-8">
        <section className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
            <User className="w-3 h-3" /> Personal details
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Full name" value={display.fullName} />
            <Field label="Gender" value={display.gender} />
            <Field label="Date of birth" value={display.dateOfBirth ? new Date(display.dateOfBirth).toLocaleDateString() : null} />
            <Field label="Nationality" value={display.nationality} />
            <Field label="Country of residence" value={display.countryOfResidence} />
            <Field label="Phone" value={display.phone} />
            <div className="sm:col-span-2">
              <Field label="Residential address" value={display.residentialAddress} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
            <FileText className="w-3 h-3" /> Uploaded documents
            {!loadingDetail && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 text-[10px] font-semibold">
                {uploadedDocs.length}
              </span>
            )}
          </p>
          {loadingDetail ? (
            <div className="flex items-center gap-2 text-sm text-white/40 py-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading documents…
            </div>
          ) : uploadedDocs.length === 0 ? (
            <p className="text-sm text-white/35 italic py-2">No documents were uploaded with this application.</p>
          ) : (
            <div className="space-y-4">
              {uploadedDocs.map(({ key, label }) => (
                <AgentDocumentCard
                  key={key}
                  fieldKey={key}
                  label={label}
                  url={display[key]}
                  idType={key === 'idDocument' ? display.idDocumentType : undefined}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
            <Briefcase className="w-3 h-3" /> Professional details
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Organisation" value={display.organizationName} />
            <Field label="Experience" value={display.yearsOfExperience != null ? `${display.yearsOfExperience} years` : null} />
            <Field label="Students per year" value={display.studentsPerYear != null ? `${display.studentsPerYear}` : null} />
            <Field label="Referral source" value={display.referralSource} />
          </div>
          {display.areasOfRecruitment?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase text-white/35 mb-1">Areas of recruitment</p>
              <div className="flex flex-wrap gap-1.5">
                {display.areasOfRecruitment.map((a) => (
                  <span key={a} className="px-2 py-0.5 text-xs rounded-full bg-white/5 border border-white/10 text-white/60">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          {display.targetCountries?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase text-white/35 mb-1">Target countries</p>
              <div className="flex flex-wrap gap-1.5">
                {display.targetCountries.map((c) => (
                  <span key={c} className="px-2 py-0.5 text-xs rounded-full bg-white/5 border border-white/10 text-white/60">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {display.personalStatement && (
            <div>
              <p className="text-[10px] uppercase text-white/35 mb-1">Personal statement</p>
              <p className="text-sm text-white/60 leading-relaxed">{display.personalStatement}</p>
            </div>
          )}
        </section>

        <section className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Admin notes</p>
          <AdminNotesEditor agentId={agentId} initial={display.adminNotes || ''} onRefresh={onRefresh} />
        </section>

        <div className="text-xs text-white/25 space-y-1 pt-2 border-t border-white/5">
          <p>Application ID: <span className="font-mono text-white/40">{agentId}</span></p>
          <p>Registered: {display.createdAt ? new Date(display.createdAt).toLocaleString() : '—'}</p>
          {display.approvedAt && (
            <p>
              Approved: {new Date(display.approvedAt).toLocaleString()}
              {display.approvedBy ? ` by ${display.approvedBy}` : ''}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
