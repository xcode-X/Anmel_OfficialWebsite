import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Building2, Calendar, DollarSign,
} from 'lucide-react';
import LazyScholarshipThumbnail from './LazyScholarshipThumbnail';
import ScholarshipShareBar from './ScholarshipShareBar';

export default function ScholarshipOpportunityCard({ scholarship: sch, index = 0 }) {
  return (
    <motion.article
      id={`scholarship-${sch._id}`}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group relative flex flex-col min-h-[420px] rounded-[2rem] bg-gradient-to-br from-slate-50 via-white to-sky-50/40 overflow-hidden"
    >
      <div className="h-48 sm:h-52 shrink-0 overflow-hidden">
        <LazyScholarshipThumbnail
          key={`${sch._id}-${sch.updatedAt || sch.hasThumbnail || ''}`}
          scholarshipId={sch._id}
          alt={sch.title}
          thumbnailUrl={sch.thumbnail}
          hasThumbnail={sch.hasThumbnail || Boolean(sch.thumbnail)}
          wrapperClassName="w-full h-full"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
      </div>

      <div className="flex flex-col flex-1 p-8 sm:p-10">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="px-4 py-1.5 bg-sky-100/80 text-sky-700 text-xs font-bold uppercase tracking-wider rounded-full">
            {sch.scholarshipType}
          </span>
          {sch.fundingStatus && (
            <span className="px-4 py-1.5 bg-emerald-100/80 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full">
              {sch.fundingStatus}
            </span>
          )}
        </div>

        <h3
          className="text-2xl sm:text-[1.65rem] font-bold text-slate-900 leading-tight group-hover:text-sky-700 transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {sch.title}
        </h3>

        <div className="mt-3 flex items-center gap-2.5 text-slate-600 text-base font-medium">
          <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
          <span>{sch.university}, {sch.country}</span>
        </div>

        {sch.amount && (
          <div className="mt-5 inline-flex items-center gap-2 text-2xl font-bold text-emerald-600 tabular-nums">
            <DollarSign className="w-6 h-6" strokeWidth={2} />
            {sch.amount}
          </div>
        )}

        {sch.description && (
          <p className="mt-4 text-base text-slate-600 leading-relaxed line-clamp-2">{sch.description}</p>
        )}

        <p className="mt-4 text-base text-slate-600 leading-relaxed flex-1">
          <span className="font-semibold text-slate-900">Eligibility: </span>
          {sch.eligibility}
        </p>

        <div className="mt-8 flex flex-col gap-4 pt-6 border-t border-slate-200/60">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-600">
            <Calendar className="w-4 h-4 shrink-0" />
            Deadline:{' '}
            {new Date(sch.deadline).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link
                to={`/education-consultant/scholarships/${sch._id}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-slate-900 text-slate-900 text-sm font-semibold hover:bg-slate-900 hover:text-white transition-colors"
              >
                View Details
              </Link>
              <Link
                to={`/student-application?scholarship=${encodeURIComponent(sch._id)}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-orange-500 transition-colors"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ScholarshipShareBar scholarship={sch} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
