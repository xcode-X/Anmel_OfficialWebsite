import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, GraduationCap, MapPin, Globe, Users, Award,
  BookOpen, CheckCircle2, X, AlertTriangle, Clock, ChevronRight,
  ExternalLink, Loader2, CalendarDays,
} from 'lucide-react';
import { universitiesApi } from '../lib/api';

// ─── Level colour tokens ──────────────────────────────────────────────────────
const LEVEL_META = {
  'Undergraduate': { colour: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  "Master's":      { colour: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  'PhD':           { colour: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Diploma':       { colour: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Certificate':   { colour: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  'Foundation':    { colour: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
};
const levelMeta = (lvl) => LEVEL_META[lvl] || { colour: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' };

// ─── Eligibility engine ───────────────────────────────────────────────────────
const QUAL_ORDER = ['secondary', 'bachelor', 'master', 'phd'];
const QUAL_LABELS = {
  secondary: 'Secondary / High School',
  bachelor:  "Bachelor's Degree",
  master:    "Master's Degree",
  phd:       'PhD / Doctorate',
};
const IELTS_ORDER = ['none', '5.0', '5.5', '6.0', '6.5', '7.0'];
const IELTS_LABELS = {
  none: 'No formal test / Below 5.0',
  '5.0': 'IELTS 5.0 – 5.5',
  '5.5': 'IELTS 5.5 – 6.0',
  '6.0': 'IELTS 6.0 – 6.5',
  '6.5': 'IELTS 6.5 – 7.0',
  '7.0': 'IELTS 7.0 or above',
};

const REQS = {
  'Undergraduate': { minQual: 'secondary', minIelts: '6.0' },
  "Master's":      { minQual: 'bachelor',  minIelts: '6.5' },
  'PhD':           { minQual: 'master',    minIelts: '7.0' },
  'Diploma':       { minQual: 'secondary', minIelts: '5.5' },
  'Certificate':   { minQual: 'secondary', minIelts: '5.0' },
  'Foundation':    { minQual: 'secondary', minIelts: '5.0' },
};

function checkEligibility(level, qual, ielts) {
  const req = REQS[level] || REQS['Undergraduate'];
  const qualOk  = QUAL_ORDER.indexOf(qual)  >= QUAL_ORDER.indexOf(req.minQual);
  const ieltsOk = IELTS_ORDER.indexOf(ielts) >= IELTS_ORDER.indexOf(req.minIelts);

  if (qualOk && ieltsOk)   return 'eligible';
  if (qualOk || ieltsOk)   return 'conditional';
  return 'ineligible';
}

// ─── Eligibility modal ────────────────────────────────────────────────────────
function EligibilityModal({ course, uniName, onClose }) {
  const [step, setStep]   = useState('form'); // 'form' | 'result'
  const [qual, setQual]   = useState('');
  const [ielts, setIelts] = useState('');
  const [result, setResult] = useState(null);

  const submit = () => {
    if (!qual || !ielts) return;
    setResult(checkEligibility(course.level, qual, ielts));
    setStep('result');
  };

  const STATUS = {
    eligible:    { icon: <CheckCircle2 className="w-12 h-12 text-emerald-500" />, title: 'You appear eligible!', sub: 'Your qualifications meet the basic entry requirements for this programme.', colour: 'bg-emerald-50 border-emerald-200' },
    conditional: { icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,  title: 'Conditionally eligible', sub: 'You may qualify, but you might need additional support or a foundation pathway.', colour: 'bg-amber-50 border-amber-200' },
    ineligible:  { icon: <X className="w-12 h-12 text-rose-500" />,               title: "Not yet eligible", sub: "You don't currently meet the minimum entry requirements, but we can help you get there.", colour: 'bg-rose-50 border-rose-200' },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Eligibility Check</p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{course.name}</h3>
              <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold border ${levelMeta(course.level).colour}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${levelMeta(course.level).dot}`} />
                {course.level}
              </span>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-8 py-6 space-y-5">
              {/* Qualification */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">What is your highest qualification?</label>
                <div className="space-y-2">
                  {Object.entries(QUAL_LABELS).map(([k, v]) => (
                    <label key={k} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${qual === k ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="qual" value={k} checked={qual === k} onChange={() => setQual(k)} className="accent-blue-600" />
                      <span className="text-sm text-slate-700">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* IELTS */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">English language level (IELTS equivalent)</label>
                <div className="space-y-2">
                  {Object.entries(IELTS_LABELS).map(([k, v]) => (
                    <label key={k} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${ielts === k ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="ielts" value={k} checked={ielts === k} onChange={() => setIelts(k)} className="accent-blue-600" />
                      <span className="text-sm text-slate-700">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={submit} disabled={!qual || !ielts}
                className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition disabled:opacity-40">
                Check My Eligibility
              </button>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="px-8 py-8 space-y-6">
              <div className={`rounded-2xl border p-6 text-center ${STATUS[result].colour}`}>
                <div className="flex justify-center mb-4">{STATUS[result].icon}</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{STATUS[result].title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{STATUS[result].sub}</p>
              </div>

              <div className="space-y-3">
                {result !== 'ineligible' && (
                  <Link
                    to={`/student-application?university=${encodeURIComponent(uniName)}&course=${encodeURIComponent(course.name)}&level=${encodeURIComponent(course.level)}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition"
                    onClick={onClose}
                  >
                    Apply Now <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                <Link to="/contact"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:border-slate-300 hover:bg-slate-50 transition"
                  onClick={onClose}
                >
                  {result === 'ineligible' ? 'Get Guidance from Our Advisors' : 'Speak to an Advisor'}
                </Link>
                <button onClick={() => setStep('form')}
                  className="w-full py-3 text-sm text-slate-400 hover:text-slate-600 transition">
                  ← Re-check with different qualifications
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Course card ──────────────────────────────────────────────────────────────
function CourseCard({ course, uniName, idx }) {
  const [showModal, setShowModal] = useState(false);
  const meta = levelMeta(course.level);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(idx * 0.04, 0.4) }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${meta.colour}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {course.level}
            </span>
            {course.duration && (
              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium whitespace-nowrap">
                <Clock className="w-3.5 h-3.5" /> {course.duration}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 leading-snug mb-auto">{course.name}</h3>
        </div>

        <div className="px-6 pb-6 flex gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            <CheckCircle2 className="w-4 h-4" /> Check Eligibility
          </button>
          <Link
            to={`/student-application?university=${encodeURIComponent(uniName)}&course=${encodeURIComponent(course.name)}&level=${encodeURIComponent(course.level)}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-blue-600 transition"
          >
            Apply <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && <EligibilityModal course={course} uniName={uniName} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UniversityCourses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uni, setUni]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [activeLevel, setActiveLevel] = useState('All');

  useEffect(() => {
    setLoading(true);
    universitiesApi.get(id)
      .then(data => { setUni(data); setLoading(false); })
      .catch(() => { setError('University not found.'); setLoading(false); });
  }, [id]);

  const levels = useMemo(() => {
    if (!uni?.courses?.length) return [];
    const s = new Set(uni.courses.map(c => c.level).filter(Boolean));
    return ['All', ...Array.from(s)];
  }, [uni]);

  const displayed = useMemo(() => {
    if (!uni?.courses) return [];
    if (activeLevel === 'All') return uni.courses;
    return uni.courses.filter(c => c.level === activeLevel);
  }, [uni, activeLevel]);

  if (loading) return (
    <div className="min-h-screen pt-28 flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      <p className="text-slate-500 font-medium">Loading university…</p>
    </div>
  );

  if (error || !uni) return (
    <div className="min-h-screen pt-28 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <GraduationCap className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">University not found</h2>
        <p className="text-slate-500 mb-6">{error || 'This university page is unavailable.'}</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 font-semibold hover:underline">← Go back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* Hero banner */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden">
        {uni.image && <img src={uni.image} alt={uni.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/50 to-slate-900/80" />

        <div className="relative h-full flex flex-col justify-end max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-24">
          <button onClick={() => navigate(-1)}
            className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2 text-white/70 text-sm font-medium mb-3">
            <MapPin className="w-4 h-4" /> {uni.country}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}>
            {uni.name}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stats strip */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 -mt-6 relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <Award className="w-5 h-5 text-amber-500" />, label: 'World Ranking', value: uni.ranking || '—' },
            { icon: <CalendarDays className="w-5 h-5 text-blue-500" />, label: 'Founded', value: uni.founded || '—' },
            { icon: <Users className="w-5 h-5 text-violet-500" />, label: 'Students', value: uni.students || '—' },
            { icon: <BookOpen className="w-5 h-5 text-emerald-500" />, label: 'Programmes', value: uni.courses?.length ?? 0 },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">{s.icon}</div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-lg font-bold text-slate-900 leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description + website */}
        {(uni.description || uni.website) && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-10 flex flex-col sm:flex-row gap-4 sm:items-start">
            {uni.description && <p className="text-slate-600 leading-relaxed flex-1">{uni.description}</p>}
            {uni.website && (
              <a href={uni.website} target="_blank" rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition">
                <Globe className="w-4 h-4" /> Visit Website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Courses section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
              <GraduationCap className="w-7 h-7 text-blue-600" />
              Available Programmes
              <span className="text-base font-normal text-slate-400 ml-1">({displayed.length})</span>
            </h2>

            {/* Level tabs */}
            {levels.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {levels.map(l => (
                  <button key={l} onClick={() => setActiveLevel(l)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition ${activeLevel === l ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {displayed.length === 0 ? (
            <div className="py-20 text-center">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">No programmes listed yet</p>
              <p className="text-slate-400 text-sm mt-1">Check back soon or contact us for more information.</p>
              <Link to="/contact" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition">
                Contact an Advisor
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {displayed.map((course, idx) => (
                  <CourseCard key={course.name + course.level + idx} course={course} uniName={uni.name} idx={idx} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* CTA banner */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 px-8 py-12 text-center text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Not sure which programme fits you?
          </h3>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">Our education advisors will assess your profile and guide you to the best-matching programme and scholarship opportunities.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact"
              className="px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-bold hover:bg-blue-50 transition">
              Talk to an Advisor
            </Link>
            <Link to="/education-consultant"
              className="px-8 py-3.5 rounded-2xl border-2 border-white/30 text-white font-bold hover:bg-white/10 transition">
              Explore All Universities
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
