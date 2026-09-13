function tokenTimestamp(token) {
  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) return null;
    const normalized = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.iat === 'number' ? payload.iat : typeof payload.exp === 'number' ? payload.exp : null;
  } catch (_) { return null; }
}

function readToken() {
  try {
    const sessionToken = sessionStorage.getItem('jwt');
    const localToken = localStorage.getItem('jwt');
    if (!sessionToken) return localToken;
    if (!localToken || sessionToken === localToken) return sessionToken;
    const sessionTime = tokenTimestamp(sessionToken);
    const localTime = tokenTimestamp(localToken);
    return sessionTime !== null && localTime !== null && localTime > sessionTime ? localToken : sessionToken;
  }
  catch (_) { return null; }
}

function clearToken() {
  try {
    localStorage.removeItem('jwt');
    sessionStorage.removeItem('jwt');
  } catch (_) {}
}

function loginUrl() {
  const current = `${location.pathname}${location.search}`;
  return `/admin/login/?next=${encodeURIComponent(current)}`;
}

function guard() {
  const protectedPage = document.body?.dataset.adminProtected === 'true';
  if (protectedPage && !readToken()) {
    location.replace(loginUrl());
    return;
  }
  document.querySelectorAll('[data-admin-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      clearToken();
      location.replace('/admin/login/');
    });
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', guard, { once: true });
else guard();

window.ElythriaAdminAuth = { readToken, clearToken };
