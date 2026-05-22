import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Award, Building2, Calendar, DollarSign, MapPin,
  RefreshCw, Pencil, Users, Mail, Phone, Loader2, Eye, Wifi,
} from 'lucide-react';
import { scholarshipsApi } from '../../lib/api';
import { subscribeContentStream } from '../../lib/contentStream';
import { ADMIN_BASE } from '../../lib/adminPaths';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { value: 'reviewing', label: 'Reviewing', cls: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { value: 'accepted', label: 'Accepted', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'rejected', label: 'Rejected', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
];

const DETAIL_PATH = `${ADMIN_BASE}/students`;

export default function AdminScholarshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [live, setLive] = useState(false);

  const listPath = `${ADMIN_BASE}/scholarships`;
  const editPath = `${ADMIN_BASE}/scholarships/${id}/edit`;

  const loadApplications = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    try {
      const data = await scholarshipsApi.listApplications(id);
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      if (!quiet) setApplications([]);
    } finally {
      setRefreshing(false);
    }
  }, [id]);

  const load = useCallback(async () => {
    try {
      const [sch, apps] = await Promise.all([
        scholarshipsApi.get(id),
        scholarshipsApi.listApplications(id),
      ]);
      setScholarship(sch);
      setApplications(Array.isArray(apps) ? apps : []);
    } catch {
      setScholarship(null);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
    const cleanupFs = scholarshipsApi.subscribeApplications(id, (rows) => {
      setLive(true);
      if (Array.isArray(rows)) setApplications(rows);
    });
    const cleanupStream = subscribeContentStream((resource, meta) => {
      if (resource === 'scholarships') {
        if (meta?.action === 'deleted' && meta?.scholarshipId === id) {
          setScholarship(null);
          setApplications([]);
          setLoading(false);
          return;
        }
        load();
      }
      if (resource === 'scholarship-applications' && (!meta?.scholarshipId || meta.scholarshipId === id)) {
        loadApplications(true);
      }
    });
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        load();
        loadApplications(true);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cleanupFs();
      cleanupStream();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [id, load, loadApplications]);

  const handleStatusChange = async (appId, status) => {
    try {
      const updated = await scholarshipsApi.updateApplicationStatus(id, appId, status);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, ...(updated || {}), status } : a)),
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const openApplication = (app) => {
    navigate(`${DETAIL_PATH}/${app._id}`, { state: { application: app } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin mr-3" />
        Loading scholarship…
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="text-center py-20 text-white">
        <p className="text-red-400 mb-6">Scholarship not found.</p>
        <Link to={listPath} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to scholarships
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <Link
          to={listPath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#2FA084] transition mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to scholarships
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2FA084]/15 border border-[#2FA084]/25">
              <Award className="w-6 h-6 text-[#2FA084]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{scholarship.title}</h1>
              <p className="text-sm text-white/40 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{scholarship.university}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{scholarship.country}</span>
                {scholarship.amount && <span className="inline-flex items-center gap-1 text-emerald-400"><DollarSign className="w-3.5 h-3.5" />{scholarship.amount}</span>}
                <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => loadApplications()} disabled={refreshing}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link to={editPath}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition">
              <Pencil className="w-4 h-4" /> Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2FA084]" />
            <h2 className="font-bold">Student Applications</h2>
            <span className="text-xs font-semibold text-white/40 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
              {applications.length} total
            </span>
            {live && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                <Wifi className="w-3 h-3" /> Live
              </span>
            )}
          </div>
          <p className="text-xs text-white/30">New submissions appear instantly — open a row for full details &amp; documents</p>
        </div>

        {applications.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-medium">No applications yet</p>
            <p className="text-white/25 text-sm mt-1">New submissions will appear here instantly</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[720px]">
              <thead className="bg-white/3 border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Applicant</th>
                  <th className="px-5 py-3.5 font-medium hidden md:table-cell">Contact</th>
                  <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Program</th>
                  <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Documents</th>
                  <th className="px-5 py-3.5 font-medium">Submitted</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map((app) => {
                  const statusMeta = STATUS_OPTIONS.find((s) => s.value === app.status) || STATUS_OPTIONS[0];
                  return (
                    <motion.tr
                      key={app._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-white/4 transition cursor-pointer"
                      onClick={() => openApplication(app)}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{app.fullName}</p>
                        <p className="text-xs text-white/40 mt-0.5">{app.country || '—'}</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-white/70 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-white/25" />{app.email}</p>
                        {app.phone && <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{app.phone}</p>}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-white/60">
                        <p>{app.degreeLevel || '—'}</p>
                        {app.course && <p className="text-xs text-white/40 mt-0.5">{app.course}</p>}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-white/60">
                        {app.documentsCount || app.submittedDocFields?.length || 0} uploaded
                      </td>
                      <td className="px-5 py-4 text-white/60 whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={app.status || 'pending'}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-2.5 py-1.5 border bg-transparent cursor-pointer focus:outline-none ${statusMeta.cls}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value} className="bg-[#0A0F1A] text-white">{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openApplication(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2FA084]/15 text-[#2FA084] text-xs font-semibold hover:bg-[#2FA084]/25 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
