import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Briefcase, Mail, ArrowRight, Plus,
  TrendingUp, Users, GraduationCap, UserCheck, Building2, Award,
  MessageSquareQuote, RefreshCw,
} from 'lucide-react';
import { adminStatsApi, agentsApi, scholarshipApplicationsApi, EMPTY_ADMIN_STATS } from '../../lib/api';
import { subscribeContentStream } from '../../lib/contentStream';
import { ADMIN_BASE } from '../../lib/adminPaths';

const statConfig = [
  {
    key: 'blog',
    label: 'Blog posts',
    subKey: 'published',
    subLabel: 'published',
    icon: BookOpen,
    to: `${ADMIN_BASE}/blog`,
    accent: '#2FA084',
    accentBg: 'rgba(47,160,132,0.12)',
    accentBorder: 'rgba(47,160,132,0.2)',
  },
  {
    key: 'caseStudies',
    label: 'Case studies',
    icon: Briefcase,
    to: `${ADMIN_BASE}/case-studies`,
    accent: '#8C2FA0',
    accentBg: 'rgba(140,47,160,0.12)',
    accentBorder: 'rgba(140,47,160,0.2)',
  },
  {
    key: 'contacts',
    label: 'Contact messages',
    subKey: 'unread',
    subLabel: 'unread',
    alertSub: true,
    icon: Mail,
    to: `${ADMIN_BASE}/contacts`,
    accent: '#E04A6F',
    accentBg: 'rgba(224,74,111,0.12)',
    accentBorder: 'rgba(224,74,111,0.2)',
  },
  {
    key: 'scholarships',
    label: 'Scholarships',
    subKey: 'live',
    subLabel: 'live on site',
    icon: Award,
    to: `${ADMIN_BASE}/scholarships`,
    accent: '#F97316',
    accentBg: 'rgba(249,115,22,0.12)',
    accentBorder: 'rgba(249,115,22,0.2)',
  },
  {
    key: 'universities',
    label: 'Partner universities',
    icon: Building2,
    to: `${ADMIN_BASE}/universities`,
    accent: '#6366F1',
    accentBg: 'rgba(99,102,241,0.12)',
    accentBorder: 'rgba(99,102,241,0.2)',
  },
  {
    key: 'agents',
    label: 'Registered agents',
    subKey: 'pending',
    subLabel: 'pending approval',
    alertSub: true,
    icon: Users,
    to: `${ADMIN_BASE}/agents`,
    accent: '#A855F7',
    accentBg: 'rgba(168,85,247,0.12)',
    accentBorder: 'rgba(168,85,247,0.2)',
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    icon: MessageSquareQuote,
    to: `${ADMIN_BASE}/testimonials`,
    accent: '#14B8A6',
    accentBg: 'rgba(20,184,166,0.12)',
    accentBorder: 'rgba(20,184,166,0.2)',
  },
];

const quickActions = [
  { to: `${ADMIN_BASE}/blog`,         label: 'New blog post',       icon: BookOpen,    hint: 'Publish an article' },
  { to: `${ADMIN_BASE}/case-studies`, label: 'New case study',      icon: Briefcase,   hint: 'Add a portfolio item' },
  { to: `${ADMIN_BASE}/scholarships/new`, label: 'Add scholarship', icon: Award,       hint: 'Publish a funding listing' },
  { to: `${ADMIN_BASE}/intern-applications`, label: 'Intern application', icon: UserCheck, hint: 'Academy program applicants' },
  { to: `${ADMIN_BASE}/lms`,          label: 'LMS content',         icon: GraduationCap, hint: 'Manage courses' },
  { to: `${ADMIN_BASE}/contacts`,     label: 'View enquiries',      icon: Mail,        hint: 'Respond to messages' },
];

const STREAM_RESOURCES = new Set([
  'blog', 'case-studies', 'scholarships', 'scholarship-applications', 'universities', 'testimonials', 'contacts', 'students',
]);

const STATS_CACHE_KEY = 'anmel_admin_stats_v1';

