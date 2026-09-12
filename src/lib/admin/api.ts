export const ADMIN_API_BASE = 'https://nijikade-backend.vercel.app/api';

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem('jwt') || sessionStorage.getItem('jwt');
  } catch (_) {
    return null;
  }
}

export function storeAdminToken(token: string): void {
  try {
    localStorage.setItem('jwt', token);
    sessionStorage.setItem('jwt', token);
  } catch (_) {}
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem('jwt');
    sessionStorage.removeItem('jwt');
  } catch (_) {}
}

export interface AdminFetchOptions {
  auth?: boolean;
  redirectOnUnauthorized?: boolean;
}

export async function adminFetch(path: string, init: RequestInit = {}, options: AdminFetchOptions = {}): Promise<Response> {
  const { auth = true, redirectOnUnauthorized = true } = options;
  const token = getAdminToken();
  if (auth && !token) {
    if (redirectOnUnauthorized) window.location.replace('/admin/login/');
    throw new Error('Not logged in');
  }

  const separator = path.includes('?') ? '&' : '?';
  const url = `${ADMIN_API_BASE}${path}${auth && token ? `${separator}token=${encodeURIComponent(token)}` : ''}`;
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (auth && token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...init, headers });
  if (response.status === 401 && redirectOnUnauthorized) {
    clearAdminToken();
    window.location.replace('/admin/login/');
  }
  return response;
}

export async function adminJson<T>(path: string, init: RequestInit = {}, options: AdminFetchOptions = {}): Promise<T> {
  const response = await adminFetch(path, init, options);
  let data: any = null;
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  if (data?.token) storeAdminToken(data.token);
  return data as T;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function setAdminStatus(target: HTMLElement | null, message = '', state: 'loading' | 'success' | 'error' | '' = ''): void {
  if (!target) return;
  target.textContent = message;
  target.dataset.state = state;
  target.hidden = !message;
}
