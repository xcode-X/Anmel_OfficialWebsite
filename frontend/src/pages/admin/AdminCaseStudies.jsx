import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  ImageIcon,
  Layers,
  Loader2,
  Pencil,
  Palette,
  Sparkles,
  Trash2,
  Trophy,
} from 'lucide-react';
import api from '../../lib/api';

const CATEGORIES = [
  'Security Assessment',
  'Compliance',
  'Web Security',
  'Healthcare',
  'Financial services',
  'Eâ€‘commerce',
];

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const emptyMetric = () => ({ label: '', value: '' });

const emptyForm = () => ({
  title: '',
  slug: '',
  category: 'Security Assessment',
  client: '',
  clientSector: '',
  duration: '',
  accent: '#0EA5E9',
  image: '',
  excerpt: '',
  resultSnippet: '',
  challenge: '',
  solution: '',
  results: '',
  metrics: [emptyMetric(), emptyMetric(), emptyMetric()],
  order: 0,
  published: true,
});

export default function AdminCaseStudies() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [imageState, setImageState] = useState({ uploading: false, error: '' });

  const compressImageToDataUrl = async (file, maxDim = 1200, quality = 0.75) => {
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

  const onPickCardImage = async (file) => {
    if (!file) return;
    setImageState({ uploading: true, error: '' });
    try {
      if (file.size > 8 * 1024 * 1024) {
        setImageState({ uploading: false, error: 'Image too large. Please upload a smaller file (< 8MB).' });
        return;
      }
      const dataUrl = await compressImageToDataUrl(file);
      setForm((f) => ({ ...f, image: dataUrl }));
      setImageState({ uploading: false, error: '' });
    } catch {
      setImageState({ uploading: false, error: 'Could not process that image. Try another file.' });
    }
  };

  const load = useCallback(() => {
    api
      .get('/case-studies')
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showNotice = (type, text) => {
    setNotice({ type, text });
    if (text) window.setTimeout(() => setNotice({ type: '', text: '' }), 4200);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice({ type: '', text: '' });
    try {
      const metrics = (form.metrics || [])
        .map((m) => ({ label: String(m.label || '').trim(), value: String(m.value || '').trim() }))
        .filter((m) => m.label || m.value);
      const payload = {
        ...form,
        slug: form.slug?.trim() || slugify(form.title),
        metrics,
        order: Number(form.order) || 0,
      };
      if (editing) await api.put(`/case-studies/${editing._id}`, payload);
      else await api.post('/case-studies', payload);
      setEditing(null);
      setForm(emptyForm());
      load();
      showNotice('ok', 'Case study saved. The public case studies page updates in real time.');
    } catch (err) {
      showNotice('err', err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this case study?')) return;
    try {
      await api.delete(`/case-studies/${id}`);
      if (editing?._id === id) {
        setEditing(null);
        setForm(emptyForm());
      }
      load();
      showNotice('ok', 'Removed.');
    } catch (err) {
      showNotice('err', err.message || 'Delete failed');
    }
  };

  const startEdit = (p) => {
    setEditing(p);
    const m = Array.isArray(p.metrics) && p.metrics.length ? [...p.metrics] : [emptyMetric(), emptyMetric(), emptyMetric()];
    while (m.length < 3) m.push(emptyMetric());
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      category: p.category || 'Security Assessment',
      client: p.client || '',
      clientSector: p.clientSector || '',
      duration: p.duration || '',
      accent: p.accent || '#0EA5E9',
      image: p.image || '',
      excerpt: p.excerpt || '',
      resultSnippet: p.resultSnippet || '',
      challenge: p.challenge || '',
      solution: p.solution || '',
      results: p.results || '',
      metrics: m.slice(0, 8),
      order: p.order ?? 0,
      published: p.published !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setMetric = (index, field, value) => {
    setForm((f) => {
      const metrics = [...(f.metrics || [])];
      metrics[index] = { ...metrics[index], [field]: value };
      return { ...f, metrics };
    });
  };

  const addMetric = () => {
    setForm((f) => ({ ...f, metrics: [...(f.metrics || []), emptyMetric()] }));
  };

  return (
    <div className="max-w-6xl">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-950/40 via-[#0A0F1A] to-[#0f172a] p-8 mb-10">
        <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            Portfolio
          </span>
          <h1 className="mt-3 text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display, inherit)' }}>
            Case studies
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            Capture client context, narrative, KPI metrics, and card imagery. List order follows the numeric order field; ties
            break by date. Changes sync to the public site instantly.
          </p>
        </div>
      </div>

      {notice.text && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            notice.type === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <form
          onSubmit={save}
          className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Layers className="h-5 w-5 text-violet-400" strokeWidth={2} />
              {editing ? 'Edit case study' : 'New case study'}
            </h2>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm());
                }}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2 block">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Title</span>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => {
                  const t = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title: t,
                    slug: editing ? f.slug : f.slug || slugify(t),
                  }));
                }}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Slug</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Sort order</span>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <p className="mt-1 text-[11px] text-neutral-600">Lower numbers appear first in the grid.</p>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <Building2 className="h-3.5 w-3.5" />
                Client label
              </span>
              <input
                type="text"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                placeholder="e.g. Confidential â€” Global bank"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Sector badge</span>
              <input
                type="text"
                value={form.clientSector}
                onChange={(e) => setForm({ ...form, clientSector: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                placeholder="e.g. Financial services"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <Clock className="h-3.5 w-3.5" />
                Duration
              </span>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                placeholder="e.g. 6 months"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <Palette className="h-3.5 w-3.5" />
                Accent color
              </span>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.accent?.startsWith('#') ? form.accent : '#0EA5E9'}
                  onChange={(e) => setForm({ ...form, accent: e.target.value })}
                  className="h-12 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                />
                <input
                  type="text"
                  value={form.accent}
                  onChange={(e) => setForm({ ...form, accent: e.target.value })}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <ImageIcon className="h-3.5 w-3.5" />
                Card image (upload)
              </span>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <input
                  type="file"
                  accept="image/*"
                  disabled={imageState.uploading}
                  onChange={(e) => onPickCardImage(e.target.files?.[0])}
                  className="w-full text-sm text-neutral-300"
                />
                <p className="mt-2 text-[11px] text-neutral-500">
                  Upload a small image. We compress it automatically before saving (stored in `image`).
                </p>
                {imageState.error && <p className="mt-2 text-[11px] text-red-400">{imageState.error}</p>}

                {form.image ? (
                  <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    <img src={form.image} alt="Card image preview" className="h-36 w-full object-cover" loading="lazy" />
                  </div>
                ) : null}

                {form.image ? (
                  <button
                    type="button"
                    disabled={imageState.uploading}
                    onClick={() => setForm((f) => ({ ...f, image: '' }))}
                    className="mt-3 inline-flex items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/5"
                  >
                    Remove image
                  </button>
                ) : null}
              </div>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Card excerpt</span>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                placeholder="2â€“3 lines for the case study grid."
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <Trophy className="h-3.5 w-3.5" />
                Outcome line
              </span>
              <input
                type="text"
                value={form.resultSnippet}
                onChange={(e) => setForm({ ...form, resultSnippet: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                placeholder="Short headline result (green callout on cards)."
              />
            </label>

            {['challenge', 'solution', 'results'].map((key) => (
              <label key={key} className="block sm:col-span-2">
                <span className="mb-1.5 text-xs font-semibold capitalize tracking-wider text-neutral-500">{key}</span>
                <textarea
                  rows={key === 'results' ? 5 : 4}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </label>
            ))}

            <div className="sm:col-span-2 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <BarChart3 className="h-4 w-4 text-violet-400" />
                  KPI metrics
                </span>
                <button
                  type="button"
                  onClick={addMetric}
                  className="text-xs font-medium text-violet-300 hover:underline"
                >
                  + Add row
                </button>
              </div>
              <div className="space-y-2">
                {form.metrics.map((m, i) => (
                  <div key={i} className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <input
                      type="text"
                      placeholder="Label"
                      value={m.label}
                      onChange={(e) => setMetric(i, 'label', e.target.value)}
                      className="min-w-[120px] flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={m.value}
                      onChange={(e) => setMetric(i, 'value', e.target.value)}
                      className="min-w-[100px] flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500/40"
              />
              <div>
                <span className="font-medium text-white">Published on site</span>
                <p className="text-xs text-neutral-500">Unpublished studies stay in the admin list only.</p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:bg-violet-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {editing ? 'Update case study' : 'Create case study'}
          </button>
        </form>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Library</h3>
            <button type="button" onClick={load} className="text-xs text-[#2FA084] hover:underline">
              Refresh
            </button>
          </div>
          <ul className="space-y-2">
            {items.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{p.title}</p>
                  <p className="text-[11px] text-neutral-500">
                    order {p.order ?? 0} Â· {p.published === false ? 'hidden' : 'live'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="rounded-lg p-2 text-[#2FA084] hover:bg-white/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p._id)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {items.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-neutral-500">
              No case studies in the database yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


