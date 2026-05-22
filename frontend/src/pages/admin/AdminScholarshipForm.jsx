import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Loader2, Share2, ImageIcon } from 'lucide-react';
import { scholarshipsApi } from '../../lib/api';
import { ADMIN_BASE } from '../../lib/adminPaths';
import SocialShareModal from '../../components/scholarships/SocialShareModal';

export const SCHOLARSHIP_TYPES = ['Full', 'Partial', 'Merit-based', 'Need-based', 'Government', 'University', 'External'];
export const FUNDING_STATUSES = ['Fully Funded', 'Partially Funded', 'Tuition Only', 'Living Allowance Only'];

const emptyForm = {
  title: '',
  university: '',
  country: '',
  deadline: '',
  scholarshipType: 'Merit-based',
  fundingStatus: 'Fully Funded',
  eligibility: '',
  programsText: '',
  description: '',
  applicationLink: '',
  amount: '',
  thumbnail: '',
  isPublished: true,
  shareOnPublish: true,
};

function toFormValues(s) {
  return {
    title: s.title || '',
    university: s.university || '',
    country: s.country || '',
    deadline: s.deadline ? new Date(s.deadline).toISOString().slice(0, 10) : '',
    scholarshipType: s.scholarshipType || 'Merit-based',
    fundingStatus: s.fundingStatus || 'Fully Funded',
    eligibility: s.eligibility || '',
    programsText: Array.isArray(s.programs)
      ? s.programs.map((p) => (typeof p === 'string' ? p : p?.name || '')).filter(Boolean).join('\n')
      : '',
    description: s.description || '',
    applicationLink: s.applicationLink || '',
    amount: s.amount || '',
    thumbnail: s.thumbnail || '',
    isPublished: s.isPublished !== false,
  };
}

