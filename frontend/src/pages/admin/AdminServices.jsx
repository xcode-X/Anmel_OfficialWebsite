import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  GripVertical,
  Layers,
  ListOrdered,
  Loader2,
  ImageIcon,
  Pencil,
  Plus,
  Tag,
  Trash2,
  Wrench,
} from 'lucide-react';
import api from '../../lib/api';

const ICONS = [
  { value: 'shield', label: 'Shield' },
  { value: 'lock', label: 'Lock' },
  { value: 'globe', label: 'Globe' },
  { value: 'activity', label: 'Activity' },
  { value: 'search', label: 'Search' },
  { value: 'server', label: 'Server' },
  { value: 'eye', label: 'Eye' },
  { value: 'file-check', label: 'File check' },
  { value: 'radar', label: 'Radar' },
  { value: 'cpu', label: 'CPU' },
];

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const emptyForm = () => ({
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  outcomes: '',
  icon: 'shield',
  image: '',
  featuresText: '',
  process: [
    { step: 1, title: '', description: '' },
    { step: 2, title: '', description: '' },
    { step: 3, title: '', description: '' },
    { step: 4, title: '', description: '' },
  ],
  order: 0,
  published: true,
});

function featuresToText(arr) {
  if (!Array.isArray(arr)) return '';
  return arr.filter(Boolean).join('\n');
}

function textToFeatures(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminServices() {
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

  const onPickServiceImage = async (file) => {
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
      .get('/services')
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
      const process = (form.process || [])
        .map((p, i) => ({
          step: Number(p.step) || i + 1,
          title: String(p.title || '').trim(),
          description: String(p.description || '').trim(),
        }))
        .filter((p) => p.title || p.description)
        .map((p, i) => ({ ...p, step: i + 1 }));

      const payload = {
        title: form.title,
        slug: form.slug?.trim() || slugify(form.title),
        shortDescription: form.shortDescription,
        description: form.description,
        outcomes: form.outcomes,
        icon: form.icon,
        image: form.image,
        features: textToFeatures(form.featuresText),
        process,
        order: Number(form.order) || 0,
        published: form.published,
      };

      if (editing) await api.put(`/services/${editing._id}`, payload);
      else await api.post('/services', payload);
      setEditing(null);
      setForm(emptyForm());
      load();
      showNotice('ok', 'Service saved. The public services page updates in real time.');
    } catch (err) {
      showNotice('err', err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
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
    let proc = Array.isArray(p.process) && p.process.length ? p.process.map((x) => ({ ...x })) : emptyForm().process;
    while (proc.length < 4) proc.push({ step: proc.length + 1, title: '', description: '' });
    setForm({
      title: p.title || '',
      slug: p.slug || '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      outcomes: p.outcomes || '',
      icon: p.icon || 'shield',
      image: p.image || '',
      featuresText: featuresToText(p.features),
      process: proc.slice(0, 12),
      order: p.order ?? 0,
      published: p.published !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setProcessRow = (i, field, value) => {
    setForm((f) => {
      const process = [...(f.process || [])];
      process[i] = { ...process[i], [field]: value };
      return { ...f, process };
    });
  };

  const addProcessStep = () => {
    setForm((f) => ({
      ...f,
      process: [...(f.process || []), { step: (f.process?.length || 0) + 1, title: '', description: '' }],
    }));
  };

  return (
    <div className="max-w-6xl">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-950/30 via-[#0A0F1A] to-sky-950/30 p-8 mb-10">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Wrench className="h-3.5 w-3.5" strokeWidth={2} />
            Offerings
          </span>
          <h1 className="mt-3 text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display, inherit)' }}>
            Services
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-400">
            Define positioning, long-form overview, target outcomes, bullet features, and methodology steps. Public pages merge
            with defaults when fields are emptyâ€”fill every section for a fully custom experience.
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
        <form onSubmit={save} className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Layers className="h-5 w-5 text-emerald-400" strokeWidth={2} />
              {editing ? 'Edit service' : 'New service'}
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
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Slug</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Sort order</span>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <Tag className="h-3.5 w-3.5" />
                Card icon key
              </span>
              <select
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {ICONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label} ({o.value})
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <ImageIcon className="h-3.5 w-3.5" />
                Service cover image (upload)
              </span>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <input
                  type="file"
                  accept="image/*"
                  disabled={imageState.uploading}
                  onChange={(e) => onPickServiceImage(e.target.files?.[0])}
                  className="w-full text-sm text-neutral-300"
                />
                <p className="mt-2 text-[11px] text-neutral-500">
                  Upload a small image. We compress it automatically before saving.
                </p>
                {imageState.error && <p className="mt-2 text-[11px] text-red-400">{imageState.error}</p>}

                {form.image ? (
                  <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    <img src={form.image} alt="Service cover preview" className="h-36 w-full object-cover" loading="lazy" />
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
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Short description</span>
              <textarea
                rows={2}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Hero subtitle & lead paragraph on the listing."
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Full overview</span>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Longer narrative for the detail page â€œOverviewâ€ section."
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">Target outcomes</span>
              <textarea
                rows={3}
                value={form.outcomes}
                onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 italic text-neutral-100 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="One compelling paragraphâ€”shown in the outcomes block on the public page."
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Whatâ€™s included (one per line)
              </span>
              <textarea
                rows={8}
                value={form.featuresText}
                onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-neutral-200 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder={'Line item 1\nLine item 2\nâ€¦'}
              />
            </label>

            <div className="sm:col-span-2 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <ListOrdered className="h-4 w-4 text-emerald-400" />
                  Methodology steps
                </span>
                <button
                  type="button"
                  onClick={addProcessStep}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add step
                </button>
              </div>
              <div className="space-y-4">
                {form.process.map((row, i) => (
                  <div key={i} className="rounded-lg border border-white/5 bg-black/30 p-3">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      <GripVertical className="h-3.5 w-3.5" />
                      Step {i + 1}
                    </div>
                    <input
                      type="text"
                      placeholder="Step title"
                      value={row.title}
                      onChange={(e) => setProcessRow(i, 'title', e.target.value)}
                      className="mb-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Description"
                      value={row.description}
                      onChange={(e) => setProcessRow(i, 'description', e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-neutral-200"
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
                className="h-4 w-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/40"
              />
              <div>
                <span className="font-medium text-white">Published</span>
                <p className="text-xs text-neutral-500">Hidden services stay out of the public catalog.</p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {editing ? 'Update service' : 'Create service'}
          </button>
        </form>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Catalog</h3>
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
                    {p.slug} Â· order {p.order ?? 0} Â· {p.published === false ? 'hidden' : 'live'}
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
              No services in the database yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


