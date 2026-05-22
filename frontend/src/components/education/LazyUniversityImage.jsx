import { useState, useEffect, useRef } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { universitiesApi } from '../../lib/api';

/**
 * Loads university campus images lazily — list API returns metadata fast;
 * base64 blobs are fetched per-card when scrolled into view.
 */
export default function LazyUniversityImage({
  uniId,
  alt,
  imageUrl,
  hasImage = false,
  compact = false,
  className = 'w-full h-full object-cover',
  wrapperClassName = 'w-full h-full',
}) {
  const [src, setSrc] = useState(imageUrl || null);
  const [pending, setPending] = useState(Boolean(hasImage && !imageUrl));
  const ref = useRef(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (imageUrl) {
      setSrc(imageUrl);
      setPending(false);
    }
  }, [imageUrl]);

  useEffect(() => {
    if (src || !hasImage || fetchedRef.current) return;
    const node = ref.current;
    if (!node) return;

    const loadImage = async () => {
      if (fetchedRef.current) return;
      fetchedRef.current = true;
      setPending(true);
      try {
        const { image } = await universitiesApi.getImage(uniId);
        if (image) setSrc(image);
      } finally {
        setPending(false);
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      loadImage();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          loadImage();
        }
      },
      { rootMargin: '240px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [uniId, hasImage, src]);

  return (
    <div ref={ref} className={wrapperClassName}>
      {src ? (
        <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />
      ) : pending ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-200/80">
          <Loader2 className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} text-slate-400 animate-spin`} />
        </div>
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${compact ? 'bg-white/5' : 'bg-slate-800'}`}>
          <Building2 className={`${compact ? 'w-5 h-5 text-white/20' : 'w-16 h-16 text-white/20'}`} />
        </div>
      )}
    </div>
  );
}
