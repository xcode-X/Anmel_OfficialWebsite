import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardPaste, FileJson, Wand2 } from 'lucide-react';
import { lmsContent } from '../../lib/api';
const emptyForm = {
  title: '',
  contentType: 'video',
  courseSlug: '',
  moduleLabel: '',
  description: '',
  mediaUrl: '',
  durationMin: '',
  recordedAt: '',
  scheduledPublishAt: '',
  published: false,
};

function getFieldPlaceholders(form, liveClock) {
  const nextSlot = new Date(liveClock);
  nextSlot.setMinutes(0, 0, 0);
  nextSlot.setHours(nextSlot.getHours() + 1);
  const scheduleExample = nextSlot.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return {
    title: 'Title',
    courseSlug: 'Slug',
    moduleLabel: 'Label',
    mediaUrl: 'Link',
    durationMin: 'Minutes',
    recordedAt: 'Date',
    description: 'Summary',
    search: 'Search',
    scheduleHelper: `Optional. Auto-publish at ${scheduleExample}`,
  };
}

function buildBulkTemplate(liveClock) {
  const scheduled = new Date(liveClock);
  scheduled.setDate(scheduled.getDate() + 1);
  scheduled.setHours(9, 0, 0, 0);

  return JSON.stringify(
    [
      {
        title: 'Module 1 — Welcome & Setup',
        contentType: 'video',
        courseSlug: 'intro-web-dev',
        moduleLabel: 'Module 1',
        description: 'Course orientation, syllabus overview, and environment setup.',
        mediaUrl: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
        durationMin: 12,
        recordedAt: liveClock.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
        published: true,
      },
      {
        title: 'Module 2 — Pre-read Worksheet',
        contentType: 'document',
        courseSlug: 'intro-web-dev',
        moduleLabel: 'Module 2',
        description: 'Reading material to complete before the next live session.',
        mediaUrl: 'https://cdn.anmelinc.com/lms/module-2-worksheet.pdf',
        durationMin: 20,
        published: false,
        scheduledPublishAt: scheduled.toISOString(),
      },
      {
        title: 'Lesson 3 — Secure Login Flows',
        contentType: 'lesson',
        courseSlug: 'cybersecurity-fundamentals',
        moduleLabel: 'Module 3',
        description: 'Interactive lesson on authentication patterns and session handling.',
        mediaUrl: 'https://learn.anmelinc.com/courses/cybersecurity-fundamentals/lesson-3',
        durationMin: 35,
        published: false,
      },
    ],
    null,
    2,
  );
}

function validateBulkJson(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      status: 'empty',
      message: 'Paste a JSON array below, or click Insert starter template.',
      validCount: 0,
      totalCount: 0,
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return {
        status: 'error',
        message: 'JSON must be an array of items — wrap objects in [ ... ].',
        validCount: 0,
        totalCount: 0,
      };
    }

    const valid = parsed.filter(
      (item) => item?.title && ['video', 'document', 'lesson'].includes(item?.contentType),
    );
    const invalid = parsed.length - valid.length;

    if (valid.length === 0) {
      return {
        status: 'error',
        message: 'No valid items found. Each entry needs title and contentType (video, document, or lesson).',
        validCount: 0,
        totalCount: parsed.length,
      };
    }

    if (invalid > 0) {
      return {
        status: 'warn',
        message: `${valid.length} ready to import · ${invalid} will be skipped (missing title or contentType).`,
        validCount: valid.length,
        totalCount: parsed.length,
        parsed,
      };
    }

    return {
      status: 'ok',
      message: `${valid.length} item${valid.length === 1 ? '' : 's'} ready to import.`,
      validCount: valid.length,
      totalCount: parsed.length,
      parsed,
    };
  } catch (err) {
    return {
      status: 'error',
      message: err.message || 'Invalid JSON syntax.',
      validCount: 0,
      totalCount: 0,
    };
  }
}

