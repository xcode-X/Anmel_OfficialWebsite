import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Briefcase, ShieldCheck, Mail, ArrowRight, Plus,
  TrendingUp, Users, GraduationCap, UserCheck, AlertTriangle,
} from 'lucide-react';
import api, { agentsApi } from '../../lib/api';
import { ADMIN_BASE } from '../../lib/adminPaths';

const statConfig = [
  {
    key: 'blog',
    label: 'Blog posts',
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
    key: 'services',
    label: 'Active services',
    icon: ShieldCheck,
    to: `${ADMIN_BASE}/services`,
    accent: '#F59E0B',
    accentBg: 'rgba(245,158,11,0.12)',
    accentBorder: 'rgba(245,158,11,0.2)',
  },
  {
    key: 'contacts',
    label: 'Contact submissions',
    icon: Mail,
    to: `${ADMIN_BASE}/contacts`,
    accent: '#E04A6F',
    accentBg: 'rgba(224,74,111,0.12)',
    accentBorder: 'rgba(224,74,111,0.2)',
  },
];

const quickActions = [
  { to: `${ADMIN_BASE}/blog`,         label: 'New blog post',       icon: BookOpen,    hint: 'Publish an article' },
  { to: `${ADMIN_BASE}/case-studies`, label: 'New case study',      icon: Briefcase,   hint: 'Add a portfolio item' },
  { to: `${ADMIN_BASE}/services`,     label: 'Update services',     icon: ShieldCheck, hint: 'Edit service offerings' },
  { to: `${ADMIN_BASE}/students`,     label: 'Student intake',      icon: UserCheck,   hint: 'Process applications' },
  { to: `${ADMIN_BASE}/lms`,          label: 'LMS content',         icon: GraduationCap, hint: 'Manage courses' },
  { to: `${ADMIN_BASE}/contacts`,     label: 'View enquiries',      icon: Mail,        hint: 'Respond to messages' },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const card = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function AdminOverview() {
  const [stats, setStats] = useState({ blog: null, caseStudies: null, services: null, contacts: null });
  const [unread, setUnread] = useState(0);
  const [pendingAgents, setPendingAgents] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/blog').catch(() => []),
      api.get('/case-studies').catch(() => []),
      api.get('/services').catch(() => []),
      api.get('/contact').catch(() => []),
      agentsApi.adminList().catch(() => []),
    ]).then(([blog, caseStudies, services, contacts, agents]) => {
      setStats({
        blog: blog.length,
        caseStudies: caseStudies.length,
        services: services.length,
        contacts: contacts.length,
      });
      setUnread(contacts.filter((c) => !c.read).length);
      setPendingAgents(agents.filter((a) => a.status === 'Pending').length);
    });
  }, []);

  return (
    <div className="max-w-5xl space-y-10">

      {/* â”€â”€ Page header â”€â”€ */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2FA084] mb-1">Admin</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Monitor your platform at a glance and take quick actions.
        </p>
      </div>

      {/* â”€â”€ Stat cards â”€â”€ */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statConfig.map((s) => {
          const Icon = s.icon;
          const value = stats[s.key];
          return (
            <motion.div key={s.key} variants={card} transition={{ type: 'spring', stiffness: 160, damping: 22 }}>
              <Link
                to={s.to}
                className="group block rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
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
                  className="text-3xl font-bold tabular-nums"
                  style={{ fontFamily: 'var(--font-display)', color: value === null ? 'transparent' : 'white' }}
                >
                  {value === null ? (
                    <span className="inline-block h-8 w-10 rounded-md animate-pulse bg-white/10" />
                  ) : value}
                </p>
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

      {/* â”€â”€ Unread alert â”€â”€ */}
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

      {/* Pending agents alert */}
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
              <p className="text-xs text-white/40">New agents registered — approve to send them login credentials</p>
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

      {/* â”€â”€ Quick actions â”€â”€ */}
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
                transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 160 }}
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

      {/* â”€â”€ System status bar â”€â”€ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/6 bg-white/2 px-5 py-4"
      >
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Backend API connected
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          MongoDB optional
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-[#2FA084]" />
          Anmel Inc Admin v2
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


