import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, FileText, Eye, Download, Loader2, Wifi,
} from 'lucide-react';
import { scholarshipsApi, scholarshipApplicationsApi } from '../../lib/api';
import { mergeApplicationWithFiles } from '../../lib/firestoreClient';
import {
  subscribeFirestoreDocument,
  subscribeScholarshipApplicationFiles,
} from '../../lib/firestoreRealtime';
import { APPLICATION_DOC_FIELDS } from '../../lib/applicationDocFields';
import { viewDoc, downloadDoc, resolveDocUrl } from '../../lib/docPreview';
import { ADMIN_BASE } from '../../lib/adminPaths';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { value: 'reviewing', label: 'Reviewing', cls: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { value: 'accepted', label: 'Accepted', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'rejected', label: 'Rejected', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
];

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

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function ScholarshipApplicationReview({ scholarshipId, appId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);

  const applyMerged = useCallback(async (row, fileRows = null) => {
    if (!row) return;
    const base = fileRows
      ? { ...row, _applicationFiles: fileRows }
      : row;
    const merged = await mergeApplicationWithFiles(base);
    setDetail(merged);
    setLoading(false);
    setLive(true);
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await scholarshipApplicationsApi.getById(appId);
      if (data) await applyMerged(data);
      else setDetail(null);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [appId, applyMerged]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    const cleanups = [];
    cleanups.push(
      subscribeFirestoreDocument('scholarshipApplications', appId, (row) => {
        if (row) applyMerged(row);
      }),
    );
    cleanups.push(
      subscribeScholarshipApplicationFiles(appId, (files) => {
        setDetail((prev) => {
          if (!prev) return prev;
          mergeApplicationWithFiles({ ...prev, _applicationFiles: files }).then((merged) => {
            setDetail(merged);
            setLive(true);
          });
          return prev;
        });
      }),
    );
    return () => cleanups.forEach((fn) => fn());
  }, [appId, applyMerged]);

  const handleStatusChange = async (status) => {
    setBusy(true);
    try {
      const sid = detail?.scholarshipId || scholarshipId;
      const updated = await scholarshipsApi.updateApplicationStatus(sid, appId, status);
      if (updated) setDetail(updated);
      else setDetail((prev) => (prev ? { ...prev, status } : prev));
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
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#2FA084] transition">
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </button>
      </div>
    );
  }

  const statusMeta = STATUS_OPTIONS.find((s) => s.value === detail.status) || STATUS_OPTIONS[0];
  const docFields = [
    ...new Set([
      ...(detail.submittedDocFields || []),
      ...(detail._applicationFiles?.map((f) => f.field || f.id).filter(Boolean) || []),
      ...APPLICATION_DOC_FIELDS.filter((f) => resolveDocUrl(detail[f])),
      ...APPLICATION_DOC_FIELDS.filter((f) => detail.documentFileNames?.[f]),
    ]),
  ];

  return (
    <div className="max-w-4xl space-y-6 text-white">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#2FA084] transition">
        <ArrowLeft className="w-4 h-4" /> Back to applications
      </button>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{detail.fullName}</h2>
              {live && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-400">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-400 flex flex-wrap items-center gap-3">
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
            <p className="font-semibold">{detail.scholarshipTitle}</p>
            <Link
              to={`${ADMIN_BASE}/scholarships/${detail.scholarshipId || scholarshipId}`}
              className="inline-block mt-2 text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              View listing →
            </Link>
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
            { label: 'Submitted', value: fmt(detail.createdAt) },
            { label: 'Last updated', value: fmt(detail.updatedAt) },
          ].filter((f) => f.value).map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">{label}</p>
              <p className="mt-0.5 break-words">{value}</p>
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
            <p className="text-sm text-neutral-500 italic">No documents listed for this application.</p>
          ) : (
            <div className="space-y-2">
              {docFields.map((field) => {
                const fileMeta = detail._applicationFiles?.find((f) => (f.field || f.id) === field);
                const previewUrl = resolveDocUrl(detail[field]) || resolveDocUrl(fileMeta?.dataUrl) || resolveDocUrl(fileMeta?.downloadUrl);
                const fileLabel = detail.documentFileNames?.[field] || fileMeta?.fileName || DOC_LABELS[field];
                const canOpen = !!previewUrl;

                return (
                  <div key={field} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                    <span className="text-sm truncate min-w-0">
                      {DOC_LABELS[field] || field}
                      {fileLabel && <span className="block text-[10px] text-neutral-500 truncate">{fileLabel}</span>}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {canOpen ? (
                        <>
                          <button
                            type="button"
                            onClick={() => viewDoc(previewUrl)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDoc(previewUrl, DOC_LABELS[field] || field)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2FA084]/20 hover:bg-[#2FA084]/30 text-xs text-[#2FA084]"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </>
                      ) : fileMeta?.tooLarge ? (
                        <span className="text-[10px] text-amber-400">Enable Firebase Storage to view this file</span>
                      ) : (
                        <span className="text-[10px] text-neutral-500">Awaiting upload…</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
