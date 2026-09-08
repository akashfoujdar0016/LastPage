'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { api, getToken } from '../lib/api';

export default function ContentCard({ item, onLikeToggle, onFavoriteToggle }) {
  const isMovie = item.type === 'MOVIE';
  const href = `/${isMovie ? 'movies' : 'books'}/${item._id}`;
  const genre = item.genres?.[0] || '';
  const rating = Number(item.averageRating || 0);

  const [liked, setLiked] = useState(() => {
    if (typeof item.liked === 'boolean') return item.liked;
    try { return localStorage.getItem(`like_${item._id}`) === 'true'; } catch { return false; }
  });

  const [favorited, setFavorited] = useState(() => {
    if (typeof item.favorited === 'boolean') return item.favorited;
    try { return localStorage.getItem(`fav_${item._id}`) === 'true'; } catch { return false; }
  });

  const [cardHovered, setCardHovered] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    try { localStorage.setItem(`like_${item._id}`, String(next)); } catch {}
    if (onLikeToggle) onLikeToggle(item._id, next);
    try { if (getToken()) await api(`/content/${item._id}/like`, { method: 'POST' }); } catch {}
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorited;
    setFavorited(next);
    try { localStorage.setItem(`fav_${item._id}`, String(next)); } catch {}
    if (onFavoriteToggle) onFavoriteToggle(item._id, next);
    try { if (getToken()) await api(`/content/${item._id}/favorite`, { method: 'POST' }); } catch {}
  };

  return (
    <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setCardHovered(true)}
        onMouseLeave={() => setCardHovered(false)}
        style={{
          background: '#FBFBFA',
          border: `1px solid ${cardHovered ? 'rgba(0,0,0,0.09)' : 'rgba(0,0,0,0.06)'}`,
          borderRadius: 9,
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: cardHovered ? 'translateY(-3px)' : 'none',
          boxShadow: cardHovered
            ? '0 12px 36px rgba(0,0,0,0.09), 0 3px 8px rgba(0,0,0,0.04)'
            : '0 1px 4px rgba(0,0,0,0.04)',
          position: 'relative',
        }}
      >
        {/* Poster area — 2:3 aspect ratio */}
        <div style={{
          aspectRatio: '2/3',
          background: '#18181B',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
                transform: cardHovered ? 'scale(1.03)' : 'scale(1)',
              }}
            />
          ) : (
            /* Typographic placeholder on matte dark */
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '20px 14px',
              gap: 10,
            }}>
              {/* Ambient glow */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 30%, rgba(80,80,129,0.10) 0%, transparent 65%)',
                pointerEvents: 'none',
              }} />

              {/* Mono label */}
              <div style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 8,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.18)',
                textAlign: 'center',
              }}>
                {isMovie ? 'Film' : 'Book'}
              </div>

              {/* Title */}
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 14,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.65)',
                textAlign: 'center',
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
              }}>
                {item.title}
              </div>

              {/* Bottom rule */}
              {item.year && (
                <div style={{
                  fontFamily: "'DM Mono', ui-monospace, monospace",
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.22)',
                  letterSpacing: '0.12em',
                }}>
                  {item.year}
                </div>
              )}
            </div>
          )}

          {/* ── Action buttons overlay — top-left, minimal ── */}
          <div style={{
            position: 'absolute', top: 8, left: 8,
            display: 'flex', alignItems: 'center', gap: 5,
            zIndex: 10,
            opacity: cardHovered ? 1 : 0.72,
            transition: 'opacity 0.2s ease',
          }}>
            {/* Like button */}
            <button
              type="button"
              onClick={handleLike}
              title={liked ? 'Unlike' : 'Like'}
              style={{
                width: 28, height: 28,
                borderRadius: 6,
                background: liked
                  ? 'rgba(224, 82, 82, 0.90)'
                  : 'rgba(9, 9, 11, 0.55)',
                border: `1px solid ${liked ? 'rgba(224,82,82,0.4)' : 'rgba(255,255,255,0.10)'}`,
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!liked) e.currentTarget.style.background = 'rgba(9,9,11,0.75)'; }}
              onMouseLeave={e => { if (!liked) e.currentTarget.style.background = 'rgba(9,9,11,0.55)'; }}
            >
              <Heart
                size={12}
                fill={liked ? '#FFFFFF' : 'none'}
                strokeWidth={liked ? 0 : 2}
                color="#FFFFFF"
              />
            </button>

            {/* Favorite button */}
            <button
              type="button"
              onClick={handleFavorite}
              title={favorited ? 'Remove from favorites' : 'Favorite'}
              style={{
                width: 28, height: 28,
                borderRadius: 6,
                background: favorited
                  ? 'rgba(200, 150, 62, 0.90)'
                  : 'rgba(9, 9, 11, 0.55)',
                border: `1px solid ${favorited ? 'rgba(200,150,62,0.4)' : 'rgba(255,255,255,0.10)'}`,
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!favorited) e.currentTarget.style.background = 'rgba(9,9,11,0.75)'; }}
              onMouseLeave={e => { if (!favorited) e.currentTarget.style.background = 'rgba(9,9,11,0.55)'; }}
            >
              <Star
                size={12}
                fill={favorited ? '#FFFFFF' : 'none'}
                strokeWidth={favorited ? 0 : 2}
                color="#FFFFFF"
              />
            </button>
          </div>

          {/* Year — bottom right, mono */}
          {item.year && (
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 9,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.10em',
            }}>
              {item.year}
            </div>
          )}
        </div>

        {/* ── Info strip ── */}
        <div style={{ padding: '11px 13px 13px' }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: '-0.015em',
            color: '#09090B',
            lineHeight: 1.35,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            marginBottom: 7,
          }}>
            {item.title}
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {genre ? (
              <span style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 9,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: '#A3A3A3',
              }}>
                {genre}
              </span>
            ) : <span />}

            {rating > 0 ? (
              <span style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 10,
                color: '#C8963E',
                letterSpacing: '0.04em',
                fontWeight: 500,
              }}>
                ★ {rating.toFixed(1)}
              </span>
            ) : (
              <span style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                fontSize: 9,
                color: '#D4D4D4',
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
              }}>
                Curated
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
