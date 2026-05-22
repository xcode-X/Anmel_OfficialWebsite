import { useState, useEffect } from 'react';

const fallback = (seed) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`;

/**
 * Remote URL images with a deterministic Picsum fallback if the CDN returns an error.
 */
export default function RemoteImage({ src, alt, fallbackSeed = 'intelera', className, loading = 'lazy', onError: onErrorProp, ...rest }) {
  const [uri, setUri] = useState(src);

  useEffect(() => {
    setUri(src);
  }, [src]);

  return (
    <img
      {...rest}
      src={uri}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={(e) => {
        onErrorProp?.(e);
        // Keep uploaded base64/blob images — do not swap for a random stock photo
        if (uri?.startsWith('data:') || uri?.startsWith('blob:')) return;
        setUri((u) => (u.startsWith('https://picsum.photos') ? u : fallback(fallbackSeed)));
      }}
    />
  );
}
