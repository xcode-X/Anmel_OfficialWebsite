const isProd = process.env.NODE_ENV === 'production';

export function logError(scope, err, extra = {}) {
  const message = err?.message || String(err);
  const payload = {
    scope,
    message,
    name: err?.name,
    code: err?.code,
    ...extra,
  };
  if (!isProd && err?.stack) {
    console.error(`[${scope}]`, message, '\n', err.stack, extra && Object.keys(extra).length ? extra : '');
  } else {
    console.error(`[${scope}]`, payload);
  }
}

export function logWarn(scope, message, extra = {}) {
  console.warn(`[${scope}]`, message, Object.keys(extra).length ? extra : '');
}
