import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, BookOpen, Clock, Eye, Sparkles,
} from 'lucide-react';
import api, { publicBlogApi } from '../lib/api';
import { getBlogCardImage } from '../lib/siteImages';
import { deferIdle } from '../lib/deferIdle';
import RemoteImage from '../components/ui/RemoteImage';
import BlogShareBar from '../components/blog/BlogShareBar';
import { subscribeContentStream } from '../lib/contentStream';

const categoryStyles = {
  Security: {
    text: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    ring: 'ring-violet-200/60',
    gradient: 'from-violet-500/10 via-transparent to-sky-400/5',
    accent: '#7C3AED',
  },
  Compliance: {
    text: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    ring: 'ring-sky-200/60',
    gradient: 'from-sky-500/10 via-transparent to-violet-400/5',
    accent: '#0284C7',
  },
  Development: {
    text: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    ring: 'ring-amber-200/60',
    gradient: 'from-amber-500/10 via-transparent to-orange-400/5',
    accent: '#D97706',
  },
};

const defaultCategoryStyle = {
  text: 'text-stone-700',
  bg: 'bg-stone-100',
  border: 'border-stone-200',
  ring: 'ring-stone-200/60',
  gradient: 'from-stone-400/10 via-transparent to-stone-300/5',
  accent: '#57534E',
};

function formatPostDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function formatPostDateShort(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function estimateReadMin(excerpt, content) {
  const text = [excerpt, content].filter(Boolean).join(' ');
  if (!text) return 4;
  const words = text.trim().split(/\s+/).length;
  return Math.max(2, Math.min(15, Math.round(words / 200) || 4));
}

function formatViewCount(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0';
  return n.toLocaleString();
}

function normalizeBlogPost(p) {
  if (!p) return p;
  return {
    ...p,
    image: getBlogCardImage(p),
    slug: p.slug,
    author: p.author || 'Anmel Team',
  };
}

function getCategoryStyle(cat) {
  return categoryStyles[cat] || defaultCategoryStyle;
}

function CategoryBadge({ category, className = '' }) {
  if (!category) return null;
  const style = getCategoryStyle(category);
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border} ${className}`}>
      {category}
    </span>
  );
}

function PostMeta({ post, views, compact = false }) {
  const readMin = estimateReadMin(post.excerpt, post.content);
  const textSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 ${textSize} text-stone-500`}>
      <span className="font-semibold text-stone-700">{post.author}</span>
      {post.publishedAt && (
        <>
          <span className="text-stone-300" aria-hidden>·</span>
          <time dateTime={post.publishedAt}>{formatPostDateShort(post.publishedAt)}</time>
        </>
      )}
      <span className="text-stone-300" aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
        {readMin} min
      </span>
      {typeof views === 'number' && (
        <>
          <span className="text-stone-300" aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            {formatViewCount(views)}
          </span>
        </>
      )}
    </div>
  );
}

