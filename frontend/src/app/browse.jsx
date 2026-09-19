'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  LayoutGrid,
  List,
  Star,
  Heart,
  Check,
  MessageSquare,
  ArrowUpRight,
  Film,
  BookOpen,
  Sparkles,
  Bookmark,
  Activity as ActivityIcon,
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
  formatLogDate,
} from '../lib/activityStore';

export default function Browse({ type, title }) {
  const isMovie = type === 'MOVIE';
  const fallbackItems = useMemo(() => getCuratedItems(type), [type]);

  const [catalogueItems, setCatalogueItems] = useState(fallbackItems);
  // Standardized Tabs: 'all' | 'watched' | 'watchlist' | 'liked' | 'favourite' | 'activity'
  const [activeTab, setActiveTab] = useState('all');
  const [browseCatalogueMode, setBrowseCatalogueMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const inputRef = useRef(null);

  // Load backend catalogue in background for search
  async function loadCatalogue(query = '') {
    setLoading(true);
    try {
      const qs = query.trim() ? `&q=${encodeURIComponent(query.trim())}` : '';
      const d = await api(`/content?type=${type}${qs}&limit=100`);
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

  // Reactive listeners for activities & user collections
  useEffect(() => {
    const handleUpdate = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener('activityUpdated', handleUpdate);
    window.addEventListener('socialUpdated', handleUpdate);
    return () => {
      window.removeEventListener('activityUpdated', handleUpdate);
      window.removeEventListener('socialUpdated', handleUpdate);
    };
  }, []);

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return catalogueItems.filter(
      item =>
        item.title?.toLowerCase().includes(q) ||
        (item.creatorNames && item.creatorNames.some(c => c.toLowerCase().includes(q))) ||
        (item.authorNames && item.authorNames.some(a => a.toLowerCase().includes(q))) ||
        (item.director && item.director.toLowerCase().includes(q)) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.genres && item.genres.some(g => g.toLowerCase().includes(q)))
    );
  }, [catalogueItems, searchQuery]);

  // User collection stores for each standardized tab
  const watchedItems = useMemo(() => getUserWatched(type), [type, refreshTrigger]);
  const watchlistItems = useMemo(() => getUserWatchlist(type), [type, refreshTrigger]);
  const likedItems = useMemo(() => getUserLiked(type), [type, refreshTrigger]);
  const favouriteItems = useMemo(() => getUserFavourites(type), [type, refreshTrigger]);

  // Section activities for Tab 5
  const sectionActivities = useMemo(() => getActivities(type), [type, refreshTrigger]);

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

  // Tab configurations
  const tabs = [
    {
      id: 'all',
      label: isMovie ? 'All Films' : 'All Books',
      count: catalogueItems.length,
      icon: Sparkles,
    },
    {
      id: 'watched',
      label: isMovie ? 'Watched' : 'Read',
      count: watchedItems.length,
      icon: Check,
    },
    {
      id: 'watchlist',
      label: isMovie ? 'Watchlist' : 'Readlist',
      count: watchlistItems.length,
      icon: Bookmark,
    },
    {
      id: 'liked',
      label: 'Liked',
      count: likedItems.length,
      icon: Heart,
    },
    {
      id: 'favourite',
      label: 'Favourite',
      count: favouriteItems.length,
      icon: Star,
    },
    {
      id: 'activity',
      label: 'Activity',
      count: sectionActivities.length,
      icon: ActivityIcon,
    },
  ];

  // Currently displayed items
  const currentTabItems = useMemo(() => {
    if (browseCatalogueMode || activeTab === 'all') {
      return catalogueItems;
    }
    switch (activeTab) {
      case 'watchlist':
        return watchlistItems;
      case 'liked':
        return likedItems;
      case 'favourite':
        return favouriteItems;
      case 'watched':
        return watchedItems;
      default:
        return catalogueItems;
    }
  }, [activeTab, browseCatalogueMode, catalogueItems, watchedItems, watchlistItems, likedItems, favouriteItems]);

  const renderActionIcon = (actType) => {
    switch (actType) {
      case 'RATED':
        return <Star size={13} className="text-white fill-white" />;
      case 'LIKED':
        return <Heart size={13} className="text-white fill-white" />;
      case 'FAVORITED':
        return <Star size={13} className="text-white fill-white" />;
      case 'WATCHED':
      case 'READ':
        return <Check size={13} className="text-white" />;
      case 'REVIEWED':
        return <MessageSquare size={13} className="text-zinc-400" />;
      default:
        return <ArrowUpRight size={13} className="text-zinc-500" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#000000] text-[#E0E0E0] pb-24 selection:bg-white/15 selection:text-white relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-12 left-1/3 w-[30rem] h-[30rem] rounded-full bg-radial from-white/[0.015] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Page Header ── */}
        <div className="pt-8 pb-6 border-b border-white/[0.08] mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {isMovie ? (
                  <Film size={14} className="text-white" />
                ) : (
                  <BookOpen size={14} className="text-white" />
                )}
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#888888]">
                  {isMovie ? 'CINEMA JOURNAL' : 'LITERARY JOURNAL'}
                </p>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight">
                {title || (isMovie ? 'Cinema' : 'Library')}
              </h1>
            </div>

            {/* Inset Search Capsule & View Mode */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Search ${isMovie ? 'films, directors' : 'books, authors'}…`}
                  className="w-full bg-[#0A0A0A] border border-[#222222] rounded-full pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-white/30 focus:ring-1 focus:ring-white/15"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Grid / List View Toggle */}
              {activeTab !== 'activity' && (
                <div className="flex items-center p-1 rounded-full bg-[#141416] border border-white/[0.08] shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-full transition-colors ${
                      viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-full transition-colors ${
                      viewMode === 'list' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="List view"
                  >
                    <List size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Standardized 5 Sub-sections / Tabs (NO category-wise filters) ── */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pt-6">
            <div className="flex items-center gap-2">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id && !browseCatalogueMode;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setBrowseCatalogueMode(false);
                      setSearchQuery('');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-wide transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.22)] active:scale-[0.99]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <Icon size={13} className={isActive ? 'text-[#09090B]' : 'text-zinc-400'} />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-black/15 text-black font-semibold'
                          : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>


          </div>
        </div>

        {/* ── Search Active Overlay ── */}
        {searchQuery.trim() ? (
          <div>
            <div className="flex items-center justify-between mb-6 text-xs text-zinc-400">
              <span>
                Found {searchResults.length} {isMovie ? 'films' : 'books'} for &ldquo;{searchQuery}&rdquo;
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-white hover:underline"
              >
                Clear search
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-serif italic text-2xl text-white mb-2">No matching works found.</p>
                <p className="text-xs text-zinc-400">Try searching for a different title, director, or author.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {searchResults.map(item => (
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
        ) : activeTab === 'activity' ? (
          /* ── Tab 5: Standardized Activity Section ── */
          <div className="max-w-3xl">
            {activityDayKeys.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-serif italic text-2xl text-white mb-2">
                  No {isMovie ? 'cinema' : 'literary'} activity logged yet.
                </p>
                <p className="text-xs text-zinc-400 mb-6">
                  Log watched works, rate masterpieces, and pen reflections to populate your timeline.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('watched');
                    setBrowseCatalogueMode(true);
                  }}
                  className="px-6 py-2.5 rounded-full bg-white text-[#09090B] font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md"
                >
                  Browse {isMovie ? 'Cinema Archive' : 'Library Archive'} →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {activityDayKeys.map(dayLabel => {
                  const dayItems = groupedActivities[dayLabel];
                  return (
                    <div key={dayLabel}>
                      <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
                        <span>{dayLabel}</span>
                        <span className="h-px flex-1 bg-white/[0.08]" />
                      </h2>

                      <div className="border-t border-white/[0.08] divide-y divide-white/[0.06]">
                        {dayItems.map((act, idx) => {
                          const href = `/${act.contentType === 'MOVIE' ? 'movies' : 'books'}/${act.contentId}`;
                          return (
                            <div
                              key={act.id || idx}
                              className="flex items-start gap-4 py-4 hover:bg-white/[0.02] px-3 rounded-xl transition-colors"
                            >
                              <div className="mt-1 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                {renderActionIcon(act.type)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 flex-wrap text-sm text-zinc-400">
                                  <span>You {act.type.toLowerCase()}</span>
                                  <Link
                                    href={href}
                                    className="font-serif text-lg text-white hover:text-[#E0E0E0] transition-colors"
                                  >
                                    {act.title}
                                  </Link>
                                  {act.score && (
                                    <span className="inline-flex items-center gap-1 font-semibold text-white text-xs">
                                      ★ {Number(act.score).toFixed(1)}
                                    </span>
                                  )}
                                </div>

                                {act.creator && (
                                  <div className="text-xs text-zinc-500 mt-0.5">
                                    {act.creator}
                                  </div>
                                )}

                                {act.reviewSnippet && (
                                  <div className="pl-3 border-l-2 border-white/40 my-2">
                                    <p className="font-serif italic text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                      &ldquo;{act.reviewSnippet}&rdquo;
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="text-[11px] text-zinc-500 shrink-0 font-mono">
                                {formatLogDate(act.createdAt)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── Tabs 1-4: Standardized Content Lists ── */
          <div>
            {currentTabItems.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-serif italic text-2xl text-white mb-2">
                  No {isMovie ? 'films' : 'books'} in your {activeTab} section yet.
                </p>
                <p className="text-xs text-zinc-400 mb-6">
                  Explore the curated {isMovie ? 'cinema' : 'library'} archive and add works to your collection.
                </p>
                <button
                  onClick={() => setBrowseCatalogueMode(true)}
                  className="btn-highlight inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold"
                >
                  Browse {isMovie ? 'Cinema Archive' : 'Library Archive'} →
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {currentTabItems.map(item => (
                  <ContentCard
                    key={item._id}
                    item={item}
                    onFavoriteToggle={() => setRefreshTrigger(p => p + 1)}
                    onLikeToggle={() => setRefreshTrigger(p => p + 1)}
                  />
                ))}
              </div>
            ) : (
              /* List View Mode */
              <div className="flex flex-col divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
                {currentTabItems.map(item => {
                  const href = `/${isMovie ? 'movies' : 'books'}/${item._id}`;
                  const creator = item.director || item.author || '';
                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-4 py-3.5 px-3 hover:bg-white/[0.02] rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <Link href={href} className="shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 aspect-[2/3] object-cover rounded shadow-md border border-white/10"
                          />
                        </Link>

                        <div className="min-w-0">
                          <Link
                            href={href}
                            className="font-serif text-base text-white font-normal hover:text-[#E0E0E0] transition-colors truncate block"
                          >
                            {item.title}
                          </Link>
                          <div className="text-xs text-zinc-400 truncate">
                            {creator} {item.year ? `· ${item.year}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-xs text-white font-semibold">
                          ★ {Number(item.averageRating || 0).toFixed(1)}
                        </div>
                        <Link
                          href={href}
                          className="text-xs text-zinc-400 hover:text-white px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                        >
                          View Review →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
