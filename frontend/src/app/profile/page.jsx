'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import {
  getUserWatched,
  getUserFavourites,
  getUserWatchlist,
  getUserRatings,
  getUserReviews,
  formatLogDate,
} from '../../lib/activityStore';
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
import EditProfileModal from '../../components/EditProfileModal';
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
  Star,
  MessageSquare,
  Bookmark,
  MapPin,
  Globe,
  Tag,
  Edit3,
  LogOut,
  Calendar,
} from 'lucide-react';

export default function Profile() {
  const [u, setU] = useState(null);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'FOLLOWING' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [hoveredFriendBtn, setHoveredFriendBtn] = useState(null);
  const [socialSubTab, setSocialSubTab] = useState('DISCOVER');
  const [activeTab, setActiveTab] = useState('WATCHED');
  const [friendsFeed, setFriendsFeed] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cloudLibrary, setCloudLibrary] = useState(null);
  const [cloudActivity, setCloudActivity] = useState([]);

  // Per-section media sub-filters (ALL | CINEMA | BOOKS)
  const [watchedFilter, setWatchedFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [favouriteFilter, setFavouriteFilter] = useState('ALL');
  const [watchlistFilter, setWatchlistFilter] = useState('ALL');
  const [activityFilter, setActivityFilter] = useState('ALL');

  // Load user data and live authentic collections
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setU(JSON.parse(stored));
      }
    } catch {}

    api('/auth/me')
      .then((x) => {
        if (x?.user) {
          setU((prev) => ({ ...prev, ...x.user }));
        }
      })
      .catch(() => {});

    // Fetch cross-device journal from cloud database
    api('/me/library')
      .then((data) => { if (data) setCloudLibrary(data); })
      .catch(() => {});

    // Fetch user's own activity from cloud
    api('/me/activity')
      .then((data) => { if (data?.items) setCloudActivity(data.items); })
      .catch(() => {});

    setFollowing(getFollowingList());
    setFollowers(getFollowersList());
    setFriendsFeed(getFriendsActivity());
  }, [refreshTrigger]);

  // Listen to profile updates & social changes
  useEffect(() => {
    const handleUpdate = () => setRefreshTrigger((p) => p + 1);
    window.addEventListener('socialUpdated', handleUpdate);
    window.addEventListener('activityUpdated', handleUpdate);
    window.addEventListener('userProfileUpdated', handleUpdate);
    return () => {
      window.removeEventListener('socialUpdated', handleUpdate);
      window.removeEventListener('activityUpdated', handleUpdate);
      window.removeEventListener('userProfileUpdated', handleUpdate);
    };
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('accessToken');
    } catch {}
    window.location.href = '/';
  };

  const handleToggleFollow = (targetUsername) => {
    toggleFollowUser(targetUsername);
    setFollowing(getFollowingList());
    setFollowers(getFollowersList());
    setRefreshTrigger((p) => p + 1);
  };

  // Helper to merge local items with cloud items (deduplicated by slug, _id, or contentId)
  const mergeItems = (localItems = [], cloudItems = []) => {
    const map = new Map();
    for (const it of cloudItems || []) {
      const idVal = it?.slug || it?._id || it?.contentId;
      if (idVal) {
        const key = String(idVal).toLowerCase().replace(/^[mb]-/, '');
        map.set(key, it);
      }
    }
    for (const it of localItems || []) {
      const idVal = it?.slug || it?._id || it?.contentId;
      if (idVal) {
        const key = String(idVal).toLowerCase().replace(/^[mb]-/, '');
        const existing = map.get(key) || {};
        map.set(key, { ...existing, ...it });
      }
    }
    return Array.from(map.values());
  };

  // Real, authentic user collections synchronized across all devices
  const allWatched = useMemo(() => {
    const local = [...getUserWatched('MOVIE'), ...getUserWatched('BOOK')];
    const cloud = cloudLibrary?.watched || [];
    const rated = (cloudLibrary?.ratings || []).map((r) => ({
      ...r,
      status: r.type === 'MOVIE' ? 'WATCHED' : 'READ',
    }));
    const reviewed = (cloudLibrary?.reviews || []).map((rv) => ({
      ...rv,
      status: rv.type === 'MOVIE' ? 'WATCHED' : 'READ',
    }));
    return mergeItems([...local, ...rated, ...reviewed], cloud);
  }, [cloudLibrary, refreshTrigger]);

  const watchedMovies = useMemo(() => allWatched.filter((it) => it.type === 'MOVIE'), [allWatched]);
  const watchedBooks = useMemo(() => allWatched.filter((it) => it.type === 'BOOK'), [allWatched]);

  const favourites = useMemo(() => {
    const local = getUserFavourites();
    const cloud = cloudLibrary?.favorites || [];
    return mergeItems(local, cloud);
  }, [cloudLibrary, refreshTrigger]);

  const allWatchlist = useMemo(() => {
    const local = [...getUserWatchlist('MOVIE'), ...getUserWatchlist('BOOK')];
    const cloud = cloudLibrary?.watchlist || [];
    return mergeItems(local, cloud);
  }, [cloudLibrary, refreshTrigger]);

  const userRatings = useMemo(() => {
    const local = getUserRatings();
    const cloud = cloudLibrary?.ratings || [];
    return mergeItems(local, cloud);
  }, [cloudLibrary, refreshTrigger]);

  const userReviews = useMemo(() => {
    const local = getUserReviews();
    const cloud = cloudLibrary?.reviews || [];
    return mergeItems(local, cloud);
  }, [cloudLibrary, refreshTrigger]);

  // Filter items by media type per-section
  const filterByMedia = (items = [], filter = 'ALL') => {
    if (filter === 'ALL') return items;
    if (filter === 'CINEMA') return items.filter((it) => it.type === 'MOVIE');
    if (filter === 'BOOKS') return items.filter((it) => it.type === 'BOOK');
    return items;
  };

  const displayedWatched = useMemo(() => filterByMedia(allWatched, watchedFilter), [allWatched, watchedFilter]);
  const displayedRatings = useMemo(() => filterByMedia(userRatings, ratingFilter), [userRatings, ratingFilter]);
  const displayedReviews = useMemo(() => filterByMedia(userReviews, reviewFilter), [userReviews, reviewFilter]);
  const displayedFavourites = useMemo(() => filterByMedia(favourites, favouriteFilter), [favourites, favouriteFilter]);
  const displayedWatchlist = useMemo(() => filterByMedia(allWatchlist, watchlistFilter), [allWatchlist, watchlistFilter]);

  // Activity: parse cloud activity items
  const allActivity = useMemo(() => {
    return (cloudActivity || []).map((act) => {
      const content = act.contentId || {};
      return {
        id: String(act._id || act.id),
        type: act.actionType || act.type,
        contentType: content.type || act.contentType,
        contentId: String(content._id || act.contentId),
        title: content.title || act.title || '',
        imageUrl: content.imageUrl || act.imageUrl || '',
        creator: (content.creatorNames?.[0] || content.authorNames?.[0] || act.creator || ''),
        score: act.score,
        reviewSnippet: act.reviewSnippet,
        createdAt: act.createdAt,
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [cloudActivity]);

  const displayedActivity = useMemo(() => filterByMedia(
    allActivity.map((a) => ({ ...a, type: a.contentType })),
    activityFilter
  ).map((a) => allActivity.find((x) => x.id === a.id) || a), [allActivity, activityFilter]);


  const searchedFriends = useMemo(() => {
    return searchUsers(friendSearch, u?.username || '');
  }, [friendSearch, u?.username, refreshTrigger]);

  const getItemImage = (contentId, contentType) => {
    const pool = contentType === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS;
    const found = pool.find((item) => item._id === contentId || item.slug === contentId);
    return found?.imageUrl || '';
  };

  // Use actual user data from DB - never fall back to generic names
  const usernameHandle = u?.username || '';
  const displayName = u?.displayName || u?.username || '';
  const userBio = u?.bio || '';
  const userAvatar = u?.avatarUrl || '';
  const userLocation = u?.location || '';
  const userWebsite = u?.website || '';
  const userGenres = Array.isArray(u?.favoriteGenres) ? u.favoriteGenres : [];

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#000000] text-[#E0E0E0] pb-24 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-theme-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-12 left-1/3 w-96 h-96 rounded-full bg-radial from-theme-accent/5 to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-12 right-1/4 w-96 h-96 rounded-full bg-radial from-theme-accent/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Top Back Link & Actions */}
        <div className="pt-8 pb-4 border-b border-theme-border mb-8 flex items-center justify-between">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            <ArrowLeft size={13} />
            <span>Back to Gateway Hub</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-theme-accent transition-colors"
            >
              <Edit3 size={13} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-red-400 transition-colors"
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* ── 1. Profile Hero Section ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-bg-surface border border-theme-border shadow-luxury mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
              {/* Avatar Preview */}
              <div className="relative w-20 sm:w-24 h-20 sm:h-24 rounded-full overflow-hidden border-2 border-theme-accent shadow-luxury shrink-0 bg-theme-accent-dim flex items-center justify-center text-theme-accent font-serif text-3xl font-semibold">
                {userAvatar ? (
                  <img src={userAvatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Names, Bio, Metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {displayName ? (
                    <h1 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary tracking-tight">
                      {displayName}
                    </h1>
                  ) : (
                    <h1 className="font-serif text-2xl sm:text-3xl font-normal text-text-muted tracking-tight italic">
                      Loading profile…
                    </h1>
                  )}
                  {usernameHandle && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-bg-surface-raised border border-theme-border text-text-secondary font-mono">
                      @{usernameHandle}
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-theme-accent-dim text-theme-accent border border-theme-accent-border uppercase tracking-widest font-mono">
                    Curator
                  </span>
                </div>

                {userBio ? (
                  <p className="text-xs text-text-secondary max-w-xl mt-2 leading-relaxed font-sans">
                    {userBio}
                  </p>
                ) : (
                  <p className="text-xs text-text-muted max-w-xl mt-2 italic">
                    No bio added yet. Click &ldquo;Edit Profile&rdquo; to express your taste and philosophy.
                  </p>
                )}

                {/* Optional Location, Website, and Genre Tags */}
                <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-text-muted">
                  {userLocation && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} className="text-theme-accent" />
                      <span>{userLocation}</span>
                    </span>
                  )}
                  {userWebsite && (
                    <a
                      href={userWebsite.startsWith('http') ? userWebsite : `https://${userWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-theme-accent transition-colors underline underline-offset-2"
                    >
                      <Globe size={11} className="text-theme-accent" />
                      <span>{userWebsite.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>

                {userGenres.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {userGenres.map((g) => (
                      <span
                        key={g}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-bg-surface-raised border border-theme-border text-text-secondary"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Social Stats & Edit Profile Pill */}
            <div className="flex flex-col sm:items-end gap-3 shrink-0 self-stretch sm:self-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-theme-border">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-5 py-2 rounded-full bg-theme-accent text-bg-base text-xs font-semibold hover:bg-theme-accent-hover transition-all shadow-sm active:scale-[0.98] self-start sm:self-end"
              >
                Edit Profile
              </button>

              <div className="flex items-center gap-5 text-xs">
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
        </div>

        {/* ── 2. Quick Stats Bento ── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          <button
            onClick={() => { setActiveTab('WATCHED'); setWatchedFilter('CINEMA'); }}
            className="p-3 rounded-xl bg-bg-surface border border-theme-border hover:border-theme-accent transition-all text-left group"
          >
            <div className="flex items-center justify-between text-[10px] text-text-secondary mb-1.5">
              <span className="group-hover:text-theme-accent transition-colors font-medium">Films</span>
              <Film size={12} className="text-theme-accent" />
            </div>
            <div className="font-serif text-xl sm:text-2xl text-text-primary">{watchedMovies.length}</div>
          </button>

          <button
            onClick={() => { setActiveTab('WATCHED'); setWatchedFilter('BOOKS'); }}
            className="p-3 rounded-xl bg-bg-surface border border-theme-border hover:border-theme-accent transition-all text-left group"
          >
            <div className="flex items-center justify-between text-[10px] text-text-secondary mb-1.5">
              <span className="group-hover:text-theme-accent transition-colors font-medium">Books</span>
              <BookOpen size={12} className="text-theme-accent" />
            </div>
            <div className="font-serif text-xl sm:text-2xl text-text-primary">{watchedBooks.length}</div>
          </button>

          <button
            onClick={() => setActiveTab('RATINGS')}
            className="p-3 rounded-xl bg-bg-surface border border-theme-border hover:border-theme-accent transition-all text-left group"
          >
            <div className="flex items-center justify-between text-[10px] text-text-secondary mb-1.5">
              <span className="group-hover:text-theme-accent transition-colors font-medium">Ratings</span>
              <Star size={12} className="text-theme-accent" />
            </div>
            <div className="font-serif text-xl sm:text-2xl text-text-primary">{userRatings.length}</div>
          </button>

          <button
            onClick={() => setActiveTab('REVIEWS')}
            className="p-3 rounded-xl bg-bg-surface border border-theme-border hover:border-theme-accent transition-all text-left group"
          >
            <div className="flex items-center justify-between text-[10px] text-text-secondary mb-1.5">
              <span className="group-hover:text-theme-accent transition-colors font-medium">Reviews</span>
              <MessageSquare size={12} className="text-theme-accent" />
            </div>
            <div className="font-serif text-xl sm:text-2xl text-text-primary">{userReviews.length}</div>
          </button>

          <button
            onClick={() => setActiveTab('FAVOURITES')}
            className="p-3 rounded-xl bg-bg-surface border border-theme-border hover:border-theme-accent transition-all text-left group"
          >
            <div className="flex items-center justify-between text-[10px] text-text-secondary mb-1.5">
              <span className="group-hover:text-theme-accent transition-colors font-medium">Favourites</span>
              <Heart size={12} className="text-theme-accent" />
            </div>
            <div className="font-serif text-xl sm:text-2xl text-text-primary">{favourites.length}</div>
          </button>

          <button
            onClick={() => setActiveTab('ACTIVITY')}
            className="p-3 rounded-xl bg-bg-surface border border-theme-border hover:border-theme-accent transition-all text-left group"
          >
            <div className="flex items-center justify-between text-[10px] text-text-secondary mb-1.5">
              <span className="group-hover:text-theme-accent transition-colors font-medium">Activity</span>
              <ActivityIcon size={12} className="text-theme-accent" />
            </div>
            <div className="font-serif text-xl sm:text-2xl text-text-primary">{allActivity.length}</div>
          </button>
        </div>

        {/* ── 3. Tab Navigation ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 pb-4 mb-6 border-b border-theme-border">
          {[
            { id: 'WATCHED', label: 'Watched / Read', count: allWatched.length },
            { id: 'RATINGS', label: 'Ratings', count: userRatings.length },
            { id: 'REVIEWS', label: 'Reviews', count: userReviews.length },
            { id: 'FAVOURITES', label: 'Favourites', count: favourites.length },
            { id: 'WATCHLIST', label: 'Watchlist / TBR', count: allWatchlist.length },
            { id: 'ACTIVITY', label: 'Activity', count: allActivity.length },
            { id: 'NETWORK', label: 'Network', count: following.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-theme-accent text-bg-base font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-bg-base/80' : 'text-text-muted'}`}>
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 4. WATCHED / READ ── */}
        {activeTab === 'WATCHED' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg text-text-primary">Watched &amp; Read</h2>
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-bg-surface-raised border border-theme-border">
                {[{ id: 'ALL', label: 'All' }, { id: 'CINEMA', label: 'Films', Icon: Film }, { id: 'BOOKS', label: 'Books', Icon: BookOpen }].map((f) => (
                  <button key={f.id} onClick={() => setWatchedFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${watchedFilter === f.id ? 'bg-theme-accent text-bg-base font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                    {f.Icon && <f.Icon size={11} />}<span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {displayedWatched.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-bg-surface border border-theme-border p-8">
                <div className="w-12 h-12 rounded-full bg-theme-accent-dim text-theme-accent flex items-center justify-center mx-auto mb-3">
                  <Film size={20} />
                </div>
                <h3 className="font-serif text-lg text-text-primary mb-1">No logged works yet</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mb-5 leading-relaxed">
                  Start logging films and books you have experienced to build your cultural diary.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/movies" className="px-4 py-2 rounded-full bg-theme-accent text-bg-base text-xs font-semibold hover:bg-theme-accent-hover transition-colors">Explore Films</Link>
                  <Link href="/books" className="px-4 py-2 rounded-full border border-theme-border text-xs text-text-secondary hover:text-text-primary transition-colors">Explore Books</Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {displayedWatched.map((item) => {
                  const isMovie = item.type === 'MOVIE';
                  const href = `/${isMovie ? 'movies' : 'books'}/${item._id || item.slug}`;
                  const score = item.userRating || (typeof window !== 'undefined' ? Number(localStorage.getItem(`rating_${item._id}`)) || null : null);
                  return (
                    <div key={item._id || item.slug} className="group flex flex-col">
                      <div className={`relative w-full aspect-[2/3] overflow-hidden bg-bg-surface border border-theme-border group-hover:border-theme-accent transition-all duration-300 shadow-luxury ${isMovie ? 'rounded-lg' : 'rounded-xl'}`}>
                        <Link href={href} className="block w-full h-full relative">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <span className="text-[10px] font-semibold bg-white text-[#121212] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md"><span>View</span><ArrowUpRight size={10} /></span>
                          </div>
                          {score > 0 && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-theme-accent/50 text-theme-accent text-[10px] font-mono font-semibold flex items-center gap-0.5">
                              <Star size={9} className="fill-theme-accent" /><span>{Number(score).toFixed(1)}</span>
                            </div>
                          )}
                        </Link>
                      </div>
                      <div className="mt-2 flex flex-col gap-0.5">
                        <Link href={href} className="font-serif text-sm text-text-primary hover:text-theme-accent truncate transition-colors">{item.title}</Link>
                        <div className="text-[11px] text-text-muted truncate">{item.year} · {isMovie ? item.creatorNames?.[0] : item.authorNames?.[0]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── 5. FAVOURITES ── */}
        {activeTab === 'FAVOURITES' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg text-text-primary">Favourites</h2>
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-bg-surface-raised border border-theme-border">
                {[{ id: 'ALL', label: 'All' }, { id: 'CINEMA', label: 'Films', Icon: Film }, { id: 'BOOKS', label: 'Books', Icon: BookOpen }].map((f) => (
                  <button key={f.id} onClick={() => setFavouriteFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${favouriteFilter === f.id ? 'bg-theme-accent text-bg-base font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                    {f.Icon && <f.Icon size={11} />}<span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {displayedFavourites.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-bg-surface border border-theme-border p-8">
                <div className="w-12 h-12 rounded-full bg-theme-accent-dim text-theme-accent flex items-center justify-center mx-auto mb-3">
                  <Heart size={20} />
                </div>
                <h3 className="font-serif text-lg text-text-primary mb-1">No favourites curated yet</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mb-5 leading-relaxed">
                  Click the heart icon on any masterpiece to pin it as a favourite.
                </p>
                <Link href="/hub" className="px-4 py-2 rounded-full bg-theme-accent text-bg-base text-xs font-semibold hover:bg-theme-accent-hover transition-colors inline-block">Browse Catalogue</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {displayedFavourites.map((item) => {
                  const isMovie = item.type === 'MOVIE';
                  const href = `/${isMovie ? 'movies' : 'books'}/${item._id || item.slug}`;
                  return (
                    <div key={item._id || item.slug} className="group flex flex-col">
                      <div className={`relative w-full aspect-[2/3] overflow-hidden bg-bg-surface border border-theme-border group-hover:border-theme-accent transition-all duration-300 shadow-luxury ${isMovie ? 'rounded-lg' : 'rounded-xl'}`}>
                        <Link href={href} className="block w-full h-full relative">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </Link>
                      </div>
                      <Link href={href} className="mt-2 font-serif text-sm text-text-primary hover:text-theme-accent truncate transition-colors">{item.title}</Link>
                      <div className="text-[11px] text-text-muted truncate mt-0.5">{item.year} · {isMovie ? item.creatorNames?.[0] : item.authorNames?.[0]}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Watchlist / TBR ── */}
        {activeTab === 'WATCHLIST' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg text-text-primary">Watchlist &amp; TBR</h2>
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-bg-surface-raised border border-theme-border">
                {[{ id: 'ALL', label: 'All' }, { id: 'CINEMA', label: 'Films', Icon: Film }, { id: 'BOOKS', label: 'Books', Icon: BookOpen }].map((f) => (
                  <button key={f.id} onClick={() => setWatchlistFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${watchlistFilter === f.id ? 'bg-theme-accent text-bg-base font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                    {f.Icon && <f.Icon size={11} />}<span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {displayedWatchlist.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-bg-surface border border-theme-border p-8">
                <div className="w-12 h-12 rounded-full bg-theme-accent-dim text-theme-accent flex items-center justify-center mx-auto mb-3"><Bookmark size={20} /></div>
                <h3 className="font-serif text-lg text-text-primary mb-1">Watchlist &amp; TBR is empty</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mb-5 leading-relaxed">Save works you intend to watch or read next.</p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/movies" className="px-4 py-2 rounded-full bg-theme-accent text-bg-base text-xs font-semibold hover:bg-theme-accent-hover transition-colors">Browse Cinema</Link>
                  <Link href="/books" className="px-4 py-2 rounded-full border border-theme-border text-xs text-text-secondary hover:text-text-primary transition-colors">Browse Books</Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {displayedWatchlist.map((item) => {
                  const isMovie = item.type === 'MOVIE';
                  const href = `/${isMovie ? 'movies' : 'books'}/${item._id || item.slug}`;
                  return (
                    <div key={item._id || item.slug} className="group flex flex-col">
                      <div className={`relative w-full aspect-[2/3] overflow-hidden bg-bg-surface border border-theme-border group-hover:border-theme-accent transition-all duration-300 shadow-luxury ${isMovie ? 'rounded-lg' : 'rounded-xl'}`}>
                        <Link href={href} className="block w-full h-full relative">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </Link>
                      </div>
                      <Link href={href} className="mt-2 font-serif text-sm text-text-primary hover:text-theme-accent truncate transition-colors">{item.title}</Link>
                      <div className="text-[11px] text-text-muted truncate mt-0.5">{item.year} · {isMovie ? item.creatorNames?.[0] : item.authorNames?.[0]}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Ratings ── */}
        {activeTab === 'RATINGS' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg text-text-primary">My Ratings</h2>
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-bg-surface-raised border border-theme-border">
                {[{ id: 'ALL', label: 'All' }, { id: 'CINEMA', label: 'Films', Icon: Film }, { id: 'BOOKS', label: 'Books', Icon: BookOpen }].map((f) => (
                  <button key={f.id} onClick={() => setRatingFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${ratingFilter === f.id ? 'bg-theme-accent text-bg-base font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                    {f.Icon && <f.Icon size={11} />}<span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {displayedRatings.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-bg-surface border border-theme-border p-8">
                <div className="w-12 h-12 rounded-full bg-theme-accent-dim text-theme-accent flex items-center justify-center mx-auto mb-3"><Star size={20} /></div>
                <h3 className="font-serif text-lg text-text-primary mb-1">No rated works yet</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mb-5 leading-relaxed">Rate films and books to record your impressions.</p>
                <Link href="/hub" className="px-4 py-2 rounded-full bg-theme-accent text-bg-base text-xs font-semibold hover:bg-theme-accent-hover transition-colors inline-block">Explore Works to Rate</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {displayedRatings.map((item) => {
                  const isMovie = item.type === 'MOVIE';
                  const href = `/${isMovie ? 'movies' : 'books'}/${item._id || item.slug || item.contentId}`;
                  const poster = item.imageUrl || getItemImage(item._id || item.contentId, item.type);
                  const score = item.userRating || item.score;
                  return (
                    <div key={item._id || item.contentId} className="group flex flex-col">
                      <div className="relative w-full aspect-[2/3] overflow-hidden bg-bg-surface border border-theme-border group-hover:border-theme-accent transition-all duration-300 shadow-luxury rounded-lg">
                        <Link href={href} className="block w-full h-full relative">
                          {poster ? <img src={poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">No Cover</div>}
                          {score && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-theme-accent/50 text-theme-accent text-[10px] font-mono font-semibold flex items-center gap-0.5">
                              <Star size={9} className="fill-theme-accent" /><span>{Number(score).toFixed(1)}</span>
                            </div>
                          )}
                        </Link>
                      </div>
                      <Link href={href} className="mt-2 font-serif text-sm text-text-primary hover:text-theme-accent truncate transition-colors">{item.title}</Link>
                      <div className="text-[11px] text-text-muted truncate mt-0.5">{item.year || (isMovie ? 'Film' : 'Book')}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Reviews ── */}
        {activeTab === 'REVIEWS' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg text-text-primary">My Reviews</h2>
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-bg-surface-raised border border-theme-border">
                {[{ id: 'ALL', label: 'All' }, { id: 'CINEMA', label: 'Films', Icon: Film }, { id: 'BOOKS', label: 'Books', Icon: BookOpen }].map((f) => (
                  <button key={f.id} onClick={() => setReviewFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${reviewFilter === f.id ? 'bg-theme-accent text-bg-base font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                    {f.Icon && <f.Icon size={11} />}<span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {displayedReviews.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-bg-surface border border-theme-border p-8">
                <div className="w-12 h-12 rounded-full bg-theme-accent-dim text-theme-accent flex items-center justify-center mx-auto mb-3"><MessageSquare size={20} /></div>
                <h3 className="font-serif text-lg text-text-primary mb-1">No written reviews yet</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mb-5 leading-relaxed">Share your reflections on works you have experienced.</p>
                <Link href="/hub" className="px-4 py-2 rounded-full bg-theme-accent text-bg-base text-xs font-semibold hover:bg-theme-accent-hover transition-colors inline-block">Explore Works to Review</Link>
              </div>
            ) : (
              <div className="max-w-3xl flex flex-col gap-4">
                {displayedReviews.map((rev) => {
                  const isMovie = rev.type === 'MOVIE';
                  const href = `/${isMovie ? 'movies' : 'books'}/${rev._id || rev.slug || rev.contentId}`;
                  const poster = rev.imageUrl || getItemImage(rev._id || rev.contentId, rev.type);
                  return (
                    <div key={rev._id || rev.reviewId || rev.contentId} className="p-5 rounded-xl bg-bg-surface border border-theme-border hover:border-theme-accent transition-all flex gap-4">
                      {poster && (
                        <Link href={href} className="w-14 h-20 rounded-lg overflow-hidden shrink-0 border border-theme-border shadow-sm hidden sm:block">
                          <img src={poster} alt={rev.title} className="w-full h-full object-cover" />
                        </Link>
                      )}
                      <div className="flex-1 flex flex-col gap-2 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <Link href={href} className="font-serif text-base text-text-primary hover:text-theme-accent truncate">{rev.title}</Link>
                          {(rev.rating || rev.userRating) && (
                            <span className="text-xs font-semibold text-theme-accent bg-theme-accent-dim px-2 py-0.5 rounded-full border border-theme-accent-border flex items-center gap-1 shrink-0 font-mono">
                              <Star size={10} className="fill-theme-accent" /><span>{Number(rev.rating || rev.userRating).toFixed(1)}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border ${isMovie ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'}`}>{isMovie ? 'Film' : 'Book'}</span>
                          {rev.year && <span>{rev.year}</span>}
                        </div>
                        {rev.reviewTitle && rev.reviewTitle !== rev.title && (
                          <h4 className="text-xs font-semibold text-text-primary font-serif tracking-wide">&ldquo;{rev.reviewTitle}&rdquo;</h4>
                        )}
                        {rev.reviewBody && (
                          <p className="text-xs text-text-secondary leading-relaxed font-sans pl-3 border-l-2 border-theme-accent italic line-clamp-3">{rev.reviewBody}</p>
                        )}
                        <div className="text-[10px] text-text-muted font-mono flex items-center justify-between pt-1">
                          <span>{formatLogDate(rev.createdAt)}</span>
                          <Link href={href} className="text-theme-accent hover:underline">View Work →</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Activity ── */}
        {activeTab === 'ACTIVITY' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg text-text-primary">My Activity</h2>
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-bg-surface-raised border border-theme-border">
                {[{ id: 'ALL', label: 'All' }, { id: 'CINEMA', label: 'Films', Icon: Film }, { id: 'BOOKS', label: 'Books', Icon: BookOpen }].map((f) => (
                  <button key={f.id} onClick={() => setActivityFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${activityFilter === f.id ? 'bg-theme-accent text-bg-base font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                    {f.Icon && <f.Icon size={11} />}<span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {displayedActivity.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-bg-surface border border-theme-border p-8">
                <div className="w-12 h-12 rounded-full bg-theme-accent-dim text-theme-accent flex items-center justify-center mx-auto mb-3"><ActivityIcon size={20} /></div>
                <h3 className="font-serif text-lg text-text-primary mb-1">No activity recorded yet</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mb-5 leading-relaxed">Your ratings, reviews, and logging actions will appear here.</p>
                <Link href="/hub" className="px-4 py-2 rounded-full bg-theme-accent text-bg-base text-xs font-semibold hover:bg-theme-accent-hover transition-colors inline-block">Start Exploring</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {displayedActivity.map((act) => {
                  const isMovie = act.contentType === 'MOVIE';
                  const targetUrl = `/${isMovie ? 'movies' : 'books'}/${act.contentId}`;
                  const actionLabel = { WATCHED: 'watched', READ: 'read', REVIEWED: 'reviewed', RATED: 'rated', FAVORITED: 'added to favourites', LIKED: 'liked', WATCHLIST: 'added to watchlist', WANT_TO_READ: 'added to TBR' }[act.type] || act.type?.toLowerCase();
                  return (
                    <div key={act.id} className="p-4 rounded-xl bg-bg-surface border border-theme-border hover:border-theme-accent-border transition-all flex gap-4 items-start">
                      {act.imageUrl && (
                        <Link href={targetUrl} className="w-10 aspect-[2/3] rounded overflow-hidden shrink-0 border border-theme-border">
                          <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" />
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link href={targetUrl} className="font-serif text-sm text-text-primary hover:text-theme-accent truncate block">{act.title}</Link>
                            <div className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border ${isMovie ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'}`}>{isMovie ? 'Film' : 'Book'}</span>
                              {actionLabel && <span className="text-text-muted">{actionLabel}</span>}
                            </div>
                          </div>
                          {act.score && (
                            <span className="text-xs font-semibold text-theme-accent bg-theme-accent-dim px-2 py-0.5 rounded-full border border-theme-accent-border flex items-center gap-1 shrink-0 font-mono">
                              <Star size={10} className="fill-theme-accent" /><span>{Number(act.score).toFixed(1)}</span>
                            </span>
                          )}
                        </div>
                        {act.reviewSnippet && (
                          <p className="text-xs text-text-secondary italic mt-1.5 pl-3 border-l-2 border-theme-accent line-clamp-2">&ldquo;{act.reviewSnippet}&rdquo;</p>
                        )}
                        <div className="text-[10px] text-text-muted font-mono mt-2">{formatLogDate(act.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'NETWORK' && (
          <div className="bg-bg-surface border border-theme-border rounded-2xl p-6 sm:p-7 shadow-luxury">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} className="text-theme-accent" />
                  <h2 className="font-serif text-xl sm:text-2xl text-text-primary font-normal tracking-tight">
                    Taste Network & Curators
                  </h2>
                </div>
                <p className="text-xs text-text-secondary">
                  Discover cultural peers, follow their journals, and view their real-time reflections.
                </p>
              </div>

              {/* Sub-tabs: Discover vs Friend Activity */}
              <div className="flex items-center p-1 rounded-full bg-bg-surface-raised border border-theme-border shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setSocialSubTab('DISCOVER')}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    socialSubTab === 'DISCOVER'
                      ? 'bg-theme-accent text-bg-base font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Compass size={12} />
                  <span>Find Curators</span>
                </button>
                <button
                  onClick={() => setSocialSubTab('FEED')}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    socialSubTab === 'FEED'
                      ? 'bg-theme-accent text-bg-base font-semibold shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <ActivityIcon size={12} />
                  <span>Friend Activity ({friendsFeed.length})</span>
                </button>
              </div>
            </div>

            {socialSubTab === 'DISCOVER' ? (
              <div>
                {/* Search Bar */}
                <div className="relative w-full mb-6">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                  />
                  <input
                    type="text"
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    placeholder="Search curators by name, @handle, or bio keywords…"
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

                {/* Curator Cards Grid */}
                {searchedFriends.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-secondary font-sans">
                    No curators found matching &ldquo;{friendSearch}&rdquo;.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchedFriends.map((peer) => {
                      const isFollowed = isFollowingUser(peer.username);
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
                                  <ArrowUpRight
                                    size={11}
                                    className="text-text-muted group-hover/user:text-theme-accent transition-colors shrink-0"
                                  />
                                </div>
                                <div className="text-[11px] text-text-secondary font-mono truncate">
                                  @{peer.username}
                                </div>
                              </div>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleToggleFollow(peer.username)}
                              onMouseEnter={() => setHoveredFriendBtn(peer.username)}
                              onMouseLeave={() => setHoveredFriendBtn(null)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 ${
                                isFollowed
                                  ? isHovered
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-bg-surface-raised text-text-primary border border-theme-border'
                                  : 'bg-theme-accent text-bg-base hover:bg-theme-accent-hover font-semibold shadow-sm'
                              }`}
                            >
                              {isFollowed ? (isHovered ? 'Unfollow' : 'Following') : 'Follow'}
                            </button>
                          </div>

                          {peer.bio && (
                            <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                              {peer.bio}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-text-muted font-mono pt-2 border-t border-theme-border">
                            <span>{peer.reviewsCount || 0} reviews logged</span>
                            <span>{peer.followersCount || (isFollowed ? 1 : 0)} followers</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Live Friend Activity Stream */
              <div className="flex flex-col gap-4">
                {friendsFeed.length === 0 ? (
                  <div className="py-12 text-center text-xs text-text-secondary">
                    No recent reflections from followed curators. Follow more peers to view their activities.
                  </div>
                ) : (
                  friendsFeed.map((act) => {
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
                            <Link
                              href={targetUrl}
                              className="w-10 aspect-[2/3] rounded overflow-hidden shrink-0 border border-theme-border"
                            >
                              <img src={itemImg} alt={act.title} className="w-full h-full object-cover" />
                            </Link>
                          )}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={targetUrl}
                              className="font-serif text-sm text-text-primary hover:text-theme-accent truncate block"
                            >
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
                            <Heart
                              size={11}
                              className={isLiked ? 'fill-theme-accent stroke-theme-accent' : 'stroke-current'}
                            />
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
        )}
      </div>

      {/* Followers / Following Modal */}
      <FollowModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: 'FOLLOWING' })}
        type={modalState.type}
        username={u?.username || 'curator'}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={u}
        onSave={(updated) => {
          setU(updated);
          setRefreshTrigger((p) => p + 1);
        }}
      />
    </div>
  );
}
