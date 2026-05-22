import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Award, Building2, Calendar, DollarSign,
  MapPin, Loader2,
} from 'lucide-react';
import { scholarshipsApi } from '../lib/api';
import { subscribeContentStream } from '../lib/contentStream';
import LazyScholarshipThumbnail from '../components/scholarships/LazyScholarshipThumbnail';
import ScholarshipShareBar from '../components/scholarships/ScholarshipShareBar';

export default function ScholarshipDetail() {
  const { id } = useParams();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await scholarshipsApi.get(id);
      setScholarship(data);
      setError('');
    } catch (err) {
      setScholarship(null);
      setError(err.message || 'Scholarship not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
    const cleanup = subscribeContentStream((resource, meta) => {
      if (resource !== 'scholarships') return;
      if (meta?.action === 'deleted' && meta?.scholarshipId === id) {
        setScholarship(null);
        setError('This listing may have been removed or is no longer available.');
        setLoading(false);
        return;
      }
      load();
    });
    return cleanup;
  }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-24 px-4 text-center">
        <Award className="w-14 h-14 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Scholarship not found</h1>
        <p className="text-slate-500 mb-8">{error || 'This listing may have been removed or is no longer available.'}</p>
        <Link to="/education-consultant/scholarships" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to scholarships
        </Link>
      </div>
    );
  }

  const studentApplyPath = `/student-application?scholarship=${encodeURIComponent(id)}`;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/education-consultant/scholarships"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-700 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all scholarships
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm"
        >
          <div className="h-56 sm:h-72">
            <LazyScholarshipThumbnail
              key={`${scholarship._id}-${scholarship.updatedAt || scholarship.hasThumbnail || ''}`}
              scholarshipId={scholarship._id}
              alt={scholarship.title}
              thumbnailUrl={scholarship.thumbnail}
              hasThumbnail={scholarship.hasThumbnail || Boolean(scholarship.thumbnail)}
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 sm:p-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider rounded-full">
                {scholarship.scholarshipType}
              </span>
              {scholarship.fundingStatus && (
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  {scholarship.fundingStatus}
                </span>
              )}
            </div>

            <h1
              className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {scholarship.title}
            </h1>

            <div className="mt-5 flex flex-wrap gap-4 text-slate-600">
              <span className="inline-flex items-center gap-2 font-medium">
                <Building2 className="w-5 h-5 text-slate-400" />
                {scholarship.university}
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <MapPin className="w-5 h-5 text-slate-400" />
                {scholarship.country}
              </span>
            </div>

            {scholarship.amount && (
              <div className="mt-6 inline-flex items-center gap-2 text-3xl font-bold text-emerald-600">
                <DollarSign className="w-7 h-7" />
                {scholarship.amount}
              </div>
            )}

            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-semibold">
              <Calendar className="w-5 h-5" />
              Application deadline:{' '}
              {new Date(scholarship.deadline).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            {scholarship.description && (
              <section className="mt-10">
                <h2 className="text-lg font-bold text-slate-900 mb-3">About this scholarship</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{scholarship.description}</p>
              </section>
            )}

            <section className="mt-10">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Eligibility</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{scholarship.eligibility}</p>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <ScholarshipShareBar scholarship={scholarship} />
              <Link
                to={studentApplyPath}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-orange-500 transition shrink-0"
              >
                Apply for this scholarship <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
