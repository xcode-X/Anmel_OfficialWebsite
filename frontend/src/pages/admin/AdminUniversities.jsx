import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, Building2, BookOpen, MapPin, X,
  GraduationCap, Users, Award, ChevronDown, ChevronUp, Image as ImageIcon,
  Globe, Loader2, ExternalLink, CheckCircle2, AlertCircle, Link2, ArrowLeft,
} from 'lucide-react';
import { universitiesApi } from '../../lib/api';
import { subscribeContentStream } from '../../lib/contentStream';
import LazyUniversityImage from '../../components/education/LazyUniversityImage';


const DEFAULT_UNI_IMAGE =
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80';

const DEGREE_LEVELS = ['Undergraduate', "Master's", 'PhD', 'Diploma', 'Certificate', 'Foundation'];

const LEVEL_SHORT = {
  Undergraduate: 'UG',
  "Master's": 'PG',
  PhD: 'PhD',
  Diploma: 'Diploma',
  Certificate: 'Cert',
  Foundation: 'Found.',
};

function normalizeWebsiteUrl(input) {
  const raw = String(input || '').trim();
  const match = raw.match(/https?:\/\/[^\s"'<>]+/i);
  if (match) return match[0];
  return raw;
}

function levelDotClass(level) {
  if (level === 'PhD') return 'bg-purple-400';
  if (level === "Master's") return 'bg-blue-400';
  if (level === 'Diploma') return 'bg-amber-400';
  if (level === 'Certificate') return 'bg-rose-400';
  if (level === 'Foundation') return 'bg-orange-400';
  return 'bg-[#2FA084]';
}

function courseKey(c) {
  return `${String(c.name || '').trim().toLowerCase()}|${c.level || 'Undergraduate'}`;
}

function mergeCatalog(existing, incoming) {
  const map = new Map();
  for (const c of [...existing, ...incoming]) {
    if (!c?.name?.trim()) continue;
    const row = {
      name: c.name.trim(),
      level: c.level || 'Undergraduate',
      duration: c.duration || '',
    };
    map.set(courseKey(row), row);
  }
  return [...map.values()];
}

// ─── Form panel (create + edit) ───────────────────────────────────────────────
function UniversityFormPanel({ onClose, onSaved, university = null }) {
  const isEdit = Boolean(university?._id);
  const [form, setForm] = useState({ name: '', country: '', description: '', ranking: '', founded: '', students: '', website: '' });
  const [programCatalog, setProgramCatalog] = useState([]);
  const [selectedDegreeLevels, setSelectedDegreeLevels] = useState([]);
  const [selectedProgramKeys, setSelectedProgramKeys] = useState(() => new Set());
  const [imageFile, setImageFile] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [programMenuOpen, setProgramMenuOpen] = useState(false);
  const lookedUpUrl = useRef('');
  const lookupDebounceRef = useRef(null);
  const programMenuRef = useRef(null);

  const courses = useMemo(
    () => programCatalog.filter((c) => selectedProgramKeys.has(courseKey(c))),
    [programCatalog, selectedProgramKeys],
  );

  const filteredPrograms = useMemo(() => {
    if (!selectedDegreeLevels.length) return programCatalog;
    return programCatalog.filter((c) => selectedDegreeLevels.includes(c.level));
  }, [programCatalog, selectedDegreeLevels]);

  const applyCatalog = useCallback((rows, { selectAll = true } = {}) => {
    const merged = mergeCatalog([], rows);
    setProgramCatalog(merged);
    const levels = [...new Set(merged.map((c) => c.level).filter(Boolean))];
    setSelectedDegreeLevels(levels.length ? levels : []);
    setSelectedProgramKeys((prev) => {
      if (!selectAll) return prev;
      return new Set(merged.map((c) => courseKey(c)));
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!university) {
      setForm({ name: '', country: '', description: '', ranking: '', founded: '', students: '', website: '' });
      setProgramCatalog([]);
      setSelectedDegreeLevels([]);
      setSelectedProgramKeys(new Set());
      setImagePreview('');
      setImageFile('');
      return;
    }
    setForm({
      name: university.name || '',
      country: university.country || '',
      description: university.description || '',
      ranking: university.ranking || '',
      founded: university.founded || '',
      students: university.students || '',
      website: university.website || '',
    });
    const existing = Array.isArray(university.courses) ? university.courses.map((c) => ({ ...c })) : [];
    applyCatalog(existing, { selectAll: true });
    setImagePreview(university.image || '');
    setImageFile('');
    setLookupDone(false);
    setLookupError('');
    lookedUpUrl.current = university.website || '';
  }, [university, applyCatalog]);

  // ── URL lookup (via backend proxy — no direct Hipolabs/Wikipedia from browser) ─
  const lookupUrl = async (url) => {
    if (!url) return;
    const trimmed = normalizeWebsiteUrl(url);
    try { new URL(trimmed); } catch { return; }
    set('website', trimmed);
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
      if (data.courses?.length > 0) {
        applyCatalog(
          data.courses.map((c) => ({
            name: c.name,
            level: c.level || 'Undergraduate',
            duration: c.duration || '',
          })),
          { selectAll: true },
        );
      }
      if (data.image && /^https?:\/\//i.test(data.image)) {
        setImagePreview(data.image);
        setImageFile(data.image);
      }
      setLookupDone(true);
      if (data.lookupWarning) {
        setLookupError(data.lookupWarning);
      } else {
        setLookupError('');
      }
    } catch {
      setLookupError('Could not fetch from the official website. Fill in manually or click Lookup to retry.');
    } finally {
      setLookingUp(false);
    }
  };

  const scheduleLookup = (url) => {
    clearTimeout(lookupDebounceRef.current);
    if (!url?.trim().startsWith('http')) return;
    lookupDebounceRef.current = setTimeout(() => lookupUrl(url.trim()), 800);
  };

  const handleUrlChange = (e) => {
    const v = normalizeWebsiteUrl(e.target.value);
    set('website', v);
    setLookupDone(false);
    setLookupError('');
    lookedUpUrl.current = '';
    scheduleLookup(v);
  };

  const handleUrlPaste = (e) => {
    const pasted = normalizeWebsiteUrl(e.clipboardData?.getData('text') || '');
    if (!pasted.startsWith('http')) return;
    e.preventDefault();
    set('website', pasted);
    setLookupDone(false);
    setLookupError('');
    setTimeout(() => lookupUrl(pasted), 150);
  };

  useEffect(() => () => clearTimeout(lookupDebounceRef.current), []);

  useEffect(() => {
    if (!programMenuOpen) return undefined;
    const onDown = (e) => {
      if (programMenuRef.current && !programMenuRef.current.contains(e.target)) {
        setProgramMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [programMenuOpen]);

  const toggleDegreeLevel = (lvl) => {
    setSelectedDegreeLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl],
    );
  };

  const toggleProgram = (c) => {
    const key = courseKey(c);
    setSelectedProgramKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllFilteredPrograms = () => {
    setSelectedProgramKeys((prev) => {
      const next = new Set(prev);
      filteredPrograms.forEach((c) => next.add(courseKey(c)));
      return next;
    });
  };

  const clearAllPrograms = () => setSelectedProgramKeys(new Set());

  // ── Image ───────────────────────────────────────────────────────────────────
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 1200;
        const scale = Math.min(1, maxW / (img.width || maxW));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round((img.width || maxW) * scale);
        canvas.height = Math.round((img.height || maxW) * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setImageFile(compressed);
        setImagePreview(compressed);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // ── Course management ───────────────────────────────────────────────────────
  const removeCourse = (c) => {
    const key = courseKey(c);
    setSelectedProgramKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const addCustomCourse = () => {
    if (!newCourse.trim()) return;
    const levels = selectedDegreeLevels.length ? selectedDegreeLevels : ['Undergraduate'];
    const added = levels.map((level) => ({
      name: newCourse.trim(),
      level,
      duration: '',
    }));
    setProgramCatalog((prev) => mergeCatalog(prev, added));
    setSelectedProgramKeys((prev) => {
      const next = new Set(prev);
      added.forEach((c) => next.add(courseKey(c)));
      return next;
    });
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
      const payload = {
        ...form,
        courses: courses.filter((c) => c.name.trim()),
        image: imageFile || university?.image || DEFAULT_UNI_IMAGE,
      };
      const saved = isEdit
        ? await universitiesApi.update(university._id, payload)
        : await universitiesApi.create(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'save'} university.`);
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50';

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto text-white"
    >
      <div className="mb-8">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#2FA084] transition-colors mb-5 group"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 group-hover:border-[#2FA084]/30 group-hover:bg-[#2FA084]/10 transition">
            <ArrowLeft className="w-4 h-4" strokeWidth={2.2} />
          </span>
          Back to universities
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2FA084]/15 border border-[#2FA084]/25">
            <Building2 className="w-6 h-6 text-[#2FA084]" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {isEdit ? 'Edit Partner University' : 'Add Partner University'}
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Paste the official website URL — name, stats, and programmes load automatically.
            </p>
          </div>
        </div>
      </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 sm:p-8 space-y-6">
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
                Fetching from the official university website (programmes, founded year, students)…
              </p>
            )}
            {lookupDone && !lookingUp && !lookupError && (
              <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Loaded from the university website — review fields and programmes below, then save.
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

          {/* ── Degree levels (multi-select) ── */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
              Degree levels offered
            </label>
            <p className="text-[11px] text-white/30 mb-2">Select one or more levels — the programme list updates instantly.</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {DEGREE_LEVELS.map((lvl) => {
                const on = selectedDegreeLevels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => toggleDegreeLevel(lvl)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition ${
                      on
                        ? 'bg-[#2FA084]/20 border-[#2FA084] text-[#3CD1AD]'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/25'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${levelDotClass(lvl)}`} />
                    {LEVEL_SHORT[lvl]} — {lvl}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedDegreeLevels([...DEGREE_LEVELS])}
                className="text-[#2FA084] hover:underline font-semibold"
              >
                Select all levels
              </button>
              <span className="text-white/20">|</span>
              <button
                type="button"
                onClick={() => setSelectedDegreeLevels([])}
                className="text-white/40 hover:text-white/70"
              >
                Clear levels
              </button>
            </div>
          </div>

          {/* ── Programmes (multi-select dropdown) ── */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
              Programmes
              {courses.length > 0 && (
                <span className="ml-2 text-[#2FA084] normal-case font-normal">
                  ({courses.length} selected{programCatalog.length ? ` / ${programCatalog.length} available` : ''})
                </span>
              )}
            </label>

            {programCatalog.length === 0 && !lookingUp && (
              <p className="text-xs text-white/30 italic mb-3">
                Paste the university URL above — programmes appear in the dropdown automatically.
              </p>
            )}

            <div ref={programMenuRef} className="relative mb-3">
              <button
                type="button"
                onClick={() => setProgramMenuOpen((o) => !o)}
                disabled={lookingUp || programCatalog.length === 0}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:border-[#2FA084]/50 disabled:opacity-40 transition"
              >
                <span className="truncate text-left">
                  {lookingUp
                    ? 'Loading programmes…'
                    : programCatalog.length === 0
                      ? 'No programmes yet — run URL lookup'
                      : `${selectedProgramKeys.size} programme(s) selected`}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition ${programMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {programMenuOpen && programCatalog.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute z-30 left-0 right-0 mt-1 rounded-xl border border-white/10 bg-[#0d1320] shadow-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/10 bg-white/3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                        {filteredPrograms.length} shown
                        {selectedDegreeLevels.length ? ` (${selectedDegreeLevels.length} level filter)` : ''}
                      </span>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={selectAllFilteredPrograms}
                          className="text-[10px] font-bold text-[#2FA084] hover:underline"
                        >
                          Select all
                        </button>
                        <button
                          type="button"
                          onClick={clearAllPrograms}
                          className="text-[10px] font-bold text-white/40 hover:text-white/70"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <ul className="max-h-56 overflow-y-auto py-1">
                      {filteredPrograms.length === 0 ? (
                        <li className="px-4 py-3 text-xs text-white/40">No programmes for the selected degree levels.</li>
                      ) : (
                        filteredPrograms.map((c) => {
                          const key = courseKey(c);
                          const checked = selectedProgramKeys.has(key);
                          return (
                            <li key={key}>
                              <label className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleProgram(c)}
                                  className="mt-0.5 accent-[#2FA084]"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm text-white/90 leading-snug">{c.name}</span>
                                  <span className="text-[10px] font-bold uppercase text-white/35">
                                    {LEVEL_SHORT[c.level] || c.level}
                                    {c.duration ? ` · ${c.duration}` : ''}
                                  </span>
                                </span>
                              </label>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {courses.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                <AnimatePresence>
                  {courses.map((c) => (
                    <motion.span
                      key={courseKey(c)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${levelDotClass(c.level)}`} />
                      <span className="text-[10px] font-bold uppercase text-white/35">{LEVEL_SHORT[c.level] || c.level}</span>
                      {c.name}
                      <button
                        type="button"
                        onClick={() => removeCourse(c)}
                        className="ml-0.5 text-white/30 hover:text-red-400 transition rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <input
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCourse())}
                placeholder="Add custom programme name…"
                className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50"
              />
              <button
                type="button"
                onClick={addCustomCourse}
                disabled={!newCourse.trim()}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#2FA084] text-sm hover:bg-[#2FA084]/10 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <p className="mt-2 text-[10px] text-white/30">
              Custom programmes are added for each selected degree level above.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/8">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#2FA084] text-white font-bold text-sm hover:bg-[#3CD1AD] transition disabled:opacity-50">
              {saving ? 'Saving…' : isEdit ? 'Update University' : 'Save University'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 hover:text-white/80 transition">
              Cancel
            </button>
          </div>
        </form>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminUniversities() {
  const [unis, setUnis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUni, setEditingUni] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});

  const retryRef = useRef(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const data = await universitiesApi.list();
      const incoming = Array.isArray(data) ? data : [];
      setUnis(prev => {
        if (!quiet) {
          return incoming.map(u => {
            const existing = prev.find(p => String(p._id) === String(u._id));
            return existing?.image && !u.image ? { ...u, image: existing.image, hasImage: true } : u;
          });
        }
        if (incoming.length === 0) return prev;
        const byId = Object.fromEntries(prev.map(u => [String(u._id), u]));
        return incoming.map(u => {
          const merged = { ...(byId[String(u._id)] || {}), ...u };
          if (byId[String(u._id)]?.image && !u.image) merged.image = byId[String(u._id)].image;
          return merged;
        });
      });
    } catch { /* ignore */ }
    finally { if (!quiet) setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const cleanups = [];
    cleanups.push(
      universitiesApi.subscribe((rows) => {
        setUnis(rows);
        setLoading(false);
      }),
    );
    cleanups.push(
      subscribeContentStream((resource) => {
        if (resource === 'universities') load(true);
      }),
    );
    const onVis = () => {
      if (document.visibilityState === 'visible') load(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearTimeout(retryRef.current);
      cleanups.forEach((fn) => fn());
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [load]);

  const handleDelete = async (id) => {
    try { await universitiesApi.delete(id); setConfirmDelete(null); setUnis(prev => prev.filter(u => u._id !== id)); }
    catch (err) { alert(err.message); }
  };

  const toggleCourses = (id) => setExpandedCourses(e => ({ ...e, [id]: !e[id] }));

  if (loading && !showForm && !editingUni) return (
    <div className="flex items-center justify-center py-24 text-white/40">
      <Loader2 className="w-6 h-6 animate-spin mr-3" />
      Loading universities…
    </div>
  );

  if (showForm || editingUni) {
    return (
      <UniversityFormPanel
        university={editingUni}
        onClose={() => { setShowForm(false); setEditingUni(null); }}
        onSaved={(saved) => {
          if (!saved?._id) return;
          setUnis((prev) => {
            const idx = prev.findIndex((u) => String(u._id) === String(saved._id));
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = { ...next[idx], ...saved };
              return next;
            }
            return [saved, ...prev];
          });
          setShowForm(false);
          setEditingUni(null);
        }}
      />
    );
  }

  return (
      <div className="space-y-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Partner Universities</h1>
            <p className="text-sm text-white/40 mt-1">{unis.length} institution{unis.length !== 1 ? 's' : ''} · updates appear live on the public site</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setEditingUni(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2FA084] text-white text-sm font-bold hover:bg-[#3CD1AD] transition shadow-lg shadow-[#2FA084]/20"
            >
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
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                          <LazyUniversityImage
                            uniId={uni._id || uni.idName}
                            alt=""
                            imageUrl={uni.image}
                            hasImage={uni.hasImage || Boolean(uni.image)}
                            compact
                            className="w-full h-full object-cover"
                            wrapperClassName="w-full h-full flex items-center justify-center"
                          />
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

                      {/* Edit / Delete */}
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Edit university"
                              onClick={() => { setEditingUni(uni); setShowForm(false); }}
                              className="p-2 rounded-lg text-[#2FA084]/60 hover:text-[#2FA084] hover:bg-[#2FA084]/10 transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(uni._id)}
                              className="p-2 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition">
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
      </div>
  );
}
