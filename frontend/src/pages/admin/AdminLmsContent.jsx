import { useEffect, useMemo, useState } from 'react';
import { lmsContent } from '../../lib/api';

const emptyForm = {
  title: '',
  contentType: 'video',
  courseSlug: 'general',
  moduleLabel: '',
  description: '',
  mediaUrl: '',
  durationMin: 0,
  recordedAt: '',
  scheduledPublishAt: '',
  published: false,
};

export default function AdminLmsContent() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [bulkText, setBulkText] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastSync, setLastSync] = useState(null);
  const [liveClock, setLiveClock] = useState(() => new Date());
  const [saveMessage, setSaveMessage] = useState('');

  const load = async () => {
    const data = await lmsContent.list(true);
    setItems(data);
    setLastSync(new Date());
  };

  useEffect(() => {
    const start = window.setTimeout(() => {
      load().catch(() => {});
    }, 0);
    const unsubscribe = lmsContent.subscribe(load);
    const poll = window.setInterval(() => {
      load().catch(() => {});
    }, 15000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(poll);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const ticker = window.setInterval(() => setLiveClock(new Date()), 1000);
    return () => window.clearInterval(ticker);
  }, []);

  const summary = useMemo(() => {
    const published = items.filter((i) => i.published).length;
    const scheduled = items.filter((i) => !i.published && i.scheduledPublishAt).length;
    const drafts = items.filter((i) => !i.published && !i.scheduledPublishAt).length;
    const videos = items.filter((i) => i.contentType === 'video').length;
    return { published, scheduled, drafts, videos };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== 'all' && item.contentType !== typeFilter) return false;
      if (statusFilter === 'published' && !item.published) return false;
      if (statusFilter === 'scheduled' && (item.published || !item.scheduledPublishAt)) return false;
      if (statusFilter === 'draft' && (item.published || item.scheduledPublishAt)) return false;
      if (search) {
        const haystack = `${item.title} ${item.courseSlug} ${item.moduleLabel} ${item.description}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, typeFilter, statusFilter, search]);

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        scheduledPublishAt: form.scheduledPublishAt || undefined,
      };
      if (editing) {
        await lmsContent.update(editing._id, payload);
      } else {
        await lmsContent.create(payload);
      }
      setEditing(null);
      setForm(emptyForm);
      await load();
      setSaveMessage(editing ? 'LMS item updated in real time.' : 'New LMS item published to stream.');
      window.setTimeout(() => setSaveMessage(''), 2800);
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this LMS item?')) return;
    await lmsContent.remove(id);
    await load();
  };

  const runBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkText);
      if (!Array.isArray(parsed)) {
        throw new Error('Bulk payload must be a JSON array.');
      }
      await lmsContent.bulkCreate(parsed);
      setBulkText('');
      await load();
      setSaveMessage(`Imported ${parsed.length} item(s).`);
      window.setTimeout(() => setSaveMessage(''), 2800);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">LMS Content Management</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Live content operations panel. Updates are synced from the real-time stream and backup polling.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
            Live {liveClock.toLocaleTimeString()}
          </span>
          {lastSync && (
            <span className="rounded-full border border-white/20 px-3 py-1 text-neutral-300">
              Last sync {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-neutral-400">Published</p>
          <p className="mt-2 text-2xl font-bold text-white">{summary.published}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-neutral-400">Scheduled</p>
          <p className="mt-2 text-2xl font-bold text-amber-300">{summary.scheduled}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-neutral-400">Drafts</p>
          <p className="mt-2 text-2xl font-bold text-neutral-200">{summary.drafts}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-neutral-400">Video lessons</p>
          <p className="mt-2 text-2xl font-bold text-cyan-300">{summary.videos}</p>
        </div>
      </div>

      {saveMessage && (
        <p className="rounded-lg border border-[#2FA084]/30 bg-[#2FA084]/10 px-3 py-2 text-sm text-[#7DE8FF]">{saveMessage}</p>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={save} className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">{editing ? 'Edit item' : 'New item'}</h2>

          <input
            type="text"
            placeholder="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.contentType}
              onChange={(e) => setForm({ ...form, contentType: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            >
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="lesson">Lesson</option>
            </select>
            <input
              type="text"
              placeholder="Course slug"
              value={form.courseSlug}
              onChange={(e) => setForm({ ...form, courseSlug: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            />
          </div>

          <input
            type="text"
            placeholder="Module label"
            value={form.moduleLabel}
            onChange={(e) => setForm({ ...form, moduleLabel: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          />

          <input
            type="url"
            placeholder="Media URL (video, doc, or lesson link)"
            value={form.mediaUrl}
            onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              placeholder="Duration (minutes)"
              value={form.durationMin}
              onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value || 0) })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            />
            <input
              type="text"
              placeholder="Recorded date"
              value={form.recordedAt}
              onChange={(e) => setForm({ ...form, recordedAt: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
            />
          </div>

          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          />

          <label className="flex items-center gap-2 text-neutral-300">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published (visible in student portal immediately)
          </label>

          <input
            type="datetime-local"
            value={form.scheduledPublishAt}
            onChange={(e) => setForm({ ...form, scheduledPublishAt: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
          />
          <p className="text-xs text-neutral-400">
            Optional schedule. Leave empty for draft, or publish now by checking Published.
          </p>

          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-[#2FA084] px-4 py-2 font-medium text-[#0A0F1A]">
              Save
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg border border-white/20 px-4 py-2 text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-2">
          <div className="grid gap-2 rounded-lg border border-white/10 bg-white/5 p-4 sm:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title/course/module"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white sm:col-span-2"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
            >
              <option value="all">All types</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="lesson">Lesson</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white sm:col-span-3"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm font-semibold text-white">Bulk create (JSON array)</p>
            <textarea
              rows={6}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder='[{"title":"Week 1 intro","contentType":"video","courseSlug":"intro-web-dev","mediaUrl":"https://...","published":true}]'
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
            />
            <button
              type="button"
              onClick={runBulkImport}
              className="mt-2 rounded-lg bg-[#2FA084] px-3 py-2 text-sm font-medium text-[#0A0F1A]"
            >
              Import items
            </button>
          </div>
          {filteredItems.map((item) => (
            <div key={item._id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-xs text-neutral-400">
                  {item.contentType} Â· {item.courseSlug || 'general'} Â· {item.published ? 'Published' : 'Draft'}
                </p>
                {item.moduleLabel && <p className="text-xs text-neutral-500">Module: {item.moduleLabel}</p>}
                {!item.published && item.scheduledPublishAt && (
                  <p className="text-xs text-amber-300">
                    Scheduled: {new Date(item.scheduledPublishAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(item);
                    setForm({
                      title: item.title || '',
                      contentType: item.contentType || 'video',
                      courseSlug: item.courseSlug || 'general',
                      moduleLabel: item.moduleLabel || '',
                      description: item.description || '',
                      mediaUrl: item.mediaUrl || '',
                      durationMin: item.durationMin || 0,
                      recordedAt: item.recordedAt || '',
                      scheduledPublishAt: item.scheduledPublishAt
                        ? new Date(item.scheduledPublishAt).toISOString().slice(0, 16)
                        : '',
                      published: !!item.published,
                    });
                  }}
                  className="text-sm text-[#2FA084]"
                >
                  Edit
                </button>
                <button type="button" onClick={() => remove(item._id)} className="text-sm text-red-400">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && <p className="text-sm text-neutral-400">No LMS content matches current filters.</p>}
        </div>
      </div>
    </div>
  );
}


