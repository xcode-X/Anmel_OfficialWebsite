import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-[#0EA5E9] font-semibold uppercase tracking-wider mb-2">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-8" style={{ fontFamily: 'var(--font-display)' }}>
          Privacy Policy
        </h1>
        <div className="prose prose-stone max-w-none text-stone-600 space-y-4 text-[15px] leading-relaxed">
          <p>
            Anmel Inc (“we”, “us”) respects your privacy. This policy describes how we collect, use, and protect information
            when you use our website, contact forms, and related services.
          </p>
          <h2 className="text-lg font-bold text-stone-900 pt-4">Information we collect</h2>
          <p>
            We may collect information you submit voluntarily (name, email, company, message content) and standard technical
            data such as IP address, browser type, and pages visited, used to operate and secure our services.
          </p>
          <h2 className="text-lg font-bold text-stone-900 pt-4">How we use information</h2>
          <p>
            We use contact details to respond to inquiries, deliver newsletters you opt into, and improve our website. We do
            not sell personal data.
          </p>
          <h2 className="text-lg font-bold text-stone-900 pt-4">Retention &amp; security</h2>
          <p>
            We retain information only as long as needed for the purposes above and apply appropriate technical and
            organizational safeguards.
          </p>
          <h2 className="text-lg font-bold text-stone-900 pt-4">Your rights</h2>
          <p>
            Depending on your jurisdiction, you may request access, correction, or deletion of your personal data. Contact us
            at{' '}
            <a href="mailto:contact@anmelinc.com" className="text-[#0EA5E9] font-medium hover:underline">
              contact@anmelinc.com
            </a>
            .
          </p>
          <p className="text-sm text-stone-500 pt-6">Last updated: {new Date().getFullYear()}. This summary is informational; execute a formal policy with counsel for production use.</p>
        </div>
        <Link to="/" className="inline-flex mt-10 text-sm font-semibold text-[#F97316] hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
