'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, EyeOff,
  ArrowRight, ArrowUpRight,
  Film, BookOpen, Compass,
  Heart, Bookmark,
  Star,
} from 'lucide-react';
import { login, register, getCurrentUser, logout } from '../lib/api';

/* ─── Tiny stat badge used on left side ─── */
function StatBadge({ value, label }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <span style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 'clamp(26px, 3vw, 38px)',
        fontWeight: 600,
        color: '#FFFFFF',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>{value}</span>
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.38)',
      }}>{label}</span>
    </div>
  );
}

/* ─── Feature pill on left side ─── */
function FeaturePill({ icon: Icon, text }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 13px',
      borderRadius: 100,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <Icon size={11} color="rgba(255,255,255,0.40)" strokeWidth={1.8} />
      <span style={{
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 10,
        fontWeight: 400,
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>{text}</span>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [mode, setMode] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCurrentUser().then(u => { if (u) setCurrentUser(u); });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      setCurrentUser(res.user);
      router.push('/hub');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(regUsername, regEmail, regPassword, regDisplayName);
      setCurrentUser(res.user);
      router.push('/hub');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '3fr 2fr',
      minHeight: 'calc(100vh - 60px)',
    }}>

      {/* ══════════════════════════════════════════════════════════════
          LEFT — Cinematic Editorial Canvas (Dark)
         ══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#0A0A0A',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(48px, 6vh, 80px) clamp(44px, 5.5vw, 84px)',
      }}>

        {/* Subtle ambient orbs */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-12%',
          width: 580,
          height: 580,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(80, 80, 129, 0.10) 0%, rgba(39, 39, 87, 0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-8%',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15, 14, 71, 0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* ── TOP — Wordmark area */}
        <div className="fade-in" style={{ animationDelay: '0s' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 'clamp(52px, 7vh, 96px)',
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 22,
              fontWeight: 500,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}>
              Last<span style={{ color: 'rgba(255,255,255,0.4)' }}>Page</span>
            </span>
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#C8963E',
              flexShrink: 0,
              marginBottom: 1,
            }} />
          </div>
        </div>

        {/* ── MIDDLE — Main editorial copy */}
        <div className="slide-right" style={{ animationDelay: '0.08s', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 'clamp(18px, 2.4vh, 28px)',
          }}>
            <div style={{ width: 22, height: 1, background: 'rgba(255,255,255,0.16)' }} />
            <span style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 9,
              fontWeight: 400,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.28)',
            }}>
              Cultural Journal
            </span>
          </div>

          {/* Display headline */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(52px, 5.2vw, 80px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.01,
            color: '#FFFFFF',
            marginBottom: 'clamp(20px, 2.8vh, 32px)',
          }}>
            Every film.<br />
            Every book.<br />
            <span style={{ color: 'rgba(255,255,255,0.28)', fontStyle: 'italic', fontWeight: 400 }}>
              Curated together.
            </span>
          </h1>

          {/* Accent rule */}
          <div style={{
            width: 40,
            height: 1,
            background: '#C8963E',
            marginBottom: 'clamp(18px, 2.4vh, 28px)',
            opacity: 0.8,
          }} />

          {/* Descriptor */}
          <p style={{
            fontSize: 'clamp(13.5px, 1.1vw, 15px)',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.38)',
            fontWeight: 400,
            maxWidth: 400,
            marginBottom: 'clamp(28px, 4vh, 44px)',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.01em',
          }}>
            A private diary for the culturally obsessed. Log films and books, write reflective reviews, and build shelves that define your taste.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'clamp(36px, 5vh, 60px)' }}>
            <FeaturePill icon={Film} text="Cinema Diary" />
            <FeaturePill icon={BookOpen} text="Reading Library" />
            <FeaturePill icon={Heart} text="Wishlists" />
            <FeaturePill icon={Bookmark} text="Bespoke Shelves" />
          </div>

          {/* Quick navigation CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/hub"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 22px',
                borderRadius: 8,
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                background: '#FFFFFF',
                color: '#0A0A0A',
                border: 'none',
                letterSpacing: '0.01em',
                transition: 'all 0.22s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#F0EDE5';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Compass size={14} />
              Explore Collections
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/movies"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '10px 18px',
                borderRadius: 8,
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.10)',
                transition: 'all 0.22s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Film size={13} />
              Browse Films
            </Link>
            <Link
              href="/books"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '10px 18px',
                borderRadius: 8,
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.10)',
                transition: 'all 0.22s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.72)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <BookOpen size={13} />
              Browse Books
            </Link>
          </div>

        </div>

        {/* ── BOTTOM — Stats row */}
        <div className="fade-up" style={{
          animationDelay: '0.25s',
          marginTop: 'clamp(40px, 5.5vh, 64px)',
          paddingTop: 'clamp(22px, 3vh, 32px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: 'clamp(24px, 4.5vw, 52px)',
        }}>
          <StatBadge value="2.4K+" label="Films logged" />
          <StatBadge value="1.8K+" label="Books tracked" />
          <StatBadge value="340+" label="Curators" />
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════
          RIGHT — Warm Paper Gallery Auth Panel
         ══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: '#F7F4EE',
        borderLeft: '1px solid #DDD7CB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(40px, 5vh, 72px) clamp(32px, 4.5vw, 60px)',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Subtle paper grain texture overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          opacity: 0.6,
        }} />

        {currentUser ? (
          /* ── Signed-in welcome state ── */
          <div id="auth" style={{
            width: '100%',
            maxWidth: 380,
            textAlign: 'center',
          }} className="fade-up">
            {/* Avatar */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #272757 0%, #505081 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 28,
              fontWeight: 600,
              color: '#FFFFFF',
              margin: '0 auto 24px',
              boxShadow: '0 8px 28px rgba(39, 39, 87, 0.22)',
            }}>
              {(currentUser.displayName || currentUser.username || 'U')[0].toUpperCase()}
            </div>

            <p style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 9,
              fontWeight: 400,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#A3A3A3',
              marginBottom: 10,
            }}>Welcome back</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 32,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: '#1A1612',
              marginBottom: 6,
              lineHeight: 1.1,
            }}>
              {currentUser.displayName || currentUser.username}
            </h2>
            <p style={{
              fontSize: 14,
              color: '#6B6355',
              marginBottom: 32,
              lineHeight: 1.5,
            }}>
              Ready to log your latest experience?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/hub" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 9,
                background: '#1A1612',
                color: '#FFFFFF',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13.5,
                fontWeight: 500,
                border: 'none',
                letterSpacing: '0.01em',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#272757'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1A1612'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Compass size={15} />
                Open My Journal
                <ArrowRight size={14} />
              </Link>
              <button onClick={logout} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 24px',
                borderRadius: 9,
                background: 'transparent',
                color: '#9A9082',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                border: '1px solid #DDD7CB',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9C2B4'; e.currentTarget.style.color = '#1A1612'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDD7CB'; e.currentTarget.style.color = '#9A9082'; }}
              >
                Sign out
              </button>
            </div>
          </div>

        ) : (
          /* ── Auth Panel ── */
          <div id="auth" style={{ width: '100%', maxWidth: 380 }} className="fade-up">

            {/* Panel header */}
            <div style={{ marginBottom: 28, textAlign: 'left' }}>
              <p style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 9,
              fontWeight: 400,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#A3A3A3',
              marginBottom: 12,
            }}>
              {mode === 'login' ? 'Member Access' : 'New Member'}
            </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(26px, 2.4vw, 34px)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: '#1A1612',
                lineHeight: 1.05,
                marginBottom: 6,
              }}>
                {mode === 'login' ? 'Sign in to\nLastPage' : 'Join the\nJournal'}
              </h2>
              <p style={{ fontSize: 13.5, color: '#6B6355', lineHeight: 1.5 }}>
                {mode === 'login'
                  ? 'Access your shelves and cultural diary.'
                  : 'Start cataloguing films and books you love.'}
              </p>
            </div>

            {/* Tab toggle */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#EDE8DF',
              border: '1px solid #D6CFC2',
              borderRadius: 9,
              padding: 3,
              marginBottom: 24,
            }}>
              {[['login', 'Sign in'], ['register', 'Create account']].map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); }}
                  style={{
                    padding: '8px 0',
                    borderRadius: 7,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: mode === m ? 600 : 400,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: mode === m ? '#FFFFFF' : 'transparent',
                    color: mode === m ? '#1A1612' : '#9A9082',
                    boxShadow: mode === m ? '0 1px 5px rgba(0,0,0,0.08)' : 'none',
                    letterSpacing: '0.01em',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '9px 13px',
                borderRadius: 8,
                marginBottom: 16,
                background: 'rgba(192, 57, 43, 0.07)',
                border: '1px solid rgba(192, 57, 43, 0.18)',
                fontSize: 12.5,
                color: '#C0392B',
                fontFamily: "'Inter', sans-serif",
              }}>
                {error}
              </div>
            )}

            {/* ─── Login Form ─── */}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6 }} className="label">Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input"
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="label">Password</label>
                    <button
                      type="button"
                      onClick={() => { setLoginEmail('demo@example.com'); setLoginPassword('password123'); }}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        color: '#505081',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                      }}
                    >
                      Fill demo →
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input"
                      style={{ paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#9A9082',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 0',
                    marginTop: 4,
                    borderRadius: 9,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    fontWeight: 500,
                    background: '#1A1612',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.65 : 1,
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#272757'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1A1612'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                  {!loading && <ArrowRight size={14} />}
                </button>
              </form>
            ) : (
              /* ─── Register Form ─── */
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 5 }} className="label">Username</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="cinephile42"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 5 }} className="label">Display name <span style={{ color: '#B0A898', fontWeight: 400, fontSize: 11 }}>(optional)</span></label>
                  <input
                    type="text"
                    value={regDisplayName}
                    onChange={e => setRegDisplayName(e.target.value)}
                    placeholder="Elena Rostova"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 5 }} className="label">Email</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 5 }} className="label">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 0',
                    marginTop: 4,
                    borderRadius: 9,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    fontWeight: 500,
                    background: '#1A1612',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.65 : 1,
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#272757'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1A1612'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading ? 'Creating account…' : 'Create account'}
                  {!loading && <ArrowRight size={14} />}
                </button>
              </form>
            )}

            {/* Divider + trust note */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 22,
              marginBottom: 18,
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
              <span style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 9,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color: '#C4BFB8',
                whiteSpace: 'nowrap',
              }}>Curated for culture</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
            </div>

            {/* Micro feature hints */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
              {[
                { icon: Heart, text: 'Favourites' },
                { icon: Bookmark, text: 'Shelves' },
                { icon: Star, text: 'Reviews' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: '#EDE8DF',
                    border: '1px solid #D6CFC2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={14} color="#6B6355" />
                  </div>
                  <span style={{ fontSize: 10.5, color: '#B0A898', fontWeight: 500, letterSpacing: '0.01em' }}>{text}</span>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
