'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Film, BookOpen, ArrowRight, Heart, Bookmark, Star, Layers } from 'lucide-react';
import { api } from '../../lib/api';

/* ─────────────────────────────────────────────────────────────────
   Asymmetric Section Card — poster-left / copy-right
   ───────────────────────────────────────────────────────────────── */
function SectionCard({ href, index, type, title, description, featuredTitle, featuredYear, featuredRating }) {
  const [hovered, setHovered] = useState(false);
  const isMovie = type === 'MOVIE';

  return (
    <Link
      href={href}
      style={{ display: 'block', textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        background: hovered ? '#F4F2EE' : '#FAF9F6',
        border: `1px solid ${hovered ? 'rgba(0,0,0,0.09)' : 'rgba(0,0,0,0.06)'}`,
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: hovered
          ? '0 16px 48px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)'
          : '0 2px 12px rgba(0,0,0,0.04)',
      }}>

        {/* LEFT — Tall matte poster frame */}
        <div style={{
          background: '#18181B',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          minHeight: 280,
          overflow: 'hidden',
        }}>
          {/* Subtle ambient glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: isMovie
              ? 'radial-gradient(ellipse at 50% 0%, rgba(80,80,129,0.18) 0%, transparent 65%)'
              : 'radial-gradient(ellipse at 50% 0%, rgba(200,150,62,0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          {/* Collection index — mono tracked */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 9,
            fontWeight: 400,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.20)',
          }}>
            {isMovie ? 'COLLECTION // 01' : 'COLLECTION // 02'}
          </div>

          {/* Minimalist icon */}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            background: 'rgba(255,255,255,0.04)',
          }}>
            {isMovie
              ? <Film size={22} color="rgba(255,255,255,0.55)" strokeWidth={1.4} />
              : <BookOpen size={22} color="rgba(255,255,255,0.55)" strokeWidth={1.4} />
            }
          </div>

          {/* Monospace type label */}
          <div style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            {isMovie ? 'Motion\nPictures' : 'The\nLibrary'}
          </div>

          {/* Bottom rule */}
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: 24,
            right: 24,
            height: 1,
            background: 'rgba(255,255,255,0.06)',
          }} />

          {/* Hover indicator arrow */}
          <div style={{
            position: 'absolute',
            bottom: 14,
            right: 18,
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 13,
            color: hovered ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.18)',
            transition: 'all 0.25s ease',
            transform: hovered ? 'translateX(3px)' : 'translateX(0)',
          }}>
            →
          </div>
        </div>

        {/* RIGHT — Editorial copy stack */}
        <div style={{
          padding: '32px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            {/* Mono tag */}
            <div style={{
              fontFamily: "'DM Mono', ui-monospace, monospace",
              fontSize: 9,
              fontWeight: 400,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#A3A3A3',
              marginBottom: 14,
            }}>
              {isMovie ? 'COLLECTION // 01' : 'COLLECTION // 02'}
            </div>

            {/* Section title */}
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(36px, 3.4vw, 50px)',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              color: '#09090B',
              marginBottom: 16,
            }}>
              {title}
            </h2>

            {/* Thin amber accent */}
            <div style={{
              width: 28,
              height: 1,
              background: '#C8963E',
              marginBottom: 18,
              opacity: 0.7,
            }} />

            {/* Description */}
            <p style={{
              fontSize: 14,
              lineHeight: 1.72,
              color: '#737373',
              fontWeight: 400,
              maxWidth: 360,
              marginBottom: 24,
            }}>
              {description}
            </p>

            {/* Featured item preview — if available */}
            {featuredTitle && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: 7,
                marginBottom: 28,
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#C8963E',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#09090B',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '-0.01em',
                  }}>
                    {featuredTitle}
                  </div>
                  <div style={{
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                    fontSize: 10,
                    color: '#A3A3A3',
                    letterSpacing: '0.06em',
                    marginTop: 2,
                  }}>
                    {featuredYear || '—'}{featuredRating > 0 ? ` · ${Number(featuredRating).toFixed(1)}` : ''}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Flat CTA — text line with arrow, no button box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingTop: featuredTitle ? 0 : 20,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: hovered ? '#09090B' : '#525252',
              fontSize: 12.5,
              fontWeight: 500,
              letterSpacing: '0.02em',
              transition: 'all 0.2s ease',
            }}>
              <span>Enter {isMovie ? 'Cinema' : 'Literary'} Collection</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: 5,
                background: hovered ? '#09090B' : 'rgba(0,0,0,0.06)',
                color: hovered ? '#FFFFFF' : '#525252',
                fontSize: 13,
                transition: 'all 0.2s ease',
                transform: hovered ? 'translateX(3px)' : 'translateX(0)',
              }}>→</span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Bottom feature strip item
   ───────────────────────────────────────────────────────────────── */
