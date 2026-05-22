import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, Award, DollarSign, Bell, Download, Clock, KeyRound, Eye, EyeOff, X } from 'lucide-react';
import { agentsApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) { setMsg('New passwords do not match.'); return; }
    if (form.next.length < 8) { setMsg('New password must be at least 8 characters.'); return; }
    setLoading(true); setMsg('');
    try {
      await agentsApi.changePassword(form.current, form.next);
      setSuccess(true);
      setMsg('Password changed successfully! Please log in again.');
      setTimeout(() => { agentsApi.logout(); window.location.href = '/agent-login'; }, 2500);
    } catch (e) {
      setMsg(e.message || 'Failed to change password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
                required placeholder="Enter your current password"
                className="w-full pr-10 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#2FA084] focus:ring-1 focus:ring-[#2FA084]" />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <input type={showNext ? 'text' : 'password'} value={form.next} onChange={e => setForm(f => ({ ...f, next: e.target.value }))}
                required placeholder="Minimum 8 characters"
                className="w-full pr-10 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#2FA084] focus:ring-1 focus:ring-[#2FA084]" />
              <button type="button" onClick={() => setShowNext(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              required placeholder="Re-enter new password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#2FA084] focus:ring-1 focus:ring-[#2FA084]" />
          </div>
          <button type="submit" disabled={loading || success}
            className="w-full py-3 rounded-xl bg-[#2FA084] text-white font-bold text-sm hover:bg-[#3CD1AD] transition disabled:opacity-50 mt-2">
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}


export default function AgentPortal() {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!agentsApi.isLoggedIn()) {
      navigate('/agent-login');
      return;
    }
    agentsApi.me()
      .then(data => {
        setAgent(data);
        setLoading(false);
      })
      .catch(() => {
        agentsApi.logout();
        navigate('/agent-login');
      });
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Loading...</div>;

  return (
    <>
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row pt-20">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#64FFDA]">Agent Portal</h2>
          <p className="text-sm text-slate-400 mt-1">{agent.fullName}</p>
          <p className="text-xs text-slate-500 font-mono mt-1">{agent.agentCode}</p>
        </div>
        <nav className="mt-4">
          {[
            { label: 'Dashboard', icon: <DollarSign className="w-4 h-4"/>, active: true },
            { label: 'Applications', icon: <FileText className="w-4 h-4"/> },
            { label: 'Scholarships', icon: <Award className="w-4 h-4"/> },
            { label: 'Commissions', icon: <DollarSign className="w-4 h-4"/> },
            { label: 'Upload Documents', icon: <Download className="w-4 h-4"/> },
          ].map((item, i) => (
            <a key={i} href="#" className={`flex items-center gap-3 px-6 py-3 text-sm ${item.active ? 'bg-[#64FFDA]/10 text-[#64FFDA] border-l-2 border-[#64FFDA]' : 'text-slate-300 hover:bg-slate-800'}`}>
              {item.icon} {item.label}
            </a>
          ))}
          <button type="button" onClick={() => setShowChangePassword(true)} className="w-full flex items-center gap-3 px-6 py-3 text-sm text-slate-300 hover:bg-slate-800 text-left">
            <KeyRound className="w-4 h-4" /> Change Password
          </button>
        </nav>
        <div className="p-6 mt-auto">
          <button onClick={() => { agentsApi.logout(); navigate('/'); }} className="text-sm text-red-400 hover:text-red-300">Log out</button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dashboard Overview</h1>
          <button className="relative p-2 text-slate-600 hover:bg-slate-200 rounded-full">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-stone-50"></span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Referred', value: agent.referredStudents || 0, icon: <Users />, color: 'bg-blue-100 text-blue-600' },
            { label: 'Active Applications', value: agent.activeApplications || 0, icon: <Clock />, color: 'bg-amber-100 text-amber-600' },
            { label: 'Approved Admissions', value: agent.approvedAdmissions || 0, icon: <CheckCircle />, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Commission Earned', value: `$${agent.commissionEarned || 0}`, icon: <DollarSign />, color: 'bg-purple-100 text-purple-600' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Student Recruitment Analytics</h2>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {[40, 70, 45, 90, 65, 85, 120].map((h, i) => (
                <div key={i} className="w-1/12 bg-blue-100 rounded-t-md relative group">
                  <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all duration-500" style={{ height: `${h}%` }}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-500 px-2">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activities</h2>
            <div className="space-y-6">
              {[
                { title: 'Application Submitted', desc: 'System Update', time: 'Just now' },
                { title: 'Profile Updated', desc: 'Personal details', time: '1 day ago' },
                { title: 'Account Approved', desc: 'Admin verification', time: '2 days ago' }
              ].map((act, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#64FFDA]"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{act.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{act.desc}</p>
                    <p className="text-xs text-slate-400 mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>

    <AnimatePresence>
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </AnimatePresence>
    </>
  );
}
