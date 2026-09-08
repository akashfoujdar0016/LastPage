const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
  const res = await fetch(`${base}${path}`, { ...opts, headers, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
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
