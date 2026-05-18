import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { contactImage } from '../lib/siteImages';
import RemoteImage from '../components/ui/RemoteImage';
import MonroviaMap from '../components/lead/MonroviaMap';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');
    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="pt-28 min-h-screen bg-white">
      <section className="py-[var(--spacing-section)] bg-stone-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-[40%_60%_60%_40%_/60%_40%_60%_40%] bg-[#E0F2FE] opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#0EA5E9] font-semibold text-sm uppercase tracking-[0.2em]">Contact</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-4 text-4xl sm:text-5xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            Get in Touch
          </motion.h1>
          <p className="mt-4 text-stone-600 max-w-xl">Schedule a confidential consultation, request a quote, or ask a question. We typically respond within one business day.</p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-stone-500">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0EA5E9]" /> Monrovia, Liberia</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#7C3AED]" /> Response within 24 hours</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#F97316]" /> No obligation</span>
          </div>
        </div>
      </section>

      <section className="py-[var(--spacing-block)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-stone-600 mb-6">Include your organization name, what you’re looking for (e.g. assessment, compliance help), and any deadlines. We’ll reply with next steps.</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none transition"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none transition"
                    placeholder="you@company.com"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-stone-700 mb-2">Company</label>
                    <input id="company" name="company" type="text" value={form.company} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none transition" placeholder="Company name" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">Phone</label>
                    <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none transition" placeholder="+231 ..." />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-2">Subject</label>
                  <input id="subject" name="subject" type="text" value={form.subject} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none transition" placeholder="e.g. Security consultation" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">Message *</label>
                  <textarea id="message" name="message" required rows={5} value={form.message} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 outline-none transition resize-none" placeholder="How can we help?" />
                </div>
                {status === 'success' && <p className="text-[#0EA5E9] font-semibold">Thank you. We will get back to you soon.</p>}
                {status === 'error' && <p className="text-red-500">{errorMessage}</p>}
                <button type="submit" disabled={status === 'sending'} className="w-full sm:w-auto px-8 py-4 rounded-[var(--radius-button)] bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] shadow-lg shadow-orange-200/50 disabled:opacity-50 transition">
                  {status === 'sending' ? 'Sending...' : 'Send message'}
                </button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
              <div className="rounded-2xl overflow-hidden border border-stone-200/80 aspect-[4/3] bg-stone-100">
                <RemoteImage src={contactImage} alt="Team meeting for security consultation" className="w-full h-full object-cover" loading="lazy" fallbackSeed="contact-side" />
              </div>
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200/80">
                <h3 className="text-lg font-semibold text-stone-900">Office</h3>
                <p className="mt-4 text-stone-600">Monrovia, Liberia</p>
                <p className="mt-1 text-stone-600">contact@intelera.com</p>
                <p className="mt-4 text-sm text-stone-500">We work across time zones and can schedule calls to suit your location.</p>
              </div>
              <div className="bg-[#E0F2FE] rounded-2xl p-6 border border-[#0EA5E9]/20">
                <h3 className="font-semibold text-stone-900">What happens next</h3>
                <ol className="mt-4 space-y-3 text-sm text-stone-600">
                  <li className="flex gap-3"><span className="text-[#0EA5E9] font-bold">1.</span> We review your message and reply within one business day.</li>
                  <li className="flex gap-3"><span className="text-[#0EA5E9] font-bold">2.</span> We schedule a short call to understand your needs and scope.</li>
                  <li className="flex gap-3"><span className="text-[#0EA5E9] font-bold">3.</span> We propose an approach and quote—no obligation to proceed.</li>
                </ol>
              </div>
              <MonroviaMap dark={false} />

            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
