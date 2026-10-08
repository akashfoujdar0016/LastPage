'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { login, register, forgotPassword, resetPassword } from '../lib/api';

export default function AuthCard({ onClose }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('register'); // 'register' | 'login' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Forgot Password step 2 state
  const [resetStep, setResetStep] = useState(1); // 1: request code, 2: enter code & new pass
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

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
    setSuccessMsg('');

    if (mode === 'register' && username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
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
      window.dispatchEvent(new Event('storage'));
      router.push('/hub');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccessMsg('Reset code generated! Please enter your code and new password below.');
      if (res?.resetToken) {
        setResetCode(res.resetToken);
      }
      setResetStep(2);
    } catch (err) {
      setError(err.message || 'Failed to request reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!resetCode.trim()) {
      setError('Please enter your 6-digit reset code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email, resetCode, newPassword);
      setSuccessMsg(res?.message || 'Password updated successfully! You can now sign in.');
      setPassword(newPassword);
      setTimeout(() => {
        setMode('login');
        setResetStep(1);
        setError('');
      }, 1400);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your code.');
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

  // Guard against hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full bg-[#121212] border border-[#212121] rounded-2xl p-6 sm:p-7 shadow-2xl min-h-[380px] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
      </div>
    );
  }

  // ── Logged In State ──
  if (currentUser) {
    return (
      <div className="w-full bg-[#111111] border border-[#222222] hover:border-white/[0.16] rounded-2xl p-6 sm:p-7 shadow-2xl text-[#E0E0E0] transition-all duration-200">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center font-serif text-lg font-medium">
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
          className="w-full py-2.5 rounded-full bg-white text-[#000000] hover:bg-[#E0E0E0] font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99]"
        >
          <span>Go to collection</span>
          <ArrowRight size={13} />
        </button>

        <button
          type="button"
          suppressHydrationWarning
          onClick={handleSignOut}
          className="mt-3 w-full text-center text-xs text-[#555555] hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  // ── Mode: Forgot Password ──
  if (mode === 'forgot') {
    return (
      <div className="w-full bg-[#111111] border border-[#222222] hover:border-white/[0.16] rounded-2xl p-6 sm:p-7 shadow-2xl relative text-[#E0E0E0] transition-all duration-200">
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
          <h3 className="font-serif text-2xl font-normal text-white leading-tight mb-1 flex items-center gap-2">
            <KeyRound size={20} className="text-amber-400" />
            <span>Reset Password</span>
          </h3>
          <p className="text-xs text-zinc-300 leading-tight">
            {resetStep === 1
              ? 'Enter your account email to receive a password reset code.'
              : 'Enter your 6-digit reset code and choose a new password.'}
          </p>
        </div>

        {error && (
          <div className="mb-3.5 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs leading-tight">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs leading-tight flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {resetStep === 1 ? (
          <form suppressHydrationWarning onSubmit={handleRequestResetCode} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1 uppercase tracking-wider">
                Account Email
              </label>
              <input
                type="email"
                required
                suppressHydrationWarning
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555555] outline-none transition-all duration-200 focus:border-white/30 focus:ring-1 focus:ring-white/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="btn-highlight mt-1 w-full py-2.5 rounded-full font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>{loading ? 'Sending code…' : 'Send Reset Code →'}</span>
            </button>
          </form>
        ) : (
          <form suppressHydrationWarning onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1 uppercase tracking-wider">
                Reset Code (6 Digits)
              </label>
              <input
                type="text"
                required
                suppressHydrationWarning
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="e.g. 492810"
                className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-[#555555] outline-none transition-all duration-200 focus:border-white/30 focus:ring-1 focus:ring-white/15"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1 uppercase tracking-wider">
                New Password (Min 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  suppressHydrationWarning
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-[#555555] outline-none transition-all duration-200 focus:border-white/30 focus:ring-1 focus:ring-white/15"
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
              className="btn-highlight mt-1 w-full py-2.5 rounded-full font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              <span>{loading ? 'Updating password…' : 'Update Password →'}</span>
            </button>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-[#222222] text-center text-xs text-[#888888]">
          Remember your password?{' '}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className="text-white font-medium hover:text-[#E0E0E0] transition-colors ml-1"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Mode: Sign In ──
  if (mode === 'login') {
    return (
      <div className="w-full bg-[#111111] border border-[#222222] hover:border-white/[0.16] rounded-2xl p-6 sm:p-7 shadow-2xl relative text-[#E0E0E0] transition-all duration-200">
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
          <div className="mb-3.5 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs leading-tight">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs leading-tight flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
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
              className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555555] outline-none transition-all duration-200 focus:border-white/30 focus:ring-1 focus:ring-white/15"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); setResetStep(1); }}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                suppressHydrationWarning
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-[#555555] outline-none transition-all duration-200 focus:border-white/30 focus:ring-1 focus:ring-white/15"
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
            className="btn-highlight mt-1 w-full py-2.5 rounded-full font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            <span>{loading ? 'Signing in…' : 'Sign in →'}</span>
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#222222] text-center text-xs text-[#888888]">
          Need an account?{' '}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            className="text-white font-medium hover:text-[#E0E0E0] transition-colors ml-1"
          >
            Sign up
          </button>
        </div>
      </div>
    );
  }

  // ── Mode: Create Account ──
  return (
    <div className="w-full bg-[#111111] border border-[#222222] hover:border-white/[0.16] rounded-2xl p-6 sm:p-7 shadow-2xl relative text-[#E0E0E0] transition-all duration-200">
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
        <p className="text-xs text-zinc-400 leading-tight">
          Keep track of the films and books you love.
        </p>
      </div>

      {error && (
        <div className="mb-3.5 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs leading-tight">
          {error}
        </div>
      )}

      <form suppressHydrationWarning onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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
            className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555555] outline-none transition-all duration-200 focus:border-white/30 focus:ring-1 focus:ring-white/15"
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
            className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555555] outline-none transition-all duration-200 focus:border-white/30 focus:ring-1 focus:ring-white/15"
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
              className="w-full bg-[#0A0A0A] border border-[#222222] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-[#555555] outline-none transition-all duration-200 focus:border-white/30 focus:ring-1 focus:ring-white/15"
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
          className="btn-highlight mt-1 w-full py-2.5 rounded-full font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          <span>{loading ? 'Creating account…' : 'Create account →'}</span>
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-[#222222] text-center text-xs text-[#888888]">
        Already have an account?{' '}
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => { setMode('login'); setError(''); }}
          className="text-white font-medium hover:text-[#E0E0E0] transition-colors ml-1"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
