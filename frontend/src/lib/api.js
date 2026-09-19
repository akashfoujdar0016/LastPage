function getBase() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:4000/api';
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export async function api(path, opts = {}) {
  const token = getToken();
  const headers = new Headers(opts.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const base = getBase();

  // Auto-stringify body if it's a plain object
  const body = opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)
    ? JSON.stringify(opts.body)
    : opts.body;

  const res = await fetch(`${base}${path}`, { ...opts, body, headers, cache: 'no-store' });

  // If 401 occurs due to an expired/stale token, clear it and notify
  if (res.status === 401 && token) {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      // Trigger Nav re-render
      window.dispatchEvent(new Event('storage'));
    } catch {}
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const login = async (email, password) => {
  const x = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (x.accessToken) {
    localStorage.setItem('accessToken', x.accessToken);
    if (x.user) localStorage.setItem('currentUser', JSON.stringify(x.user));
  }
  return x;
};

export const register = async (username, email, password, displayName) => {
  const x = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
      displayName: displayName || username,
    }),
  });
  if (x.accessToken) {
    localStorage.setItem('accessToken', x.accessToken);
    if (x.user) localStorage.setItem('currentUser', JSON.stringify(x.user));
  }
  return x;
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const data = await api('/auth/me');
    if (data.user) {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return data.user;
    }
  } catch (err) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    return null;
  }
  return null;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  }
};
