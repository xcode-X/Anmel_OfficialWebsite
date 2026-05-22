import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, PlayCircle, BookOpen, Globe2, Users, Calendar, ArrowUpRight } from 'lucide-react';
import LazyUniversityImage from './LazyUniversityImage';

export default function FeaturedUniversityCard({ uni, index, onTour }) {
  const uniId = uni._id || uni.idName;
  const courseCount = Array.isArray(uni.courses) ? uni.courses.length : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="group relative flex flex-col h-full rounded-[1.75rem] bg-white border border-slate-200/80 overflow-hidden hover:border-sky-200/80 transition-colors duration-300"
    >
      {/* Image panel */}
      <div className="relative h-56 sm:h-60 overflow-hidden bg-slate-100">
        <LazyUniversityImage
          uniId={uniId}
          alt={uni.name}
          imageUrl={uni.image}
          hasImage={uni.hasImage || Boolean(uni.image)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          wrapperClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-800 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            {uni.country || 'Global'}
          </span>
          {courseCount > 0 && (
            <span className="rounded-full bg-sky-600/90 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-white">
              {courseCount} courses
            </span>
          )}
        </div>

        <div className="absolute bottom-4 left-5 right-5">
          <h3
            className="text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-sm pr-8"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {uni.name}
          </h3>
        </div>

        <Link
          to={`/university/${uniId}/courses`}
          className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-900 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
          aria-label={`View ${uni.name} courses`}
        >
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6 sm:p-7">
        {uni.description && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-5">
            {uni.description}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 mb-6">
          {(uni.ranking || uni.founded || uni.students) ? (
            <>
              {uni.ranking && (
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2.5 text-center">
                  <Globe2 className="w-3.5 h-3.5 text-sky-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Ranking</p>
                  <p className="text-xs font-semibold text-slate-800 truncate">{uni.ranking}</p>
                </div>
              )}
              {uni.founded && (
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2.5 text-center">
                  <Calendar className="w-3.5 h-3.5 text-orange-500 mx-auto mb-1" />
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Founded</p>
                  <p className="text-xs font-semibold text-slate-800 truncate">{uni.founded}</p>
                </div>
              )}
              {uni.students && (
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-2.5 text-center">
                  <Users className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Students</p>
                  <p className="text-xs font-semibold text-slate-800 truncate">{uni.students}</p>
                </div>
              )}
            </>
          ) : (
            <div className="col-span-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-center text-xs text-slate-500">
              Partner institution · explore programmes and campus life
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-2.5">
          <button
            type="button"
            onClick={() => onTour?.({ ...uni, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' })}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-orange-500 transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            Campus tour
          </button>
          <Link
            to={`/university/${uniId}/courses`}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50/50 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Courses
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
