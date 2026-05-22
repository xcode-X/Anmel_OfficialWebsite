import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, Loader2, ExternalLink } from 'lucide-react';
import {
  buildCaseStudyShareLinks,
  buildCaseStudyShareText,
  copyShareText,
  getCaseStudyShareUrl,
  openAllShareWindows,
  openShareWindow,
  SHARE_PLATFORMS,
} from '../../lib/caseStudyShare';
import { caseStudiesApi } from '../../lib/api';

function PlatformIcon({ id, className }) {
  const icons = {
    facebook: (
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    ),
    linkedin: (
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    ),
    x: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
    whatsapp: (
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    ),
    telegram: (
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    ),
    reddit: (
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.587.545a1.25 1.25 0 0 1 1.249-1.25zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    ),
    email: (
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    ),
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {icons[id]}
    </svg>
  );
}

export default function CaseStudySocialShareModal({ caseStudy, open, onClose }) {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(null);

  if (!caseStudy) return null;

  const shareUrl = getCaseStudyShareUrl(caseStudy.slug);
  const shareText = buildCaseStudyShareText(caseStudy, shareUrl);
  const links = buildCaseStudyShareLinks(shareUrl, shareText);

  const handleCopy = async () => {
    const ok = await copyShareText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
    if (!ok) window.prompt('Copy this text to share:', shareText);
  };

  const handlePublishAll = async () => {
    setPublishing(true);
    setStatus(null);
    try {
      const data = await caseStudiesApi.share(caseStudy._id);
      const apiPosted = (data.results || []).filter((r) => r.method === 'api' && r.ok);
      const intentPlatforms = (data.results || [])
        .filter((r) => r.method === 'intent')
        .map((r) => r.platform);

      await openAllShareWindows(data.links || links, intentPlatforms.length ? intentPlatforms : undefined);

      setStatus({
        type: 'success',
        message: apiPosted.length
          ? `Posted via API to ${apiPosted.map((r) => r.platform).join(', ')}. Share windows opened for other platforms.`
          : 'Share windows opened for all platforms. Complete each post in the opened tabs.',
      });
    } catch (err) {
      await openAllShareWindows(links);
      setStatus({
        type: 'info',
        message: err.message || 'Opened share windows. Allow pop-ups if any platform did not open.',
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0A0F1A] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-6 border-b border-white/8">
              <div>
                <div className="flex items-center gap-2 text-violet-400 mb-1">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Publish to Social</span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug">{caseStudy.title}</h2>
                <p className="text-xs text-white/40 mt-1">Share live to all institution platforms in real time</p>
              </div>
              <button type="button" onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-xl bg-white/5 border border-white/8 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Preview</p>
                <p className="text-sm text-white/70 whitespace-pre-line leading-relaxed">{shareText}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SHARE_PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => openShareWindow(links[platform.id])}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition group"
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition group-hover:scale-105"
                      style={{ backgroundColor: platform.color }}
                    >
                      <PlatformIcon id={platform.id} className="w-5 h-5" />
                    </span>
                    <span className="text-[11px] font-semibold text-white/60 group-hover:text-white">{platform.label}</span>
                  </button>
                ))}
              </div>

              {status && (
                <p className={`text-xs rounded-xl px-4 py-3 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'}`}>
                  {status.message}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/5 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy text'}
                </button>
                <button
                  type="button"
                  onClick={handlePublishAll}
                  disabled={publishing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-500 transition disabled:opacity-50"
                >
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  {publishing ? 'Publishing…' : 'Publish to all platforms'}
                </button>
              </div>

              <p className="text-[11px] text-white/30 text-center">
                Allow pop-ups in your browser. Facebook & LinkedIn auto-post when API keys are configured in server .env.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
