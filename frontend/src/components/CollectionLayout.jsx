'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ContentCard from './ContentCard';
import { api } from '../lib/api';

export default function CollectionLayout({
  title,
  kicker = 'YOUR COLLECTION',
  mode = 'DUAL', // 'DUAL' or 'SINGLE'
  contentType = 'MOVIE', // Used if mode === 'SINGLE'
  icon: Icon = null,
  getItems,
  emptyConfig,
}) {
  const [activeCategory, setActiveCategory] = useState(mode === 'SINGLE' ? contentType : 'MOVIE');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cloudData, setCloudData] = useState(null);

  useEffect(() => {
    const handleUpdate = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('activityUpdated', handleUpdate);
    window.addEventListener('socialUpdated', handleUpdate);
    return () => {
      window.removeEventListener('activityUpdated', handleUpdate);
      window.removeEventListener('socialUpdated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    api('/me/library')
      .then((d) => {
        if (d) setCloudData(d);
      })
      .catch(() => {});
  }, [refreshTrigger]);

  const mergeList = (local, cloud) => {
    const map = new Map();
    for (const it of cloud || []) {
      if (it && (it.slug || it._id)) {
        const key = String(it.slug || it._id).toLowerCase().replace(/^[mb]-/, '');
        map.set(key, it);
      }
    }
    for (const it of local || []) {
      if (it && (it.slug || it._id)) {
        const key = String(it.slug || it._id).toLowerCase().replace(/^[mb]-/, '');
        map.set(key, { ...map.get(key), ...it });
      }
    }
    return Array.from(map.values());
  };

  const getCloudItemsForType = (type) => {
    if (!cloudData) return [];
    const t = String(title).toLowerCase();
    let list = [];
    if (t.includes('fav')) list = cloudData.favorites || [];
    else if (t.includes('like')) list = cloudData.likes || [];
    else if (t.includes('watch') || t.includes('read')) list = cloudData.watchlist || [];
    return list.filter((it) => it && it.type === type);
  };

  const movieItems = mergeList(getItems('MOVIE'), getCloudItemsForType('MOVIE'));
  const bookItems = mergeList(getItems('BOOK'), getCloudItemsForType('BOOK'));
  const currentCategory = mode === 'SINGLE' ? contentType : activeCategory;
  const displayedItems = currentCategory === 'MOVIE' ? movieItems : bookItems;

  const defaultEmptyConfig = (cat) => {
    const isM = cat === 'MOVIE';
    return {
      title: `No ${isM ? 'films' : 'books'} in your ${title.toLowerCase()} yet.`,
      subtitle: `Explore ${isM ? 'cinema' : 'literature'} to build your collection.`,
      ctaText: `Browse ${isM ? 'Films' : 'Books'} →`,
      ctaHref: isM ? '/movies' : '/books',
    };
  };

  const empty = emptyConfig ? emptyConfig(currentCategory) : defaultEmptyConfig(currentCategory);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#000000] text-[#E0E0E0] pb-24 selection:bg-white/15 selection:text-white relative overflow-hidden">
      {/* Ambient monochrome glow */}
      <div className="fixed top-12 left-1/4 w-96 h-96 rounded-full bg-radial from-white/[0.015] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Page Header ── */}
        <div className="pt-10 pb-6 border-b border-[#212121] mb-8">
          <div className="flex items-center gap-2 mb-2">
            {Icon && <Icon size={14} className="text-white" />}
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#888888]">
              {kicker}
            </p>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight mb-2">
            {title}
          </h1>

          {mode === 'SINGLE' ? (
            <p className="text-xs text-zinc-400">
              {displayedItems.length} {currentCategory === 'MOVIE' ? 'films' : 'books'} in your collection
            </p>
          ) : (
            /* Dual Mode: Segmented Filter Tabs */
            <div className="flex gap-2 overflow-x-auto no-scrollbar pt-4">
              <button
                onClick={() => setActiveCategory('MOVIE')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                  activeCategory === 'MOVIE'
                    ? 'bg-white/[0.08] text-white border border-white/[0.20] shadow-md font-semibold'
                    : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                Films ({movieItems.length})
              </button>

              <button
                onClick={() => setActiveCategory('BOOK')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                  activeCategory === 'BOOK'
                    ? 'bg-white/[0.08] text-white border border-white/[0.20] shadow-md font-semibold'
                    : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                Books ({bookItems.length})
              </button>
            </div>
          )}
        </div>

        {/* ── Content Grid ── */}
        {displayedItems.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif italic text-2xl text-white mb-2">
              {empty.title}
            </p>
            <p className="text-xs text-zinc-400 mb-6">
              {empty.subtitle}
            </p>
            <Link
              href={empty.ctaHref}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-white text-[#000000] hover:bg-[#E0E0E0] transition-all active:scale-[0.99]"
            >
              {empty.ctaText}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {displayedItems.map(item => (
              <ContentCard
                key={item._id}
                item={item}
                onFavoriteToggle={() => setRefreshTrigger(prev => prev + 1)}
                onLikeToggle={() => setRefreshTrigger(prev => prev + 1)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
