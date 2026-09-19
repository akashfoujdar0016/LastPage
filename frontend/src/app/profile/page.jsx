'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { getUserWatched, formatLogDate } from '../../lib/activityStore';
import {
  getFollowingList,
  getFollowersList,
  searchUsers,
  toggleFollowUser,
  isFollowingUser,
  getFriendsActivity,
  toggleActivityLike,
  isActivityLiked,
} from '../../lib/socialStore';
import { CURATED_MOVIES, CURATED_BOOKS } from '../../lib/curatedCatalogue';
import FollowModal from '../../components/FollowModal';
import {
  Film,
  BookOpen,
  ArrowLeft,
  Search,
  X,
  Users,
  ArrowUpRight,
  Heart,
  UserPlus,
  Compass,
  Activity as ActivityIcon,
} from 'lucide-react';

export default function Profile() {
  const [u, setU] = useState(null);
  const [stats, setStats] = useState({ movies: 0, books: 0 });
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'FOLLOWING' });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('Tracking cinema and literature in a private journal.');
  const [friendSearch, setFriendSearch] = useState('');
  const [hoveredFriendBtn, setHoveredFriendBtn] = useState(null);
  const [socialTab, setSocialTab] = useState('DISCOVER'); // 'DISCOVER' | 'FEED'
  const [friendsFeed, setFriendsFeed] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        setU(parsed);
        if (parsed.bio) setBioText(parsed.bio);
      }
    } catch {}

    api('/auth/me')
      .then(x => {
        if (x?.user) {
          setU(x.user);
          if (x.user.bio) setBioText(x.user.bio);
        }
      })
      .catch(() => {});

    try {
      const m = getUserWatched('MOVIE').length;
      const b = getUserWatched('BOOK').length;
      setStats({ movies: m, books: b });
    } catch {}

    setFollowing(getFollowingList());
    setFollowers(getFollowersList());
    setFriendsFeed(getFriendsActivity());
  }, [refreshTrigger]);

  useEffect(() => {
    const handleSocialUpdate = () => setRefreshTrigger(p => p + 1);
    window.addEventListener('socialUpdated', handleSocialUpdate);
    window.addEventListener('activityUpdated', handleSocialUpdate);
    return () => {
      window.removeEventListener('socialUpdated', handleSocialUpdate);
      window.removeEventListener('activityUpdated', handleSocialUpdate);
    };
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('accessToken');
    } catch {}
    window.location.href = '/';
  };

  const handleSaveBio = () => {
    setIsEditingBio(false);
    if (u) {
      const updated = { ...u, bio: bioText };
      setU(updated);
      try {
        localStorage.setItem('currentUser', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleToggleFollow = (targetUsername) => {
    toggleFollowUser(targetUsername);
    setFollowing(getFollowingList());
    setFollowers(getFollowersList());
    setRefreshTrigger(p => p + 1);
  };

  const searchedFriends = useMemo(() => {
    return searchUsers(friendSearch, u?.username || '');
  }, [friendSearch, u?.username, refreshTrigger]);

  const getItemImage = (contentId, contentType) => {
    const pool = contentType === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS;
    const found = pool.find(item => item._id === contentId);
    return found?.imageUrl || '';
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#000000] text-[#E0E0E0] pb-24 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-theme-accent/4 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-12 left-1/3 w-96 h-96 rounded-full bg-radial from-theme-accent/4 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-12 right-1/4 w-96 h-96 rounded-full bg-radial from-theme-accent/4 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">

        {/* Top Back Link & Sign Out */}
        <div className="pt-8 pb-4 border-b border-theme-border mb-8 flex items-center justify-between">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            <ArrowLeft size={13} />
            <span>Back to Gateway Hub</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="text-xs text-text-secondary hover:text-theme-accent transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* ── 1. Profile Header: Social Stats & Follow Actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-theme-border mb-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-theme-accent-dim border-2 border-theme-accent text-theme-accent flex items-center justify-center font-serif text-2xl sm:text-3xl font-medium shadow-luxury shrink-0">
              {(u?.username || 'C').charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary tracking-tight">
                  {u?.username || 'Curator'}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-bg-surface-raised border border-theme-border text-text-secondary font-mono">
                  @{u?.username || 'journal'}
                </span>
              </div>

              {/* Bio display or edit */}
              {!isEditingBio ? (
                <p className="text-xs text-text-secondary max-w-md mt-2 leading-relaxed">
                  {bioText}
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2 max-w-md">
                  <textarea
                    value={bioText}
                    onChange={e => setBioText(e.target.value)}
                    rows={2}
                    className="w-full bg-bg-surface-raised border border-theme-border rounded-lg p-2.5 text-xs text-text-primary placeholder-text-muted outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent-dim resize-none font-sans"
                    placeholder="Write a brief kicker or aesthetic bio..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveBio}
                      className="px-3.5 py-1 rounded-full bg-theme-accent text-bg-base text-xs font-semibold hover:bg-theme-accent-hover transition-colors shadow-sm"
                    >
                      Save Bio
                    </button>
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-3.5 py-1 rounded-full border border-theme-border text-text-secondary hover:text-text-primary text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Clickable Social Stats */}
              <div className="flex items-center gap-5 mt-3 text-xs">
                <button
                  onClick={() => setModalState({ isOpen: true, type: 'FOLLOWING' })}
                  className="text-text-secondary hover:text-text-primary transition-colors flex items-baseline gap-1"
                >
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    {following.length}
                  </span>
                  <span>Following</span>
                </button>

                <span className="text-text-muted">•</span>

                <button
                  onClick={() => setModalState({ isOpen: true, type: 'FOLLOWERS' })}
                  className="text-text-secondary hover:text-text-primary transition-colors flex items-baseline gap-1"
                >
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    {followers.length}
                  </span>
                  <span>Followers</span>
                </button>
              </div>
            </div>
          </div>

          {/* Edit Profile Pill */}
          <button
            onClick={() => setIsEditingBio(!isEditingBio)}
            className="btn-highlight self-start sm:self-center px-5 py-2 rounded-full text-xs font-semibold"
          >
            {isEditingBio ? 'Close Editor' : 'Edit Profile'}
          </button>
        </div>

        {/* ── 2. Bento Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          <Link
            href="/movies"
            className="bg-bg-surface border border-theme-border hover:border-theme-accent rounded-2xl p-6 shadow-luxury transition-all block group"
          >
            <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
              <span className="font-medium uppercase tracking-wider group-hover:text-theme-accent transition-colors">
                Films Logged
              </span>
              <Film size={15} className="text-theme-accent" />
            </div>
            <div className="font-serif text-4xl text-text-primary font-normal">
              {stats.movies}
            </div>
            <div className="text-[11px] text-text-muted mt-2 flex items-center gap-1 group-hover:text-text-secondary transition-colors">
              <span>Open Cinema Journal</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/books"
            className="bg-bg-surface border border-theme-border hover:border-theme-accent rounded-2xl p-6 shadow-luxury transition-all block group"
          >
            <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
              <span className="font-medium uppercase tracking-wider group-hover:text-theme-accent transition-colors">
                Books Logged
              </span>
              <BookOpen size={15} className="text-theme-accent" />
            </div>
            <div className="font-serif text-4xl text-text-primary font-normal">
              {stats.books}
            </div>
            <div className="text-[11px] text-text-muted mt-2 flex items-center gap-1 group-hover:text-text-secondary transition-colors">
              <span>Open Library Journal</span>
              <span>→</span>
            </div>
          </Link>
        </div>

        {/* ── 3. CONNECT WITH FRIENDS SYSTEM ── */}
        <div className="bg-bg-surface border border-theme-border hover:border-theme-accent-border rounded-2xl p-6 sm:p-7 shadow-luxury mb-10 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-theme-accent" />
                <h2 className="font-serif text-xl sm:text-2xl text-text-primary font-normal tracking-tight">
                  Connect with Friends
                </h2>
              </div>
              <p className="text-xs text-text-secondary">
                Discover taste peers, follow their cultural journals, and see their real-time reflections.
              </p>
            </div>

            {/* Social Sub-tabs: Discover Curators vs Friend Feed */}
            <div className="flex items-center p-1 rounded-full bg-bg-surface-raised border border-theme-border shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setSocialTab('DISCOVER')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  socialTab === 'DISCOVER'
                    ? 'bg-theme-accent text-bg-base font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Compass size={12} />
                <span>Find Curators</span>
              </button>
              <button
                onClick={() => setSocialTab('FEED')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  socialTab === 'FEED'
                    ? 'bg-theme-accent text-bg-base font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <ActivityIcon size={12} />
                <span>Friend Activity ({friendsFeed.length})</span>
              </button>
            </div>
          </div>

          {socialTab === 'DISCOVER' ? (
            /* ── A. Discover Curators & Search ── */
            <div>
              {/* Inset Search Bar */}
              <div className="relative w-full mb-6">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                />
                <input
                  type="text"
                  value={friendSearch}
                  onChange={e => setFriendSearch(e.target.value)}
                  placeholder="Search curators by name or @handle…"
                  className="w-full bg-bg-surface-raised border border-theme-border rounded-full pl-9 pr-8 py-2 text-xs text-text-primary placeholder-text-muted outline-none transition-all duration-200 focus:border-theme-accent focus:ring-1 focus:ring-theme-accent-dim"
                />
                {friendSearch && (
                  <button
                    onClick={() => setFriendSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Curators Result Grid */}
              {searchedFriends.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-secondary font-sans">
                  No curators found matching &ldquo;{friendSearch}&rdquo;.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {searchedFriends.map(peer => {
                    const following = isFollowingUser(peer.username);
                    const isHovered = hoveredFriendBtn === peer.username;

                    return (
                      <div
                        key={peer.username}
                        className="p-4 rounded-xl bg-bg-surface-raised/40 hover:bg-bg-surface-raised border border-theme-border hover:border-theme-accent-border transition-all flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            href={`/user/${peer.username}`}
                            className="flex items-center gap-3 min-w-0 flex-1 group/user"
                          >
                            <div className="w-10 h-10 rounded-full bg-theme-accent-dim border border-theme-accent-border text-theme-accent flex items-center justify-center font-serif text-sm font-medium shrink-0 group-hover/user:scale-105 transition-transform">
                              {peer.initial || peer.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-text-primary truncate">
                                  {peer.displayName || peer.username}
                                </span>
                                <ArrowUpRight size={11} className="text-text-muted group-hover/user:text-theme-accent transition-colors shrink-0" />
                              </div>
                              <div className="text-[11px] text-text-secondary font-mono truncate">
                                @{peer.username}
                              </div>
                            </div>
                          </Link>

                          {/* Follow / Following Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleFollow(peer.username)}
                            onMouseEnter={() => setHoveredFriendBtn(peer.username)}
                            onMouseLeave={() => setHoveredFriendBtn(null)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 ${
                              following
                                ? isHovered
                                  ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                  : 'bg-bg-surface-raised text-text-primary border border-theme-border'
                                : 'bg-theme-accent text-bg-base hover:bg-theme-accent-hover font-semibold shadow-sm'
                            }`}
                          >
                            {following ? (isHovered ? 'Unfollow' : 'Following') : 'Follow'}
                          </button>
                        </div>

                        {peer.bio && (
                          <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                            {peer.bio}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-2 border-t border-theme-border">
                          <span>{peer.reviewsCount || peer.watched?.length || 0} logged works</span>
                          <span>{peer.followersCount || 0} followers</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ── B. Live Friends Activity Stream ── */
            <div className="flex flex-col gap-4">
              {friendsFeed.length === 0 ? (
                <div className="py-12 text-center text-xs text-text-secondary">
                  No recent reflections from friends. Follow more curators to see their journal activity.
                </div>
              ) : (
                friendsFeed.map(act => {
                  const isLiked = isActivityLiked(act.id);
                  const itemImg = getItemImage(act.contentId, act.contentType);
                  const targetUrl = `/${act.contentType === 'MOVIE' ? 'movies' : 'books'}/${act.contentId}`;

                  return (
                    <div
                      key={act.id}
                      className="p-4 rounded-xl bg-bg-surface-raised/40 border border-theme-border hover:border-theme-accent-border transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <Link
                            href={`/user/${act.user.username}`}
                            className="font-semibold text-text-primary hover:text-theme-accent transition-colors"
                          >
                            {act.user.displayName}
                          </Link>
                          <span className="text-text-muted">@{act.user.username}</span>
                          <span className="text-text-secondary">
                            {act.type === 'REVIEWED' && 'reviewed'}
                            {act.type === 'READ' && 'read'}
                            {act.type === 'WATCHED' && 'watched'}
                            {act.type === 'FAVORITED' && 'added to favourites'}
                            {act.type === 'RATED' && 'rated'}
                          </span>
                        </div>

                        {act.score && (
                          <span className="text-xs font-semibold text-theme-accent bg-theme-accent-dim px-2 py-0.5 rounded-full border border-theme-accent-border">
                            ★ {Number(act.score).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3 items-center bg-bg-surface p-2.5 rounded-lg border border-theme-border">
                        {itemImg && (
                          <Link href={targetUrl} className="w-10 aspect-[2/3] rounded overflow-hidden shrink-0 border border-theme-border">
                            <img src={itemImg} alt={act.title} className="w-full h-full object-cover" />
                          </Link>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link href={targetUrl} className="font-serif text-sm text-text-primary hover:text-theme-accent truncate block">
                            {act.title}
                          </Link>
                          <div className="text-[11px] text-text-secondary">
                            {act.creator} · {act.contentType === 'MOVIE' ? 'Film' : 'Book'}
                          </div>
                        </div>
                      </div>

                      {act.reviewSnippet && (
                        <div className="pl-3 border-l-2 border-theme-accent my-0.5">
                          <p className="font-serif italic text-xs text-text-primary leading-relaxed">
                            &ldquo;{act.reviewSnippet}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-text-muted pt-1">
                        <span>{formatLogDate(act.createdAt)}</span>
                        <button
                          onClick={() => toggleActivityLike(act.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            isLiked
                              ? 'text-theme-accent bg-theme-accent-dim border border-theme-accent-border'
                              : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
                          }`}
                        >
                          <Heart size={11} className={isLiked ? 'fill-theme-accent stroke-theme-accent' : 'stroke-current'} />
                          <span>{(act.likesCount || 0) + (isLiked ? 1 : 0)}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Quick Links to Cinema & Library */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/movies"
            className="px-5 py-2.5 rounded-full text-xs font-medium bg-bg-surface text-text-primary hover:bg-bg-surface-raised border border-theme-border hover:border-theme-accent transition-all shadow-sm flex items-center gap-2"
          >
            <Film size={13} className="text-theme-accent" />
            <span>Open Cinema Section →</span>
          </Link>
          <Link
            href="/books"
            className="px-5 py-2.5 rounded-full text-xs font-medium bg-bg-surface text-text-primary hover:bg-bg-surface-raised border border-theme-border hover:border-theme-accent transition-all shadow-sm flex items-center gap-2"
          >
            <BookOpen size={13} className="text-theme-accent" />
            <span>Open Book Section →</span>
          </Link>
          <Link
            href="/hub"
            className="px-5 py-2.5 rounded-full text-xs font-medium bg-bg-surface text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised border border-theme-border transition-all shadow-sm"
          >
            Pathway Gateway Hub →
          </Link>
        </div>

      </div>

      {/* Followers / Following Modal */}
      <FollowModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: 'FOLLOWING' })}
        type={modalState.type}
        username={u?.username || 'me'}
      />
    </div>
  );
}
