import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Calendar, Clock, Eye, Sparkles, FileText } from 'lucide-react';
import api from '../lib/api';
import { deferIdle } from '../lib/deferIdle';
import RemoteImage from '../components/ui/RemoteImage';
import BlogShareBar from '../components/blog/BlogShareBar';
import { subscribeContentStream } from '../lib/contentStream';

const placeholderPosts = [];


function formatPostDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function estimateReadMin(excerpt) {
  if (!excerpt || typeof excerpt !== 'string') return 4;
  const words = excerpt.trim().split(/\s+/).length;
  return Math.max(2, Math.min(12, Math.round(words / 40) + 2));
}

const categoryChipClass = {
  Security: 'bg-violet-600 text-white ring-violet-700/30',
  Compliance: 'bg-sky-600 text-white ring-sky-700/30',
  Development: 'bg-amber-600 text-white ring-amber-700/30',
};

function formatViewCount(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0';
  return n.toLocaleString();
}

function normalizeBlogPost(p) {
  if (!p) return p;
  return {
    ...p,
    image: p.image || p.featuredImage || null,
    slug: p.slug,
  };
}

export function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [viewMap, setViewMap] = useState({});

  const loadPosts = useCallback(() => {
    const url = category ? `/blog?category=${encodeURIComponent(category)}` : '/blog';
    api
      .get(url)
      .then((data) => { setPosts(Array.isArray(data) ? data.map(normalizeBlogPost) : []); setLoading(false); })
      .catch(() => { setPosts([]); setLoading(false); });
  }, [category]);

  useEffect(() => {
    let cancelled = false;
    const cancel = deferIdle(() => {
      if (cancelled) return;
      loadPosts();
    }, 400);
    return () => {
      cancelled = true;
      cancel();
    };
  }, [loadPosts]);

  useEffect(() => {
    const onViews = (e) => {
      const { slug, views } = e.detail || {};
      if (slug && typeof views === 'number') setViewMap((prev) => ({ ...prev, [slug]: views }));
    };
    window.addEventListener('anmel-blog-views', onViews);
    return () => window.removeEventListener('anmel-blog-views', onViews);
  }, []);

  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') loadPosts(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [loadPosts]);

  useEffect(() => {
    return subscribeContentStream((resource) => { if (resource === 'blog') loadPosts(); });
  }, [loadPosts]);

  const list = posts;

  useEffect(() => {
    setViewMap((prev) => {
      const next = { ...prev };
      posts.forEach((p) => { if (typeof p.views === 'number') next[p.slug] = p.views; });
      return next;
    });
  }, [posts]);

  const categories = [...new Set(list.map((p) => p.category))];
  const featured = list[0];

  const chipClass = (cat) => categoryChipClass[cat] || 'bg-stone-700 text-white ring-stone-600/30';

  const viewsFor = (slug) => {
    if (viewMap[slug] != null) return viewMap[slug];
    const p = list.find((x) => x.slug === slug);
    return typeof p?.views === 'number' ? p.views : 0;
  };

  if (loading) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <svg className="w-8 h-8 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-sm font-medium">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-white to-stone-50 pb-[var(--spacing-section)] pt-8">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-violet-200/45 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-violet-700 shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} />
            Insights & updates
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mt-6 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.25rem]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Insights & Updates
          </motion.h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
            Security best practices, compliance tips, threat updates, and product news—written for both technical teams
            and non-technical decision-makers.
          </p>
          <p className="mt-3 max-w-xl text-sm text-stone-500">
            Use the filters to focus on a topic. New posts appear here as soon as they are published.
          </p>
        </div>
      </section>

      <section className="py-[var(--spacing-block)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="mr-2 hidden text-sm font-medium text-stone-500 sm:inline">Topic:</span>
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                !category
                  ? 'bg-stone-900 text-white shadow-md shadow-stone-900/15 ring-2 ring-stone-900'
                  : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200/80 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  category === cat
                    ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/20 ring-2 ring-[#F97316]'
                    : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200/80 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-5">
                <FileText className="w-7 h-7 text-violet-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-stone-800">No posts yet</h3>
              <p className="mt-2 text-stone-500 max-w-sm">Blog posts published from the admin dashboard will appear here.</p>
            </div>
          )}

          {featured && (
            <div className="mb-14 overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_8px_40px_-12px_rgba(15,23,42,0.1)] ring-1 ring-stone-900/[0.04] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-stone-300/90 hover:shadow-[0_28px_56px_-16px_rgba(15,23,42,0.14),0_0_0_1px_rgba(124,58,237,0.08)]">
              <Link
                to={`/blog/${featured.slug}`}
                className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div
                  className="pointer-events-none absolute inset-0 z-[1] rounded-t-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, transparent 50%, rgba(14,165,233,0.05) 100%)',
                  }}
                />
                <div className="relative grid gap-0 lg:grid-cols-2">
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-200 lg:min-h-[280px] lg:aspect-auto">
                    {featured.image ? (
                      <RemoteImage
                        src={featured.image}
                        alt={`Featured: ${featured.title}`}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        loading="eager"
                        fallbackSeed={`blog-f-${featured.slug}`}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-violet-100" />
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent opacity-80 lg:opacity-100"
                      aria-hidden
                    />
                    <div className="absolute left-4 top-4 z-[2] flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-800 shadow-sm ring-1 ring-white/10">
                        Featured
                      </span>
                      {featured.category && (
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-black/5 ${chipClass(featured.category)}`}>
                          {featured.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative z-[2] flex flex-col justify-center p-8 sm:p-10 lg:pl-12">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
                      {featured.publishedAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                          {formatPostDate(featured.publishedAt)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                        {estimateReadMin(featured.excerpt)} min read
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-stone-600">
                        <Eye className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        {formatViewCount(viewsFor(featured.slug))} views
                      </span>
                    </div>
                    <h2
                      className="mt-4 text-2xl font-bold leading-[1.2] text-stone-900 transition-colors duration-200 group-hover:text-violet-800 sm:text-3xl"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-[17px] leading-relaxed text-stone-600">{featured.excerpt}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] transition group-hover:gap-3">
                      Read full article
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                    </span>
                  </div>
                </div>
              </Link>
              <div className="flex flex-col gap-3 border-t border-stone-100 bg-stone-50/90 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-stone-500">Share this article</p>
                <BlogShareBar slug={featured.slug} title={featured.title} />
              </div>
            </div>
          )}

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {list.slice(featured ? 1 : 0).map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 120, damping: 18 }}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] ring-1 ring-stone-900/[0.04] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-stone-300/90 hover:shadow-[0_24px_48px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(14,165,233,0.08)]"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="blog-card-inner relative flex min-h-0 flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-t-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:rounded-3xl"
                    style={{
                      background: `linear-gradient(135deg, ${post.category === 'Security' ? 'rgba(124,58,237,0.07)' : post.category === 'Compliance' ? 'rgba(14,165,233,0.07)' : 'rgba(245,158,11,0.06)'} 0%, transparent 55%)`,
                    }}
                  />
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
                    {post.image ? (
                      <RemoteImage
                        src={post.image}
                        alt={`Blog: ${post.title}`}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                        fallbackSeed={`blog-${post.slug}`}
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-sky-100/90 to-amber-50/90" />
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-stone-900/10 to-transparent"
                      aria-hidden
                    />
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-3xl">
                      <div className="absolute inset-0 w-1/2 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-[220%] group-hover:opacity-100" />
                    </div>
                    {post.category && (
                      <span
                        className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md ring-1 ring-black/5 ${chipClass(post.category)}`}
                      >
                        {post.category}
                      </span>
                    )}
                  </div>
                  <div className="relative flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt} className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" strokeWidth={2} />
                          {formatPostDate(post.publishedAt)}
                        </time>
                      )}
                      <span className="inline-flex items-center gap-1 text-stone-400">
                        <Clock className="h-3 w-3" strokeWidth={2} />
                        {estimateReadMin(post.excerpt)} min
                      </span>
                      <span className="inline-flex items-center gap-1 text-stone-500">
                        <Eye className="h-3 w-3" strokeWidth={2} aria-hidden />
                        {formatViewCount(viewsFor(post.slug))} views
                      </span>
                    </div>
                    <h3
                      className="mt-3 text-lg font-bold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-sky-700"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-stone-600">{post.excerpt}</p>
                    <span className="mt-6 flex items-center justify-between text-sm font-semibold text-sky-600">
                      <span className="transition group-hover:text-sky-700">Read article</span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={2}
                      />
                    </span>
                  </div>
                </Link>
                <div className="mt-auto flex flex-col gap-2 border-t border-stone-100 bg-stone-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Share</span>
                  <BlogShareBar slug={post.slug} title={post.title} className="justify-end sm:justify-start" />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-gradient-to-br from-orange-50/50 via-white to-violet-50/40 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            Stay updated
          </h2>
          <p className="mt-3 text-stone-600">
            Get new posts and security insights in your inbox. No spam—unsubscribe anytime.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#F97316] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#EA580C] hover:shadow-xl hover:shadow-orange-500/30"
          >
            Subscribe to newsletter
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export function BlogPostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [viewCount, setViewCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    api
      .get(`/blog/${slug}`)
      .then((data) => {
        if (cancelled) return;
        const normalized = normalizeBlogPost(data);
        setPost({ ...normalized, content: data.content || '' });
        setViewCount(typeof data.views === 'number' ? data.views : 0);
      })
      .catch(() => {
        if (cancelled) return;
        setPost(null);
        setNotFound(true);
      });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    return subscribeContentStream((resource) => {
      if (resource !== 'blog' || !slug) return;
      api.get(`/blog/${slug}`)
        .then((data) => {
          const normalized = normalizeBlogPost(data);
          setPost({ ...normalized, content: data.content || '' });
          setViewCount(typeof data.views === 'number' ? data.views : 0);
        })
        .catch(() => {});
    });
  }, [slug]);

  useEffect(() => {
    if (!slug || !post) return;
    const sessKey = `anmel_blog_viewed_${slug}`;
    if (sessionStorage.getItem(sessKey)) return;
    sessionStorage.setItem(sessKey, '1');
    api.post(`/blog/${slug}/view`, {})
      .then((r) => {
        if (typeof r.views === 'number') {
          setViewCount(r.views);
          window.dispatchEvent(new CustomEvent('anmel-blog-views', { detail: { slug, views: r.views } }));
        }
      })
      .catch(() => {});
  }, [slug, post]);

  if (notFound) return (
    <div className="pt-28 min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-stone-900">Post not found</h1>
      <p className="mt-2 text-stone-600 text-center max-w-md">This post doesn't exist or has been removed.</p>
      <Link to="/blog" className="mt-6 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition">Back to Blog</Link>
    </div>
  );

  if (!post) return <div className="pt-28 min-h-screen flex items-center justify-center bg-white text-stone-600">Loading...</div>;

  const heroImage = post.image || post.featuredImage;

  return (
    <div className="pt-28 bg-white">
      <article className="mx-auto max-w-3xl px-4 py-[var(--spacing-block)] sm:px-6 lg:px-8">
        <Link to="/blog" className="text-sm font-semibold text-[#0EA5E9] hover:underline">
          ← Blog
        </Link>
        <span className="mt-4 block text-sm font-semibold uppercase tracking-wider text-[#7C3AED]">{post.category}</span>
        <h1 className="mt-2 text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
          {post.title}
        </h1>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6">
          <p className="flex-1 text-stone-600">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 border-t border-stone-100 pt-4 sm:border-t-0 sm:pt-0">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600">
              <Eye className="h-4 w-4 text-stone-500" strokeWidth={2} aria-hidden />
              {formatViewCount(viewCount ?? 0)} views
            </span>
            <BlogShareBar slug={slug} title={post.title} />
          </div>
        </div>
        {heroImage && (
          <div className="mt-8 aspect-[16/10] overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100">
            <RemoteImage
              src={heroImage}
              alt={`Blog: ${post.title}`}
              className="h-full w-full object-cover"
              loading="lazy"
              fallbackSeed={`blogd-${post.slug}`}
            />
          </div>
        )}
        <div className="prose prose-stone mt-8 max-w-none text-stone-600" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
      </article>
    </div>
  );
}
