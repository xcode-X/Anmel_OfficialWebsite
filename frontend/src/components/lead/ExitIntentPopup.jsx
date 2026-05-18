import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, X } from 'lucide-react';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    const key = 'intelera_exit_dismissed';
    if (typeof window === 'undefined' || localStorage.getItem(key)) return;
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !dismissed && !shownRef.current) {
        shownRef.current = true;
        setShow(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [dismissed]);

  // First-time visit: show popup after 10 seconds if not already shown
  useEffect(() => {
    const key = 'intelera_exit_dismissed';
    if (typeof window === 'undefined' || localStorage.getItem(key)) return;
    const t = setTimeout(() => {
      if (!shownRef.current) {
        shownRef.current = true;
        setShow(true);
      }
    }, 10000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setShow(false);
    setDismissed(true);
    try { localStorage.setItem('intelera_exit_dismissed', '1'); } catch { void 0; }
  };

  useEffect(() => {
    if (!show) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-md z-[70]"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-intent-title"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[420px] z-[71] px-4"
          >
            <div className="relative bg-white rounded-[var(--radius-card)] border border-stone-200/80 shadow-[var(--shadow-hover)] overflow-hidden">
              {/* Gradient accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-sky via-purple to-orange" aria-hidden />

              <div className="p-8 pt-7">
                <button
                  type="button"
                  onClick={close}
                  className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-pale flex items-center justify-center text-purple mb-5">
                    <Shield className="w-7 h-7" strokeWidth={1.8} />
                  </div>
                  <h3 id="exit-intent-title" className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                    Before you go
                  </h3>
                  <p className="mt-3 text-stone-600 text-[15px] leading-relaxed max-w-[320px]">
                    Get a <span className="font-semibold text-stone-800">free cybersecurity consultation</span>. No obligation—we’ll help you understand your risks and next steps.
                  </p>
                </div>

                <div className="mt-7 space-y-3">
                  <Link
                    to="/contact"
                    onClick={close}
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-full bg-orange text-white font-semibold text-[15px] hover:bg-orange-light transition shadow-[var(--shadow-orange)]"
                  >
                    Schedule free consultation
                    <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
                  </Link>
                  <button
                    type="button"
                    onClick={close}
                    className="w-full py-2.5 text-stone-500 text-sm font-medium hover:text-stone-700 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
