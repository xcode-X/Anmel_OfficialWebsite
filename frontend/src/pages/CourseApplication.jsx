import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import api, { studentRegistrations } from '../lib/api';
import { defaultCourses } from '../lib/coursesData';
import { mergeCourseDetail } from '../lib/mergeCourseDetail';

function useCourse(slug) {
  const [item, setItem] = useState(null);
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    api
      .get(`/courses/${slug}`)
      .then((data) => {
        if (cancelled) return;
        if (!data || Array.isArray(data) || !data.slug) throw new Error('not found');
        const merged = mergeCourseDetail(data, slug);
        setItem(merged || data);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = defaultCourses.find((c) => c.slug === slug);
        setItem(fallback || null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return item;
}

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  educationLevel: '',
  experienceLevel: '',
  preferredLearningMode: '',
  preferredStartWindow: '',
  motivation: '',
};

export default function CourseApplication() {
  const { slug } = useParams();
  const course = useCourse(slug);
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState('');
  const [saving, setSaving] = useState(false);

  const courseTitle = useMemo(() => course?.title || 'Selected program', [course?.title]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setState('');
    try {
      await studentRegistrations.register({
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        courseSlug: slug,
        applicationType: 'intern',
        course: courseTitle,
      });
      setState('success');
      setForm(initialForm);
    } catch (err) {
      setState(err.message || 'Could not submit application.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white pt-28">
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to={`/education/${slug}`} className="text-sm font-semibold text-[#0EA5E9] hover:underline">
            ← Back to program
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-stone-900 sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Intern application — {courseTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Complete this form to apply for the academy program. Your submission appears immediately in the intern application queue for review.
          </p>
        </motion.div>

        <form onSubmit={onSubmit} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <input required type="text" placeholder="Full name" value={form.fullName} onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))} className="sm:col-span-2 rounded-xl border border-stone-200 px-4 py-3 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} className="rounded-xl border border-stone-200 px-4 py-3 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2" />
            <input required type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} className="rounded-xl border border-stone-200 px-4 py-3 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2" />
            <input type="text" placeholder="Country / location" value={form.country} onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))} className="rounded-xl border border-stone-200 px-4 py-3 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2" />
            <select value={form.educationLevel} onChange={(e) => setForm((s) => ({ ...s, educationLevel: e.target.value }))} className="rounded-xl border border-stone-200 px-4 py-3 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2">
              <option value="">Education level</option>
              <option value="high-school">High school</option>
              <option value="diploma">Diploma</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="other">Other</option>
            </select>
            <select value={form.experienceLevel} onChange={(e) => setForm((s) => ({ ...s, experienceLevel: e.target.value }))} className="rounded-xl border border-stone-200 px-4 py-3 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2">
              <option value="">Experience level</option>
              <option value="beginner">Beginner</option>
              <option value="some-experience">Some experience</option>
              <option value="working-professional">Working professional</option>
            </select>
            <select value={form.preferredLearningMode} onChange={(e) => setForm((s) => ({ ...s, preferredLearningMode: e.target.value }))} className="rounded-xl border border-stone-200 px-4 py-3 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2">
              <option value="">Preferred learning mode</option>
              <option value="live-online">Live online</option>
              <option value="hybrid">Hybrid</option>
              <option value="self-paced-with-support">Self-paced with support</option>
            </select>
            <select value={form.preferredStartWindow} onChange={(e) => setForm((s) => ({ ...s, preferredStartWindow: e.target.value }))} className="rounded-xl border border-stone-200 px-4 py-3 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2">
              <option value="">Preferred start window</option>
              <option value="immediately">Immediately</option>
              <option value="within-30-days">Within 30 days</option>
              <option value="within-60-days">Within 60 days</option>
              <option value="flexible">Flexible</option>
            </select>
            <textarea rows={5} placeholder="Why are you applying for this course? (goals, background, expectations)" value={form.motivation} onChange={(e) => setForm((s) => ({ ...s, motivation: e.target.value }))} className="sm:col-span-2 rounded-xl border border-stone-200 px-4 py-3 outline-none ring-sky-200 focus:border-sky-400 focus:ring-2" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0EA5E9] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-200/50 hover:bg-[#0284C7] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit application'}
              {!saving && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
            </button>
            <Link to="/education" className="rounded-xl border border-stone-300 px-6 py-3.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
              Browse other programs
            </Link>
          </div>

          {state === 'success' && (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Application submitted successfully. Admissions will contact you with next steps.
            </p>
          )}
          {state && state !== 'success' && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state}</p>
          )}
        </form>
      </div>
    </div>
  );
}
