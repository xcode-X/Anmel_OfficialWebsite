import { useState } from 'react';
import api from '../../lib/api';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/newsletter/subscribe', { email });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Newsletter</h4>
      <p className="mt-1.5 text-sm text-stone-400">Security insights and updates. No spam.</p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
        <label htmlFor="newsletter-email" className="sr-only">Email for newsletter</label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-stone-500 focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]/30 outline-none text-sm"
        />
        <button type="submit" disabled={status === 'sending'} className="shrink-0 px-4 py-2.5 rounded-lg bg-[#F97316] text-white font-semibold text-sm disabled:opacity-50 hover:bg-[#EA580C] transition">
          {status === 'sending' ? '…' : 'Subscribe'}
        </button>
      </form>
      {status === 'success' && <p className="mt-2 text-sm text-[#38BDF8] font-medium">Subscribed.</p>}
      {status === 'error' && <p className="mt-2 text-sm text-amber-400 font-medium">Something went wrong.</p>}
    </div>
  );
}
