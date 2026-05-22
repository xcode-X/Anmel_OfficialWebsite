import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  ImageIcon,
  Link2,
  Loader2,
  Pencil,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { blogApi } from '../../lib/api';
import { isBlogImageSrc } from '../../lib/siteImages';

const CATEGORIES = ['Security', 'Compliance', 'Development', 'Education', 'News'];

const emptyForm = () => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Security',
  featuredImage: '',
  author: 'Anmel Inc Team',
  published: true,
});

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [imageState, setImageState] = useState({ uploading: false, error: '' });

  const load = useCallback(async () => {
    try {
      const data = await blogApi.list();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const cleanup = blogApi.subscribe((rows) => {
      if (Array.isArray(rows)) {
        setPosts(rows);
        setLoading(false);
        if (editing?._id) {
          const fresh = rows.find((r) => r._id === editing._id);
          if (!fresh) {
            setEditing(null);
            setForm(emptyForm());
          }
        }
      }
    });
    return cleanup;
  }, [load, editing?._id]);

  const showNotice = (type, text) => {
    setNotice({ type, text });
    if (text) window.setTimeout(() => setNotice({ type: '', text: '' }), 4200);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice({ type: '', text: '' });
    const wasEditing = !!editing;
    try {
      const payload = { ...form, slug: form.slug?.trim() || slugify(form.title) };
      const saved = wasEditing
        ? await blogApi.update(editing._id, payload)
        : await blogApi.create(payload);
      setEditing(null);
      setForm(emptyForm());
      if (saved?._id) {
        setPosts((prev) => {
          const next = prev.filter((p) => p._id !== saved._id);
          return [saved, ...next];
        });
      }
      showNotice(
        'ok',
        wasEditing
          ? 'Post updated. Changes are live on the public blog.'
          : 'Post created. It is live on the public blog.',
      );
    } catch (err) {
      showNotice('err', err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this post permanently?')) return;
    setDeletingId(id);
    try {
      await blogApi.remove(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      if (editing?._id === id) {
        setEditing(null);
        setForm(emptyForm());
      }
      showNotice('ok', 'Post deleted.');
    } catch (err) {
      showNotice('err', err.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = async (p) => {
    setNotice({ type: '', text: '' });
    let full = p;
    try {
      const detail = await blogApi.getById(p._id);
      if (detail) full = detail;
    } catch {
      try {
        const bySlug = await blogApi.getBySlug(p.slug);
        if (bySlug) full = bySlug;
      } catch { /* use list row */ }
    }
    setEditing(full);
    setForm({
      title: full.title || '',
      slug: full.slug || '',
      excerpt: full.excerpt || '',
      content: full.content || '',
      category: full.category || 'Security',
      featuredImage: full.featuredImage || '',
      author: full.author || 'Anmel Inc Team',
      published: !!full.published,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm());
  };

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

  const onPickFeaturedImage = async (file) => {
    if (!file) return;
    setImageState({ uploading: true, error: '' });

    try {
      if (file.size > 8 * 1024 * 1024) {
        setImageState({ uploading: false, error: 'Image too large. Please upload a smaller file (< 8MB).' });
        return;
      }
      const dataUrl = await compressImageToDataUrl(file);
      setForm((f) => ({ ...f, featuredImage: dataUrl }));
      setImageState({ uploading: false, error: '' });
    } catch {
      setImageState({ uploading: false, error: 'Could not upload/preview that image. Try a different file.' });
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0A0F1A] via-[#0f172a] to-[#0A0F1A] p-8 mb-10 shadow-xl shadow-black/20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#2FA084]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2FA084]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              CMS
            </span>
            <h1 className="mt-3 text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display, inherit)' }}>
              Blog management
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-400">
              Create, edit, and delete articles. Changes sync to Firestore and the public blog in real time.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300 ring-1 ring-emerald-500/25">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live sync
            </span>
          </div>
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

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <form
          onSubmit={save}
          className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 shadow-inner shadow-black/20"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Pencil className="h-5 w-5 text-[#2FA084]" strokeWidth={2} />
              {editing ? 'Edit article' : 'New article'}
            </h2>
            {editing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                Cancel edit
              </button>
            )}
          </div>

          {editing && (
            <p className="text-xs text-neutral-500 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
              Editing: <span className="text-white font-medium">{editing.title}</span>
              <span className="font-mono text-neutral-500 ml-2">#{editing._id?.slice(0, 8)}</span>
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <FileText className="h-3.5 w-3.5" />
                Title
              </span>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => {
                  const t = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title: t,
                    slug: editing ? f.slug : f.slug || slugify(t),
                  }));
                }}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#2FA084]/50 focus:outline-none focus:ring-2 focus:ring-[#2FA084]/20"
                placeholder="Headline readers will see"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <Link2 className="h-3.5 w-3.5" />
                URL slug
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white focus:border-[#2FA084]/50 focus:outline-none focus:ring-2 focus:ring-[#2FA084]/20"
                  placeholder="url-friendly-slug"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, slug: slugify(f.title) }))}
                  className="shrink-0 rounded-xl border border-white/15 px-3 text-xs font-medium text-neutral-300 hover:bg-white/5"
                >
                  Regenerate
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <Tag className="h-3.5 w-3.5" />
                Category
              </span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-[#2FA084]/50 focus:outline-none focus:ring-2 focus:ring-[#2FA084]/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <User className="h-3.5 w-3.5" />
                Author
              </span>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-[#2FA084]/50 focus:outline-none focus:ring-2 focus:ring-[#2FA084]/20"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <ImageIcon className="h-3.5 w-3.5" />
                Featured image (upload)
              </span>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickFeaturedImage(e.target.files?.[0])}
                  className="w-full text-sm text-neutral-300"
                  disabled={imageState.uploading}
                />
                <p className="mt-2 text-[11px] text-neutral-500">
                  Upload a small image. We compress it automatically before saving.
                </p>
                {imageState.error && <p className="mt-2 text-[11px] text-red-400">{imageState.error}</p>}

                {form.featuredImage ? (
                  <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    <img
                      src={form.featuredImage}
                      alt="Featured preview"
                      className="h-36 w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}

                {form.featuredImage ? (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, featuredImage: '' }))}
                    className="mt-3 inline-flex items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/5"
                    disabled={imageState.uploading}
                  >
                    Remove image
                  </button>
                ) : null}
              </div>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Excerpt
                </span>
                <span className="font-normal text-neutral-600">{form.excerpt.length} chars</span>
              </span>
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-[#2FA084]/50 focus:outline-none focus:ring-2 focus:ring-[#2FA084]/20"
                placeholder="Short summary for cards and SEO (plain text)."
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <FileText className="h-3.5 w-3.5" />
                Body (HTML)
              </span>
              <textarea
                rows={14}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm leading-relaxed text-neutral-200 focus:border-[#2FA084]/50 focus:outline-none focus:ring-2 focus:ring-[#2FA084]/20"
                placeholder="<p>Use semantic HTML. Headings, lists, and links are supported.</p>"
              />
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-black/40 text-[#2FA084] focus:ring-[#2FA084]/40"
              />
              <div>
                <span className="font-medium text-white">Published</span>
                <p className="text-xs text-neutral-500">Published posts appear on the public blog immediately.</p>
              </div>
            </label>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2FA084] px-6 py-3 text-sm font-semibold text-[#0A0F1A] shadow-lg shadow-[#2FA084]/20 transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {editing ? 'Save changes' : 'Create post'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => remove(editing._id)}
                disabled={deletingId === editing._id || saving}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
              >
                {deletingId === editing._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete post
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              All posts {loading ? '' : `(${posts.length})`}
            </h3>
            <button
              type="button"
              onClick={load}
              className="text-xs font-medium text-[#2FA084] hover:underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-neutral-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading posts…
            </div>
          ) : (
            <ul className="space-y-3">
              {posts.map((p) => {
                const isActive = editing?._id === p._id;
                return (
                  <li
                    key={p._id}
                    className={`group rounded-xl border p-4 transition ${
                      isActive
                        ? 'border-[#2FA084]/50 bg-[#2FA084]/10'
                        : 'border-white/10 bg-white/[0.04] hover:border-[#2FA084]/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {isBlogImageSrc(p.featuredImage) && (
                        <img
                          src={p.featuredImage}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-lg object-cover border border-white/10"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{p.title}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                          <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-neutral-400">
                            {p.slug}
                          </span>
                          {p.published ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Live
                            </span>
                          ) : (
                            <span className="text-amber-200/90">Draft</span>
                          )}
                          {p.category && <span className="text-neutral-500">· {p.category}</span>}
                          {isActive && (
                            <span className="text-[#2FA084] font-semibold">Editing</span>
                          )}
                        </p>
                        {p.updatedAt && (
                          <p className="mt-2 flex items-center gap-1 text-[11px] text-neutral-600">
                            <Calendar className="h-3 w-3" />
                            Updated {new Date(p.updatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="rounded-lg p-2 text-[#2FA084] hover:bg-white/10"
                          title="Edit"
                          aria-label={`Edit ${p.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p._id)}
                          disabled={deletingId === p._id}
                          className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                          title="Delete"
                          aria-label={`Delete ${p.title}`}
                        >
                          {deletingId === p._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && posts.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-neutral-500">
              No posts yet. Create your first article on the left.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
