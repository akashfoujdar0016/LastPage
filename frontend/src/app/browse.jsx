'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  LayoutGrid,
  List,
  Heart,
  Star,
  Check,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react';
import ContentCard from '../components/ContentCard';
import { api } from '../lib/api';
import { getCuratedItems } from '../lib/curatedCatalogue';
import {
  getUserWatched,
  getUserWatchlist,
  getUserFavourites,
  getUserLiked,
  getActivities,
  getRelativeDayLabel,
} from '../lib/activityStore';

export default function Browse({ type, title }) {
  const isMovie = type === 'MOVIE';
  const fallbackItems = useMemo(() => getCuratedItems(type), [type]);

  const [catalogueItems, setCatalogueItems] = useState(fallbackItems);
  const [subView, setSubView] = useState('watched');
  const [q, setQ] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const inputRef = useRef(null);

  // Load backend catalogue in background for search
  async function loadCatalogue(query = '') {
    setLoading(true);
    try {
      const qs = query.trim() ? `&q=${encodeURIComponent(query.trim())}` : '';
      const d = await api(`/content?type=${type}${qs}&limit=60`);
      if (d?.items?.length > 0) {
        setCatalogueItems(d.items);
      } else {
        setCatalogueItems(fallbackItems);
      }
    } catch {
      setCatalogueItems(fallbackItems);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalogue('');
  }, [type]);

  // Listen for activity updates so personal lists update reactively
  useEffect(() => {
    const handleUpdate = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('activityUpdated', handleUpdate);
    return () => window.removeEventListener('activityUpdated', handleUpdate);
  }, []);

  // When search is active, search across the catalogue
  const searchResults = useMemo(() => {
    if (!q.trim()) return [];
    const lq = q.toLowerCase();
    return catalogueItems.filter(
      it =>
        it.title.toLowerCase().includes(lq) ||
        (it.director && it.director.toLowerCase().includes(lq)) ||
        (it.author && it.author.toLowerCase().includes(lq)) ||
        (it.genres && it.genres.some(g => g.toLowerCase().includes(lq)))
    );
  }, [catalogueItems, q]);

  // When not searching and not in activity, show the user's selected personal collection
  const currentPersonalItems = useMemo(() => {
    switch (subView) {
      case 'watchlist':
        return getUserWatchlist(type);
      case 'favourites':
        return getUserFavourites(type);
      case 'liked':
        return getUserLiked(type);
      case 'watched':
      default:
        return getUserWatched(type);
    }
  }, [subView, type, refreshTrigger]);

  // Activities for this specific section (Cinema vs Library)
  const sectionActivities = useMemo(() => {
    return getActivities(type);
  }, [type, refreshTrigger]);

  // Group section activities by relative day
  const groupedActivities = useMemo(() => {
    const groups = {};
    for (const act of sectionActivities) {
      const label = getRelativeDayLabel(act.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(act);
    }
    return groups;
  }, [sectionActivities]);

  const activityDayKeys = Object.keys(groupedActivities);

  const isSearching = q.trim().length > 0;
  const isActivityView = !isSearching && subView === 'activity';
  const displayed = isSearching ? searchResults : currentPersonalItems;

  const subViewTabs = isMovie
    ? [
        { id: 'watched', label: 'Watched' },
        { id: 'watchlist', label: 'Watchlist' },
        { id: 'favourites', label: 'Favourites' },
        { id: 'liked', label: 'Liked' },
        { id: 'activity', label: 'Activity' },
      ]
    : [
        { id: 'watched', label: 'Read' },
        { id: 'watchlist', label: 'Reading list' },
        { id: 'favourites', label: 'Favourites' },
        { id: 'liked', label: 'Liked' },
        { id: 'activity', label: 'Activity' },
      ];

  const getSubViewHeading = () => {
    if (isSearching) return `Search catalogue for "${q}"`;
    if (isMovie) {
      switch (subView) {
        case 'activity':
          return 'Cinema activity';
        case 'watchlist':
          return 'Watchlist';
        case 'favourites':
          return 'Favourite films';
        case 'liked':
          return 'Liked films';
        case 'watched':
        default:
          return 'Watched films';
      }
    } else {
      switch (subView) {
        case 'activity':
          return 'Library activity';
        case 'watchlist':
          return 'Reading list';
        case 'favourites':
          return 'Favourite books';
        case 'liked':
          return 'Liked books';
        case 'watched':
        default:
          return 'Books read';
      }
    }
  };

  const renderActionIcon = (actType) => {
    switch (actType) {
      case 'RATED':
        return <Star size={13} className="text-gold fill-gold" />;
      case 'LIKED':
        return <Heart size={13} className="text-ember fill-ember" />;
      case 'FAVORITED':
        return <Star size={13} className="text-gold fill-gold" />;
      case 'WATCHED':
      case 'READ':
        return <Check size={13} className="text-ink" />;
      case 'REVIEWED':
        return <MessageSquare size={13} className="text-ink-muted" />;
      default:
        return <ArrowUpRight size={13} className="text-ink-faint" />;
    }
  };

  const renderActionText = (act) => {
    const targetUrl = `/${isMovie ? 'movies' : 'books'}/${act.contentId}`;
    const titleLink = (
      <Link
        href={targetUrl}
        className="font-serif text-lg text-ink hover:text-ember transition-colors duration-200"
      >
        {act.title}
      </Link>
    );

    switch (act.type) {
      case 'RATED':
        return (
          <div className="flex items-baseline gap-2 flex-wrap text-sm text-ink-muted">
            <span>You rated</span>
            {titleLink}
            {act.score && (
              <span className="inline-flex items-center gap-1 font-semibold text-gold text-xs">
                ★ {Number(act.score).toFixed(1)}
              </span>
            )}
          </div>
        );
      case 'LIKED':
        return (
          <div className="flex items-baseline gap-2 flex-wrap text-sm text-ink-muted">
            <span>You liked</span>
            {titleLink}
          </div>
        );
      case 'FAVORITED':
        return (
          <div className="flex items-baseline gap-2 flex-wrap text-sm text-ink-muted">
            <span>You added</span>
            {titleLink}
            <span>to favourites</span>
          </div>
        );
      case 'WATCHED':
        return (
          <div className="flex items-baseline gap-2 flex-wrap text-sm text-ink-muted">
            <span>You watched</span>
            {titleLink}
          </div>
        );
      case 'READ':
        return (
          <div className="flex items-baseline gap-2 flex-wrap text-sm text-ink-muted">
            <span>You read</span>
            {titleLink}
          </div>
        );
      case 'REVIEWED':
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2 flex-wrap text-sm text-ink-muted">
              <span>You reviewed</span>
              {titleLink}
            </div>
            {act.reviewSnippet && (
              <p className="font-serif italic text-sm text-ink-muted mt-1 leading-relaxed">
                "{act.reviewSnippet}"
              </p>
            )}
          </div>
        );
      default:
        return (
          <div className="flex items-baseline gap-2 text-sm text-ink-muted">
            <span>You logged</span>
            {titleLink}
          </div>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-page text-ink pb-24 selection:bg-ember/30 selection:text-ink relative overflow-hidden">
      {/* Background ambient light */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/[0.035] via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-0 right-1/4 w-96 h-96 rounded-full bg-radial from-ember/[0.05] to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/3 w-[30rem] h-[30rem] rounded-full bg-radial from-gold/[0.03] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section Header ── */}
        <div className="pt-10 pb-6 border-b border-white/[0.08] mb-8">
          {/* Top Row: Category title & Search bar */}
          <div className="flex items-end justify-between gap-6 flex-wrap mb-7">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-[#F87171] mb-2">
                {isMovie ? 'CINEMA JOURNAL' : 'LIBRARY JOURNAL'}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-zinc-100 tracking-tight leading-none">
                {getSubViewHeading()}
              </h1>
            </div>

            {/* Right: Search Capsule & View Mode Toggle */}
            <div className="flex items-center gap-3.5 flex-wrap">
              {/* Inset Rounded Capsule Search Bar */}
              <div className="relative flex items-center w-64 sm:w-72">
                <Search
                  size={14}
                  className="absolute left-3.5 text-zinc-400 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder={isMovie ? 'Search films by title or director…' : 'Search books by title or author…'}
                  className="w-full bg-[#1A1A20] border border-white/10 rounded-full pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/20 focus:bg-[#202028]"
                />
                {q && (
                  <button
                    onClick={() => setQ('')}
                    title="Clear search"
                    className="absolute right-3 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Grid / List view toggle (hidden on activity view) */}
              {!isActivityView && (
                <div className="flex items-center p-1 bg-surface border border-white/[0.08] rounded-full">
                  {[
                    { mode: 'grid', Icon: LayoutGrid, title: 'Grid view' },
                    { mode: 'list', Icon: List, title: 'List view' },
                  ].map(({ mode, Icon, title }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      title={title}
                      className={`p-1.5 rounded-full transition-all duration-200 ${
                        viewMode === mode
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.7} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Segmented Pill Navigation */}
          {!isSearching && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {subViewTabs.map(tab => {
                const isActive = subView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSubView(tab.id);
                      setQ('');
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Main Content Area ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-[2/3] bg-surface-raised rounded-xl" />
                <div className="h-4 bg-surface-raised rounded w-3/4" />
                <div className="h-3 bg-surface-raised rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : isSearching && displayed.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif italic text-2xl text-ink mb-2">
              No results found for "{q}".
            </p>
            <p className="text-xs text-ink-muted">
              Try searching with another keyword or explore the collection.
            </p>
          </div>
        ) : isActivityView ? (
          /* ── Activity View ── */
          activityDayKeys.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif italic text-2xl text-ink mb-2">
                No activity recorded yet.
              </p>
              <p className="text-xs text-ink-muted">
                Log, rate, or review items to build your personal timeline.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10 max-w-3xl">
              {activityDayKeys.map(dayLabel => {
                const dayItems = groupedActivities[dayLabel];
                return (
                  <div key={dayLabel}>
                    <h2 className="font-serif text-xl text-ink mb-4 flex items-center gap-3">
                      <span>{dayLabel}</span>
                      <span className="h-px flex-1 bg-border" />
                    </h2>
                    <div className="border-t border-border divide-y divide-border/60">
                      {dayItems.map((act, idx) => (
                        <div
                          key={act.id || idx}
                          className="flex items-start gap-4 py-3.5 hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
                        >
                          <div className="mt-1 w-5 h-5 flex items-center justify-center shrink-0">
                            {renderActionIcon(act.type)}
                          </div>
                          <div className="flex-1">
                            {renderActionText(act)}
                            {act.creator && (
                              <div className="text-xs text-ink-faint mt-0.5">
                                {act.creator}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : displayed.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif italic text-2xl text-ink mb-2">
              No entries in this view.
            </p>
            <p className="text-xs text-ink-muted mb-6">
              Start adding items by exploring the catalogue.
            </p>
            <button
              onClick={() => {
                if (inputRef.current) inputRef.current.focus();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-white/10 text-ink hover:bg-white/20 border border-white/15 transition-all"
            >
              <Search size={13} />
              <span>Search the catalogue</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Responsive Balanced Grid ── */
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
        ) : (
          /* ── Editorial List View ── */
          <div className="border-t border-border divide-y divide-border/60">
            {displayed.map(item => {
              const creator = item.director || item.creatorNames?.[0] || item.author || item.authorNames?.[0] || '';
              const href = `/${isMovie ? 'movies' : 'books'}/${item._id}`;
              const rating = Number(item.averageRating || 0);

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between py-3 px-2 hover:bg-white/[0.02] rounded-lg transition-colors gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Link
                      href={href}
                      className="w-10 h-14 shrink-0 rounded overflow-hidden bg-surface-raised border border-white/10 relative"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-ink-muted">
                          {isMovie ? 'Film' : 'Book'}
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <Link
                        href={href}
                        className="font-serif text-base text-ink hover:text-ember transition-colors truncate block"
                      >
                        {item.title}
                      </Link>
                      {creator && (
                        <div className="text-xs text-ink-muted truncate">
                          {creator}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    {rating > 0 && (
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-gold">
                        <Star size={12} className="fill-gold stroke-gold" />
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    )}
                    <Link
                      href={href}
                      className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
