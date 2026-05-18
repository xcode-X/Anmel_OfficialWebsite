import { Link } from 'react-router-dom';

export default function CookiePolicy() {
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-[#0EA5E9] font-semibold uppercase tracking-wider mb-2">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          Cookie Policy
        </h1>
        <div className="prose prose-stone max-w-none text-stone-600 space-y-4 text-[15px] leading-relaxed">
          <p>
            This site may use cookies and similar technologies to remember preferences, measure traffic, and improve
            performance. You can control cookies through your browser settings.
          </p>
          <h2 className="text-lg font-bold text-stone-900 pt-4">Types of cookies</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-stone-800">Essential:</strong> required for basic site operation and security.
            </li>
            <li>
              <strong className="text-stone-800">Analytics (optional):</strong> help us understand how pages are used—only if
              enabled.
            </li>
          </ul>
          <h2 className="text-lg font-bold text-stone-900 pt-4">Your choices</h2>
          <p>
            Most browsers let you refuse or delete cookies. Blocking essential cookies may affect site functionality. For
            questions, email{' '}
            <a href="mailto:contact@intelera.com" className="text-[#0EA5E9] font-medium hover:underline">
              contact@intelera.com
            </a>
            .
          </p>
          <p className="text-sm text-stone-500 pt-6">Last updated: {new Date().getFullYear()}.</p>
        </div>
        <Link to="/" className="inline-flex mt-10 text-sm font-semibold text-[#F97316] hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
