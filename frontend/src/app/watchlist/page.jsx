'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ContentCard from '../../components/ContentCard';
import { getUserWatchlist } from '../../lib/activityStore';

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadItems = () => {
    setItems(getUserWatchlist('MOVIE'));
  };

  useEffect(() => {
    loadItems();
    window.addEventListener('activityUpdated', loadItems);
    return () => window.removeEventListener('activityUpdated', loadItems);
  }, []);

  return (
    <div className="min-h-[calc(100vh-52px)] bg-page text-ink pb-24 selection:bg-ember/30 selection:text-ink relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed top-12 left-1/4 w-96 h-96 rounded-full bg-radial from-ember/[0.06] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Page Header ── */}
        <div className="pt-10 pb-6 border-b border-border mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ember mb-2">
            CINEMA
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-ink tracking-tight mb-2">
            Watchlist
          </h1>
          <p className="text-xs text-ink-muted">
            Films you plan to watch.
          </p>
        </div>

        {/* ── Grid ── */}
        {items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif italic text-2xl text-ink mb-2">
              Your watchlist is empty.
            </p>
            <p className="text-xs text-ink-muted mb-6">
              Explore cinema and add films you wish to watch.
            </p>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-white/10 text-ink hover:bg-white/20 border border-white/15 transition-all"
            >
              Browse cinema →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map(item => (
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
