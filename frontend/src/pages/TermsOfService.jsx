import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-[#0EA5E9] font-semibold uppercase tracking-wider mb-2">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          Terms of Service
        </h1>
        <div className="prose prose-stone max-w-none text-stone-600 space-y-4 text-[15px] leading-relaxed">
          <p>
            By accessing or using Anmel Inc’s website and services, you agree to these terms. If you do not agree, please do
            not use our site.
          </p>
          <h2 className="text-lg font-bold text-stone-900 pt-4">Services</h2>
          <p>
            Professional services are governed by separate statements of work or master agreements. Website content is
            provided for general information and is not a substitute for a signed engagement.
          </p>
          <h2 className="text-lg font-bold text-stone-900 pt-4">Acceptable use</h2>
          <p>
            You agree not to misuse the site (including probing, scraping, or attempting unauthorized access) or to interfere
            with other users’ access.
          </p>
          <h2 className="text-lg font-bold text-stone-900 pt-4">Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, Anmel Inc is not liable for indirect or consequential damages arising from
            use of the website. Materials are provided “as is” without warranties of any kind.
          </p>
          <h2 className="text-lg font-bold text-stone-900 pt-4">Changes</h2>
          <p>We may update these terms periodically. Continued use after changes constitutes acceptance.</p>
          <p className="text-sm text-stone-500 pt-6">Last updated: {new Date().getFullYear()}. Review with legal counsel before relying on this template in production.</p>
        </div>
        <Link to="/" className="inline-flex mt-10 text-sm font-semibold text-[#F97316] hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