function BlogPostCard({ post, index, views, featured = false }) {
  const style = getCategoryStyle(post.category);
  const readMin = estimateReadMin(post.excerpt, post.content);

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="group"
      >
        <Link
          to={`/blog/${post.slug}`}
          className={`relative block overflow-hidden rounded-[1.75rem] border border-stone-200/90 bg-white shadow-[0_8px_40px_-16px_rgba(15,23,42,0.12)] ring-1 ring-stone-900/[0.03] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_56px_-20px_rgba(15,23,42,0.18)] hover:border-stone-300`}
        >
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
          <div className="relative grid lg:grid-cols-2 gap-0">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[340px] overflow-hidden bg-stone-100">
              <RemoteImage
                src={post.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                loading="eager"
                fallbackSeed={`blog-f-${post.slug}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-stone-950/10" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-800 shadow-sm">
                  Latest
                </span>
                <CategoryBadge category={post.category} />
              </div>
            </div>
            <div className="relative flex flex-col justify-center p-8 sm:p-10 lg:p-12">
              <h2
                className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-stone-900 leading-snug transition-colors duration-300 group-hover:text-stone-700"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {post.title}
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed text-[17px] line-clamp-4">{post.excerpt}</p>
              <PostMeta post={post} views={views} />
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 group-hover:gap-3 group-hover:shadow-xl"
                  style={{ backgroundColor: style.accent }}
                >
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                </span>
                <span className="text-xs font-medium text-stone-400">{readMin} minute read</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group h-full"
    >
      <Link
        to={`/blog/${post.slug}`}
        className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-stone-200/90 bg-white shadow-[0_4px_24px_-10px_rgba(15,23,42,0.08)] ring-1 ring-stone-900/[0.03] transition-all duration-400 hover:-translate-y-1.5 hover:border-stone-300 hover:shadow-[0_24px_48px_-16px_rgba(15,23,42,0.14)]"
      >
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-[1.5rem]`} />

        <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
          <RemoteImage
            src={post.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            fallbackSeed={`blog-${post.slug}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-stone-900/5 to-transparent" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 w-1/2 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-[220%] group-hover:opacity-100" />
          </div>
          <div className="absolute left-4 top-4">
            <CategoryBadge category={post.category} />
          </div>
        </div>

        <div className="relative flex flex-1 flex-col p-6 sm:p-7">
          <h3
            className="text-xl font-bold text-stone-900 leading-snug transition-colors duration-300 group-hover:text-stone-700 line-clamp-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {post.title}
          </h3>
          <p className="mt-3 flex-1 text-[15px] leading-relaxed text-stone-600 line-clamp-3">{post.excerpt}</p>

          <div className="mt-5 pt-5 border-t border-stone-100">
            <PostMeta post={post} views={views} compact />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold transition-colors duration-300" style={{ color: style.accent }}>
                Read more
              </span>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition-all duration-300 group-hover:border-transparent group-hover:text-white group-hover:scale-110"
                style={{ '--hover-bg': style.accent }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = style.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
              >
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [viewMap, setViewMap] = useState({});

  const loadPosts = useCallback(() => {
    publicBlogApi
      .list(category)
      .then((data) => {
        setPosts(Array.isArray(data) ? data.map(normalizeBlogPost) : []);
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
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
    const cleanup = publicBlogApi.subscribe(
      (rows) => {
        setPosts(Array.isArray(rows) ? rows.map(normalizeBlogPost) : []);
        setLoading(false);
      },
      category,
    );
    return cleanup;
  }, [category]);

  useEffect(() => {
    setViewMap((prev) => {
      const next = { ...prev };
      posts.forEach((p) => { if (typeof p.views === 'number') next[p.slug] = p.views; });
      return next;
    });
  }, [posts]);

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];
  const featured = posts[0];
  const rest = featured ? posts.slice(1) : posts;

  const viewsFor = (slug) => {
    if (viewMap[slug] != null) return viewMap[slug];
    const p = posts.find((x) => x.slug === slug);
    return typeof p?.views === 'number' ? p.views : 0;
  };

  const popularPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => (viewsFor(b.slug) || 0) - (viewsFor(a.slug) || 0))
      .slice(0, 4);
  }, [posts, viewMap]);

  if (loading) {
    return (
      <div className="pt-28 min-h-screen bg-gradient-to-b from-stone-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="h-10 w-48 bg-stone-200/80 rounded-lg animate-pulse" />
          <div className="mt-6 h-5 w-full max-w-xl bg-stone-200/80 rounded animate-pulse" />
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-stone-200 overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-stone-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-20 bg-stone-200 rounded" />
                  <div className="h-6 w-full bg-stone-200 rounded" />
                  <div className="h-16 bg-stone-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 bg-gradient-to-b from-stone-50 via-white to-white min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-stone-200/80">
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500">
              <BookOpen className="h-4 w-4 text-violet-600" strokeWidth={2} />
              Anmel Inc. · Insights & field notes
            </p>
            <h1
              className="mt-4 text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-stone-900 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The Anmel Blog
            </h1>
            <p className="mt-5 max-w-2xl text-lg sm:text-xl text-stone-600 leading-relaxed">
              Practical writing from consultants and engineers who work on security assessments, compliance programmes, and software delivery every day.
            </p>
            <p className="mt-3 max-w-xl text-sm text-stone-500 leading-relaxed">
              No fluff — just what we have learned helping teams reduce risk, pass audits, and ship with confidence.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Category filter */}
        {categories.length > 0 && (
          <nav className="sticky top-[4.5rem] z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white/90 backdrop-blur-md border-b border-stone-200/80 flex flex-wrap items-center gap-2" aria-label="Blog categories">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 mr-2 hidden sm:inline">Filter</span>
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                !category
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All posts
            </button>
            {categories.map((cat) => {
              const style = getCategoryStyle(cat);
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 border ${
                    active
                      ? `${style.bg} ${style.text} ${style.border} shadow-sm ring-2 ${style.ring}`
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>
        )}

        {posts.length === 0 && (
          <div className="py-24 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
              <BookOpen className="w-7 h-7 text-stone-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-stone-800">Nothing published here yet</h2>
            <p className="mt-2 text-stone-500 max-w-md mx-auto">
              When our team publishes a new article, it will show up on this page automatically.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_300px] gap-12 lg:gap-16 py-12 sm:py-16">
          <div>
            {/* Featured */}
            {featured && (
              <section className="mb-14 sm:mb-16">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Editor&apos;s pick
                </p>
                <BlogPostCard post={featured} views={viewsFor(featured.slug)} featured />
              </section>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <section>
                {featured && (
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-8">
                    {category ? `${category} articles` : 'All articles'}
                  </h2>
                )}
                <motion.div layout className="grid gap-8 sm:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {rest.map((post, i) => (
                      <BlogPostCard
                        key={post.slug}
                        post={post}
                        index={i}
                        views={viewsFor(post.slug)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          {posts.length > 0 && (
            <aside className="lg:pt-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-5">Popular reads</h3>
                <ul className="space-y-5">
                  {popularPosts.map((post, i) => (
                    <li key={post.slug}>
                      <Link to={`/blog/${post.slug}`} className="group block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">#{i + 1}</span>
                        <p
                          className="mt-1 text-sm font-bold text-stone-900 leading-snug group-hover:text-violet-700 transition-colors line-clamp-2"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {post.title}
                        </p>
                        <p className="mt-1.5 text-xs text-stone-500 inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatViewCount(viewsFor(post.slug))} views
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-900 to-stone-800 p-6 text-white shadow-lg"
              >
                <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  Need expert help?
                </h3>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  Our team supports organisations with penetration testing, compliance readiness, and secure software development.
                </p>
                <Link
                  to="/services"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white border-b border-white/40 pb-0.5 hover:border-white transition-colors"
                >
                  Explore services
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
                <Link
                  to="/contact"
                  className="mt-4 block text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Or get in touch →
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.45 }}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-6"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-3">Stay current</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  New posts appear here as soon as they are published from our admin dashboard — no refresh needed.
                </p>
              </motion.div>
            </aside>
          )}
        </div>

        {/* Bottom CTA */}
        <section className="border-t border-stone-200 py-14 sm:py-16 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[1.75rem] border border-stone-200 bg-gradient-to-br from-violet-50/80 via-white to-sky-50/80 p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-10"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                Have a question about something you read?
              </h2>
              <p className="mt-3 text-stone-600 leading-relaxed">
                Whether it is a compliance gap, a security concern, or a build decision — our consultants are happy to talk it through and point you in the right direction.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex flex-wrap gap-3 shrink-0">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-stone-800 transition-all hover:gap-3"
              >
                Contact our team
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                to="/case-studies"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 hover:border-stone-400 transition-colors"
              >
                See case studies
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export function BlogPostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [viewCount, setViewCount] = useState(null);

  const loadPost = useCallback(() => {
    if (!slug) return;
    setNotFound(false);
    publicBlogApi
      .getBySlug(slug)
      .then((data) => {
        const normalized = normalizeBlogPost(data);
        setPost({ ...normalized, content: data.content || '' });
        setViewCount(typeof data.views === 'number' ? data.views : 0);
      })
      .catch(() => {
        setPost(null);
        setNotFound(true);
      });
  }, [slug]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    if (!post?.category) return;
    publicBlogApi
      .list(post.category)
      .then((data) => {
        const list = (Array.isArray(data) ? data : [])
          .map(normalizeBlogPost)
          .filter((p) => p.slug !== slug)
          .slice(0, 3);
        setRelated(list);
      })
      .catch(() => setRelated([]));
  }, [post?.category, slug]);

  useEffect(() => {
    const cleanup = publicBlogApi.subscribe((rows) => {
      const match = (Array.isArray(rows) ? rows : []).find((p) => p.slug === slug);
      if (!match) return;
      const normalized = normalizeBlogPost(match);
      setPost((prev) => ({ ...normalized, content: match.content || prev?.content || '' }));
      setViewCount(typeof match.views === 'number' ? match.views : 0);
      setNotFound(false);
    });
    const cleanupMeta = subscribeContentStream((resource) => {
      if (resource === 'blog') loadPost();
    });
    return () => {
      cleanup();
      cleanupMeta();
    };
  }, [slug, loadPost]);

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

  if (notFound) {
    return (
      <div className="pt-28 min-h-[60vh] flex flex-col items-center justify-center px-4 bg-white">
        <h1 className="text-2xl font-bold text-stone-900">Post not found</h1>
        <p className="mt-2 text-stone-600 text-center max-w-md">This article may have been removed or the link is incorrect.</p>
        <Link to="/blog" className="mt-8 text-sm font-semibold text-stone-900 border-b border-stone-900 pb-0.5 hover:text-stone-600 transition">
          Back to blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-28 min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 py-24 animate-pulse space-y-4">
          <div className="h-4 w-20 bg-stone-100 rounded" />
          <div className="h-10 w-full bg-stone-100 rounded" />
          <div className="h-4 w-64 bg-stone-100 rounded" />
        </div>
      </div>
    );
  }

  const heroImage = getBlogCardImage(post);
  const readMin = estimateReadMin(post.excerpt, post.content);

  return (
    <div className="pt-28 bg-white min-h-screen">
      <article>
        <header className="border-b border-stone-200 bg-gradient-to-b from-stone-50/80 to-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <Link to="/blog" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
              ← All posts
            </Link>
            {post.category && (
              <div className="mt-8">
                <CategoryBadge category={post.category} />
              </div>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-stone-900 leading-[1.15] tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {post.title}
            </motion.h1>
            {post.excerpt && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.45 }}
                className="mt-5 text-xl text-stone-600 leading-relaxed"
              >
                {post.excerpt}
              </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-stone-500"
            >
              <span className="font-semibold text-stone-800">{post.author}</span>
              {post.publishedAt && (
                <>
                  <span className="text-stone-300">·</span>
                  <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                </>
              )}
              <span className="text-stone-300">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                {readMin} min read
              </span>
              <span className="text-stone-300">·</span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                {formatViewCount(viewCount ?? 0)} views
              </span>
            </motion.div>
          </div>
        </header>

        {heroImage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
          >
            <div className="aspect-[2/1] overflow-hidden rounded-2xl bg-stone-100 shadow-lg ring-1 ring-stone-900/5">
              <RemoteImage
                src={heroImage}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
                fallbackSeed={`blogd-${post.slug}`}
              />
            </div>
          </motion.div>
        )}

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="blog-article prose prose-stone prose-lg max-w-none
              prose-headings:tracking-tight prose-headings:text-stone-900
              prose-p:text-stone-700 prose-p:leading-[1.75]
              prose-a:text-stone-900 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-stone-600
              prose-strong:text-stone-900
              prose-li:text-stone-700
              prose-blockquote:border-stone-300 prose-blockquote:text-stone-600 prose-blockquote:not-italic"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {related.length > 0 && (
            <section className="mt-16 pt-12 border-t border-stone-200">
              <h2 className="text-lg font-bold text-stone-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                More in {post.category}
              </h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {related.map((r, i) => (
                  <motion.div
                    key={r.slug}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link to={`/blog/${r.slug}`} className="group block rounded-xl border border-stone-200 p-4 hover:border-stone-300 hover:shadow-md transition-all">
                      <p className="text-sm font-bold text-stone-900 leading-snug group-hover:text-stone-600 line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>
                        {r.title}
                      </p>
                      <p className="mt-2 text-xs text-stone-500">{formatPostDateShort(r.publishedAt)}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-16 pt-10 border-t border-stone-200">
            <p className="text-sm font-medium text-stone-500 mb-4">Share this article</p>
            <BlogShareBar slug={slug} title={post.title} stopPropagation={false} />
            <Link
              to="/blog"
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-stone-900 hover:text-stone-600 transition-colors"
            >
              ← Back to all posts
            </Link>
          </footer>
        </div>
      </article>
    </div>
  );
}
