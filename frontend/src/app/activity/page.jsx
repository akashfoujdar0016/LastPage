'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Heart, Star, MessageSquare, Users, User, ArrowLeft, Check, ArrowUpRight } from 'lucide-react';
import { getActivities, getRelativeDayLabel, formatLogDate } from '../../lib/activityStore';
import { getFriendsActivity, toggleActivityLike, isActivityLiked } from '../../lib/socialStore';
import { CURATED_MOVIES, CURATED_BOOKS } from '../../lib/curatedCatalogue';

export default function ActivityPage() {
  const [feedMode, setFeedMode] = useState('FRIENDS'); // 'FRIENDS' or 'PERSONAL'
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'MOVIE', 'BOOK'
  const [personalActivities, setPersonalActivities] = useState([]);
  const [friendsFeed, setFriendsFeed] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadData = () => {
    setPersonalActivities(getActivities());
    setFriendsFeed(getFriendsActivity());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => setRefreshTrigger(p => p + 1);
    window.addEventListener('activityUpdated', handleUpdate);
    window.addEventListener('socialUpdated', handleUpdate);
    return () => {
      window.removeEventListener('activityUpdated', handleUpdate);
      window.removeEventListener('socialUpdated', handleUpdate);
    };
  }, [refreshTrigger]);

  const filteredPersonal = useMemo(() => {
    if (activeTab === 'ALL') return personalActivities;
    return personalActivities.filter(a => a.contentType === activeTab);
  }, [personalActivities, activeTab]);

  // Group personal activities by relative day
  const groupedPersonal = useMemo(() => {
    const groups = {};
    for (const act of filteredPersonal) {
      const label = getRelativeDayLabel(act.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(act);
    }
    return groups;
  }, [filteredPersonal]);

  const groupKeys = Object.keys(groupedPersonal);

  const renderActionIcon = (type) => {
    switch (type) {
      case 'RATED':
        return <Star size={13} className="text-white fill-white" />;
      case 'LIKED':
        return <Heart size={13} className="text-white fill-white" />;
      case 'FAVORITED':
        return <Star size={13} className="text-white fill-white" />;
      case 'WATCHED':
      case 'READ':
        return <Check size={13} className="text-ink" />;
      case 'REVIEWED':
        return <MessageSquare size={13} className="text-ink-muted" />;
      default:
        return <ArrowUpRight size={13} className="text-ink-faint" />;
    }
  };

  const getItemImage = (contentId, contentType) => {
    const pool = contentType === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS;
    const found = pool.find(item => item._id === contentId);
    return found?.imageUrl || '';
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#000000] text-[#E0E0E0] pb-24 selection:bg-white/15 selection:text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-12 left-1/3 w-96 h-96 rounded-full bg-radial from-white/[0.015] to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-12 right-1/4 w-96 h-96 rounded-full bg-radial from-white/[0.015] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 md:px-10 relative z-10">

        {/* ── Top Back Navigation ── */}
        <div className="pt-8 pb-4 border-b border-white/[0.08] flex items-center justify-between mb-8">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to collection</span>
          </Link>

          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
            Timeline Feed
          </span>
        </div>

        {/* ── Header: Title & Feed Switcher (Friends Activity vs Your Journal) ── */}
        <div className="pb-6 border-b border-white/[0.08] mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#888888] mb-2">
            COMMUNITY & JOURNAL
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-white tracking-tight mb-6">
            Activity Stream
          </h1>

          {/* Top-Level Mode Segmented Pill Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-full bg-[#111111] border border-[#222222] w-fit">
            <button
              onClick={() => setFeedMode('FRIENDS')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                feedMode === 'FRIENDS'
                  ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.22)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users size={13} />
              <span>Friends Activity</span>
            </button>

            <button
              onClick={() => setFeedMode('PERSONAL')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                feedMode === 'PERSONAL'
                  ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.22)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <User size={13} />
              <span>Your Journal</span>
            </button>
          </div>
        </div>

        {/* ── Feed View ── */}
        {feedMode === 'FRIENDS' ? (
          /* ── Aggregate Friends Activity Stream ── */
          friendsFeed.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif italic text-2xl text-zinc-100 mb-2">
                No activity from friends yet.
              </p>
              <p className="text-xs text-zinc-400 mb-6">
                Follow curators, cinephiles, and readers to see their real-time reflections.
              </p>
              <Link
                href="/profile"
                className="btn-highlight inline-flex items-center px-5 py-2 rounded-full text-xs font-semibold"
              >
                Discover Curators →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {friendsFeed.map((act) => {
                const isLiked = isActivityLiked(act.id);
                const itemImg = getItemImage(act.contentId, act.contentType);
                const targetUrl = `/${act.contentType === 'MOVIE' ? 'movies' : 'books'}/${act.contentId}`;

                return (
                  <div
                    key={act.id}
                    className="p-6 rounded-2xl bg-[#111111] border border-[#222222] shadow-2xl backdrop-blur-md flex flex-col gap-4 hover:border-white/[0.16] transition-all"
                  >
                    {/* Header: User avatar + Action line */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/user/${act.user.username}`}
                          className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/20 text-white flex items-center justify-center font-serif text-base font-medium shrink-0 hover:border-white transition-colors"
                        >
                          {act.user.initial || act.user.username.charAt(0).toUpperCase()}
                        </Link>

                        <div>
                          <div className="flex items-baseline gap-1.5 flex-wrap text-xs">
                            <Link
                              href={`/user/${act.user.username}`}
                              className="font-medium text-white hover:text-[#E0E0E0] transition-colors"
                            >
                              {act.user.displayName}
                            </Link>
                            <span className="text-zinc-500">@{act.user.username}</span>
                            <span className="text-zinc-400">
                              {act.type === 'REVIEWED' && 'reviewed'}
                              {act.type === 'READ' && 'read'}
                              {act.type === 'WATCHED' && 'watched'}
                              {act.type === 'FAVORITED' && 'added to favourites'}
                              {act.type === 'RATED' && 'rated'}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {formatLogDate(act.createdAt)}
                          </div>
                        </div>
                      </div>

                      {act.score && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-white/[0.08] px-2.5 py-1 rounded-full border border-white/[0.14] shrink-0">
                          ★ {Number(act.score).toFixed(1)}
                        </span>
                      )}
                    </div>

                    {/* Media Item & Review Body */}
                    <div className="flex gap-4 items-start bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                      {itemImg && (
                        <Link
                          href={targetUrl}
                          className="w-16 sm:w-20 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shrink-0 relative hover:border-white/30 transition-colors shadow-md"
                        >
                          <img
                            src={itemImg}
                            alt={act.title}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                      )}

                      <div className="flex-1 min-w-0">
                        <Link
                          href={targetUrl}
                          className="font-serif text-lg text-white font-normal hover:text-[#E0E0E0] transition-colors truncate block mb-0.5"
                        >
                          {act.title}
                        </Link>
                        <div className="text-xs text-zinc-400 mb-2">
                          {act.creator} · {act.contentType === 'MOVIE' ? 'Film' : 'Book'}
                        </div>

                        {act.reviewSnippet && (
                          <div className="pl-3 border-l-2 border-white/40 my-1">
                            <p className="font-serif italic text-xs sm:text-sm text-zinc-300 leading-relaxed">
                              "{act.reviewSnippet}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Micro-Interaction: Like / Heart */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                      <span className="text-[11px] text-zinc-500">
                        Shared via peer journal
                      </span>

                      <button
                        onClick={() => toggleActivityLike(act.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isLiked
                            ? 'text-white bg-white/10 border border-white/20'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <Heart
                          size={13}
                          className={isLiked ? 'fill-white stroke-white' : 'stroke-current'}
                        />
                        <span>{(act.likesCount || 0) + (isLiked ? 1 : 0)}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ── Personal Journal Stream ── */
          <div>
            {/* Category Filter Switcher */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6 mb-6 border-b border-border">
              {[
                { id: 'ALL', label: 'All Personal' },
                { id: 'MOVIE', label: 'Cinema Only' },
                { id: 'BOOK', label: 'Library Only' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {groupKeys.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-serif italic text-2xl text-white mb-2">
                  No personal activity logged yet.
                </p>
                <p className="text-xs text-zinc-400">
                  Log, rate, or review titles to build your personal timeline.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {groupKeys.map(dayLabel => {
                  const dayItems = groupedPersonal[dayLabel];
                  return (
                    <div key={dayLabel}>
                      <h2 className="font-serif text-xl text-white mb-4 flex items-center gap-3">
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
                              <div className="flex items-baseline gap-2 flex-wrap text-sm text-zinc-400">
                                <span>You {act.type.toLowerCase()}</span>
                                <Link
                                  href={`/${act.contentType === 'MOVIE' ? 'movies' : 'books'}/${act.contentId}`}
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
                            </div>
                          </div>
                        ))}
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