export default function AdminScholarshipForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [savedScholarship, setSavedScholarship] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageState, setImageState] = useState({ uploading: false, error: '' });

  const listPath = `${ADMIN_BASE}/scholarships`;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const compressImageToDataUrl = async (file, maxDim = 900, quality = 0.78) => {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });

    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) return dataUrl;

    const scale = Math.min(1, maxDim / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    try {
      return canvas.toDataURL('image/jpeg', quality);
    } catch {
      return dataUrl;
    }
  };

  const onPickThumbnail = async (file) => {
    if (!file) return;
    setImageState({ uploading: true, error: '' });
    try {
      if (file.size > 8 * 1024 * 1024) {
        setImageState({ uploading: false, error: 'Image too large. Please upload a smaller file (< 8MB).' });
        return;
      }
      const dataUrl = await compressImageToDataUrl(file);
      set('thumbnail', dataUrl);
      setImageState({ uploading: false, error: '' });
    } catch {
      setImageState({ uploading: false, error: 'Could not process that image. Try another file.' });
    }
  };

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await scholarshipsApi.get(id);
        if (!cancelled) setForm({ ...emptyForm, ...toFormValues(data) });
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Scholarship not found.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const goBack = () => navigate(listPath);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.university.trim()) { setError('University is required.'); return; }
    if (!form.country.trim()) { setError('Country is required.'); return; }
    if (!form.deadline) { setError('Deadline is required.'); return; }
    if (!form.eligibility.trim()) { setError('Eligibility is required.'); return; }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        university: form.university.trim(),
        country: form.country.trim(),
        deadline: form.deadline,
        scholarshipType: form.scholarshipType,
        fundingStatus: form.fundingStatus,
        eligibility: form.eligibility.trim(),
        programsText: form.programsText,
        description: form.description.trim(),
        applicationLink: form.applicationLink.trim(),
        amount: form.amount.trim(),
        thumbnail: form.thumbnail.trim(),
        isPublished: form.isPublished,
      };

      let result;
      if (isEdit) {
        result = await scholarshipsApi.update(id, payload);
      } else {
        result = await scholarshipsApi.create(payload);
      }

      if (form.shareOnPublish && form.isPublished) {
        setSavedScholarship(result);
        setShowShareModal(true);
      } else {
        navigate(listPath);
      }
    } catch (err) {
      setError(err.message || 'Failed to save scholarship.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin mr-3" />
        Loading scholarship…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 text-white">
        <p className="text-red-400 mb-6">{loadError}</p>
        <button type="button" onClick={goBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to scholarships
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto text-white"
    >
      {/* Back + header */}
      <div className="mb-8">
        <Link
          to={listPath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#2FA084] transition-colors mb-5 group"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 group-hover:border-[#2FA084]/30 group-hover:bg-[#2FA084]/10 transition">
            <ArrowLeft className="w-4 h-4" strokeWidth={2.2} />
          </span>
          Back to scholarships
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2FA084]/15 border border-[#2FA084]/25">
            <Award className="w-6 h-6 text-[#2FA084]" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {isEdit ? 'Edit Scholarship' : 'Add New Scholarship'}
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Published listings appear live on the Education Consultant page instantly.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 sm:p-8 space-y-5">
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
            Thumbnail image
          </label>
          <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] overflow-hidden">
            {form.thumbnail ? (
              <div className="relative group">
                <img src={form.thumbnail} alt="Scholarship thumbnail preview" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-lg bg-white/90 text-slate-900 text-xs font-bold hover:bg-white transition">
                    Replace
                    <input type="file" accept="image/*" className="hidden" disabled={imageState.uploading}
                      onChange={(e) => onPickThumbnail(e.target.files?.[0])} />
                  </label>
                  <button type="button" disabled={imageState.uploading}
                    onClick={() => set('thumbnail', '')}
                    className="px-4 py-2 rounded-lg bg-red-500/90 text-white text-xs font-bold hover:bg-red-500 transition disabled:opacity-50">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 py-12 cursor-pointer hover:bg-white/[0.03] transition group">
                {imageState.uploading ? (
                  <Loader2 className="w-8 h-8 text-[#2FA084] animate-spin" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-white/20 group-hover:text-white/40 transition" />
                )}
                <span className="text-sm text-white/30 group-hover:text-white/50 transition">
                  {imageState.uploading ? 'Processing image…' : 'Click to upload thumbnail'}
                </span>
                <span className="text-[11px] text-white/20">JPEG/PNG · auto-compressed · appears live on scholarship cards</span>
                <input type="file" accept="image/*" className="hidden" disabled={imageState.uploading}
                  onChange={(e) => onPickThumbnail(e.target.files?.[0])} />
              </label>
            )}
          </div>
          {imageState.error && <p className="mt-2 text-[11px] text-red-400">{imageState.error}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">Scholarship Title *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Global Excellence Scholarship 2026" className={inputCls} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">University *</label>
            <input required value={form.university} onChange={e => set('university', e.target.value)}
              placeholder="e.g. University of Toronto" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Country *</label>
            <input required value={form.country} onChange={e => set('country', e.target.value)}
              placeholder="e.g. Canada" className={inputCls} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Scholarship Type *</label>
            <select value={form.scholarshipType} onChange={e => set('scholarshipType', e.target.value)} className={inputCls}>
              {SCHOLARSHIP_TYPES.map(t => <option key={t} value={t} className="bg-[#0A0F1A]">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Funding Status *</label>
            <select value={form.fundingStatus} onChange={e => set('fundingStatus', e.target.value)} className={inputCls}>
              {FUNDING_STATUSES.map(s => <option key={s} value={s} className="bg-[#0A0F1A]">{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Application Deadline *</label>
            <input required type="date" value={form.deadline}
              onChange={e => set('deadline', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Amount (optional)</label>
            <input value={form.amount} onChange={e => set('amount', e.target.value)}
              placeholder="e.g. $25,000 / year" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">Eligibility *</label>
          <textarea required value={form.eligibility} onChange={e => set('eligibility', e.target.value)}
            placeholder="Who can apply? GPA, nationality, programme level, etc."
            rows={3} className={`${inputCls} resize-none`} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-1.5">
            Programs covered (optional)
          </label>
          <textarea
            value={form.programsText}
            onChange={(e) => set('programsText', e.target.value)}
            placeholder={'One course or program per line, e.g.\nComputer Science (Undergraduate)\nMBA (Master\'s)'}
            rows={4}
            className={`${inputCls} resize-none font-mono text-sm`}
          />
          <p className="text-[11px] text-white/35 mt-1.5">
            Optional. The public application form already includes a worldwide standard program list; use this only to highlight specific programs for this scholarship.
          </p>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Description (optional)</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Additional details about the scholarship..."
            rows={3} className={`${inputCls} resize-none`} />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Application Link (optional)</label>
          <input type="text" value={form.applicationLink} onChange={e => set('applicationLink', e.target.value)}
            placeholder="https://university.edu/scholarships/apply" className={inputCls} />
        </div>

        <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-white/10 bg-white/3 px-4 py-3">
          <input type="checkbox" checked={form.isPublished}
            onChange={e => {
              const checked = e.target.checked;
              set('isPublished', checked);
              if (!checked) set('shareOnPublish', false);
            }}
            className="w-4 h-4 rounded accent-[#2FA084]" />
          <div>
            <p className="text-sm font-semibold text-white">Publish on public site</p>
            <p className="text-xs text-white/40">Shows in Scholarship Opportunities on /education-consultant</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3">
          <input type="checkbox" checked={form.shareOnPublish}
            onChange={e => set('shareOnPublish', e.target.checked)}
            disabled={!form.isPublished}
            className="w-4 h-4 rounded accent-sky-500 disabled:opacity-40" />
          <div>
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-sky-400" />
              Share to social media after saving
            </p>
            <p className="text-xs text-white/40">Opens Facebook, LinkedIn, X, WhatsApp, Telegram, Reddit & Email instantly</p>
          </div>
        </label>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-white/8">
          <button type="button" onClick={goBack}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/5 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 rounded-xl bg-[#2FA084] text-white font-bold text-sm hover:bg-[#3CD1AD] transition disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Update Scholarship' : 'Create Scholarship'}
          </button>
        </div>
      </form>

      <SocialShareModal
        scholarship={savedScholarship}
        open={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          navigate(listPath);
        }}
      />
    </motion.div>
  );
}
