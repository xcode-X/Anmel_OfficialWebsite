import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, User } from 'lucide-react';
import { agentsApi } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';

export default function AgentLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: '', // email or agentCode
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const isCode = formData.identifier.toUpperCase().startsWith('AGT-');
      await agentsApi.login({
        [isCode ? 'agentCode' : 'email']: formData.identifier,
        password: formData.password
      });
      navigate('/agent-portal');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 bg-stone-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-3xl" />
            <div className="relative z-10">
              <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>Agent Portal Login</h1>
              <p className="text-blue-100/80 text-sm">Welcome back! Please enter your details.</p>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Email or Agent Code</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                  <input required type="text" value={formData.identifier} onChange={(e) => setFormData({ ...formData, identifier: e.target.value })} className="w-full pl-10 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. AGT-ABC123 or email" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                  <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                {loading ? 'Authenticating...' : 'Secure Login'} <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-600">Don't have an account? <Link to="/agent-registration" className="text-blue-600 font-bold hover:underline">Register here</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
