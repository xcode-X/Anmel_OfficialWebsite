import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Quote, Star, X, RefreshCw, Image as ImageIcon,
  MessageSquare, Check,
} from 'lucide-react';
import { testimonialsApi } from '../../lib/api';

const ACCENT_OPTIONS = [
  { key: 'sky',    label: 'Teal',   color: '#2FA084' },
  { key: 'purple', label: 'Purple', color: '#8C2FA0' },
  { key: 'orange', label: 'Amber',  color: '#F59E0B' },
];

function TestimonialFormPanel({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', role: '', company: '', program: '', uni: '', quote: '', outcome: '', accent: 'sky',
  });
  const [imageFile, setImageFile] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImageFile(reader.result); setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.quote.trim()) { setError('Testimonial quote is required.'); return; }
    setSaving(true);
    try {
      await testimonialsApi.create({
        ...form,
        avatar: imageFile || '',
        image: imageFile || '',
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50';

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
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Add Testimonial</h2>
            <p className="text-xs text-white/40 mt-0.5">Appears instantly on the homepage &amp; education page</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-white/40 hover:text-white/80 rounded-lg hover:bg-white/5 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">
          {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

          {/* Avatar upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Photo (optional)</label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setImageFile(''); setImagePreview(''); }}
                      className="absolute top-1 right-1 p-0.5 bg-black/70 text-white rounded-full hover:bg-black transition">
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="w-8 h-8 text-white/15" />
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-[#2FA084]/40 transition text-sm text-white/30 hover:text-white/50">
                  Click to upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </div>
              </label>
            </div>
          </div>

          {/* Personal info */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Person</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-white/40 mb-1.5">Full Name *</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Sarah Johnson" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Role / Title</label>
                <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Software Engineer" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Company / Organisation</label>
                <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Google" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Study Programme</label>
                <input value={form.program} onChange={e => set('program', e.target.value)} placeholder="e.g. MSc Computer Science" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">University</label>
                <input value={form.uni} onChange={e => set('uni', e.target.value)} placeholder="e.g. University of Toronto" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Quote */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">Testimonial Quote *</label>
            <textarea required value={form.quote} onChange={e => set('quote', e.target.value)}
              placeholder="What did this person say about their experience with Anmel Inc?"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50 resize-none" />
          </div>

          {/* Outcome badge */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">Outcome Badge (optional)</label>
            <input value={form.outcome} onChange={e => set('outcome', e.target.value)}
              placeholder="e.g. Got admitted to Oxford · 100% Scholarship · Visa Approved"
              className={inputCls} />
            <p className="text-xs text-white/20 mt-1">Displayed as a highlight pill on the card</p>
          </div>

          {/* Accent colour */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Card Accent Colour</label>
            <div className="flex gap-3">
              {ACCENT_OPTIONS.map(({ key, label, color }) => (
                <button key={key} type="button" onClick={() => set('accent', key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${form.accent === key ? 'border-[#2FA084]/50 bg-[#2FA084]/10 text-white' : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'}`}>
                  <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                  {label}
                  {form.accent === key && <Check className="w-3.5 h-3.5 text-[#2FA084] ml-1" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/8">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#2FA084] text-white font-bold text-sm hover:bg-[#3CD1AD] transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Testimonial'}
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

function ConfirmDelete({ name, onConfirm, onCancel }) {
  return (
    <div className="mt-3 p-3 bg-red-900/25 border border-red-500/25 rounded-xl space-y-2">
      <p className="text-xs text-red-300">Delete <strong>"{name}"</strong>? Cannot be undone.</p>
      <div className="flex gap-2">
        <button type="button" onClick={onConfirm} className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition">Yes, delete</button>
        <button type="button" onClick={onCancel} className="flex-1 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:bg-white/5 transition">Cancel</button>
      </div>
    </div>
  );
}

const ACCENT_BG = { sky: 'border-l-[#2FA084]', purple: 'border-l-[#8C2FA0]', orange: 'border-l-[#F59E0B]' };

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try { const data = await testimonialsApi.list(); setTestimonials(Array.isArray(data) ? data : []); }
    catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => load(true), 10000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleDelete = async (id) => {
    try { await testimonialsApi.delete(id); setConfirmDelete(null); load(true); }
    catch (err) { alert(err.message); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-white/40">
      <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading testimonials...
    </div>
  );

  return (
    <>
      <div className="space-y-6 text-white">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Testimonials</h1>
            <p className="text-sm text-white/40 mt-1">{testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''} · appear live on homepage &amp; education page</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => load(true)} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button type="button" onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2FA084] text-white text-sm font-bold hover:bg-[#3CD1AD] transition shadow-lg shadow-[#2FA084]/20">
              <Plus className="w-4 h-4" />
              Add Testimonial
            </button>
          </div>
        </div>

        {/* Grid */}
        {testimonials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <MessageSquare className="w-12 h-12 text-white/15 mx-auto mb-4" />
            <p className="text-white/40 text-lg font-medium">No testimonials yet</p>
            <p className="text-white/25 text-sm mt-1">Click "Add Testimonial" to add the first one</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {testimonials.map((t) => {
                const accentBorder = ACCENT_BG[t.accent] || ACCENT_BG.sky;
                const initials = t.name ? t.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
                const avatarSrc = t.avatar || t.image;
                return (
                  <motion.div key={t._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-col hover:border-white/15 transition border-l-4 ${accentBorder}`}>
                    <Quote className="w-8 h-8 text-white/10 mb-3" />

                    <blockquote className="text-sm text-white/70 leading-relaxed flex-1 line-clamp-4">
                      "{t.quote}"
                    </blockquote>

                    {t.outcome && (
                      <div className="mt-3 inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-white/50">
                        <Star className="w-3 h-3" /> {t.outcome}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/8">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                        {avatarSrc ? <img src={avatarSrc} alt={t.name} className="w-full h-full object-cover" /> : initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                        {(t.role || t.company) && <p className="text-xs text-white/40 truncate">{[t.role, t.company].filter(Boolean).join(' · ')}</p>}
                        {(t.program || t.uni) && <p className="text-xs text-white/30 truncate">{[t.program, t.uni].filter(Boolean).join(' · ')}</p>}
                      </div>
                    </div>

                    {confirmDelete === t._id ? (
                      <ConfirmDelete name={t.name} onConfirm={() => handleDelete(t._id)} onCancel={() => setConfirmDelete(null)} />
                    ) : (
                      <button type="button" onClick={() => setConfirmDelete(t._id)}
                        className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-red-500/15 text-red-400/50 text-xs hover:border-red-500/35 hover:text-red-400 hover:bg-red-500/5 transition">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && <TestimonialFormPanel onClose={() => setShowForm(false)} onSaved={() => load(true)} />}
      </AnimatePresence>
    </>
  );
}
