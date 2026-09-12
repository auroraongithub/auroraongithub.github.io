function readToken() {
  try { return localStorage.getItem('jwt') || sessionStorage.getItem('jwt'); }
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