function FeatureItem({ icon: Icon, label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <Icon size={12} color="#A3A3A3" strokeWidth={1.8} />
      <span style={{
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#A3A3A3',
        fontWeight: 400,
      }}>
        {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HUB PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function HubPage() {
  const [sample, setSample] = useState({ movie: null, book: null });

  useEffect(() => {
    api('/content?type=MOVIE&limit=1').then(d => {
      if (d.items?.[0]) setSample(s => ({ ...s, movie: d.items[0] }));
    }).catch(() => {});
    api('/content?type=BOOK&limit=1').then(d => {
      if (d.items?.[0]) setSample(s => ({ ...s, book: d.items[0] }));
    }).catch(() => {});
  }, []);

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      background: '#FAF9F6',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 'clamp(40px, 6vh, 72px) clamp(24px, 5vw, 80px)',
    }}>

      <div style={{
        maxWidth: 960,
        width: '100%',
        margin: '0 auto',
      }}>

        {/* ── Editorial Header ─────────────────────────────────────── */}
        <div className="fade-up" style={{ marginBottom: 'clamp(36px, 5vh, 56px)' }}>

          {/* Mono label */}
          <div style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#A3A3A3',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ display: 'inline-block', width: 20, height: 1, background: '#D4D4D4', verticalAlign: 'middle' }} />
            Explore & Catalogue
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(40px, 4.5vw, 60px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.02,
            color: '#09090B',
            marginBottom: 14,
          }}>
            Choose your section.
          </h1>

          <p style={{
            fontSize: 14,
            lineHeight: 1.72,
            color: '#737373',
            maxWidth: 480,
            fontWeight: 400,
          }}>
            Select a domain to log entries, discover curated recommendations, or cultivate your personal shelves.
          </p>
        </div>

        {/* ── Twin Asymmetric Cards ────────────────────────────────── */}
        <div className="fade-up" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          animationDelay: '0.08s',
        }}>
          <SectionCard
            href="/movies"
            index={1}
            type="MOVIE"
            title="Movies"
            description="Feature films, art-house cinema, retrospectives and documentaries. Log what you've screened and write reflective reviews."
            featuredTitle={sample.movie?.title}
            featuredYear={sample.movie?.year}
            featuredRating={sample.movie?.averageRating}
          />

          <SectionCard
            href="/books"
            index={2}
            type="BOOK"
            title="Books"
            description="Novels, philosophical works, essays, poetry and anthologies. Track reading milestones and curate your personal canon."
            featuredTitle={sample.book?.title}
            featuredYear={sample.book?.year}
            featuredRating={sample.book?.averageRating}
          />
        </div>

        {/* ── Bottom Feature Strip ─────────────────────────────────── */}
        <div className="fade-up" style={{
          marginTop: 'clamp(32px, 4.5vh, 52px)',
          paddingTop: 'clamp(20px, 3vh, 28px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(20px, 4vw, 44px)',
          flexWrap: 'wrap',
          animationDelay: '0.16s',
        }}>
          <FeatureItem icon={Star} label="Community Ratings" />
          <FeatureItem icon={Bookmark} label="Watchlists" />
          <FeatureItem icon={Heart} label="Curated Tastes" />
          <FeatureItem icon={Layers} label="Cross-Domain Diary" />
        </div>

      </div>
    </div>
  );
}
