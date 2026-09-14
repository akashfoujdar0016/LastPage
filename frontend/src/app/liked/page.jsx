'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ContentCard from '../../components/ContentCard';
import { getUserLiked } from '../../lib/activityStore';

export default function LikedPage() {
  const [activeCategory, setActiveCategory] = useState('MOVIE'); // 'MOVIE' or 'BOOK'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setRefreshTrigger(p => p + 1);
    window.addEventListener('activityUpdated', handleUpdate);
    return () => window.removeEventListener('activityUpdated', handleUpdate);
  }, []);

  const movieLiked = getUserLiked('MOVIE');
  const bookLiked = getUserLiked('BOOK');

  const displayed = activeCategory === 'MOVIE' ? movieLiked : bookLiked;

  return (
    <div className="min-h-[calc(100vh-52px)] bg-page text-ink pb-24 selection:bg-ember/30 selection:text-ink relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed top-12 left-1/4 w-96 h-96 rounded-full bg-radial from-ember/[0.06] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Page Header ── */}
        <div className="pt-10 pb-6 border-b border-border mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ember mb-2">
            YOUR COLLECTION
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-ink tracking-tight mb-6">
            Liked
          </h1>

          {/* Category Tabs: Strictly separate Films vs Books */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveCategory('MOVIE')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                activeCategory === 'MOVIE'
                  ? 'bg-white/10 text-ink border border-white/20 shadow-sm'
                  : 'text-ink-muted hover:text-ink hover:bg-white/5 border border-transparent'
              }`}
            >
              Liked films ({movieLiked.length})
            </button>

            <button
              onClick={() => setActiveCategory('BOOK')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                activeCategory === 'BOOK'
                  ? 'bg-white/10 text-ink border border-white/20 shadow-sm'
                  : 'text-ink-muted hover:text-ink hover:bg-white/5 border border-transparent'
              }`}
            >
              Liked books ({bookLiked.length})
            </button>
          </div>
        </div>

        {/* ── Content Grid ── */}
        {displayed.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif italic text-2xl text-ink mb-2">
              No liked {activeCategory === 'MOVIE' ? 'films' : 'books'} yet.
            </p>
            <p className="text-xs text-ink-muted mb-6">
              Click like on any {activeCategory === 'MOVIE' ? 'film' : 'book'} to add it here.
            </p>
            <Link
              href={activeCategory === 'MOVIE' ? '/movies' : '/books'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-white/10 text-ink hover:bg-white/20 border border-white/15 transition-all"
            >
              Browse {activeCategory === 'MOVIE' ? 'films' : 'books'} →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {displayed.map(item => (
              <ContentCard
                key={item._id}
                item={item}
                onFavoriteToggle={() => setRefreshTrigger(p => p + 1)}
                onLikeToggle={() => setRefreshTrigger(p => p + 1)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
