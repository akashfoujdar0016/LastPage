function getBase() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:4000/api';
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  if (token) return token;
  const user = localStorage.getItem('currentUser');
  if (user) {
    const fallback = 'offline-token-session';
    try { localStorage.setItem('accessToken', fallback); } catch {}
    return fallback;
  }
  return null;
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

  // If 401 occurs due to an expired/stale token, attempt silent fallback before clearing
  if (res.status === 401 && token) {
    try {
      if (!token.startsWith('offline-token-')) {
        localStorage.setItem('accessToken', 'offline-token-session');
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        window.dispatchEvent(new Event('storage'));
      }
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

export const forgotPassword = async (email) => {
  return await api('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (email, token, newPassword) => {
  return await api('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, newPassword }),
  });
};
