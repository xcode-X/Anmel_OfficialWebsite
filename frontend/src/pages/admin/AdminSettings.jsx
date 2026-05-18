import { useState } from 'react';
import {
  KeyRound,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info,
} from 'lucide-react';
import api from '../../lib/api';

function Notice({ type, text }) {
  if (!text) return null;
  const styles = {
    success: 'border-emerald-500/25 bg-emerald-500/8 text-emerald-300',
    error:   'border-red-400/25 bg-red-500/8 text-red-300',
    info:    'border-[#2FA084]/25 bg-[#2FA084]/8 text-[#2FA084]',
  };
  const icons = {
    success: CheckCircle2,
    error:   XCircle,
    info:    Info,
  };
  const Icon = icons[type] || Info;
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${styles[type] || styles.info}`}>
      <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
      {text}
    </div>
  );
}

const inputBase =
  'w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#2FA084]/50 focus:bg-white/6 focus:ring-1 focus:ring-[#2FA084]/20';
const labelBase =
  'block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2';

export default function AdminSettings() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwStatus, setPwStatus] = useState({ type: '', text: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [popupNotice, setPopupNotice] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwStatus({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPwStatus({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }

    setPwLoading(true);
    try {
      await api.patch('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPwStatus({ type: 'success', text: 'Password updated successfully.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwStatus({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const clearPopupDismissal = () => {
    try {
      localStorage.removeItem('intelera_exit_dismissed');
      setPopupNotice({ type: 'success', text: 'Reset â€” exit-intent popup will show on the next visit.' });
    } catch {
      setPopupNotice({ type: 'error', text: 'Could not access localStorage.' });
    }
    setTimeout(() => setPopupNotice({ type: '', text: '' }), 4000);
  };

  return (
    <div className="max-w-2xl space-y-8">

      {/* â”€â”€ Page header â”€â”€ */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2FA084] mb-1">Configuration</p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Settings
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Manage account security and platform preferences.
        </p>
      </div>

      {/* â”€â”€ Site info card â”€â”€ */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6">
          <div className="w-8 h-8 rounded-lg bg-[#2FA084]/12 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-[#2FA084]" strokeWidth={1.8} />
          </div>
          <h2 className="text-sm font-semibold text-white">Site Information</h2>
        </div>
        <dl className="divide-y divide-white/5">
          {[
            { label: 'Company',       value: 'Anmel Inc Security' },
            { label: 'Contact email', value: 'contact@anmelinc.com' },
            { label: 'Location',      value: 'Monrovia, Liberia' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3.5">
              <dt className="text-sm text-white/40">{label}</dt>
              <dd className="text-sm font-medium text-white/80">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* â”€â”€ Change password card â”€â”€ */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6">
          <div className="w-8 h-8 rounded-lg bg-[#2FA084]/12 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-[#2FA084]" strokeWidth={1.8} />
          </div>
          <h2 className="text-sm font-semibold text-white">Change Password</h2>
        </div>
        <div className="p-5">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className={labelBase}>Current password</label>
              <input
                id="currentPassword"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className={inputBase}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className={labelBase}>New password</label>
              <input
                id="newPassword"
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className={inputBase}
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelBase}>Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className={inputBase}
                placeholder="Repeat new password"
              />
            </div>

            <Notice type={pwStatus.type} text={pwStatus.text} />

            <button
              type="submit"
              disabled={pwLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2FA084] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(47,160,132,0.25)] transition hover:bg-[#3CD1AD] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <KeyRound className="w-4 h-4" strokeWidth={2} />
              )}
              {pwLoading ? 'Savingâ€¦' : 'Update password'}
            </button>
          </form>
        </div>
      </div>

      {/* â”€â”€ Danger zone card â”€â”€ */}
      <div className="rounded-2xl border border-red-500/15 bg-red-500/4 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-red-500/12">
          <div className="w-8 h-8 rounded-lg bg-red-500/12 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-400" strokeWidth={1.8} />
          </div>
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/70">Reset exit-intent popup</p>
              <p className="text-xs text-white/35 mt-0.5">
                Clears the dismissal flag â€” the popup will appear again on the visitor's next session.
              </p>
            </div>
            <button
              type="button"
              onClick={clearPopupDismissal}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-red-400/30 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/8 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
              Reset popup
            </button>
          </div>

          <Notice type={popupNotice.type} text={popupNotice.text} />
        </div>
      </div>

    </div>
  );
}


