import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Mail, MapPin, ArrowRight, Github, Youtube } from 'lucide-react';
import NewsletterSignup from '../lead/NewsletterSignup';
import MonroviaMap from '../lead/MonroviaMap';

const ChecklistDownload = lazy(() => import('../lead/ChecklistDownload'));
import logoAnmel from '../../images/logo_anmel_transparent.png';

const footerLinks = {
  Navigation: [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/services', label: 'Security Services' },
    { to: '/education', label: 'Education' },
    { to: '/case-studies', label: 'Portfolio' },
    { to: '/contact', label: 'Contact' },
  ],
  Services: [
    { to: '/services/security-assessment', label: 'Penetration Testing' },
    { to: '/services/security-assessment', label: 'Security Audits' },
    { to: '/services/compliance', label: 'Compliance Consulting' },
    { to: '/services/secure-development', label: 'Web Development' },
    { to: '/services/cloud-security', label: 'Cloud Security' },
  ],
  Resources: [
    { to: '/application-security-checker', label: 'Application Security Checker' },
    { to: '/education', label: 'Education & courses' },
    { to: '/blog', label: 'Security Blog' },
    { to: '/case-studies', label: 'Case Studies' },
    { to: '/blog', label: 'White Papers' },
    { to: '/#security-checklist', label: 'Security Checklist' },
    { to: '/#faq', label: 'FAQ' },
  ],
};

const complianceBadges = ['ISO 27001', 'SOC 2', 'GDPR', 'PCI DSS'];

export default function Footer() {
  return (
    <footer className="footer-pattern relative overflow-hidden border-t border-white/10">
      <div className="h-1 w-full bg-gradient-to-r from-sky via-purple to-orange" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-10 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-4">
              <Link to="/" className="inline-flex items-center gap-2 mb-5">
                <img src={logoAnmel} alt="Anmel Inc" className="h-10 w-auto object-contain" />
              </Link>
              <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
                Protecting your digital assets with cutting-edge cybersecurity solutions and secure web engineering—from Monrovia,
                Liberia to teams worldwide.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-stone-400">
                  <MapPin className="w-4 h-4 text-sky shrink-0" aria-hidden />
                  <span>Monrovia, Liberia</span>
                </div>
                <a
                  href="mailto:contact@anmelinc.com"
                  className="flex items-center gap-3 text-sm text-stone-400 hover:text-sky-light transition"
                >
                  <Mail className="w-4 h-4 shrink-0" aria-hidden />
                  contact@anmelinc.com
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 hover:text-sky hover:border-sky/40 transition"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" strokeWidth={1.8} />
                </a>
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 hover:text-sky hover:border-sky/40 transition"
                  aria-label="X (Twitter)"
                >
                  <Twitter className="w-5 h-5" strokeWidth={1.8} />
                </a>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 hover:text-sky hover:border-sky/40 transition"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" strokeWidth={1.8} />
                </a>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-stone-400 hover:text-sky hover:border-sky/40 transition"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" strokeWidth={1.8} />
                </a>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-6">
              {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title} className="min-w-0">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-[0.15em] mb-4">
                    {title}
                  </h4>
                  <ul className="space-y-2.5">
                    {links.map(({ to, label }) => (
                      <li key={`${title}-${label}`}>
                        <Link
                          to={to}
                          className="text-stone-400 hover:text-white text-sm transition inline-flex items-center gap-2 group"
                        >
                          {label}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-0.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" strokeWidth={2} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pb-12 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="min-h-[220px] lg:min-h-[280px] order-2 lg:order-1">
              <MonroviaMap />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <NewsletterSignup />
              <div id="security-checklist">
                <Suspense fallback={<div className="h-48 rounded-xl border border-white/10 bg-white/5 animate-pulse" aria-hidden />}>
                  <ChecklistDownload />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        <div className="py-6 border-t border-white/10">
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mb-6">
            {complianceBadges.map((label) => (
              <span
                key={label}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] sm:text-xs font-medium text-stone-400 tracking-wide"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <p className="text-stone-500 text-sm">
              © {new Date().getFullYear()} Anmel Inc. Monrovia, Liberia. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 text-sm text-stone-500">
              <Link to="/privacy" className="hover:text-stone-300 transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-stone-300 transition">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-stone-300 transition">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
