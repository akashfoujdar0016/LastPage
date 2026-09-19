'use client';

import { use, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  Star,
  Check,
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Film,
  Award,
  Sparkles,
  MessageSquare,
  ArrowUpRight,
  Share2,
} from 'lucide-react';
import { api, getToken } from '../lib/api';
import { CURATED_MOVIES, CURATED_BOOKS } from '../lib/curatedCatalogue';
import { recordActivity, formatLogDate } from '../lib/activityStore';

export default function Detail({ type, params }) {
  const { id } = use(params);
  const isMovie = type === 'MOVIE';

  const curatedFallback = useMemo(() => {
    return [...CURATED_MOVIES, ...CURATED_BOOKS].find(
      (item) => item._id === id || String(item.title).toLowerCase().replace(/[^a-z0-9]+/g, '-') === id
    );
  }, [id]);

  const [d, setD] = useState(curatedFallback ? { content: curatedFallback, reviews: [] } : null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [loggedStatus, setLoggedStatus] = useState('');
  const [loggedDate, setLoggedDate] = useState('');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  async function load() {
    try {
      const data = await api(`/content/${id}`);
      if (data?.content) setD(data);
    } catch {}
  }

  useEffect(() => {
    load();
    try {
      setLiked(localStorage.getItem(`like_${id}`) === 'true');
      setFavorited(localStorage.getItem(`fav_${id}`) === 'true');
      setLoggedStatus(localStorage.getItem(`status_${id}`) || '');
      const savedDate = localStorage.getItem(`logged_date_${id}`);
      setLoggedDate(savedDate || '');
      const savedRating = localStorage.getItem(`rating_${id}`);
      if (savedRating) setRating(Number(savedRating));
    } catch {}
  }, [id]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2400);
  };

  const c = d?.content || curatedFallback;
  const creator = c?.director || c?.creatorNames?.[0] || c?.author || c?.authorNames?.[0] || 'Unknown';

  const handleStatus = async (status) => {
    setLoggedStatus(status);
    const dateStr = new Date().toISOString();
    try {
      localStorage.setItem(`status_${id}`, status);
      if (status === 'WATCHED' || status === 'READ') {
        localStorage.setItem(`logged_date_${id}`, dateStr);
        setLoggedDate(dateStr);
        recordActivity({
          type: status,
          contentId: id,
          contentType: isMovie ? 'MOVIE' : 'BOOK',
          title: c?.title || 'Unknown',
          creator,
        });
      }
    } catch {}

    showToast(
      isMovie
        ? status === 'WATCHED' ? 'Marked as watched' : 'Added to watchlist'
        : status === 'READ' ? 'Marked as read' : 'Added to reading list'
    );
    try {
      if (getToken()) {
        await api(`/content/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) });
      }
    } catch {}
  };

  const handleDateChange = (newDateVal) => {
    if (!newDateVal) return;
    const iso = new Date(newDateVal).toISOString();
    setLoggedDate(iso);
    try {
      localStorage.setItem(`logged_date_${id}`, iso);
    } catch {}
    setIsEditingDate(false);
    showToast('Log date updated');
  };

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    try {
      localStorage.setItem(`like_${id}`, String(next));
      if (next) {
        recordActivity({
          type: 'LIKED',
          contentId: id,
          contentType: isMovie ? 'MOVIE' : 'BOOK',
          title: c?.title || 'Unknown',
          creator,
        });
      }
    } catch {}
    showToast(next ? 'Liked' : 'Removed from liked');
    try {
      if (getToken()) await api(`/content/${id}/like`, { method: 'POST' });
    } catch {}
  };

  const handleFavorite = async () => {
    const next = !favorited;
    setFavorited(next);
    try {
      localStorage.setItem(`fav_${id}`, String(next));
      if (next) {
        recordActivity({
          type: 'FAVORITED',
          contentId: id,
          contentType: isMovie ? 'MOVIE' : 'BOOK',
          title: c?.title || 'Unknown',
          creator,
        });
      }
    } catch {}
    showToast(next ? 'Added to favourites' : 'Removed from favourites');
    try {
      if (getToken()) await api(`/content/${id}/favorite`, { method: 'POST' });
    } catch {}
  };

  const handleSetStarRating = async (score) => {
    setRating(score);
    try {
      localStorage.setItem(`rating_${id}`, String(score));
      recordActivity({
        type: 'RATED',
        contentId: id,
        contentType: isMovie ? 'MOVIE' : 'BOOK',
        title: c?.title || 'Unknown',
        creator,
        score,
      });
    } catch {}
    showToast(`Rated ★ ${score.toFixed(1)}`);
    try {
      if (getToken()) {
        await api(`/content/${id}/rating`, { method: 'POST', body: JSON.stringify({ score }) });
        load();
      }
    } catch {}
  };

  const handlePublishReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    const newRev = {
      _id: 'rev-' + Date.now(),
      title: reviewTitle.trim() || undefined,
      body: reviewText.trim(),
      rating: rating > 0 ? rating : undefined,
      userId: { displayName: 'You' },
      createdAt: new Date().toISOString(),
    };
    setD((prev) => (prev ? { ...prev, reviews: [newRev, ...(prev.reviews || [])] } : prev));
    try {
      recordActivity({
        type: 'REVIEWED',
        contentId: id,
        contentType: isMovie ? 'MOVIE' : 'BOOK',
        title: c?.title || 'Unknown',
        creator,
        reviewSnippet: reviewText.trim().slice(0, 100),
      });
    } catch {}
    setReviewTitle('');
    setReviewText('');
    showToast('Review published to your journal');
    try {
      if (getToken()) {
        await api(`/content/${id}/reviews`, {
          method: 'POST',
          body: JSON.stringify({ body: reviewText, spoiler: false }),
        });
        load();
      }
    } catch {}
  };

  if (!d && !curatedFallback) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-base flex items-center justify-center text-xs text-text-muted">
        Loading review record…
      </div>
    );
  }

  const isWatched = loggedStatus === 'WATCHED' || loggedStatus === 'READ';
  const isWatchlist = loggedStatus === 'WATCHLIST' || loggedStatus === 'WANT_TO_READ';
  const activeRating = hoverRating || rating;
  const ratingVal = Number(c?.averageRating || 0);
  const ratingCount = Number(c?.ratingCount || 0);
  const runtimeOrPages = isMovie
    ? (c?.runtime ? `${c.runtime} min` : '—')
    : (c?.pages ? `${c.pages} pages` : '—');
  const ratingDistribution = c?.ratingBreakdown || null;

  return (
    <div className="min-h-screen bg-[#000000] text-[#E0E0E0] pb-32 relative overflow-hidden">
      
      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-bg-surface/95 backdrop-blur-md border border-theme-accent/40 text-xs text-text-primary shadow-luxury animate-fade-in flex items-center gap-2">
          <Check size={13} className="text-theme-accent" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── FULL-BLEED BACKDROP HEADER WITH GRADIENT FADING ── */}
      <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] overflow-hidden bg-black">
        <img
          src={c?.backdropUrl || c?.imageUrl}
          alt={c?.title}
          className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.08]"
        />
        {/* Cinematic multi-layered gradient fades into base background */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"
          style={{
            background: 'linear-gradient(to top, #000000 0%, rgba(0,0,0,0.7) 60%, transparent 100%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-theme-accent/5 via-transparent to-transparent pointer-events-none" />

        {/* Floating Top Navigation Breadcrumbs */}
        <div className="absolute top-6 inset-x-0 max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between z-20">
          <Link
            href={isMovie ? '/movies' : '/books'}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-xs font-medium text-white transition-all shadow-md"
          >
            <ArrowLeft size={13} />
            <span>{isMovie ? 'Back to Cinema' : 'Back to Library'}</span>
          </Link>

          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-theme-accent bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-theme-accent-border">
            {isMovie ? 'Cinema Archive' : 'Literary Archive'}
          </span>
        </div>

        {/* Hero Title and Metadata Overlay */}
        <div className="absolute bottom-8 inset-x-0 max-w-7xl mx-auto px-6 md:px-12 z-20">
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-white/10 text-white border border-white/20"
            >
              {isMovie ? 'Film Review' : 'Book Review'}
            </span>
            <span className="text-zinc-300 text-xs font-mono">
              {c?.year} · {runtimeOrPages}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-[1.08] tracking-tight text-balance">
            {c?.title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-200 mt-1.5 font-medium">
            By <span className="text-white">{creator}</span>
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER: SPLIT-COLUMN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

          {/* ── LEFT COLUMN: STICKY METADATA PANEL & DUAL-MEDIA STATS (5 cols) ── */}
          <div className="lg:col-span-5 max-w-md mx-auto lg:mx-0 w-full flex flex-col gap-6">
            
            {/* High-Resolution Artwork Container */}
            <div
              className={`relative w-full aspect-[2/3] overflow-hidden bg-bg-surface border border-theme-border shadow-luxury transition-all ${
                isMovie
                  ? 'rounded-2xl'
                  : 'rounded-2xl shadow-book-spine'
              }`}
            >
              {c?.imageUrl ? (
                <img
                  src={c.imageUrl}
                  alt={c.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-bg-surface">
                  <div className="font-serif text-2xl text-text-primary mb-2">{c?.title}</div>
                  <div className="text-xs text-text-secondary">{creator}</div>
                </div>
              )}

              {/* Book Spine Emboss Effect */}
              {!isMovie && (
                <div className="absolute inset-y-0 left-0 w-4 pointer-events-none bg-gradient-to-r from-white/20 via-white/5 to-transparent mix-blend-overlay z-10" />
              )}
            </div>

            {/* Like & Favourite Quick Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleLike}
                className={`py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 border ${
                  liked
                    ? 'bg-red-500/90 text-white border-red-400 shadow-md'
                    : 'bg-bg-surface hover:bg-bg-surface-raised text-text-secondary hover:text-text-primary border-theme-border hover:border-theme-border-strong'
                }`}
              >
                <Heart size={13} className={liked ? 'fill-white stroke-white' : 'stroke-current'} />
                <span>{liked ? 'Liked' : 'Like'}</span>
              </button>

              <button
                onClick={handleFavorite}
                className={`py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 border ${
                  favorited
                    ? 'bg-theme-accent text-bg-base font-semibold border-theme-accent shadow-md'
                    : 'bg-bg-surface hover:bg-bg-surface-raised text-text-secondary hover:text-text-primary border-theme-border hover:border-theme-border-strong'
                }`}
              >
                <Star size={13} className={favorited ? 'fill-current stroke-current' : 'stroke-current'} />
                <span>{favorited ? 'Favourite ✓' : 'Favourite'}</span>
              </button>
            </div>

            {/* ── DUAL-MEDIA STATS & METADATA PANEL (STICKY) ── */}
            <div className="bg-bg-surface/90 backdrop-blur-md border border-theme-border rounded-2xl p-6 flex flex-col gap-4 text-xs shadow-luxury">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                <span className="font-semibold text-text-primary tracking-wide text-sm font-serif">
                  Technical Specifications
                </span>
                <span className="text-[10px] text-theme-accent uppercase tracking-widest font-mono">
                  Verified Data
                </span>
              </div>

              {/* Dual-Media Stats: Runtime / Pages & Rating */}
              <div className="grid grid-cols-2 gap-3 py-1">
                <div className="bg-bg-surface-raised border border-theme-border-subtle rounded-xl p-3 flex flex-col">
                  <span className="text-[11px] text-text-secondary flex items-center gap-1.5 mb-1">
                    {isMovie ? <Clock size={12} className="text-theme-accent" /> : <BookOpen size={12} className="text-theme-accent" />}
                    <span>{isMovie ? 'Runtime' : 'Page Count'}</span>
                  </span>
                  <span className="font-serif text-lg text-text-primary font-medium">
                    {runtimeOrPages}
                  </span>
                </div>

                <div className="bg-bg-surface-raised border border-theme-border-subtle rounded-xl p-3 flex flex-col">
                  <span className="text-[11px] text-text-secondary flex items-center gap-1.5 mb-1">
                    <Star size={12} className="text-theme-accent" />
                    <span>Average Rating</span>
                  </span>
                  <span className="font-serif text-lg text-theme-accent font-medium">
                    {ratingVal > 0 ? `★ ${ratingVal.toFixed(1)}` : 'Unrated'}
                  </span>
                </div>
              </div>

              {/* Metadata Key-Value List */}
              <div className="flex flex-col gap-2.5 pt-1 text-xs">
                {[
                  { label: 'Medium', value: isMovie ? 'Cinematic Film' : 'Literary Work' },
                  { label: isMovie ? 'Director' : 'Author', value: creator },
                  { label: 'Release Year', value: c?.year ? `${c.year}` : '—' },
                  { label: 'Community Rating', value: ratingVal > 0 ? `★ ${ratingVal.toFixed(1)} / 5.0` : 'Unrated', highlight: ratingVal > 0 },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-baseline gap-4">
                    <span className="text-text-secondary">{row.label}</span>
                    <span className={`font-medium truncate text-right max-w-[65%] ${row.highlight ? 'text-theme-accent font-semibold' : 'text-text-primary'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RATING BREAKDOWN ── */}
            <div className="bg-bg-surface/90 backdrop-blur-md border border-theme-border rounded-2xl p-6 flex flex-col gap-3 shadow-luxury">
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-serif text-sm text-text-primary font-semibold">
                  Rating Breakdown
                </span>
                <span className="text-[11px] text-theme-accent font-mono">
                  {ratingCount > 0 ? `${ratingCount} ratings` : '0 ratings'}
                </span>
              </div>

              {ratingCount > 0 && ratingDistribution ? (
                <div className="flex flex-col gap-2 pt-1">
                  {[5, 4, 3, 2, 1].map((starVal) => {
                    const percentage = ratingDistribution[starVal] || 0;
                    return (
                      <div key={starVal} className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 w-8 text-text-secondary font-mono text-[11px]">
                          <span>{starVal}</span>
                          <Star size={10} className="fill-theme-accent stroke-theme-accent" />
                        </div>

                        {/* Progress Bar Track */}
                        <div className="flex-1 h-2 bg-bg-surface-raised rounded-full overflow-hidden relative border border-theme-border-subtle">
                          <div
                            className="h-full bg-theme-accent rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <span className="w-9 text-right font-mono text-[11px] text-text-secondary">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-text-muted py-2">
                  No community ratings recorded yet. Log your personal rating above.
                </p>
              )}
            </div>

          </div>

          {/* ── RIGHT COLUMN: EDITORIAL TYPOGRAPHY & INTERACTIVE REVIEW (7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2">
              {(c?.genres || []).map((g) => (
                <span
                  key={g}
                  className="px-3.5 py-1 rounded-full text-xs font-medium text-text-secondary bg-bg-surface border border-theme-border"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* ── MERGED SYNOPSIS & EDITORIAL DEEP-DIVE ── */}
            {(c?.description || c?.editorialReview) && (
              <div className="bg-bg-surface/90 backdrop-blur-md border border-theme-border rounded-2xl p-7 flex flex-col gap-4 shadow-luxury">
                <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg text-text-primary font-normal">
                      Curatorial Insight
                    </span>
                  </div>
                </div>

                {c?.description && (
                  <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed font-normal mb-1">
                    {c.description}
                  </p>
                )}


                {c?.editorialReview && (
                  <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed font-normal">
                    {c.editorialReview}
                  </p>
                )}
              </div>
            )}

            {/* Status Check & Log Date Section */}
            <div className="p-6 rounded-2xl bg-bg-surface/90 border border-theme-border flex flex-col gap-4 shadow-luxury">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleStatus(isMovie ? 'WATCHED' : 'READ')}
                  className={`px-6 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
                    isWatched
                      ? 'btn-highlight'
                      : 'bg-bg-surface-raised text-text-primary hover:border-white/30 hover:bg-white/[0.04] border border-theme-border active:scale-[0.99]'
                  }`}
                >
                  <Check size={13} strokeWidth={2.5} />
                  <span>
                    {isMovie
                      ? (isWatched ? 'Watched ✓' : 'Mark as watched')
                      : (isWatched ? 'Read ✓' : 'Mark as read')}
                  </span>
                </button>

                <button
                  onClick={() => handleStatus(isMovie ? 'WATCHLIST' : 'WANT_TO_READ')}
                  className={`px-5 py-2.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                    isWatchlist
                      ? 'bg-theme-accent-dim border-theme-accent text-theme-accent'
                      : 'border-theme-border text-text-secondary hover:text-text-primary bg-bg-surface-subtle hover:bg-bg-surface'
                  }`}
                >
                  {isMovie ? '+ Add to watchlist' : '+ Add to reading list'}
                </button>
              </div>

              {/* Log Date Tracker */}
              {isWatched && loggedDate && (
                <div className="flex items-center gap-2.5 text-xs text-text-secondary flex-wrap pt-2 border-t border-theme-border">
                  <Calendar size={13} className="text-theme-accent" />
                  <span>
                    {isMovie ? 'Watched on' : 'Read on'} {formatLogDate(loggedDate)}
                  </span>
                  {!isEditingDate ? (
                    <button
                      onClick={() => setIsEditingDate(true)}
                      className="text-[11px] text-text-muted hover:text-text-primary underline ml-1"
                    >
                      Change date
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 ml-1">
                      <input
                        type="date"
                        defaultValue={new Date(loggedDate).toISOString().split('T')[0]}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="bg-bg-surface-raised border border-theme-border rounded-lg px-2.5 py-1 text-xs text-text-primary outline-none"
                      />
                      <button
                        onClick={() => setIsEditingDate(false)}
                        className="text-[11px] text-text-muted hover:text-text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── INTERACTIVE 5-STAR RATING WIDGET (0.5 INCREMENTS) ── */}
            <div className="bg-bg-surface/90 backdrop-blur-md border border-theme-border rounded-2xl p-6 flex items-center justify-between gap-4 shadow-luxury">
              <div>
                <p className="text-xs text-text-secondary mb-2.5 font-medium uppercase tracking-wider">
                  Your Personal Rating
                </p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starIndex) => {
                    const isFull = activeRating >= starIndex;
                    const isHalf = !isFull && activeRating >= starIndex - 0.5;
                    return (
                      <div
                        key={starIndex}
                        className="relative w-7 h-7 cursor-pointer"
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        {/* Left half trigger */}
                        <div
                          className="absolute inset-y-0 left-0 w-1/2 z-10"
                          onMouseEnter={() => setHoverRating(starIndex - 0.5)}
                          onClick={() => handleSetStarRating(starIndex - 0.5)}
                        />
                        {/* Right half trigger */}
                        <div
                          className="absolute inset-y-0 right-0 w-1/2 z-10"
                          onMouseEnter={() => setHoverRating(starIndex)}
                          onClick={() => handleSetStarRating(starIndex)}
                        />
                        {/* Base Star */}
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          className={`transition-colors duration-150 ${
                            isFull
                              ? 'fill-theme-accent stroke-theme-accent'
                              : 'fill-none stroke-theme-border-strong'
                          }`}
                          strokeWidth="1.5"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {/* Half star clip */}
                        {isHalf && (
                          <div className="absolute inset-0 w-1/2 overflow-hidden pointer-events-none">
                            <svg
                              width="26"
                              height="26"
                              viewBox="0 0 24 24"
                              className="fill-theme-accent stroke-theme-accent"
                              strokeWidth="1.5"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {rating > 0 && (
                <div className="text-right">
                  <div className="text-lg font-semibold text-theme-accent leading-none mb-1">
                    ★ {rating.toFixed(1)}
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    Logged to journal
                  </div>
                </div>
              )}
            </div>



            {/* ── WRITE A JOURNAL REVIEW FORM ── */}
            <form onSubmit={handlePublishReview} className="bg-bg-surface/90 border border-theme-border rounded-2xl p-7 flex flex-col gap-4 shadow-luxury">
              <div className="flex justify-between items-baseline">
                <label className="font-serif text-xl font-normal text-text-primary">
                  Write Your Reflection
                </label>
                <span className="text-[11px] text-text-muted font-mono">
                  {formatLogDate(new Date())}
                </span>
              </div>

              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Review heading (optional)"
                className="w-full bg-bg-surface-raised border border-theme-border rounded-xl px-4 py-3 text-xs text-text-primary placeholder-text-muted outline-none transition-all duration-200 focus:border-theme-accent focus:ring-1 focus:ring-theme-accent-dim"
              />

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your personal reflections on this work… How did it make you feel? What lingered after the final scene or page?"
                rows={4}
                className="w-full bg-bg-surface-raised border border-theme-border rounded-xl p-4 text-xs text-text-primary placeholder-text-muted outline-none transition-all duration-200 focus:border-theme-accent focus:ring-1 focus:ring-theme-accent-dim resize-y leading-relaxed"
              />

              <button
                type="submit"
                className="btn-highlight self-start px-6 py-2.5 rounded-full text-xs font-semibold"
              >
                Publish Review →
              </button>
            </form>

            {/* ── COMMUNITY & JOURNAL REVIEWS STREAM ── */}
            <section className="flex flex-col gap-4">
              <h3 className="font-serif text-2xl font-normal text-text-primary">
                Member Reviews
              </h3>

              <div className="flex flex-col gap-4">
                {d.reviews && d.reviews.length > 0 ? (
                  d.reviews.map((r) => (
                    <div
                      key={r._id}
                      className="bg-bg-surface/80 backdrop-blur-md border border-theme-border rounded-2xl p-6 transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-baseline mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-base text-text-primary">
                            {r.userId?.displayName || 'You'}
                          </span>
                          {r.rating && (
                            <span className="text-xs font-semibold text-theme-accent">
                              ★ {Number(r.rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-text-muted font-mono">
                          {formatLogDate(r.createdAt)}
                        </span>
                      </div>

                      {r.title && (
                        <div className="font-serif text-base text-text-primary mb-1.5 font-medium">
                          {r.title}
                        </div>
                      )}

                      <p className="font-serif italic text-sm sm:text-base text-text-secondary leading-relaxed">
                        &ldquo;{r.body}&rdquo;
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-bg-surface/50 border border-dashed border-theme-border rounded-2xl p-8 text-center text-xs text-text-muted">
                    No community reviews recorded yet. Write your thoughts above.
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
