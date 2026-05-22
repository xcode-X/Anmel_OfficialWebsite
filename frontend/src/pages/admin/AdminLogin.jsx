import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  BookOpen,
  Briefcase,
  Clock3,
  ShieldCheck,
  Lock,
  UserPlus,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Mail,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AppContext';
import logoAnmel from '../../images/logo_anmel_transparent.png';
import { ADMIN_BASE } from '../../lib/adminPaths';
import { auth } from '../../lib/api';

const TAB_LOGIN    = 'login';
const TAB_REGISTER = 'register';

export default function AdminLogin() {
  const [tab, setTab] = useState(TAB_LOGIN);

  /* ── login state ── */
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loginError, setLoginError]   = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  /* ── register state ── */
  const [regName,    setRegName]    = useState('');
  const [regEmail,   setRegEmail]   = useState('');
  const [regPw,      setRegPw]      = useState('');
  const [regPwC,     setRegPwC]     = useState('');
  const [showRegPw,  setShowRegPw]  = useState(false);
  const [regError,   setRegError]   = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  /* ── live stats ── */
  const [now, setNow]               = useState(() => new Date());
  const [stats, setStats]           = useState({ blog: 0, caseStudies: 0, lms: 0 });
  const [lastRefresh, setLastRefresh] = useState(null);
  const [statusText, setStatusText] = useState('Connecting...');

  const { login } = useAuth();
  const navigate  = useNavigate();

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, [now]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [blog, caseStudies, lms] = await Promise.all([
          api.getSafe('/blog', []).then((d) => (Array.isArray(d) ? d.length : 0)),
          api.getSafe('/case-studies', []).then((d) => (Array.isArray(d) ? d.length : 0)),
          api.getSafe('/lms-content', []).then((d) => (Array.isArray(d) ? d.length : 0)),
        ]);
        setStats({ blog, caseStudies, lms });
        setLastRefresh(new Date());
        setStatusText('All systems online');
      } catch {
        setStatusText('Waiting for API...');
      }
    };
    const start = setTimeout(refresh, 0);
    const poll  = setInterval(refresh, 60000); // poll every 60s — purely decorative stats
    return () => { clearTimeout(start); clearInterval(poll); };
  }, []);

  /* ── handlers ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(email, password);
      navigate(ADMIN_BASE, { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Login failed. Check your credentials and try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPw !== regPwC) {
      setRegError('Passwords do not match.');
      return;
    }
    if (regPw.length < 8) {
      setRegError('Password must be at least 8 characters.');
      return;
    }

    setRegLoading(true);
    try {
      await auth.registerAdmin({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPw,
      });
      setRegSuccess(`Account created for ${regEmail.trim()}. Signing you in…`);
      await login(regEmail.trim(), regPw);
      navigate(ADMIN_BASE, { replace: true });
    } catch (err) {
      setRegError(err.message || 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  /* ── shared styles ── */
  const inputBase =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#2FA084]/55 focus:bg-white/6 focus:ring-1 focus:ring-[#2FA084]/20';
  const labelBase =
    'block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060d18] text-white flex items-center justify-center px-4 py-10">
      {/* bg blobs */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 15% 20%, rgba(93,28,106,0.22) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 80%, rgba(47,160,132,0.16) 0%, transparent 60%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(47,160,132,1) 1px, transparent 1px), linear-gradient(to right, rgba(47,160,132,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">

          {/* ── Left: platform info ── */}
          <motion.section
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-white/8 bg-white/[0.03] p-7 backdrop-blur-xl lg:p-9 flex flex-col"
          >
            <div className="mb-7">
              <img src={logoAnmel} alt="Anmel Inc" className="h-9 w-auto object-contain" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#2FA084]/30 bg-[#2FA084]/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#2FA084] mb-5 w-fit">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
              Secure Command Center
            </div>

            <h1
              className="text-3xl font-bold leading-tight sm:text-4xl mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {greeting},<br />
              <span className="text-[#2FA084]">Anmel Inc</span> Admin
            </h1>
            <p className="text-sm leading-relaxed text-white/40 max-w-sm mb-7">
              Secure command center for scholarship and intern applications, LMS publishing, blog management, and
              operations monitoring. Live metrics refresh every minute.
            </p>

            {/* live stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Articles', value: stats.blog,         Icon: BookOpen },
                { label: 'Case studies', value: stats.caseStudies, Icon: Briefcase },
                { label: 'LMS',      value: stats.lms,          Icon: Activity },
              ].map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 flex flex-col gap-2"
                >
                  <Icon className="h-4 w-4 text-[#2FA084]/70" strokeWidth={1.8} />
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    {value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-white/30">{label}</p>
                </div>
              ))}
            </div>

            {/* status */}
            <div className="flex flex-wrap items-center gap-3 mt-auto">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 px-3 py-1.5 text-xs text-white/50">
                <Clock3 className="h-3.5 w-3.5 text-[#2FA084]" strokeWidth={1.8} />
                {now.toLocaleTimeString()}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 px-3 py-1.5 text-xs text-white/50">
                <span className={`h-1.5 w-1.5 rounded-full ${lastRefresh ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                {statusText}
              </span>
              {lastRefresh && (
                <span className="text-xs text-white/25">
                  Refreshed {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </div>
          </motion.section>

          {/* ── Right: login / register ── */}
          <motion.section
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="rounded-3xl border border-white/8 bg-[#0A0F1A]/90 p-7 lg:p-9 shadow-[0_32px_80px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* ── Tab switcher ── */}
            <div className="flex rounded-xl border border-white/8 bg-white/3 p-1 mb-7">
              {[
                { key: TAB_LOGIN,    label: 'Sign in',         Icon: Lock },
                { key: TAB_REGISTER, label: 'Register admin',  Icon: UserPlus },
              ].map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setTab(key); setLoginError(''); setRegError(''); setRegSuccess(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    tab === key
                      ? 'bg-[#2FA084] text-white shadow-[0_4px_16px_rgba(47,160,132,0.3)]'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* ── SIGN IN TAB ── */}
              {tab === TAB_LOGIN && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                      Sign in to your account
                    </h2>
                    <p className="text-sm text-white/35 mt-1">Enter your admin credentials to continue</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4 flex-1">
                    <div>
                      <label htmlFor="email" className={labelBase}>Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" strokeWidth={1.8} />
                        <input
                          id="email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`${inputBase} pl-10`}
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className={labelBase}>Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" strokeWidth={1.8} />
                        <input
                          id="password"
                          type={showPw ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${inputBase} pl-10 pr-12`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute inset-y-0 right-0 px-4 text-white/30 hover:text-white/60 transition-colors"
                          aria-label={showPw ? 'Hide password' : 'Show password'}
                        >
                          {showPw ? <EyeOff className="w-4 h-4" strokeWidth={1.8} /> : <Eye className="w-4 h-4" strokeWidth={1.8} />}
                        </button>
                      </div>
                    </div>

                    {loginError && (
                      <div className="rounded-xl border border-red-400/25 bg-red-500/8 px-4 py-3 text-sm text-red-300 flex items-start gap-2">
                        <span className="shrink-0 mt-0.5">⚠</span>
                        {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2FA084] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(47,160,132,0.3)] transition hover:bg-[#3CD1AD] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loginLoading ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      ) : (
                        <>
                          Enter control center
                          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-xs text-white/20">
                    Demo: demo.admin@Anmel Inc.com &nbsp;·&nbsp; DemoAdmin@123
                  </p>
                </motion.div>
              )}

              {/* ── REGISTER TAB ── */}
              {tab === TAB_REGISTER && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1"
                >
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                      Create admin account
                    </h2>
                    <p className="text-sm text-white/35 mt-1">
                      Fill in the details below to create a new admin account
                    </p>
                  </div>

                  {regSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center gap-4 py-10 text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">Account created!</p>
                        <p className="text-sm text-white/50 mt-1">{regSuccess}</p>
                        <p className="text-xs text-white/30 mt-2">Redirecting to sign in...</p>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4 flex-1">
                      <div>
                        <label htmlFor="reg-name" className={labelBase}>Full name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" strokeWidth={1.8} />
                          <input
                            id="reg-name"
                            type="text"
                            required
                            autoComplete="name"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className={`${inputBase} pl-10`}
                            placeholder="e.g. John Smith"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reg-email" className={labelBase}>Email address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" strokeWidth={1.8} />
                          <input
                            id="reg-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className={`${inputBase} pl-10`}
                            placeholder="e.g. jane@Anmel Inc.com"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="reg-pw" className={labelBase}>Password</label>
                          <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" strokeWidth={1.8} />
                            <input
                              id="reg-pw"
                              type={showRegPw ? 'text' : 'password'}
                              required
                              value={regPw}
                              onChange={(e) => setRegPw(e.target.value)}
                              className={`${inputBase} pl-10 pr-10`}
                              placeholder="Min. 8 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPw((v) => !v)}
                              className="absolute inset-y-0 right-0 px-3 text-white/30 hover:text-white/60 transition-colors"
                              aria-label={showRegPw ? 'Hide' : 'Show'}
                            >
                              {showRegPw ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.8} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.8} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="reg-pwc" className={labelBase}>Confirm password</label>
                          <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" strokeWidth={1.8} />
                            <input
                              id="reg-pwc"
                              type={showRegPw ? 'text' : 'password'}
                              required
                              value={regPwC}
                              onChange={(e) => setRegPwC(e.target.value)}
                              className={`${inputBase} pl-10`}
                              placeholder="Repeat password"
                            />
                          </div>
                        </div>
                      </div>

                      {regError && (
                        <div className="rounded-xl border border-red-400/25 bg-red-500/8 px-4 py-3 text-sm text-red-300 flex items-start gap-2">
                          <span className="shrink-0 mt-0.5">⚠</span>
                          {regError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={regLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2FA084] py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(47,160,132,0.3)] transition hover:bg-[#3CD1AD] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {regLoading ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" strokeWidth={2} />
                            Create admin account
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

        </div>
      </div>
    </div>
  );
}
