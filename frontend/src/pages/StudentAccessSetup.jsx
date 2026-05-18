import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../lib/api';

export default function StudentAccessSetup() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus('Missing activation token.');
      return;
    }
    if (password.length < 8) {
      setStatus('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('Passwords do not match.');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      await api.post('/auth/student/activate', { token, newPassword: password });
      setStatus('success');
    } catch (err) {
      setStatus(err.message || 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07101F] px-4 py-16 text-white">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8"
      >
        <h1 className="text-2xl font-bold">Set your LMS password</h1>
        <p className="mt-2 text-sm text-neutral-300">
          Use this one-time setup to secure your account before entering the student portal.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#00D4FF] py-3 font-semibold text-[#072030] disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Activate account'}
          </button>
        </form>
        {status === 'success' ? (
          <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            Password updated successfully. You can now open the student portal.
            {' '}
            <Link to="/student" className="font-semibold underline">Go to portal</Link>
          </p>
        ) : status ? (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">{status}</p>
        ) : null}
      </motion.div>
    </div>
  );
}
