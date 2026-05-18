import { useEffect, useState, useRef, useCallback } from 'react';
import { api, auth, studentRegistrations } from '../../lib/api';
import {
  Loader2, Wifi, WifiOff, Building, Clock, X, Eye, Download,
  FileText, CheckCircle2, XCircle, RotateCcw, GraduationCap,
  ChevronRight, AlertTriangle, User, Mail, Phone, Globe,
  Copy, KeyRound,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────

function isNew(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_COLORS = {
  pending:     'bg-white/10 text-white/60',
  ready:       'bg-emerald-500/20 text-emerald-300',
  provisioned: 'bg-blue-500/20 text-blue-300',
  rejected:    'bg-red-500/20 text-red-400',
};

const DOC_FIELDS = [
  'passportPhoto', 'oLevelCertificate', 'aLevelCertificate', 'highSchoolDiploma',
  'waecResult', 'academicTranscript', 'bachelorDegree', 'masterDegree',
  'englishProficiency', 'healthCertificate', 'passportBioPage',
  'recommendationLetters', 'personalStatement', 'cvResume', 'otherDocuments',
];

const DOC_LABELS = {
  passportPhoto: 'Passport Photo',        oLevelCertificate: 'O-Level Certificate',
  aLevelCertificate: 'A-Level Certificate', highSchoolDiploma: 'High School Diploma',
  waecResult: 'WAEC / WASSCE Results',    academicTranscript: 'Academic Transcript',
  bachelorDegree: "Bachelor's Degree",    masterDegree: "Master's Degree",
  englishProficiency: 'English Proficiency', healthCertificate: 'Health Certificate',
  passportBioPage: 'Passport Bio Page',   recommendationLetters: 'Recommendation Letters',
  personalStatement: 'Personal Statement', cvResume: 'CV / Resume',
  otherDocuments: 'Other Documents',
};

function getMime(dataUrl) {
  try { return dataUrl.split(';')[0].split(':')[1]; } catch { return 'application/octet-stream'; }
}

function viewDoc(dataUrl) {
  try {
    const arr   = dataUrl.split(',');
    const mime  = arr[0].match(/:(.*?);/)[1];
    const bstr  = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    const blob  = new Blob([u8arr], { type: mime });
    const url   = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch {
    window.open(dataUrl, '_blank');
  }
}

function downloadDoc(dataUrl, label) {
  const mime = getMime(dataUrl);
  const ext  = mime.includes('pdf') ? 'pdf' : mime.includes('jpeg') ? 'jpg' : mime.includes('png') ? 'png' : 'file';
  const link = document.createElement('a');
  link.href     = dataUrl;
  link.download = `${label.replace(/[\s/]+/g, '_')}.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Password cell (copy-to-clipboard) ───────────────────────────────────────

function PasswordCell({ password }) {
  const [visible, setVisible] = useState(false);
  const [copied,  setCopied]  = useState(false);
  if (!password) return <span className="text-white/25 italic text-xs">hidden</span>;
  const copy = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-base tracking-widest text-[#64FFDA] font-bold">
        {visible ? password : '••••••••••'}
      </span>
      <button type="button" onClick={() => setVisible(v => !v)} title={visible ? 'Hide' : 'Show'}
        className="text-white/30 hover:text-white/70 transition">
        <Eye className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={copy} title="Copy"
        className="text-white/30 hover:text-[#2FA084] transition">
        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ─── Detail Overlay ───────────────────────────────────────────────────────────

function DetailOverlay({ id, onClose, onRefresh }) {
  const [detail, setDetail]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [busy, setBusy]             = useState('');       // which action is in-flight
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [notice, setNotice]         = useState(null);     // { type: 'success'|'error', msg }
  const [lmsResult, setLmsResult]   = useState(null);     // result from provision-lms API

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentRegistrations.getById(id);
      setDetail(data);
    } catch (err) {
      setNotice({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const doFlag = async (patch) => {
    setBusy('flag');
    try {
      await api.patch(`/student-registrations/${id}`, patch);
      await load();
      onRefresh();
    } catch (err) {
      setNotice({ type: 'error', msg: err.message });
    } finally { setBusy(''); }
  };

  const doReject = async () => {
    setBusy('reject');
    try {
      await studentRegistrations.reject(id, rejectReason);
      setShowReject(false);
      setRejectReason('');
      await load();
      onRefresh();
      setNotice({ type: 'success', msg: 'Application rejected.' });
    } catch (err) {
      setNotice({ type: 'error', msg: err.message });
    } finally { setBusy(''); }
  };

  const doRestore = async () => {
    setBusy('restore');
    try {
      await studentRegistrations.restore(id);
      await load();
      onRefresh();
      setNotice({ type: 'success', msg: 'Application restored to review queue.' });
    } catch (err) {
      setNotice({ type: 'error', msg: err.message });
    } finally { setBusy(''); }
  };

  const doProvision = async () => {
    setBusy('lms');
    setNotice(null);
    try {
      const result = await studentRegistrations.provision(id);
      setLmsResult(result);
      await load();
      onRefresh();
    } catch (err) {
      setNotice({ type: 'error', msg: err.message });
    } finally { setBusy(''); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative h-full w-full max-w-2xl overflow-y-auto bg-[#0A0F1A] border-l border-white/10 shadow-2xl flex flex-col">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-[#0A0F1A]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Application Detail</h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-white/40">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading application…</p>
          </div>
        ) : !detail ? (
          <div className="flex items-center justify-center flex-1 text-red-400">Failed to load.</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* Notice */}
            {notice && (
              <div className={`rounded-lg p-3 text-sm flex items-start justify-between gap-3 ${
                notice.type === 'success'
                  ? 'border border-[#2FA084]/30 bg-[#2FA084]/10 text-[#2FA084]'
                  : 'border border-red-500/30 bg-red-500/10 text-red-400'
              }`}>
                <p className="break-words">{notice.msg}</p>
                <button type="button" onClick={() => setNotice(null)} className="shrink-0 hover:opacity-70"><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Status + New badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[detail.status] || STATUS_COLORS.pending}`}>
                {detail.status}
              </span>
              {isNew(detail.createdAt) && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2FA084] text-[#0A0F1A] uppercase tracking-wide">New</span>
              )}
              <span className="ml-auto text-xs text-neutral-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Submitted {fmt(detail.createdAt)}
              </span>
            </div>

            {/* Personal info */}
            <section>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: User,  label: 'Full Name',  value: detail.fullName },
                  { icon: Mail,  label: 'Email',      value: detail.email },
                  { icon: Phone, label: 'Phone',      value: detail.phone },
                  { icon: Globe, label: 'Country',    value: detail.country },
                ].map(({ icon: Icon, label, value }) => value ? (
                  <div key={label} className="flex items-start gap-2.5 bg-white/5 rounded-lg p-3">
                    <Icon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">{label}</p>
                      <p className="text-sm text-white break-all">{value}</p>
                    </div>
                  </div>
                ) : null)}
              </div>
            </section>

            {/* Academic background */}
            {(detail.educationLevel || detail.experienceLevel) && (
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Academic Background</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detail.educationLevel && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Education Level</p>
                      <p className="text-sm text-white">{detail.educationLevel}</p>
                    </div>
                  )}
                  {detail.experienceLevel && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Experience</p>
                      <p className="text-sm text-white">{detail.experienceLevel}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Program selection */}
            {(detail.university || detail.course || detail.degreeLevel) && (
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Building className="w-3.5 h-3.5" /> Program Selection
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'University',  value: detail.university },
                    { label: 'Course',      value: detail.course },
                    { label: 'Degree Level', value: detail.degreeLevel },
                    { label: 'Study Mode',  value: detail.studyMode },
                    { label: 'Campus',      value: detail.campus },
                    { label: 'Intake',      value: detail.intake },
                  ].filter(f => f.value).map(({ label, value }) => (
                    <div key={label} className="bg-white/5 rounded-lg p-3">
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">{label}</p>
                      <p className="text-sm text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Motivation */}
            {detail.motivation && (
              <section>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Motivation Statement</h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{detail.motivation}</p>
                </div>
              </section>
            )}

            {/* Rejection reason (if rejected) */}
            {detail.status === 'rejected' && detail.rejectionReason && (
              <section>
                <h3 className="text-xs font-semibold text-red-400/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Rejection Reason
                </h3>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-sm text-red-300 leading-relaxed">{detail.rejectionReason}</p>
                </div>
              </section>
            )}

            {/* Documents */}
            <section>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Submitted Documents
                <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] font-semibold">
                  {detail.submittedDocFields?.length || 0}
                </span>
              </h3>
              {(!detail.submittedDocFields || detail.submittedDocFields.length === 0) ? (
                <p className="text-sm text-neutral-500 italic">No documents uploaded.</p>
              ) : (
                <div className="space-y-2">
                  {detail.submittedDocFields.map(field => (
                    <div key={field} className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-[#2FA084] shrink-0" />
                        <span className="text-sm text-white truncate">{DOC_LABELS[field]}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => viewDoc(detail[field])}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
                          title="Preview in new tab"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadDoc(detail[field], DOC_LABELS[field])}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2FA084]/20 hover:bg-[#2FA084]/30 text-xs text-[#2FA084] transition-colors"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Admin Actions ── */}
            <section>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Admin Actions</h3>
              <div className="space-y-3">

                {/* Requirements + Fees toggles */}
                {detail.status !== 'rejected' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy === 'flag'}
                      onClick={() => doFlag({ requirementsReceived: !detail.requirementsReceived })}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                        detail.requirementsReceived
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {detail.requirementsReceived ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      Requirements {detail.requirementsReceived ? 'Received' : 'Pending'}
                    </button>
                    <button
                      type="button"
                      disabled={busy === 'flag'}
                      onClick={() => doFlag({ feesPaid: !detail.feesPaid })}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                        detail.feesPaid
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {detail.feesPaid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      Fees {detail.feesPaid ? 'Paid' : 'Outstanding'}
                    </button>
                  </div>
                )}

                {/* ── LMS provisioning ── */}
                {detail.status !== 'rejected' && !detail.lmsProvisioned && !lmsResult && (
                  <>
                    <button
                      type="button"
                      disabled={busy === 'lms'}
                      onClick={doProvision}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2FA084] px-4 py-3 text-sm font-bold text-[#0A0F1A] disabled:cursor-not-allowed disabled:opacity-60 hover:bg-[#3CD1AD] active:scale-[.98] transition-all"
                    >
                      {busy === 'lms'
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating LMS Account…</>
                        : <><GraduationCap className="w-4 h-4" /> Create LMS Account</>
                      }
                    </button>
                    {(!detail.requirementsReceived || !detail.feesPaid) && (
                      <p className="text-[11px] text-neutral-500 text-center -mt-1">
                        Tip: mark requirements &amp; fees above before provisioning for a cleaner workflow.
                      </p>
                    )}
                  </>
                )}

                {/* ── Credentials box (shown immediately after provisioning in this session) ── */}
                {lmsResult && (
                  <div className="rounded-xl border border-[#2FA084]/30 bg-[#2FA084]/6 p-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2FA084] flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5" /> LMS Account Created
                    </p>
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/35 mb-0.5">Email / Username</p>
                        <p className="text-sm text-white font-mono">{lmsResult.email}</p>
                      </div>
                      {lmsResult.password && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Temporary Password</p>
                          <PasswordCell password={lmsResult.password} />
                        </div>
                      )}
                      {lmsResult.existing && (
                        <p className="text-xs text-neutral-400">This email already had an account — it has been linked.</p>
                      )}
                    </div>
                    <p className="text-xs text-[#2FA084]/70">
                      Login credentials have been emailed to the student at <strong>{lmsResult.email}</strong>.
                    </p>
                  </div>
                )}

                {/* ── Already provisioned (reloaded from DB — password not stored for security) ── */}
                {detail.lmsProvisioned && !lmsResult && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/6 p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-300">LMS Account Active</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Account linked to <span className="font-mono text-white/70">{detail.email}</span>.
                        {detail.lmsProvisionedAt && (
                          <span className="ml-1">Created {fmt(detail.lmsProvisionedAt)}.</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {!detail.lmsProvisioned && (
                  detail.status === 'rejected' ? (
                    /* Restore button */
                    <button
                      type="button"
                      disabled={busy === 'restore'}
                      onClick={doRestore}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                      {busy === 'restore' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      Restore Application
                    </button>
                  ) : (
                    /* Reject button / form */
                    !showReject ? (
                      <button
                        type="button"
                        onClick={() => setShowReject(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject Application
                      </button>
                    ) : (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
                        <p className="text-sm font-semibold text-red-400">Confirm Rejection</p>
                        <textarea
                          rows={3}
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection (optional — will be stored on record)"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-400 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={busy === 'reject'}
                            onClick={doReject}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-500/80 hover:bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                          >
                            {busy === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Confirm Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowReject(false); setRejectReason(''); }}
                            className="px-4 py-2.5 rounded-lg bg-white/10 text-sm text-neutral-300 hover:bg-white/15 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main list card ───────────────────────────────────────────────────────────

function StudentCard({ r, onView }) {
  const newApp = isNew(r.createdAt);
  return (
    <div className={`rounded-xl border bg-white/5 transition-colors ${
      newApp ? 'border-[#2FA084]/50' : r.status === 'rejected' ? 'border-red-500/20' : 'border-white/10'
    }`}>
      <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold text-white">{r.fullName}</p>
            {newApp && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2FA084] text-[#0A0F1A] uppercase tracking-wide">New</span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[r.status] || STATUS_COLORS.pending}`}>
              {r.status}
            </span>
          </div>
          <p className="text-sm text-neutral-400 truncate">{r.email}{r.phone ? ` · ${r.phone}` : ''}{r.country ? ` · ${r.country}` : ''}</p>
          {(r.university || r.course) && (
            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
              <Building className="w-3 h-3" />
              {[r.university, r.course, r.degreeLevel].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {(r.submittedDocFields?.length > 0) && (
              <span className="text-[10px] text-neutral-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                {r.submittedDocFields.length} doc{r.submittedDocFields.length !== 1 ? 's' : ''}
              </span>
            )}
            {r.requirementsReceived && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Requirements ✓</span>
            )}
            {r.feesPaid && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Fees ✓</span>
            )}
            {r.lmsProvisioned && (
              <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">LMS Active</span>
            )}
            <span className="text-[10px] text-neutral-600 flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />{fmt(r.createdAt)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onView(r._id)}
          className="shrink-0 flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2.5 text-sm text-white font-medium transition-colors"
        >
          View <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const FILTER_TABS = ['all', 'pending', 'ready', 'provisioned', 'rejected'];

export default function AdminStudentIntake() {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [dbDown, setDbDown]       = useState(false);
  const [sseOk, setSseOk]         = useState(false);
  const [filter, setFilter]       = useState('all');
  const [detailId, setDetailId]   = useState(null);
  const retryRef = useRef(null);
  const pollRef  = useRef(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    let retrying = false;
    try {
      const data = await api.get('/student-registrations');
      setDbDown(false);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message === 'db_unavailable') {
        setDbDown(true);
        if (!quiet) {
          clearTimeout(retryRef.current);
          retryRef.current = setTimeout(() => load(false), 2000);
          retrying = true;
        }
      }
    } finally {
      if (!quiet && !retrying) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const token = auth.getToken();
    let sseSource;

    if (token) {
      sseSource = new EventSource(
        `/api/student-registrations/stream?token=${encodeURIComponent(token)}`
      );
      sseSource.addEventListener('open', () => setSseOk(true));
      sseSource.onmessage = (e) => {
        try { if (JSON.parse(e.data).event === 'changed') load(true); } catch { /* ignore */ }
      };
      sseSource.onerror = () => setSseOk(false);
    }

    pollRef.current = setInterval(() => load(true), 30000);

    return () => {
      sseSource?.close();
      clearInterval(pollRef.current);
      clearTimeout(retryRef.current);
    };
  }, [load]);

  const counts = FILTER_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? rows.length : rows.filter(r => r.status === tab).length;
    return acc;
  }, {});

  const visible = filter === 'all' ? rows : rows.filter(r => r.status === filter);
  const newCount = rows.filter(r => isNew(r.createdAt)).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-sm">{dbDown ? 'Database reconnecting…' : 'Loading applications…'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Detail overlay */}
      {detailId && (
        <DetailOverlay
          id={detailId}
          onClose={() => setDetailId(null)}
          onRefresh={() => load(true)}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Student Intake
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#2FA084] text-[#0A0F1A]">
                {newCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {rows.length} application{rows.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {sseOk ? (
            <span className="flex items-center gap-1.5 text-emerald-400"><Wifi className="w-3.5 h-3.5" /> Live</span>
          ) : (
            <span className="flex items-center gap-1.5 text-neutral-500"><WifiOff className="w-3.5 h-3.5" /> Polling 30 s</span>
          )}
        </div>
      </div>

      {/* DB reconnecting */}
      {dbDown && (
        <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          Database reconnecting — data will refresh automatically.
        </div>
      )}

      {/* ── Status filter tabs ── */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              filter === tab
                ? 'bg-white/15 text-white'
                : 'text-neutral-500 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab} <span className="opacity-60">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* ── Application list ── */}
      <div className="space-y-3">
        {visible.map(r => (
          <StudentCard key={r._id} r={r} onView={id => setDetailId(id)} />
        ))}
        {visible.length === 0 && !dbDown && (
          <p className="text-neutral-500 py-10 text-center">
            {filter === 'all' ? 'No student applications yet.' : `No ${filter} applications.`}
          </p>
        )}
      </div>
    </div>
  );
}
