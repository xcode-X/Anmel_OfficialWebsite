import { useState } from 'react';
import { buildShareLinks, copyPostUrlForMedium } from '../../lib/blogShare';

function IconFacebook({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconLinkedin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconX({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconMedium({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75S22.15 6.25 22.81 6.25 24 8.83 24 12z" />
    </svg>
  );
}

const btnBase =
  'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/90 bg-white text-stone-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1';

/**
 * @param {{ slug: string, title: string, className?: string, stopPropagation?: boolean }} props
 */
export default function BlogShareBar({ slug, title, className = '', stopPropagation = true }) {
  const [mediumHint, setMediumHint] = useState(false);
  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : '';
  const links = buildShareLinks(postUrl, title);

  const wrap = (e) => {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const open = (url) => (e) => {
    wrap(e);
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=480');
  };

  const onMedium = async (e) => {
    wrap(e);
    const ok = await copyPostUrlForMedium(postUrl);
    setMediumHint(true);
    window.setTimeout(() => setMediumHint(false), 2500);
    window.open(links.medium, '_blank', 'noopener,noreferrer');
    if (!ok) {
      window.prompt('Copy this link to share on Medium:', postUrl);
    }
  };

  if (!postUrl) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`} onClick={wrap} onKeyDown={(e) => e.stopPropagation()} role="group" aria-label="Share this post">
      <button type="button" className={`${btnBase} hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]`} aria-label="Share on Facebook" onClick={open(links.facebook)}>
        <IconFacebook className="h-4 w-4" />
      </button>
      <button type="button" className={`${btnBase} hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]`} aria-label="Share on LinkedIn" onClick={open(links.linkedin)}>
        <IconLinkedin className="h-4 w-4" />
      </button>
      <button type="button" className={`${btnBase} hover:bg-stone-900 hover:text-white hover:border-stone-900`} aria-label="Share on X" onClick={open(links.x)}>
        <IconX className="h-4 w-4" />
      </button>
      <span className="relative inline-flex">
        <button
          type="button"
          className={`${btnBase} hover:bg-black hover:text-white hover:border-black`}
          aria-label="Open Medium and copy link"
          onClick={onMedium}
        >
          <IconMedium className="h-4 w-4" />
        </button>
        {mediumHint ? (
          <span className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-stone-900 px-2 py-1 text-[10px] font-medium text-white shadow-lg">
            Link copied
          </span>
        ) : null}
      </span>
    </div>
  );
}
