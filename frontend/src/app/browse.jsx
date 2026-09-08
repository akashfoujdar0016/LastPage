'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, Heart, Star, Layers } from 'lucide-react';
import ContentCard from '../components/ContentCard';
import { api } from '../lib/api';

export default function Browse({ type, title }) {
  const isMovie = type === 'MOVIE';
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [localUpdate, setLocalUpdate] = useState(0);

  async function load(query = q) {
    setLoading(true);
    try {
      const qs = query.trim() ? `&q=${encodeURIComponent(query.trim())}` : '';
      const d = await api(`/content?type=${type}${qs}&limit=60`);
      setItems(d.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(''); }, [type]);

  const handleLikeToggle = (id, nextState) => {
    setItems(prev => prev.map(item => item._id === id ? { ...item, liked: nextState } : item));
    setLocalUpdate(v => v + 1);
  };

  const handleFavoriteToggle = (id, nextState) => {
    setItems(prev => prev.map(item => item._id === id ? { ...item, favorited: nextState } : item));
    setLocalUpdate(v => v + 1);
  };

  const isLiked = (item) => {
    if (item.liked) return true;
    try { return localStorage.getItem(`like_${item._id}`) === 'true'; } catch { return false; }
  };
  const isFavorited = (item) => {
    if (item.favorited) return true;
    try { return localStorage.getItem(`fav_${item._id}`) === 'true'; } catch { return false; }
  };

  const filtered = useMemo(() => {
    if (activeTab === 'LIKED')     return items.filter(isLiked);
    if (activeTab === 'FAVORITES') return items.filter(isFavorited);
    return items;
  }, [items, activeTab, localUpdate]);

  const likedCount = useMemo(() => items.filter(isLiked).length, [items, localUpdate]);
  const favCount   = useMemo(() => items.filter(isFavorited).length, [items, localUpdate]);

  /* ── Filter tab config ── */
  const tabs = [
    { id: 'ALL',       label: 'All',       icon: Layers, count: items.length },
    { id: 'LIKED',     label: 'Liked',     icon: Heart,  count: likedCount },
    { id: 'FAVORITES', label: 'Favorites', icon: Star,   count: favCount },
  ];

  return (
    <div style={{ background: '#FAF9F6', minHeight: 'calc(100vh - 60px)', paddingBottom: 100 }}>
      <div className="container" style={{ paddingTop: 48 }}>

        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="fade-up" style={{ marginBottom: 36 }}>

          {/* Back breadcrumb */}
          <Link href="/hub" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#A3A3A3',
            marginBottom: 24,
            transition: 'color 0.15s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#525252'}
          onMouseLeave={e => e.currentTarget.style.color = '#A3A3A3'}
          >
            ← Collections
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}>
            <div>
              {/* Mono collection label */}
              <div style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 10,
                fontWeight: 400,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#A3A3A3',
                marginBottom: 10,
              }}>
                {isMovie ? 'COLLECTION // 01 — Motion Pictures' : 'COLLECTION // 02 — The Library'}
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(36px, 4vw, 56px)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                lineHeight: 1.0,
                color: '#09090B',
              }}>
                {title}
              </h1>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, width: '100%', maxWidth: 340 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={13} style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  color: '#A3A3A3', pointerEvents: 'none',
                }} />
                <input
                  className="input"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') load(q); }}
                  placeholder={`Search ${title.toLowerCase()}…`}
                  style={{ paddingLeft: 36, paddingRight: q ? 34 : 14, fontSize: 13 }}
                />
                {q && (
                  <button
                    onClick={() => { setQ(''); load(''); }}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#A3A3A3', display: 'flex', alignItems: 'center', padding: 0,
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => load(q)}
                style={{ flexShrink: 0, borderRadius: 6, fontSize: 12.5, padding: '0 18px' }}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* ── Hairline divider ────────────────────────────────────── */}
        <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', marginBottom: 28 }} />

        {/* ── Filter Row ───────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 36,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {tabs.map(({ id, label, icon: Icon, count }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '7px 16px',
                    borderRadius: 6,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 400,
                    border: `1px solid ${active ? 'rgba(0,0,0,0.10)' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: active ? '#FBFBFA' : 'transparent',
                    color: active ? '#09090B' : '#A3A3A3',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    letterSpacing: '0.01em',
                  }}
                >
                  <Icon
                    size={12}
                    strokeWidth={id === 'ALL' ? 1.8 : 2}
                    color={id === 'LIKED' && active ? '#e05252'
                      : id === 'FAVORITES' && active ? '#C8963E'
                      : active ? '#525252' : '#D4D4D4'}
                    fill={id === 'LIKED' && active ? '#e05252'
                      : id === 'FAVORITES' && active ? '#C8963E'
                      : 'none'}
                  />
                  {label}
                  {count > 0 && (
                    <span style={{
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                      fontSize: 10,
                      padding: '1px 7px',
                      borderRadius: 20,
                      background: active ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.04)',
                      color: active ? '#525252' : '#A3A3A3',
                      letterSpacing: '0.04em',
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Result count */}
          <div style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#A3A3A3',
          }}>
            {filtered.length} {filtered.length === 1
              ? (isMovie ? 'film' : 'title')
              : (isMovie ? 'films' : 'titles')}
          </div>
        </div>

        {/* ── Content Grid ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{
            padding: '100px 0',
            textAlign: 'center',
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#D4D4D4',
          }}>
            Loading catalogue…
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div style={{
            padding: '80px 20px',
            textAlign: 'center',
          }}>
            {activeTab === 'LIKED' ? (
              <>
                <Heart size={28} color="#D4D4D4" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 500, color: '#09090B', marginBottom: 8 }}>
                  Nothing liked yet
                </p>
                <p style={{ fontSize: 13.5, color: '#737373', marginBottom: 24, lineHeight: 1.65 }}>
                  Tap the heart icon on any {isMovie ? 'film poster' : 'book cover'} to save it here.
                </p>
                <button onClick={() => setActiveTab('ALL')} className="btn btn-primary" style={{ fontSize: 12.5 }}>
                  Browse all {isMovie ? 'films' : 'books'}
                </button>
              </>
            ) : activeTab === 'FAVORITES' ? (
              <>
                <Star size={28} color="#D4D4D4" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 500, color: '#09090B', marginBottom: 8 }}>
                  No favorites yet
                </p>
                <p style={{ fontSize: 13.5, color: '#737373', marginBottom: 24, lineHeight: 1.65 }}>
                  Tap the star icon on any {isMovie ? 'film poster' : 'book cover'} to pin it to favorites.
                </p>
                <button onClick={() => setActiveTab('ALL')} className="btn btn-primary" style={{ fontSize: 12.5 }}>
                  Browse all {isMovie ? 'films' : 'books'}
                </button>
              </>
            ) : (
              <>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 500, color: '#09090B', marginBottom: 8 }}>
                  No titles found
                </p>
                <p style={{ fontSize: 13.5, color: '#737373', marginBottom: 24 }}>
                  Try another keyword or title.
                </p>
                <button onClick={() => { setQ(''); load(''); }} className="btn btn-outline" style={{ fontSize: 12.5 }}>
                  Reset search
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 18,
          }}>
            {filtered.map(item => (
              <ContentCard
                key={item._id}
                item={item}
                onLikeToggle={handleLikeToggle}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}

        {/* ── Switch section footer ─────────────────────────────────── */}
        <div style={{
          marginTop: 80,
          paddingTop: 28,
          borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#A3A3A3',
          }}>
            {isMovie ? 'Also in the journal' : 'Also in the journal'}
          </div>
          <Link
            href={isMovie ? '/books' : '/movies'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              fontWeight: 500,
              color: '#525252',
              textDecoration: 'none',
              letterSpacing: '0.02em',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#09090B'}
            onMouseLeave={e => e.currentTarget.style.color = '#525252'}
          >
            Switch to {isMovie ? 'Books' : 'Movies'} →
          </Link>
        </div>

      </div>
    </div>
  );
}
