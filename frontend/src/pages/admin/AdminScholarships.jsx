import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Award, RefreshCw, Building2, MapPin, Calendar,
  DollarSign, Eye, EyeOff, Pencil, Share2, Users,
} from 'lucide-react';
import { scholarshipsApi } from '../../lib/api';
import { subscribeContentStream } from '../../lib/contentStream';
import { ADMIN_BASE } from '../../lib/adminPaths';
import SocialShareModal from '../../components/scholarships/SocialShareModal';

export default function AdminScholarships() {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);

  const newPath = `${ADMIN_BASE}/scholarships/new`;
  const editPath = (id) => `${ADMIN_BASE}/scholarships/${id}/edit`;
  const detailPath = (id) => `${ADMIN_BASE}/scholarships/${id}`;

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const data = await scholarshipsApi.adminList();
      setScholarships(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    load();
    const cleanups = [];
    cleanups.push(
      scholarshipsApi.subscribe((rows) => {
        setScholarships(rows);
        setLoading(false);
        setRefreshing(false);
      }, { admin: true }),
    );
    cleanups.push(
      subscribeContentStream((resource, meta) => {
        if (resource === 'scholarships') {
          if (meta?.action === 'deleted' && meta?.scholarshipId) {
            setScholarships((prev) => prev.filter((s) => s._id !== meta.scholarshipId));
          } else {
            load(true);
          }
        }
      }),
    );
    const onVis = () => {
      if (document.visibilityState === 'visible') load(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cleanups.forEach((fn) => fn());
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [load]);

  const handleDelete = async (id) => {
    try {
      await scholarshipsApi.remove(id);
      setConfirmDelete(null);
      setScholarships(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-white/40">
        <RefreshCw className="w-6 h-6 animate-spin mr-3" />
        Loading scholarships…
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Scholarships</h1>
          <p className="text-sm text-white/40 mt-1">
            {scholarships.length} listing{scholarships.length !== 1 ? 's' : ''} · published items appear live and can be shared to social media instantly
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to={newPath}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2FA084] text-white text-sm font-bold hover:bg-[#3CD1AD] transition shadow-lg shadow-[#2FA084]/20"
          >
            <Plus className="w-4 h-4" />
            Add Scholarship
          </Link>
        </div>
      </div>

      {scholarships.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
          <Award className="w-12 h-12 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 text-lg font-medium">No scholarships yet</p>
          <p className="text-white/25 text-sm mt-1 mb-6">Create one to populate the Scholarship Opportunities section</p>
          <Link to={newPath}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2FA084] text-white text-sm font-bold hover:bg-[#3CD1AD] transition">
            <Plus className="w-4 h-4" />
            Add Scholarship
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/3 border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-medium">Scholarship</th>
                <th className="px-5 py-3.5 font-medium hidden md:table-cell">Location</th>
                <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Type</th>
                <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Deadline</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium hidden md:table-cell">Applications</th>
                <th className="px-5 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {scholarships.map(s => (
                  <motion.tr key={s._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="hover:bg-white/4 transition group">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white group-hover:text-[#2FA084] transition">{s.title}</p>
                      {s.amount && <p className="text-xs text-emerald-400/80 mt-0.5 flex items-center gap-1"><DollarSign className="w-3 h-3" />{s.amount}</p>}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-white/70 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-white/25" />{s.university}</p>
                      <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{s.country}</p>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-white/60">{s.scholarshipType}</td>
                    <td className="px-5 py-4 hidden lg:table-cell text-white/60">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-white/25" />
                        {s.deadline ? new Date(s.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {s.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                          <Eye className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/40 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                          <EyeOff className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Link to={detailPath(s._id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition">
                        <Users className="w-3.5 h-3.5" />
                        View applications
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {confirmDelete === s._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => handleDelete(s._id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition">Confirm</button>
                          <button type="button" onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:bg-white/5 transition">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => navigate(detailPath(s._id))}
                            className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-500/10 transition" title="View applications">
                            <Users className="w-4 h-4" />
                          </button>
                          {s.isPublished && (
                            <button type="button" onClick={() => setShareTarget(s)}
                              className="p-2 rounded-lg text-white/40 hover:text-sky-400 hover:bg-sky-500/10 transition" title="Share to social media">
                              <Share2 className="w-4 h-4" />
                            </button>
                          )}
                          <button type="button" onClick={() => navigate(editPath(s._id))}
                            className="p-2 rounded-lg text-white/40 hover:text-[#2FA084] hover:bg-[#2FA084]/10 transition" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => setConfirmDelete(s._id)}
                            className="p-2 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      <SocialShareModal
        scholarship={shareTarget}
        open={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
      />
    </div>
  );
}
