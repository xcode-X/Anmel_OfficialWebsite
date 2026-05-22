import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { scholarshipApplicationsApi } from '../../lib/api';
import { mergeApplicationWithFiles } from '../../lib/firestoreClient';
import { subscribeFirestoreDocument } from '../../lib/firestoreRealtime';
import { ADMIN_BASE } from '../../lib/adminPaths';
import { APPLICATION_DOC_FIELDS } from '../../lib/applicationDocFields';
import { viewDoc, downloadDoc } from '../../lib/docPreview';
import {
  Loader2, Wifi, WifiOff, Clock, ChevronRight, ArrowLeft,
  FileText, Eye, Download, Award, Mail, Phone, Building2,
} from 'lucide-react';

const LIST_PATH = `${ADMIN_BASE}/students`;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { value: 'reviewing', label: 'Reviewing', cls: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { value: 'accepted', label: 'Accepted', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'rejected', label: 'Rejected', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
];

const FILTER_TABS = ['all', 'pending', 'reviewing', 'accepted', 'rejected'];

const DOC_LABELS = {
  passportPhoto: 'Passport Photo',
  oLevelCertificate: 'O-Level Certificate',
  aLevelCertificate: 'A-Level Certificate',
  highSchoolDiploma: 'High School Diploma',
  waecResult: 'WAEC / WASSCE Results',
  academicTranscript: 'Academic Transcript',
  bachelorDegree: "Bachelor's Degree",
  masterDegree: "Master's Degree",
  englishProficiency: 'English Proficiency',
  healthCertificate: 'Health Certificate',
  passportBioPage: 'Passport Bio Page',
  recommendationLetters: 'Recommendation Letters',
  personalStatement: 'Personal Statement',
  cvResume: 'CV / Resume',
  otherDocuments: 'Other Documents',
};

function isNew(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function ApplicationDetail({ id, onClose, onRefresh }) {
  const location = useLocation();
  const cached = location.state?.application;
  const [detail, setDetail] = useState(
    cached && (cached._id === id || cached.id === id) ? cached : null,
  );
  const [loading, setLoading] = useState(!detail);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await scholarshipApplicationsApi.getById(id);
      if (data && (data.fullName || data.email)) {
        const merged = await mergeApplicationWithFiles(data);
        setDetail(merged);
      } else {
        setDetail((prev) => prev ?? null);
      }
    } catch {
      setDetail((prev) => prev ?? null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!cached) setLoading(true);
    load();
  }, [load, cached]);

  useEffect(() => {
    const cleanup = subscribeFirestoreDocument('scholarshipApplications', id, async (row) => {
      if (row) {
        const merged = await mergeApplicationWithFiles(row);
        setDetail(merged);
        setLoading(false);
      }
    });
    return cleanup;
  }, [id]);

  const handleStatusChange = async (status) => {
    setBusy(true);
    try {
      const updated = await scholarshipApplicationsApi.updateApplicationStatus(
        detail?.scholarshipId || '',
        id,
        status,
      );
      if (updated) setDetail(updated);
      else setDetail((prev) => (prev ? { ...prev, status } : prev));
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-sm">Loading application…</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-20 text-white">
        <p className="text-red-400 mb-6">Application not found.</p>
        <button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#2FA084] transition">
          <ArrowLeft className="w-4 h-4" /> Back to Scholarship application
        </button>
      </div>
    );
  }

  const statusMeta = STATUS_OPTIONS.find((s) => s.value === detail.status) || STATUS_OPTIONS[0];
  const docFields = detail.submittedDocFields?.length
    ? detail.submittedDocFields
    : detail._applicationFiles?.map((f) => f.field || f.id).filter(Boolean) ||
      APPLICATION_DOC_FIELDS.filter((f) => detail[f] || detail.documentFileNames?.[f]);

  return (
    <div className="max-w-4xl space-y-6">
      <button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#2FA084] transition">
        <ArrowLeft className="w-4 h-4" /> Back to Scholarship application
      </button>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{detail.fullName}</h2>
            <p className="text-sm text-neutral-400 mt-1 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{detail.email}</span>
              {detail.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{detail.phone}</span>}
            </p>
          </div>
          <select
            value={detail.status || 'pending'}
            disabled={busy}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`text-xs font-semibold rounded-full px-3 py-2 border bg-transparent cursor-pointer focus:outline-none ${statusMeta.cls}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#0A0F1A] text-white">{s.label}</option>
            ))}
          </select>
        </div>

        {detail.scholarshipTitle && (
          <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1">Scholarship</p>
            <p className="font-semibold text-white">{detail.scholarshipTitle}</p>
            {detail.scholarshipId && (
              <Link
                to={`${ADMIN_BASE}/scholarships/${detail.scholarshipId}`}
                className="inline-block mt-2 text-xs font-semibold text-sky-400 hover:text-sky-300"
              >
                View scholarship listing →
              </Link>
            )}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Full name', value: detail.fullName },
            { label: 'Email', value: detail.email },
            { label: 'Phone', value: detail.phone },
            { label: 'Country', value: detail.country },
            { label: 'University', value: detail.university },
            { label: 'Course / program', value: detail.course },
            { label: 'Degree level', value: detail.degreeLevel },
            { label: 'Education level', value: detail.educationLevel },
            { label: 'Experience', value: detail.experienceLevel },
            { label: 'Study mode', value: detail.studyMode },
            { label: 'Campus', value: detail.campus },
            { label: 'Status', value: (detail.status || 'pending').replace(/^\w/, (c) => c.toUpperCase()) },
            { label: 'Submitted', value: fmt(detail.createdAt) },
            { label: 'Last updated', value: fmt(detail.updatedAt) },
          ].filter((f) => f.value).map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">{label}</p>
              <p className="text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {detail.personalStatement && (
          <section>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">Personal statement</h3>
            <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">{detail.personalStatement}</p>
          </section>
        )}

        <section>
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Documents
            <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px]">{docFields.length}</span>
          </h3>
          {docFields.length === 0 ? (
            <p className="text-sm text-neutral-500 italic">No documents listed.</p>
          ) : (
            <div className="space-y-2">
              {detail.documentsPendingCollection && (
                <p className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  Some files were too large for inline storage. Contact the applicant if a document shows as pending.
                </p>
              )}
              {docFields.map((field) => {
                const url = detail[field];
                const fileMeta = detail._applicationFiles?.find((f) => (f.field || f.id) === field);
                const fileLabel = detail.documentFileNames?.[field] || fileMeta?.fileName;
                const hasFile =
                  (typeof url === 'string' && (url.startsWith('http') || url.startsWith('data:'))) ||
                  fileMeta?.dataUrl;
                const previewUrl = url || fileMeta?.dataUrl;
                return (
                <div key={field} className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <span className="text-sm text-white truncate">
                    {DOC_LABELS[field] || field}
                    {fileLabel && <span className="block text-[10px] text-neutral-500 truncate">{fileLabel}</span>}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasFile ? (
                      <>
                        <button type="button" onClick={() => viewDoc(previewUrl)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white">
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button type="button" onClick={() => downloadDoc(previewUrl, DOC_LABELS[field])} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2FA084]/20 hover:bg-[#2FA084]/30 text-xs text-[#2FA084]">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </>
                    ) : fileMeta?.tooLarge ? (
                      <span className="text-[10px] text-amber-400 uppercase tracking-wide">File too large — request by email</span>
                    ) : (
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Pending file</span>
                    )}
                  </div>
                </div>
              );})}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ApplicationCard({ r, onView }) {
  const newApp = isNew(r.createdAt);
  const statusMeta = STATUS_OPTIONS.find((s) => s.value === r.status) || STATUS_OPTIONS[0];
  return (
    <div className={`rounded-xl border bg-white/5 transition-colors ${newApp ? 'border-[#2FA084]/50' : 'border-white/10'}`}>
      <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold text-white">{r.fullName}</p>
            {newApp && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2FA084] text-[#0A0F1A] uppercase">New</span>}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusMeta.cls}`}>{r.status || 'pending'}</span>
          </div>
          <p className="text-sm text-neutral-400 truncate">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
          {r.scholarshipTitle && (
            <p className="text-xs text-sky-400/90 flex items-center gap-1 mt-1">
              <Award className="w-3 h-3 shrink-0" />{r.scholarshipTitle}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-neutral-500">
            {(r.documentsCount > 0 || r.submittedDocFields?.length > 0) && (
              <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                {r.documentsCount || r.submittedDocFields?.length} doc{(r.documentsCount || r.submittedDocFields?.length) !== 1 ? 's' : ''}
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{fmt(r.createdAt)}</span>
          </div>
        </div>
        <button type="button" onClick={() => onView(r._id)} className="shrink-0 flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2.5 text-sm text-white font-medium">
          View <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminScholarshipApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbDown, setDbDown] = useState(false);
  const [sseOk, setSseOk] = useState(false);
  const [filter, setFilter] = useState('all');
  const retryRef = useRef(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    let retrying = false;
    try {
      const data = await scholarshipApplicationsApi.list();
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
    const cleanupSse = scholarshipApplicationsApi.subscribe((list) => {
      setSseOk(true);
      if (Array.isArray(list)) {
        setDbDown(false);
        setRows(list);
        setLoading(false);
      } else load(true);
    });
    const pollId = window.setInterval(() => load(true), 20000);
    const onVis = () => { if (document.visibilityState === 'visible') load(true); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cleanupSse();
      clearInterval(pollId);
      clearTimeout(retryRef.current);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [load]);

  const counts = useMemo(() => FILTER_TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? rows.length : rows.filter((r) => (r.status || 'pending') === tab).length;
    return acc;
  }, {}), [rows]);

  const visible = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => (r.status || 'pending') === filter)),
    [rows, filter],
  );
  const newCount = rows.filter((r) => isNew(r.createdAt)).length;

  if (id) {
    return <ApplicationDetail id={id} onClose={() => navigate(LIST_PATH)} onRefresh={() => load(true)} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-sm">{dbDown ? 'Database reconnecting…' : 'Loading scholarship applications…'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Scholarship application
            {newCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#2FA084] text-[#0A0F1A]">{newCount} new</span>
            )}
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            {rows.length} application{rows.length !== 1 ? 's' : ''} from public scholarship listings
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {sseOk ? (
            <span className="flex items-center gap-1.5 text-emerald-400"><Wifi className="w-3.5 h-3.5" /> Live</span>
          ) : (
            <span className="flex items-center gap-1.5 text-neutral-500"><WifiOff className="w-3.5 h-3.5" /> Polling</span>
          )}
        </div>
      </div>

      {dbDown && (
        <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          Database reconnecting — data will refresh automatically.
        </div>
      )}

      <div className="flex gap-1 mb-5 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              filter === tab ? 'bg-white/15 text-white' : 'text-neutral-500 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab} <span className="opacity-60">({counts[tab]})</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((r) => (
          <ApplicationCard key={r._id} r={r} onView={(appId) => navigate(`${LIST_PATH}/${appId}`, { state: { application: r } })} />
        ))}
        {visible.length === 0 && !dbDown && (
          <p className="text-neutral-500 py-10 text-center">
            {filter === 'all' ? 'No scholarship applications yet.' : `No ${filter} applications.`}
          </p>
        )}
      </div>
    </div>
  );
}
