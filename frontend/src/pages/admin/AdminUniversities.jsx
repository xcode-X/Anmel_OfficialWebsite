import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Building2, BookOpen, MapPin, X,
  GraduationCap, Users, Award, ChevronDown, ChevronUp, Image as ImageIcon,
  Globe, Loader2, ExternalLink, CheckCircle2, AlertCircle, Link2,
} from 'lucide-react';
import { universitiesApi } from '../../lib/api';


// ─── Form panel ───────────────────────────────────────────────────────────────
function UniversityFormPanel({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', country: '', description: '', ranking: '', founded: '', students: '', website: '' });
  const [courses, setCourses]     = useState([]);
  const [imageFile, setImageFile] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const lookedUpUrl = useRef('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── URL lookup (via backend proxy — no direct Hipolabs/Wikipedia from browser) ─
  const lookupUrl = async (url) => {
    if (!url) return;
    const trimmed = url.trim();
    try { new URL(trimmed); } catch { return; }
    lookedUpUrl.current = trimmed;
    setLookingUp(true);
    setLookupDone(false);
    setLookupError('');

    try {
      const data = await universitiesApi.lookup(trimmed);
      setForm(f => ({
        ...f,
        website:     data.website     || trimmed,
        name:        data.name        || f.name,
        country:     data.country     || f.country,
        description: data.description || f.description,
        founded:     data.founded     || f.founded,
        students:    data.students    || f.students,
      }));
      if (data.courses?.length > 0) setCourses(data.courses);
      setLookupDone(true);
    } catch {
      setLookupError('Could not fetch details. Fill in manually or click Lookup to try again.');
    } finally {
      setLookingUp(false);
    }
  };

  const handleUrlChange = (e) => {
    set('website', e.target.value);
    setLookupDone(false);
    lookedUpUrl.current = '';
  };

  const handleUrlPaste = (e) => {
    const pasted = (e.clipboardData?.getData('text') || '').trim();
    if (pasted.startsWith('http')) {
      // update the input value first, then auto-trigger lookup
      set('website', pasted);
      setLookupDone(false);
      setTimeout(() => lookupUrl(pasted), 100);
    }
  };

  // ── Image ───────────────────────────────────────────────────────────────────
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImageFile(reader.result); setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };

  // ── Course management ───────────────────────────────────────────────────────
  const removeCourse = (i) => setCourses(c => c.filter((_, idx) => idx !== i));
  const addCustomCourse = () => {
    if (!newCourse.trim()) return;
    setCourses(c => [...c, { name: newCourse.trim(), level: 'Undergraduate', duration: '' }]);
    setNewCourse('');
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim())    { setError('University name is required.');  return; }
    if (!form.country.trim()) { setError('Country is required.'); return; }
    setSaving(true);
    try {
      const created = await universitiesApi.create({
        ...form,
        courses: courses.filter(c => c.name.trim()),
        image: imageFile || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      });
      onSaved(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save university.');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-full w-full max-w-xl bg-[#0A0F1A] border-l border-white/8 overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0A0F1A] border-b border-white/8">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Add Partner University</h2>
            <p className="text-xs text-white/40 mt-0.5">Paste the university website URL — details &amp; courses auto-fill instantly</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-white/40 hover:text-white/80 rounded-lg hover:bg-white/5 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          {/* ── URL field (primary trigger) ── */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
              University Website URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                {lookingUp
                  ? <Loader2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2FA084] animate-spin pointer-events-none" />
                  : <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                }
                <input
                  value={form.website}
                  onChange={handleUrlChange}
                  onPaste={handleUrlPaste}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), lookupUrl(form.website))}
                  placeholder="Paste or type URL e.g. https://www.ox.ac.uk"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50"
                />
              </div>
              <button
                type="button"
                onClick={() => lookupUrl(form.website)}
                disabled={lookingUp || !form.website.trim().startsWith('http')}
                className="px-4 py-3 rounded-xl bg-[#2FA084] text-white text-sm font-bold hover:bg-[#3CD1AD] transition disabled:opacity-40 flex items-center gap-2 shrink-0"
              >
                {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {lookingUp ? 'Looking up…' : 'Lookup'}
              </button>
            </div>
            {lookingUp && (
              <p className="mt-2 text-xs text-[#2FA084]/70 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Looking up university name, details &amp; programmes…
              </p>
            )}
            {lookupDone && !lookingUp && (
              <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Details auto-filled from web — review and edit the fields below before saving.
              </p>
            )}
            {lookupError && !lookingUp && (
              <p className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {lookupError}
              </p>
            )}
          </div>

          {/* ── Campus image ── */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Campus Image</label>
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-white/10 hover:border-[#2FA084]/40 transition group bg-white/3">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button type="button" onClick={() => { setImageFile(''); setImagePreview(''); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 cursor-pointer">
                  <ImageIcon className="w-9 h-9 text-white/20 mb-2 group-hover:text-[#2FA084]/60 transition" />
                  <span className="text-sm text-white/30 group-hover:text-white/50 transition">Click to upload campus photo</span>
                  <span className="text-xs text-white/20 mt-1">JPG, PNG, WebP · max 5 MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
              )}
            </div>
          </div>

          {/* ── University details (auto-filled, editable) ── */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">University Details</p>

            <div>
              <label className="block text-xs text-white/40 mb-1.5">University Name *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. University of Oxford" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5">Country *</label>
              <input required value={form.country} onChange={e => set('country', e.target.value)} placeholder="e.g. United Kingdom" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Global Ranking</label>
                <input value={form.ranking} onChange={e => set('ranking', e.target.value)} placeholder="e.g. #1 in UK" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Founded Year</label>
                <input value={form.founded} onChange={e => set('founded', e.target.value)} placeholder="e.g. 1209" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Total Students</label>
                <input value={form.students} onChange={e => set('students', e.target.value)} placeholder="e.g. 24000+" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Brief description of the university…" rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50 resize-none" />
            </div>
          </div>

          {/* ── Courses — auto-fetched from URL, shown as removable chips ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
              Programmes &amp; Degrees
              {courses.length > 0 && <span className="ml-2 text-[#2FA084] normal-case font-normal">({courses.length} detected)</span>}
            </p>

            {courses.length === 0 && !lookingUp && (
              <p className="text-xs text-white/30 italic mb-3">
                Paste the university URL above and programmes will appear here automatically.
              </p>
            )}

            {courses.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                <AnimatePresence>
                  {courses.map((c, i) => (
                    <motion.span key={c.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.level === 'PhD' ? 'bg-purple-400' : c.level === "Master's" ? 'bg-blue-400' : 'bg-[#2FA084]'}`} />
                      {c.name}
                      <button type="button" onClick={() => removeCourse(i)}
                        className="ml-0.5 text-white/30 hover:text-red-400 transition rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Add custom programme */}
            <div className="flex gap-2">
              <input
                value={newCourse}
                onChange={e => setNewCourse(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomCourse())}
                placeholder="Add a programme manually…"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50"
              />
              <button type="button" onClick={addCustomCourse}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#2FA084] text-sm hover:bg-[#2FA084]/10 transition flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {courses.length > 0 && (
              <div className="mt-2 flex gap-3 text-[10px] text-white/25">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#2FA084]" />Undergraduate</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />Master's</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" />PhD</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/8">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#2FA084] text-white font-bold text-sm hover:bg-[#3CD1AD] transition disabled:opacity-50">
              {saving ? 'Saving…' : 'Save University'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 hover:text-white/80 transition">
              Cancel
            </button>
          </div>
        </form>
      </motion.aside>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminUniversities() {
  const [unis, setUnis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const pollRef = useRef(null);

  const retryRef = useRef(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const data = await (quiet ? universitiesApi.list() : universitiesApi.listFull());

      if (universitiesApi.isUnavailable(data)) {
        // DB is reconnecting — schedule a quick retry for the initial load
        if (!quiet) {
          retryRef.current = setTimeout(() => load(false), 2000);
        }
        return; // keep loading spinner / existing data intact
      }

      const incoming = Array.isArray(data) ? data : [];
      setUnis(prev => {
        if (!quiet) return incoming;
        // Background poll: merge metadata, preserve image blobs already in state
        if (incoming.length === 0) return prev; // skip if poll returned empty (keep existing)
        const byId = Object.fromEntries(prev.map(u => [String(u._id), u]));
        return incoming.map(u => ({ ...(byId[String(u._id)] || {}), ...u }));
      });
    } catch { /* ignore */ }
    finally { if (!quiet) setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), 30000);
    return () => {
      clearInterval(pollRef.current);
      clearTimeout(retryRef.current);
    };
  }, []);

  const handleDelete = async (id) => {
    try { await universitiesApi.delete(id); setConfirmDelete(null); setUnis(prev => prev.filter(u => u._id !== id)); }
    catch (err) { alert(err.message); }
  };

  const toggleCourses = (id) => setExpandedCourses(e => ({ ...e, [id]: !e[id] }));

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-white/40">
      <Loader2 className="w-6 h-6 animate-spin mr-3" />
      Loading universities…
    </div>
  );

  return (
    <>
      <div className="space-y-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Partner Universities</h1>
            <p className="text-sm text-white/40 mt-1">{unis.length} institution{unis.length !== 1 ? 's' : ''} · updates appear live on the public site</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2FA084] text-white text-sm font-bold hover:bg-[#3CD1AD] transition shadow-lg shadow-[#2FA084]/20">
              <Plus className="w-4 h-4" />
              Add University
            </button>
          </div>
        </div>

        {unis.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <GraduationCap className="w-12 h-12 text-white/15 mx-auto mb-4" />
            <p className="text-white/40 text-lg font-medium">No partner universities yet</p>
            <p className="text-white/25 text-sm mt-1">Click "Add University" to add the first one</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/3 border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-medium w-14">Logo</th>
                  <th className="px-5 py-3.5 font-medium">University</th>
                  <th className="px-5 py-3.5 font-medium hidden md:table-cell">Country</th>
                  <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Ranking</th>
                  <th className="px-5 py-3.5 font-medium hidden lg:table-cell">Founded</th>
                  <th className="px-5 py-3.5 font-medium hidden md:table-cell">Students</th>
                  <th className="px-5 py-3.5 font-medium">Courses</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {unis.map(uni => (
                    <motion.tr
                      key={uni._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/4 transition group"
                    >
                      {/* Thumbnail */}
                      <td className="px-5 py-3.5">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
                          {uni.image
                            ? <img src={uni.image} alt="" className="w-full h-full object-cover" />
                            : <Building2 className="w-5 h-5 text-white/20" />}
                        </div>
                      </td>

                      {/* Name + website */}
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-white group-hover:text-[#2FA084] transition leading-tight">{uni.name}</p>
                        {uni.website && (
                          <a href={uni.website} target="_blank" rel="noreferrer"
                            className="text-[11px] text-white/25 hover:text-[#2FA084] transition truncate block max-w-[180px]"
                            onClick={e => e.stopPropagation()}>
                            {uni.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        )}
                      </td>

                      {/* Country */}
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="flex items-center gap-1.5 text-white/60">
                          <MapPin className="w-3 h-3 text-white/25 shrink-0" />
                          {uni.country}
                        </span>
                      </td>

                      {/* Ranking */}
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        {uni.ranking
                          ? <span className="flex items-center gap-1 text-white/60"><Award className="w-3 h-3 text-white/25" />{uni.ranking}</span>
                          : <span className="text-white/20">—</span>}
                      </td>

                      {/* Founded */}
                      <td className="px-5 py-3.5 hidden lg:table-cell text-white/50">
                        {uni.founded || <span className="text-white/20">—</span>}
                      </td>

                      {/* Students */}
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {uni.students
                          ? <span className="flex items-center gap-1 text-white/60"><Users className="w-3 h-3 text-white/25" />{uni.students}</span>
                          : <span className="text-white/20">—</span>}
                      </td>

                      {/* Courses — expandable */}
                      <td className="px-5 py-3.5">
                        {uni.courses?.length > 0 ? (
                          <div>
                            <button type="button" onClick={() => toggleCourses(uni._id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-[#2FA084]/70 hover:text-[#2FA084] transition whitespace-nowrap">
                              <BookOpen className="w-3.5 h-3.5" />
                              {uni.courses.length} course{uni.courses.length !== 1 ? 's' : ''}
                              {expandedCourses[uni._id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            <AnimatePresence>
                              {expandedCourses[uni._id] && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mt-2 space-y-1 min-w-[260px]">
                                  {uni.courses.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between gap-4 text-xs text-white/45 bg-white/3 rounded-lg px-3 py-1.5">
                                      <span className="truncate">{c.name}</span>
                                      <span className="text-white/25 whitespace-nowrap shrink-0">{c.level} · {c.duration}</span>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        {confirmDelete === uni._id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button type="button" onClick={() => handleDelete(uni._id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition">
                              Confirm
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(null)}
                              className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:bg-white/5 transition">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setConfirmDelete(uni._id)}
                            className="p-2 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && <UniversityFormPanel onClose={() => setShowForm(false)} onSaved={(newUni) => { if (newUni) setUnis(prev => [newUni, ...prev]); }} />}
      </AnimatePresence>
    </>
  );
}
