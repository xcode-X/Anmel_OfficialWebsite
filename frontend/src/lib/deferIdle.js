/**
 * Run work after first paint / when the main thread is idle (falls back to setTimeout).
 * Use for non-critical API hydration so navigation and LCP stay fast.
 */
export function deferIdle(fn, timeout = 400) {
  if (typeof requestIdleCallback !== 'undefined') {
    const id = requestIdleCallback(fn, { timeout });
    return () => cancelIdleCallback(id);
  }
  const t = setTimeout(fn, 1);
  return () => clearTimeout(t);
}
