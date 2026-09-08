'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Film, BookOpen, LayoutGrid } from 'lucide-react';
import { getCurrentUser, logout } from '../lib/api';

export default function Nav() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    try {
      const cached = localStorage.getItem('currentUser');
      if (cached) setUser(JSON.parse(cached));
    } catch {}
    getCurrentUser().then(u => setUser(u || null));

    const sync = () => {
      try {
        const c = localStorage.getItem('currentUser');
        setUser(c ? JSON.parse(c) : null);
      } catch {}
    };
    window.addEventListener('storage', sync);

    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  const links = [
    { href: '/hub',    label: 'Sections', Icon: LayoutGrid },
    { href: '/movies', label: 'Movies',   Icon: Film },
    { href: '/books',  label: 'Books',    Icon: BookOpen },
  ];

  /* On the homepage, the nav sits on the dark left panel — use transparent/dark style */
  const navBg = isHome
    ? scrolled
      ? 'rgba(9, 9, 11, 0.97)'
      : 'rgba(9, 9, 11, 0.82)'
    : scrolled
      ? 'rgba(250, 249, 246, 0.97)'
      : 'rgba(250, 249, 246, 0.90)';

  const navBorderColor = isHome
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(0,0,0,0.06)';

  const wordmarkColor = isHome ? '#FFFFFF' : '#09090B';
  const wordmarkDotColor = '#C8963E';
  const wordmarkMutedColor = isHome ? 'rgba(255,255,255,0.28)' : 'rgba(9,9,11,0.28)';
  const linkColor = isHome ? 'rgba(255,255,255,0.42)' : '#A3A3A3';
  const linkActiveColor = isHome ? '#FFFFFF' : '#09090B';
  const linkActiveBg = isHome ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
  const linkActiveBorder = isHome ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: navBg,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: `1px solid ${navBorderColor}`,
      boxShadow: scrolled
        ? isHome
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 2px 16px rgba(0,0,0,0.06)'
        : 'none',
      transition: 'all 0.25s ease',
    }}>
      <div className="container" style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* LEFT — Wordmark */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          textDecoration: 'none',
        }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: wordmarkColor,
            lineHeight: 1,
          }}>
            Last<span style={{ color: wordmarkMutedColor }}>Page</span>
          </span>
          <span style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: wordmarkDotColor,
            flexShrink: 0,
          }} />
        </Link>

        {/* CENTER — Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {links.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 6,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  fontWeight: active ? 500 : 400,
                  color: active ? linkActiveColor : linkColor,
                  background: active ? linkActiveBg : 'transparent',
                  border: `1px solid ${active ? linkActiveBorder : 'transparent'}`,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = linkActiveColor;
                    e.currentTarget.style.background = linkActiveBg;
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = linkColor;
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={13} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT — User state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Avatar + name chip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '4px 11px 4px 5px',
                background: isHome ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isHome ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius: 7,
              }}>
                <span style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #272757, #505081)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}>
                  {(user.displayName || user.username || 'U')[0].toUpperCase()}
                </span>
                <span style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: isHome ? 'rgba(255,255,255,0.80)' : '#09090B',
                  maxWidth: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user.displayName || user.username}
                </span>
              </div>

              {/* Sign out icon button */}
              <button
                onClick={logout}
                title="Sign out"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 7,
                  background: 'transparent',
                  border: `1px solid ${isHome ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                  color: isHome ? 'rgba(255,255,255,0.35)' : '#A3A3A3',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = isHome ? '#FFFFFF' : '#09090B';
                  e.currentTarget.style.background = isHome ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = isHome ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.09)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = isHome ? 'rgba(255,255,255,0.35)' : '#A3A3A3';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = isHome ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
                }}
              >
                <LogOut size={13} strokeWidth={1.8} />
              </button>
            </div>
          ) : (
            <a
              href="#auth"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 17px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                color: isHome ? '#09090B' : '#FFFFFF',
                background: isHome ? '#FFFFFF' : '#09090B',
                border: 'none',
                transition: 'all 0.2s ease',
                letterSpacing: '0.01em',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isHome ? '#F4F2EE' : '#272757';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isHome ? '#FFFFFF' : '#09090B';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign in
            </a>
          )}
        </div>

      </div>
    </header>
  );
}
