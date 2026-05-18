import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  Settings,
  Users,
  Mail,
  GraduationCap,
  MonitorCheck,
  Terminal,
  UserCheck,
  Building2,
  MessageSquareQuote,
  Home,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AppContext';
import logoAnmel from '../../images/logo_anmel_transparent.png';
import { ADMIN_BASE, ADMIN_LOGIN } from '../../lib/adminPaths';

const nav = [
  { to: ADMIN_BASE, label: 'Overview',          end: true, icon: LayoutDashboard },
  { to: `${ADMIN_BASE}/blog`,        label: 'Blog',           icon: BookOpen },
  { to: `${ADMIN_BASE}/case-studies`,label: 'Case Studies',   icon: Briefcase },
  { to: `${ADMIN_BASE}/services`,    label: 'Services',       icon: ShieldCheck },
  { to: `${ADMIN_BASE}/lms`,         label: 'LMS Content',    icon: GraduationCap },
  { to: `${ADMIN_BASE}/students`,    label: 'Student Intake', icon: UserCheck },
  { to: `${ADMIN_BASE}/contacts`,    label: 'Contacts',       icon: Mail },
  { to: `${ADMIN_BASE}/pentest-results`, label: 'Pen Testing', icon: Terminal },
  { to: `${ADMIN_BASE}/users`,       label: 'Users',          icon: Users },
  { to: `${ADMIN_BASE}/agents`,      label: 'Agents',         icon: MonitorCheck },
  { to: `${ADMIN_BASE}/universities`,label: 'Universities',   icon: Building2 },
  { to: `${ADMIN_BASE}/testimonials`,label: 'Testimonials',   icon: MessageSquareQuote },
  { to: `${ADMIN_BASE}/settings`,    label: 'Settings',       icon: Settings },
];

const ACCENT = '#2FA084'; // brand teal

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ADMIN_LOGIN);
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="min-h-screen bg-[#060d18] flex text-white">

      {/* â”€â”€ SIDEBAR â”€â”€ */}
      <aside
        className={`${sidebarOpen ? 'w-60' : 'w-[60px]'} bg-[#0A0F1A] border-r border-white/6 flex flex-col transition-all duration-300 shrink-0 relative`}
      >
        {/* Logo bar */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-white/6 shrink-0">
          {sidebarOpen && (
            <Link to={ADMIN_BASE} className="flex items-center gap-2.5 min-w-0">
              <img src={logoAnmel} alt="Anmel Inc" className="h-7 w-auto object-contain shrink-0" />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35 whitespace-nowrap"
              >
                Control Center
              </span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/6 transition shrink-0 ml-auto"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen
              ? <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              : <ChevronRight className="w-4 h-4" strokeWidth={2} />}
          </button>
        </div>

        {/* View site link */}
        <div className="px-2 pt-3 pb-1">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 hover:bg-emerald-500/14 transition ${sidebarOpen ? '' : 'justify-center'}`}
          >
            <Home className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            {sidebarOpen && (
              <>
                <span className="flex-1">Public site</span>
                <ExternalLink className="w-3 h-3 opacity-60 shrink-0" strokeWidth={2} />
              </>
            )}
          </Link>
        </div>

        {/* Nav group label */}
        {sidebarOpen && (
          <p className="px-5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
            Management
          </p>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-2 pb-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150
                  ${isActive
                    ? 'bg-[#2FA084]/15 text-[#2FA084] font-semibold border border-[#2FA084]/20'
                    : 'text-white/45 hover:bg-white/5 hover:text-white/85 border border-transparent'
                  }
                  ${sidebarOpen ? '' : 'justify-center'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`shrink-0 transition-colors ${sidebarOpen ? 'w-4 h-4' : 'w-[18px] h-[18px]'} ${isActive ? 'text-[#2FA084]' : 'text-white/40 group-hover:text-white/70'}`}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    {sidebarOpen && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-2 pb-3 pt-2 border-t border-white/6 space-y-1">
          {sidebarOpen && user?.email && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/4 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#2FA084]/20 border border-[#2FA084]/30 flex items-center justify-center text-[10px] font-bold text-[#2FA084] shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white/80 font-medium truncate">{user.email}</p>
                <p className="text-[10px] text-white/30">Administrator</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400/80 hover:bg-red-500/8 hover:text-red-400 transition border border-transparent ${sidebarOpen ? '' : 'justify-center'}`}
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
            {sidebarOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* â”€â”€ MAIN CONTENT â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top bar */}
        <header className="h-14 sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/6 bg-[#060d18]/95 px-5 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {/* breadcrumb placeholder â€” pages can override via portal if needed */}
            <div className="w-1.5 h-5 rounded-full bg-[#2FA084]/50" aria-hidden />
            <span className="text-sm font-semibold text-white/70">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/30 bg-white/4 border border-white/8 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>System online</span>
            </div>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/4 px-3.5 py-2 text-xs font-semibold text-white/70 transition hover:border-[#2FA084]/40 hover:text-[#2FA084] hover:bg-[#2FA084]/8"
            >
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">View site</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


