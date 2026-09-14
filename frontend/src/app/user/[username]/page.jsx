'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  Star,
  Check,
  MessageSquare,
  ArrowLeft,
  Calendar,
  Film,
  BookOpen,
  ArrowUpRight,
  UserCheck,
  UserPlus,
  Share2,
} from 'lucide-react';
import {
  getUserByUsername,
  isFollowingUser,
  toggleFollowUser,
  toggleActivityLike,
  isActivityLiked,
} from '../../../lib/socialStore';
import FollowModal from '../../../components/FollowModal';
import { formatLogDate } from '../../../lib/activityStore';

export default function UserProfilePage({ params }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;

  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followHovered, setFollowHovered] = useState(false);
  const [activeMedia, setActiveMedia] = useState('ALL'); // 'ALL' | 'CINEMA' | 'LIBRARY'
  const [activeCollection, setActiveCollection] = useState('WATCHED'); // 'WATCHED' | 'FAVOURITES' | 'LIKES' | 'WATCHLIST' | 'ACTIVITY'
  const [modalState, setModalState] = useState({ isOpen: false, type: 'FOLLOWING' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loaded = getUserByUsername(username);
    setUser(loaded);
    if (loaded && !loaded.isSelf) {
      setIsFollowing(isFollowingUser(loaded.username));
    }
  }, [username, refreshTrigger]);

  useEffect(() => {
    const handleSocialUpdate = () => setRefreshTrigger(p => p + 1);
    window.addEventListener('socialUpdated', handleSocialUpdate);
    return () => window.removeEventListener('socialUpdated', handleSocialUpdate);
  }, []);

  const handleFollowToggle = () => {
    if (!user || user.isSelf) return;
    const next = toggleFollowUser(user.username);
    setIsFollowing(next);
  };

  // Filter items by media type
  const filterByMedia = (items = []) => {
    if (activeMedia === 'ALL') return items;
    if (activeMedia === 'CINEMA') return items.filter(it => it.type === 'MOVIE');
    if (activeMedia === 'LIBRARY') return items.filter(it => it.type === 'BOOK');
    return items;
  };

  const displayedItems = useMemo(() => {
    if (!user) return [];
    switch (activeCollection) {
      case 'FAVOURITES':
        return filterByMedia(user.favourites);
      case 'LIKES':
        return filterByMedia(user.likes);
      case 'WATCHLIST':
        return filterByMedia(user.watchlist);
      case 'WATCHED':
      default:
        return filterByMedia(user.watched);
    }
  }, [user, activeCollection, activeMedia]);

  const displayedActivities = useMemo(() => {
    if (!user) return [];
    if (activeMedia === 'ALL') return user.activities;
    if (activeMedia === 'CINEMA') return user.activities.filter(a => a.contentType === 'MOVIE');
    if (activeMedia === 'LIBRARY') return user.activities.filter(a => a.contentType === 'BOOK');
    return user.activities;
  }, [user, activeMedia]);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-52px)] bg-page text-ink flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif text-3xl text-white mb-2">Member not found</h1>
        <p className="text-xs text-zinc-400 mb-6">
          The requested profile @{username} does not exist in the journal archive.
        </p>
        <Link
          href="/hub"
          className="px-5 py-2 rounded-full bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors"
        >
          Back to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-52px)] bg-page text-ink pb-24 selection:bg-ember/30 selection:text-ink relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/[0.035] via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-12 left-1/4 w-96 h-96 rounded-full bg-radial from-ember/[0.05] to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-12 right-1/4 w-96 h-96 rounded-full bg-radial from-gold/[0.03] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Top Back Navigation ── */}
        <div className="pt-8 pb-4 border-b border-white/[0.08] flex items-center justify-between mb-8">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to collection</span>
          </Link>

          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F87171]">
            {user.isSelf ? 'Your Journal' : 'Peer Journal'}
          </span>
        </div>

        {/* ── 1. Profile Header: Social Stats & Follow Actions ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/[0.08] mb-8">
          <div className="flex items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-ember/15 border-2 border-ember/30 text-ember flex items-center justify-center font-serif text-2xl sm:text-3xl font-medium shadow-2xl shrink-0">
              {user.initial || user.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-100 leading-tight">
                  {user.displayName}
                </h1>
                <span className="text-xs text-zinc-400">
                  @{user.username}
                </span>
              </div>

              <p className="text-xs text-zinc-300 max-w-lg mt-1 leading-relaxed">
                {user.bio}
              </p>

              {/* Clickable Social Stats */}
              <div className="flex items-center gap-5 mt-3 text-xs">
                <button
                  onClick={() => setModalState({ isOpen: true, type: 'FOLLOWING' })}
                  className="text-zinc-400 hover:text-white transition-colors flex items-baseline gap-1"
                >
                  <span className="font-mono text-sm font-semibold text-zinc-100">
                    {user.followingCount}
                  </span>
                  <span>Following</span>
                </button>

                <span className="text-zinc-600">•</span>

                <button
                  onClick={() => setModalState({ isOpen: true, type: 'FOLLOWERS' })}
                  className="text-zinc-400 hover:text-white transition-colors flex items-baseline gap-1"
                >
                  <span className="font-mono text-sm font-semibold text-zinc-100">
                    {user.followersCount}
                  </span>
                  <span>Followers</span>
                </button>

                <span className="text-zinc-600">•</span>

                <span className="text-zinc-400 flex items-baseline gap-1">
                  <span className="font-mono text-sm font-semibold text-zinc-100">
                    {user.watched?.length || 0}
                  </span>
                  <span>Logged</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button: Dynamic Follow vs Edit Profile */}
          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            {user.isSelf ? (
              <Link
                href="/profile"
                className="px-5 py-2 rounded-full border border-white/20 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/40 transition-all shadow-sm"
              >
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollowToggle}
                onMouseEnter={() => setFollowHovered(true)}
                onMouseLeave={() => setFollowHovered(false)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 shadow-md ${
                  isFollowing
                    ? 'border border-white/20 text-zinc-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10'
                    : 'bg-[#F4F4F5] text-[#121216] hover:bg-white active:scale-[0.99]'
                }`}
              >
                {isFollowing ? (followHovered ? 'Unfollow' : 'Following') : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* ── 2. Segmented Media Switcher & Collection Filters ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
          {/* Media Switcher: All | Cinema | Library */}
          <div className="flex items-center p-1 rounded-full bg-surface border border-white/[0.08] shrink-0 self-start">
            {[
              { id: 'ALL', label: 'All Media' },
              { id: 'CINEMA', label: 'Cinema', Icon: Film },
              { id: 'LIBRARY', label: 'Library', Icon: BookOpen },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveMedia(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeMedia === tab.id
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.Icon && <tab.Icon size={12} />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Collection Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'WATCHED', label: 'Watched / Read' },
              { id: 'FAVOURITES', label: 'Favourites' },
              { id: 'LIKES', label: 'Likes' },
              { id: 'WATCHLIST', label: 'Watchlist / TBR' },
              { id: 'ACTIVITY', label: 'Journal Activity' },
            ].map(filter => {
              const active = activeCollection === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveCollection(filter.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                    active
                      ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Content View: Media Grid or Activity Feed ── */}
        {activeCollection === 'ACTIVITY' ? (
          /* ── Friend Activity Stream ── */
          displayedActivities.length === 0 ? (
            <div className="py-24 text-center text-xs text-zinc-400">
              No journal activity logged by @{user.username} yet.
            </div>
          ) : (
            <div className="max-w-3xl flex flex-col gap-6">
              {displayedActivities.map(act => {
                const isLiked = isActivityLiked(act.id);
                return (
                  <div
                    key={act.id}
                    className="p-5 sm:p-6 rounded-2xl bg-surface/80 border border-white/10 shadow-xl backdrop-blur-md flex flex-col gap-3.5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="font-medium text-white">{user.displayName}</span>
                        <span>
                          {act.type === 'REVIEWED' && 'reviewed'}
                          {act.type === 'READ' && 'read'}
                          {act.type === 'WATCHED' && 'watched'}
                          {act.type === 'FAVORITED' && 'favourited'}
                          {act.type === 'RATED' && 'rated'}
                        </span>
                        <Link
                          href={`/${act.contentType === 'MOVIE' ? 'movies' : 'books'}/${act.contentId}`}
                          className="font-serif text-sm text-white hover:text-ember transition-colors truncate"
                        >
                          {act.title}
                        </Link>
                      </div>

                      {act.score && (
                        <span className="text-xs font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20 shrink-0">
                          ★ {Number(act.score).toFixed(1)}
                        </span>
                      )}
                    </div>

                    {act.reviewSnippet && (
                      <div className="pl-3.5 border-l-2 border-ember/60 my-1">
                        <p className="font-serif italic text-sm text-zinc-300 leading-relaxed">
                          "{act.reviewSnippet}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-500">
                      <span>{formatLogDate(act.createdAt)}</span>

                      <button
                        onClick={() => toggleActivityLike(act.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                          isLiked
                            ? 'text-ember bg-ember/10'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Heart
                          size={12}
                          className={isLiked ? 'fill-ember stroke-ember' : 'stroke-current'}
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
          /* ── Friend Media Grid ── */
          displayedItems.length === 0 ? (
            <div className="py-24 text-center text-xs text-zinc-400">
              No titles in {user.displayName}'s {activeCollection.toLowerCase()} list.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {displayedItems.map(item => {
                const isMovie = item.type === 'MOVIE';
                const href = `/${isMovie ? 'movies' : 'books'}/${item._id}`;
                const creator = item.director || item.author || '';

                return (
                  <div key={item._id} className="group relative flex flex-col">
                    {/* Poster container with read-only overlay */}
                    <div
                      className={`relative w-full aspect-[2/3] overflow-hidden bg-surface-raised border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-xl ${
                        isMovie ? 'rounded-lg' : 'rounded-xl shadow-[2px_4px_16px_rgba(0,0,0,0.5)]'
                      }`}
                    >
                      <Link href={href} className="block w-full h-full relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col justify-end p-4 bg-surface">
                            <div className="font-serif text-sm text-white truncate">{item.title}</div>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-[10px] font-medium bg-white/90 text-zinc-950 px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <span>View details</span>
                            <ArrowUpRight size={10} />
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Metadata & Friend Rating */}
                    <div className="mt-3 flex flex-col">
                      <Link
                        href={href}
                        className="font-serif text-[17px] text-white font-normal truncate hover:text-ember transition-colors leading-tight mb-0.5"
                      >
                        {item.title}
                      </Link>

                      {creator && (
                        <div className="text-xs text-zinc-400 truncate mb-1">
                          {creator}
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {item.userRating && (
                          <div className="inline-flex items-center gap-1 font-semibold text-gold text-xs">
                            <Star size={11} className="fill-gold stroke-gold" />
                            <span>{Number(item.userRating).toFixed(1)}</span>
                          </div>
                        )}
                        {item.loggedDate && (
                          <span className="text-[10px] text-zinc-500">
                            {formatLogDate(item.loggedDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

      </div>

      {/* ── Followers / Following Modal ── */}
      <FollowModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: 'FOLLOWING' })}
        type={modalState.type}
        username={user.username}
      />
    </div>
  );
}
