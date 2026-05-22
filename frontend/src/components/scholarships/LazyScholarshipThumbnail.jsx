import { useState, useMemo, useEffect } from 'react';
import { Award } from 'lucide-react';

function resolveImageSrc(scholarshipId, thumbnailUrl, hasThumbnail) {
  if (thumbnailUrl) {
    if (thumbnailUrl.startsWith('http') || thumbnailUrl.startsWith('data:')) return thumbnailUrl;
    if (thumbnailUrl.startsWith('/api/')) return thumbnailUrl;
    if (thumbnailUrl.startsWith('/uploads/')) return thumbnailUrl;
  }
  if (hasThumbnail && scholarshipId) {
    return `/api/scholarships/${scholarshipId}/thumbnail/image`;
  }
  return null;
}

/**
 * Scholarship card/detail image — uses list API image URL or streams from the server.
 */
export default function LazyScholarshipThumbnail({
  scholarshipId,
  alt,
  thumbnailUrl,
  hasThumbnail = false,
  className = 'w-full h-full object-cover',
  wrapperClassName = 'w-full h-full',
}) {
  const initialSrc = useMemo(
    () => resolveImageSrc(scholarshipId, thumbnailUrl, hasThumbnail),
    [scholarshipId, thumbnailUrl, hasThumbnail],
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [initialSrc]);

  const displaySrc = failed ? null : initialSrc;

  return (
    <div className={wrapperClassName}>
      {displaySrc ? (
        <img
          src={displaySrc}
          alt={alt}
          className={className}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-slate-200">
          <Award className="w-14 h-14 text-slate-300" />
        </div>
      )}
    </div>
  );
}
