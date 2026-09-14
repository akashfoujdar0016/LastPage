'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export default function Nav() {
  const pathname = usePathname();
  const [userInitial, setUserInitial] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const u = JSON.parse(stored);
        const name = u.displayName || u.username || u.email || '';
        setUserInitial(name.charAt(0).toUpperCase() || null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isCinema  = pathname.startsWith('/movies') || pathname === '/watchlist';
  const isLibrary = pathname.startsWith('/books')  || pathname === '/reading-list';
  const isSection = isCinema || isLibrary;

  if (pathname === '/' || pathname === '/hub') return null;

  const SwitchLink = ({ href, label }) => (
    <Link
      href={href}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        fontWeight: 400,
        color: 'var(--ink-muted)',
        transition: 'color 0.18s ease',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
    >
      {label} →
    </Link>
  );

  const ProfileBtn = () => (
    <Link
      href="/profile"
      title="Profile"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: userInitial ? 'var(--ember-dim)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${userInitial ? 'rgba(232,85,61,0.25)' : 'rgba(255,255,255,0.08)'}`,
        color: userInitial ? 'var(--ember)' : 'var(--ink-muted)',
        fontFamily: "'Inter', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
        transition: 'all 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--ember)';
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.borderColor = 'var(--ember)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = userInitial ? 'var(--ember-dim)' : 'rgba(255,255,255,0.05)';
        e.currentTarget.style.color = userInitial ? 'var(--ember)' : 'var(--ink-muted)';
        e.currentTarget.style.borderColor = userInitial ? 'rgba(232,85,61,0.25)' : 'rgba(255,255,255,0.08)';
      }}
    >
      {userInitial || <User size={13} strokeWidth={1.6} />}
    </Link>
  );

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(20px, 4vw, 56px)',
        background: scrolled
          ? 'rgba(18,18,22,0.92)'
          : 'rgba(18,18,22,0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'}`,
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* ── Logo ── */}
      <Link
        href="/"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: '0.06em',
          color: 'var(--ink)',
          transition: 'color 0.18s ease',
          lineHeight: 1,
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--ember)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink)')}
      >
        LastPage
      </Link>

      {/* ── Right: nav + profile ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
          {isCinema ? (
            <>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--ink)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Cinema
              </span>
              <span style={{ color: 'var(--border)', fontSize: 12 }}>·</span>
              <SwitchLink href="/books" label="Library" />
            </>
          ) : isLibrary ? (
            <>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--ink)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Library
              </span>
              <span style={{ color: 'var(--border)', fontSize: 12 }}>·</span>
              <SwitchLink href="/movies" label="Cinema" />
            </>
          ) : (
            <>
              {[{ href: '/movies', label: 'Cinema' }, { href: '/books', label: 'Library' }].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: 'var(--ink-muted)',
                    letterSpacing: '0.03em',
                    transition: 'color 0.18s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
                >
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {isSection && (
          <>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            <ProfileBtn />
          </>
        )}
      </div>
    </header>
  );
}