const BULK_FIELD_HINTS = [
  { key: 'title', required: true, note: 'Lesson or module name' },
  { key: 'contentType', required: true, note: 'video · document · lesson' },
  { key: 'courseSlug', required: false, note: 'Defaults to general' },
  { key: 'moduleLabel', required: false, note: 'Shown in the student portal' },
  { key: 'description', required: false, note: 'Short summary for learners' },
  { key: 'mediaUrl', required: false, note: 'Video, PDF, or lesson link' },
  { key: 'durationMin', required: false, note: 'Length in minutes' },
  { key: 'recordedAt', required: false, note: 'Display date label' },
  { key: 'published', required: false, note: 'true = live immediately' },
  { key: 'scheduledPublishAt', required: false, note: 'ISO date if draft + scheduled' },
];
const fieldClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-[#2FA084]/50 focus:outline-none focus:ring-2 focus:ring-[#2FA084]/20';

const fieldClassSm =
  'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-[#2FA084]/50 focus:outline-none focus:ring-2 focus:ring-[#2FA084]/20';

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
  const [bulkError, setBulkError] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
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
    const arr = Array.isArray(items) ? items : [];
    const published = arr.filter((i) => i.published).length;
    const scheduled = arr.filter((i) => !i.published && i.scheduledPublishAt).length;
    const drafts = arr.filter((i) => !i.published && !i.scheduledPublishAt).length;
    const videos = arr.filter((i) => i.contentType === 'video').length;
    return { published, scheduled, drafts, videos };
  }, [items]);

  const filteredItems = useMemo(() => {
    return (Array.isArray(items) ? items : []).filter((item) => {
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

  const placeholders = useMemo(
    () => getFieldPlaceholders(form, liveClock),
    [form, liveClock],
  );

  const bulkTemplate = useMemo(() => buildBulkTemplate(liveClock), [liveClock]);

  const bulkValidation = useMemo(() => validateBulkJson(bulkText), [bulkText]);
  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        courseSlug: form.courseSlug.trim() || 'general',
        durationMin: Number(form.durationMin) || 0,
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
    setBulkError('');
    if (bulkValidation.status === 'empty' || bulkValidation.status === 'error' || bulkValidation.validCount === 0) {
      setBulkError(bulkValidation.message);
      return;
    }

    setBulkImporting(true);
    try {
      const parsed = bulkValidation.parsed || JSON.parse(bulkText);
      const items = Array.isArray(parsed) ? parsed : [];
      const result = await lmsContent.bulkCreate(items);
      const created = result?.created ?? bulkValidation.validCount;
      setBulkText('');
      await load();
      setSaveMessage(`Imported ${created} item${created === 1 ? '' : 's'} in real time.`);
      window.setTimeout(() => setSaveMessage(''), 2800);
    } catch (err) {
      setBulkError(err.message || 'Bulk import failed.');
    } finally {
      setBulkImporting(false);
    }
  };

  const insertBulkTemplate = () => {
    setBulkText(bulkTemplate);
    setBulkError('');
  };

  const formatBulkJson = () => {
    setBulkError('');
    try {
      const parsed = JSON.parse(bulkText.trim());
      setBulkText(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setBulkError(err.message || 'Fix JSON syntax before formatting.');
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

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Title</span>
            <input
              type="text"
              placeholder={placeholders.title}
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={fieldClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Content type</span>
              <select
                value={form.contentType}
                onChange={(e) => setForm({ ...form, contentType: e.target.value })}
                className={fieldClass}
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="lesson">Lesson</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Course slug</span>
              <input
                type="text"
                placeholder={placeholders.courseSlug}
                value={form.courseSlug}
                onChange={(e) => setForm({ ...form, courseSlug: e.target.value })}
                className={fieldClass}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Module label</span>
            <input
              type="text"
              placeholder={placeholders.moduleLabel}
              value={form.moduleLabel}
              onChange={(e) => setForm({ ...form, moduleLabel: e.target.value })}
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Media URL</span>
            <input
              type="url"
              placeholder={placeholders.mediaUrl}
              value={form.mediaUrl}
              onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
              className={fieldClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Duration (minutes)</span>
              <input
                type="number"
                min="0"
                placeholder={placeholders.durationMin}
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Recorded date</span>
              <input
                type="text"
                placeholder={placeholders.recordedAt}
                value={form.recordedAt}
                onChange={(e) => setForm({ ...form, recordedAt: e.target.value })}
                className={fieldClass}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Description</span>
            <textarea
              placeholder={placeholders.description}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={fieldClass}
            />
          </label>

          <label className="flex items-center gap-2 text-neutral-300">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published (visible in student portal immediately)
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Scheduled publish</span>
            <input
              type="datetime-local"
              value={form.scheduledPublishAt}
              onChange={(e) => setForm({ ...form, scheduledPublishAt: e.target.value })}
              className={fieldClass}
              aria-label="Scheduled publish date and time"
            />
            <p className="mt-1.5 text-xs text-neutral-400">{placeholders.scheduleHelper}</p>
          </label>

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
              placeholder={placeholders.search}
              className={`${fieldClassSm} sm:col-span-2`}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={fieldClassSm}
              aria-label="Filter by content type"
            >
              <option value="all">All types</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="lesson">Lesson</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${fieldClassSm} sm:col-span-3`}
              aria-label="Filter by publish status"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="mb-4 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#2FA084]">
                  <FileJson className="h-4 w-4" />
                  <p className="text-sm font-semibold text-white">Bulk create (JSON array)</p>
                </div>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-neutral-400">
                  Import multiple lessons at once. Paste valid JSON or start from the template — validation updates as you type.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={insertBulkTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#2FA084]/30 bg-[#2FA084]/10 px-3 py-2 text-xs font-semibold text-[#7DE8FF] hover:bg-[#2FA084]/15 transition"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Insert starter template
                </button>
                <button
                  type="button"
                  onClick={formatBulkJson}
                  disabled={!bulkText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5 transition disabled:opacity-40"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Format JSON
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={14}
                value={bulkText}
                onChange={(e) => {
                  setBulkText(e.target.value);
                  if (bulkError) setBulkError('');
                }}
                spellCheck={false}
                aria-label="Bulk create JSON array"
                placeholder={bulkTemplate}
                className="w-full rounded-xl border border-white/10 bg-[#060d18]/80 px-4 py-3 font-mono text-[11px] leading-relaxed text-emerald-100/90 placeholder:text-neutral-600 focus:border-[#2FA084]/50 focus:outline-none focus:ring-2 focus:ring-[#2FA084]/20 sm:text-xs"
              />
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div
                className={`inline-flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                  bulkValidation.status === 'ok'
                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                    : bulkValidation.status === 'warn'
                      ? 'border border-amber-500/20 bg-amber-500/10 text-amber-200'
                      : bulkValidation.status === 'error'
                        ? 'border border-red-500/20 bg-red-500/10 text-red-300'
                        : 'border border-white/10 bg-white/[0.03] text-neutral-400'
                }`}
              >
                {bulkValidation.status === 'ok' ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : bulkValidation.status === 'error' ? (
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <FileJson className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <span>{bulkError || bulkValidation.message}</span>
              </div>

              <button
                type="button"
                onClick={runBulkImport}
                disabled={bulkImporting || bulkValidation.validCount === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2FA084] px-4 py-2.5 text-sm font-semibold text-[#0A0F1A] hover:bg-[#3CD1AD] transition disabled:cursor-not-allowed disabled:opacity-45"
              >
                {bulkImporting ? 'Importing…' : `Import ${bulkValidation.validCount || 0} item${bulkValidation.validCount === 1 ? '' : 's'}`}
              </button>
            </div>

            <details className="mt-4 rounded-lg border border-white/8 bg-black/20 px-3 py-2">
              <summary className="cursor-pointer select-none py-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Field reference
              </summary>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {BULK_FIELD_HINTS.map(({ key, required, note }) => (
                  <div key={key} className="rounded-lg border border-white/6 bg-white/[0.03] px-3 py-2">
                    <p className="font-mono text-[11px] text-[#7DE8FF]">
                      {key}
                      {required && <span className="ml-1 text-red-400">*</span>}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">{note}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>          {filteredItems.map((item) => (
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
                      courseSlug: item.courseSlug && item.courseSlug !== 'general' ? item.courseSlug : '',
                      moduleLabel: item.moduleLabel || '',
                      description: item.description || '',
                      mediaUrl: item.mediaUrl || '',
                      durationMin: item.durationMin ? String(item.durationMin) : '',
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