function readCachedStats() {
  try {
    const raw = sessionStorage.getItem(STATS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.blog?.total === 'number' ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedStats(data) {
  try {
    sessionStorage.setItem(STATS_CACHE_KEY, JSON.stringify(data));
  } catch { /* quota / private mode */ }
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const card = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function getStatValue(stats, key) {
  const block = stats?.[key];
  if (!block || typeof block.total !== 'number') return null;
  return block.total;
}

function getStatSub(stats, key, subKey) {
  const block = stats?.[key];
  if (!block || typeof block[subKey] !== 'number') return null;
  return block[subKey];
}

export default function AdminOverview() {
  const [stats, setStats] = useState(() => readCachedStats() || { ...EMPTY_ADMIN_STATS });
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => readCachedStats()?.updatedAt ?? null);

  const loadStats = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    try {
      const data = await adminStatsApi.get();
      setStats(data);
      setLastUpdated(data.updatedAt || Date.now());
      writeCachedStats(data);
    } catch {
      setStats((prev) => prev || { ...EMPTY_ADMIN_STATS, updatedAt: Date.now() });
      setLastUpdated(Date.now());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();

    const cleanupStream = subscribeContentStream((resource) => {
      if (STREAM_RESOURCES.has(resource)) loadStats(true);
    });

    const cleanupStudents = scholarshipApplicationsApi.subscribe(() => loadStats(true));
    const cleanupAgents = agentsApi.subscribe(() => loadStats(true));

    const onVis = () => {
      if (document.visibilityState === 'visible') loadStats(true);
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cleanupStream();
      cleanupStudents();
      cleanupAgents();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [loadStats]);

  const unread = stats?.contacts?.unread ?? 0;
  const pendingAgents = stats?.agents?.pending ?? 0;
  const pendingStudents = stats?.students?.pending ?? 0;

  return (
    <div className="max-w-6xl space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2FA084] mb-1">Admin</p>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Live counts across your platform — updates automatically when data changes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadStats()}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {lastUpdated && (
        <p className="text-xs text-white/30 -mt-6">
          Last updated {new Date(lastUpdated).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
        </p>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {statConfig.map((s) => {
          const Icon = s.icon;
          const value = getStatValue(stats, s.key);
          const subValue = s.subKey ? getStatSub(stats, s.key, s.subKey) : null;

          return (
            <motion.div key={s.key} variants={card} transition={{ type: 'spring', stiffness: 180, damping: 24 }}>
              <Link
                to={s.to}
                className="group block rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg h-full"
                style={{
                  backgroundColor: s.accentBg,
                  borderColor: s.accentBorder,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${s.accent}20`, color: s.accent }}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                </div>
                <p className="text-white/50 text-xs font-medium mb-1">{s.label}</p>
                <p
                  className="text-3xl font-bold tabular-nums text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {value ?? 0}
                </p>
                {s.subKey && subValue !== null && (
                  <p className={`mt-1.5 text-xs font-medium ${s.alertSub && subValue > 0 ? 'text-amber-300' : 'text-white/40'}`}>
                    {subValue} {s.subLabel}
                  </p>
                )}
                <div
                  className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ color: s.accent }}
                >
                  Manage
                  <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {unread > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Mail className="w-4 h-4 text-amber-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {unread} unread {unread === 1 ? 'message' : 'messages'}
              </p>
              <p className="text-xs text-white/40">New contact submissions need your attention</p>
            </div>
          </div>
          <Link
            to={`${ADMIN_BASE}/contacts`}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </motion.div>
      )}

      {pendingStudents > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 rounded-2xl border border-sky-500/20 bg-sky-500/8 px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-sky-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {pendingStudents} scholarship application{pendingStudents > 1 ? 's' : ''} awaiting review
              </p>
              <p className="text-xs text-white/40">Submissions from public scholarship listings</p>
            </div>
          </div>
          <Link
            to={`${ADMIN_BASE}/scholarships`}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            Review applications
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </motion.div>
      )}

      {pendingAgents > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/8 px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {pendingAgents} agent application{pendingAgents > 1 ? 's' : ''} pending review
              </p>
              <p className="text-xs text-white/40">Approve agents to send them login credentials</p>
            </div>
          </div>
          <Link
            to={`${ADMIN_BASE}/agents`}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Review agents
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </motion.div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-white/30" strokeWidth={1.8} />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Quick actions</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.to}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04, type: 'spring', stiffness: 160 }}
              >
                <Link
                  to={action.to}
                  className="group flex items-center gap-3.5 rounded-xl border border-white/7 bg-white/3 px-4 py-3.5 transition-all duration-150 hover:bg-white/6 hover:border-[#2FA084]/25"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#2FA084]/10 border border-[#2FA084]/15 flex items-center justify-center shrink-0 group-hover:bg-[#2FA084]/18 transition-colors">
                    <Icon className="w-4 h-4 text-[#2FA084]" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                      {action.label}
                    </p>
                    <p className="text-xs text-white/35 truncate">{action.hint}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-[#2FA084] transition-colors ml-auto shrink-0" strokeWidth={2} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/6 bg-white/2 px-5 py-4"
      >
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live dashboard sync active
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-[#2FA084]" />
          Anmel Inc Admin
        </div>
        <Link
          to={`${ADMIN_BASE}/settings`}
          className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
        >
          <Users className="w-3.5 h-3.5" strokeWidth={1.8} />
          Settings
        </Link>
      </motion.div>
    </div>
  );
}
