import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, ChevronRight } from 'lucide-react';
import { scholarshipsApi } from '../lib/api';
import { subscribeContentStream } from '../lib/contentStream';

function ScholarshipTableRow({ sch, index }) {
  return (
    <motion.tr
      id={`scholarship-${sch._id}`}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="group border-b border-slate-200/80 last:border-b-0 hover:bg-sky-50/40 transition-colors"
    >
      <td className="py-4 pl-4 pr-4 align-middle text-sm sm:text-base font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
        {sch.title}
      </td>
      <td className="py-4 px-4 align-middle text-sm text-slate-600 whitespace-nowrap">
        {sch.scholarshipType || '—'}
      </td>
      <td className="py-4 px-4 align-middle text-sm text-slate-600 whitespace-nowrap">
        {sch.country || '—'}
      </td>
      <td className="py-4 pr-4 pl-4 align-middle text-right whitespace-nowrap">
        <Link
          to={`/education-consultant/scholarships/${sch._id}`}
          className="text-sm font-semibold text-sky-700 hover:text-sky-900 underline-offset-2 hover:underline"
        >
          Details
        </Link>
      </td>
    </motion.tr>
  );
}

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-slate-200 last:border-b-0 animate-pulse">
          <td className="py-4 pl-4 pr-4"><div className="h-5 bg-slate-200 rounded w-3/4" /></td>
          <td className="py-4 px-4"><div className="h-5 bg-slate-200 rounded w-20" /></td>
          <td className="py-4 px-4"><div className="h-5 bg-slate-200 rounded w-16" /></td>
          <td className="py-4 pr-4 pl-4"><div className="h-5 bg-slate-200 rounded w-14 ml-auto" /></td>
        </tr>
      ))}
    </>
  );
}

export default function ScholarshipsList() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const applyRows = (rows) => {
      setScholarships(Array.isArray(rows) ? rows : []);
      setLoading(false);
    };

    scholarshipsApi.list().then(applyRows).catch(() => applyRows([]));

    const cleanups = [];
    cleanups.push(scholarshipsApi.subscribe(applyRows));
    cleanups.push(
      subscribeContentStream((resource) => {
        if (resource === 'scholarships') {
          scholarshipsApi.list().then(applyRows).catch(() => {});
        }
      }),
    );
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        scholarshipsApi.list().then(applyRows).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cleanups.forEach((fn) => fn());
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#scholarship-')) return;
    const timer = window.setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, scholarships.length ? 150 : 600);
    return () => window.clearTimeout(timer);
  }, [scholarships]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/education-consultant#scholarships"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-700 transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Education Consultant
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              All Scholarship Opportunities
            </h1>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              Published scholarships update here automatically when new opportunities are added.
            </p>
          </div>

          <Link
            to="/student-application"
            className="inline-flex items-center gap-2 text-white font-semibold bg-slate-900 px-6 py-3 rounded-full text-sm hover:bg-slate-800 transition shrink-0"
          >
            General application <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <tbody>
                {loading ? (
                  <TableSkeleton />
                ) : scholarships.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-500">
                      <Award className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">No scholarships posted yet</p>
                      <p className="text-sm text-slate-400 mt-2">Check back soon — new listings appear here automatically.</p>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {scholarships.map((sch, i) => (
                      <ScholarshipTableRow key={sch._id} sch={sch} index={i} />
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
