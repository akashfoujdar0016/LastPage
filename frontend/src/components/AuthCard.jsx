'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { login, register } from '../lib/api';

export default function AuthCard({ onClose }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        const u = username.trim() || email.split('@')[0];
        await register(u, email, password, u);
      }
      router.push('/hub');
    } catch {
      // Offline fallback
      const fallbackUser = {
        _id: 'member-' + Date.now(),
        username: (username.trim() || email.split('@')[0] || 'member'),
        displayName: (username.trim() || email.split('@')[0] || 'Member').replace('.', ' '),
        email,
      };
      try {
        localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
        localStorage.setItem('accessToken', 'offline-token-' + Date.now());
      } catch {}
      router.push('/hub');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('accessToken');
    } catch {}
    setCurrentUser(null);
  };

  // Guard against hydration mismatch from browser autofill extensions (e.g. fdprocessedid)
  if (!mounted) {
    return (
      <div className="w-full bg-[#1C1C22] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-2xl min-h-[380px] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
      </div>
    );
  }

  // ── Logged In State ──
  if (currentUser) {
    return (
      <div className="w-full bg-[#1C1C22] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-6 sm:p-7 shadow-2xl text-ink transition-all">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-ember/15 border border-ember/30 text-ember flex items-center justify-center font-serif text-lg font-medium">
            {(currentUser.username || 'M').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">
              {currentUser.displayName || currentUser.username || 'Member'}
            </div>
            <div className="text-xs text-zinc-400 leading-tight mt-0.5">
              {currentUser.email || ''}
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed mb-5">
          You are signed in to your personal archive. Continue to your collection.
        </p>

        <button
          type="button"
          suppressHydrationWarning
          onClick={() => router.push('/hub')}
          className="w-full py-2.5 rounded-full bg-[#F4F4F5] text-[#121216] hover:bg-white font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-white/10 active:scale-[0.99]"
        >
          <span>Go to collection</span>
          <ArrowRight size={13} />
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={handleSignOut}
          className="mt-3 w-full text-center text-xs text-zinc-400 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  // ── Mode: Sign In (Focused & Frictionless) ──
  if (mode === 'login') {
    return (
      <div className="w-full bg-[#1C1C22] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-6 sm:p-7 shadow-2xl relative text-ink transition-all">
        {onClose && (
          <button
            type="button"
            suppressHydrationWarning
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        <div className="mb-5">
          <h3 className="font-serif text-2xl font-normal text-white leading-tight mb-1">
            Welcome back
          </h3>
          <p className="text-xs text-zinc-300 leading-tight">
            Sign in to your personal journal and saved works.
          </p>
        </div>

        {error && (
          <div className="mb-3.5 px-3 py-2 rounded-lg bg-ember/15 border border-ember/30 text-ember text-xs leading-tight">
            {error}
          </div>
        )}

        <form suppressHydrationWarning onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              suppressHydrationWarning
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#1A1A20] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/20 focus:bg-[#202028]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                suppressHydrationWarning
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1A1A20] border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/20 focus:bg-[#202028]"
              />
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className="mt-1 w-full py-2.5 rounded-full bg-[#F4F4F5] text-[#121216] hover:bg-white font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-white/10 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            <span>{loading ? 'Signing in…' : 'Sign in →'}</span>
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-white/10 text-center text-xs text-zinc-400">
          Need an account?{' '}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => { setMode('register'); setError(''); }}
            className="text-white font-medium hover:text-ember transition-colors ml-1"
          >
            Sign up
          </button>
        </div>
      </div>
    );
  }

  // ── Mode: Create Account (Streamlined & Pure) ──
  return (
    <div className="w-full bg-[#1C1C22] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-6 sm:p-7 shadow-2xl relative text-ink transition-all">
      {onClose && (
        <button
          type="button"
          suppressHydrationWarning
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      )}

      <div className="mb-5">
        <h3 className="font-serif text-2xl font-normal text-white leading-tight mb-1">
          Create an account
        </h3>
        <p className="text-xs text-zinc-300 leading-tight">
          Keep track of the films and books you love.
        </p>
      </div>

      {error && (
        <div className="mb-3.5 px-3 py-2 rounded-lg bg-ember/15 border border-ember/30 text-ember text-xs leading-tight">
          {error}
        </div>
      )}

      <form suppressHydrationWarning onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1 uppercase tracking-wider">
            Username
          </label>
          <input
            type="text"
            required
            suppressHydrationWarning
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="yourname"
            className="w-full bg-[#1A1A20] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/20 focus:bg-[#202028]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            required
            suppressHydrationWarning
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-[#1A1A20] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/20 focus:bg-[#202028]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-400 mb-1 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              suppressHydrationWarning
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1A1A20] border border-white/10 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/20 focus:bg-[#202028]"
            />
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          suppressHydrationWarning
          className="mt-1.5 w-full py-2.5 rounded-full bg-[#F4F4F5] text-[#121216] hover:bg-white font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-white/10 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          <span>{loading ? 'Creating account…' : 'Create account →'}</span>
        </button>
      </form>

      <div className="mt-4 pt-3.5 border-t border-white/10 text-center text-xs text-zinc-400">
        Already have an account?{' '}
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => { setMode('login'); setError(''); }}
          className="text-white font-medium hover:text-ember transition-colors ml-1"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
