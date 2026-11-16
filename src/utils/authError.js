/**
 * utils/authError.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized parser & formatter for authentication/OAuth errors arriving from
 * URL query parameters, hash fragments, or router navigation state.
 *
 * Handles:
 * - /login?error=...
 * - /login/?error=...
 * - /login/#error=...
 * - /oauth/callback?error=...
 * - /oauth/callback/?error=...
 * - /login/oauth/callback/?error=...
 * - /register?error=...
 * - /register/?error=...
 */

export function formatAuthErrorMessage(msg) {
  if (!msg) return '';
  let decoded = String(msg).trim();
  try {
    decoded = decodeURIComponent(decoded).trim();
  } catch {}

  const m = decoded.toLowerCase();
  if (
    m.includes('local account') ||
    m.includes('signed up with local') ||
    m.includes('use your local') ||
    m.includes('signed up with a local account')
  ) {
    return "Looks like you're signed up with a local account. Please use your email/mobile and password to login.";
  }
  return decoded;
}

export function extractAuthError(loc) {
  try {
    const search = loc?.search || (typeof window !== 'undefined' ? window.location.search : '');
    const hash   = loc?.hash   || (typeof window !== 'undefined' ? window.location.hash : '');

    // 1. Check search query params
    if (search) {
      const sParams = new URLSearchParams(search);
      const sErr = sParams.get('error') || sParams.get('error_description') || sParams.get('errorMessage') || sParams.get('err');
      if (sErr) return formatAuthErrorMessage(sErr);
    }

    // 2. Check hash fragments (OAuth2 implicit/fragment responses e.g. #error=... or #/?error=...)
    if (hash) {
      const cleanHash = hash.replace(/^#\/?/, '');
      const hQuery = cleanHash.includes('?') ? cleanHash.split('?')[1] : cleanHash;
      const hParams = new URLSearchParams(hQuery);
      const hErr = hParams.get('error') || hParams.get('error_description') || hParams.get('errorMessage') || hParams.get('err');
      if (hErr) return formatAuthErrorMessage(hErr);
    }

    // 3. Check react-router state
    if (loc?.state?.error) {
      return formatAuthErrorMessage(loc.state.error);
    }
  } catch {}
  return '';
}

export function hasAuthErrorInUrl(loc) {
  try {
    const search = loc?.search || (typeof window !== 'undefined' ? window.location.search : '');
    const hash   = loc?.hash   || (typeof window !== 'undefined' ? window.location.hash : '');
    if (search && (search.includes('error=') || search.includes('errorMessage=') || search.includes('error_description='))) {
      return true;
    }
    if (hash && (hash.includes('error=') || hash.includes('errorMessage=') || hash.includes('error_description='))) {
      return true;
    }
    const err = extractAuthError(loc);
    return Boolean(err);
  } catch {
    return false;
  }
}
