import 'dotenv/config';

/** Single source of truth — mismatched fallbacks caused SSE/auth 401/500 issues. */
const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'anmelinc-secret-change-in-production';

export function getJwtSecret() {
  return JWT_SECRET;
}

export function warnIfDefaultJwtSecret() {
  if (!process.env.JWT_SECRET && !process.env.NEXTAUTH_SECRET) {
    console.warn(
      '[auth] JWT_SECRET is not set — using development default. Set JWT_SECRET in production.',
    );
  }
}
