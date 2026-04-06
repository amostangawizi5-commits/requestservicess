const AUTH_COOKIE_NAME = 'portfolio_token';

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((cookies, entry) => {
      const separatorIndex = entry.indexOf('=');

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();

      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, bearerToken] = authHeader.split(' ');

  if (scheme === 'Bearer' && bearerToken) {
    return bearerToken;
  }

  const cookies = parseCookies(req.headers.cookie || '');
  return cookies[AUTH_COOKIE_NAME] || null;
};

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
};

module.exports = {
  AUTH_COOKIE_NAME,
  getTokenFromRequest,
  setAuthCookie,
  clearAuthCookie,
};
