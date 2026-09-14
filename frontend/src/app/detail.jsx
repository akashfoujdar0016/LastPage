'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Star, Check, ArrowLeft, Calendar } from 'lucide-react';
import { api, getToken } from '../lib/api';
import { CURATED_MOVIES, CURATED_BOOKS } from '../lib/curatedCatalogue';
import { recordActivity, formatLogDate } from '../lib/activityStore';

export default function Detail({ type, params }) {
  const { id } = use(params);
  const isMovie = type === 'MOVIE';

  const curatedFallback = [...CURATED_MOVIES, ...CURATED_BOOKS].find(
    item => item._id === id || String(item.title).toLowerCase().replace(/[^a-z0-9]+/g, '-') === id
  );

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

  const showToast = msg => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  };

  const c = d?.content || curatedFallback;
  const creator = c?.director || c?.creatorNames?.[0] || c?.author || c?.authorNames?.[0] || 'Unknown';

  const handleStatus = async status => {
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

  const handleSetStarRating = async score => {
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

  const handlePublishReview = async e => {
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
    setD(prev => (prev ? { ...prev, reviews: [newRev, ...(prev.reviews || [])] } : prev));
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
    showToast('Review saved');
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
      <div className="min-h-[calc(100vh-52px)] bg-page flex items-center justify-center text-xs text-ink-muted">
        Loading…
      </div>
    );
  }

  const isWatched = loggedStatus === 'WATCHED' || loggedStatus === 'READ';
  const isWatchlist = loggedStatus === 'WATCHLIST' || loggedStatus === 'WANT_TO_READ';
  const activeRating = hoverRating || rating;

  return (
    <div className="min-h-[calc(100vh-52px)] bg-page text-ink pb-24 selection:bg-ember/30 selection:text-ink relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/[0.035] via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-10 left-10 w-[30rem] h-[30rem] rounded-full bg-radial from-ember/[0.05] to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[30rem] h-[30rem] rounded-full bg-radial from-gold/[0.03] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between py-6 border-b border-white/[0.08] mb-10">
          <Link
            href={isMovie ? '/movies' : '/books'}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft size={14} />
            <span>{isMovie ? 'Back to Cinema' : 'Back to Library'}</span>
          </Link>

          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F87171]">
            {isMovie ? 'Film Record' : 'Book Record'}
          </span>
        </div>

        {/* ── Toast Notification ── */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-surface-raised/95 backdrop-blur-md border border-white/15 text-xs text-ink shadow-2xl animate-fade-in flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ember" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ── Main Editorial Diptych Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-12 border-b border-border">

          {/* ── Left Column: Artwork & Quick Controls (5 cols) ── */}
          <div className="lg:col-span-5 max-w-sm mx-auto lg:mx-0 w-full flex flex-col gap-6">
            {/* Artwork Container */}
            <div
              className={`relative w-full aspect-[2/3] overflow-hidden bg-surface-raised border border-white/10 shadow-2xl ${
                isMovie ? 'rounded-2xl' : 'rounded-2xl shadow-[4px_8px_24px_rgba(0,0,0,0.6),-2px_0_4px_rgba(255,255,255,0.08)_inset]'
              }`}
            >
              {c.imageUrl ? (
                <img
                  src={c.imageUrl}
                  alt={c.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-surface to-surface-raised">
                  <div className="font-serif text-2xl text-ink mb-2">
                    {c.title}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {creator}
                  </div>
                </div>
              )}

              {/* Book spine highlight */}
              {!isMovie && (
                <div className="absolute inset-y-0 left-0 w-4 pointer-events-none bg-gradient-to-r from-white/15 via-white/5 to-transparent mix-blend-overlay" />
              )}
            </div>

            {/* Like & Favourite Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleLike}
                className={`py-2.5 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 border ${
                  liked
                    ? 'bg-ember text-white border-ember shadow-md'
                    : 'bg-surface-raised/80 hover:bg-surface-raised text-ink border-white/10 hover:border-white/20'
                }`}
              >
                <Heart size={13} className={liked ? 'fill-white stroke-white' : 'stroke-current'} />
                <span>{liked ? 'Liked' : 'Like'}</span>
              </button>

              <button
                onClick={handleFavorite}
                className={`py-2.5 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 border ${
                  favorited
                    ? 'bg-gold text-black font-semibold border-gold shadow-md'
                    : 'bg-surface-raised/80 hover:bg-surface-raised text-ink border-white/10 hover:border-white/20'
                }`}
              >
                <Star size={13} className={favorited ? 'fill-black stroke-black' : 'stroke-current'} />
                <span>{favorited ? 'Favourite ✓' : 'Favourite'}</span>
              </button>
            </div>

            {/* Structured Metadata Box */}
            <div className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-3 text-xs">
              {[
                { label: 'Medium', value: isMovie ? 'Film' : 'Book' },
                { label: 'Year', value: c.year || '—' },
                { label: isMovie ? 'Director' : 'Author', value: creator },
                { label: 'Average rating', value: `★ ${Number(c.averageRating || 4.8).toFixed(1)}`, accent: true },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-baseline gap-4">
                  <span className="text-ink-muted">{row.label}</span>
                  <span className={`font-medium truncate text-right max-w-[65%] ${row.accent ? 'text-gold' : 'text-ink'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column: Title, Synopsis, Rating, Journal Review (7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col gap-7">

            {/* Eyebrow & Title */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ember mb-2.5">
                {c.year} · {creator}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-ink leading-tight tracking-tight mb-4">
                {c.title}
              </h1>

              {/* Genre Pills */}
              {(c.genres || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {c.genres.map(g => (
                    <span
                      key={g}
                      className="px-3 py-1 rounded-full text-xs font-medium text-ink-muted bg-surface-raised border border-white/10"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-normal">
                {c.description}
              </p>
            </div>

            {/* Status & Log Date Section */}
            <div className="py-5 border-y border-white/[0.08] flex flex-col gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handleStatus(isMovie ? 'WATCHED' : 'READ')}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-md ${
                    isWatched
                      ? 'bg-ember text-white'
                      : 'bg-[#F4F4F5] text-[#121216] hover:bg-white active:scale-[0.99]'
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
                      ? 'bg-white/10 border-white/25 text-ink'
                      : 'border-white/10 text-ink-muted hover:text-ink hover:border-white/20 bg-surface-raised/60'
                  }`}
                >
                  {isMovie ? '+ Add to watchlist' : '+ Want to read'}
                </button>
              </div>

              {/* Log Date Display & Editor */}
              {isWatched && loggedDate && (
                <div className="flex items-center gap-2.5 text-xs text-ink-muted flex-wrap">
                  <Calendar size={13} className="text-gold" />
                  <span>
                    {isMovie ? 'Watched' : 'Read'} {formatLogDate(loggedDate)}
                  </span>
                  {!isEditingDate ? (
                    <button
                      onClick={() => setIsEditingDate(true)}
                      className="text-[11px] text-ink-faint hover:text-ink underline ml-1"
                    >
                      Change date
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 ml-1">
                      <input
                        type="date"
                        defaultValue={new Date(loggedDate).toISOString().split('T')[0]}
                        onChange={e => handleDateChange(e.target.value)}
                        className="bg-surface-raised border border-white/15 rounded-lg px-2 py-1 text-xs text-ink outline-none"
                      />
                      <button
                        onClick={() => setIsEditingDate(false)}
                        className="text-[11px] text-ink-faint hover:text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Interactive Rating System (0.5 increments, Gold Stars) ── */}
            <div className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-ink-muted mb-2 font-medium">
                  Your rating
                </p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(starIndex => {
                    const isFull = activeRating >= starIndex;
                    const isHalf = !isFull && activeRating >= starIndex - 0.5;
                    return (
                      <div
                        key={starIndex}
                        className="relative w-6 h-6 cursor-pointer"
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
                        {/* Base Empty / Full Star */}
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          className={`transition-colors duration-150 ${
                            isFull
                              ? 'fill-gold stroke-gold'
                              : 'fill-none stroke-white/20'
                          }`}
                          strokeWidth="1.5"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {/* Half star clip */}
                        {isHalf && (
                          <div className="absolute inset-0 w-1/2 overflow-hidden pointer-events-none">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              className="fill-gold stroke-gold"
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
                  <div className="text-base font-semibold text-gold leading-none mb-1">
                    ★ {rating.toFixed(1)}
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    out of 5.0
                  </div>
                </div>
              )}
            </div>

            {/* ── Personal Journal Review Form ── */}
            <form onSubmit={handlePublishReview} className="flex flex-col gap-3.5">
              <div className="flex justify-between items-baseline">
                <label className="font-serif text-xl font-normal text-ink">
                  Write a review
                </label>
                <span className="text-[11px] text-ink-muted">
                  {formatLogDate(new Date())}
                </span>
              </div>

              <input
                type="text"
                value={reviewTitle}
                onChange={e => setReviewTitle(e.target.value)}
                placeholder="Review heading (optional)"
                className="w-full bg-[#1A1A20] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/20 focus:bg-[#202028]"
              />

              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Write your reflections on this work…"
                rows={4}
                className="w-full bg-[#1A1A20] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-white/25 focus:ring-1 focus:ring-white/20 focus:bg-[#202028] resize-y leading-relaxed"
              />

              <button
                type="submit"
                className="self-start px-6 py-2.5 rounded-full bg-[#F4F4F5] text-[#121216] hover:bg-white text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-white/10 active:scale-[0.99]"
              >
                Save review →
              </button>
            </form>

          </div>
        </div>

        {/* ── Community & Personal Reviews Section ── */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-normal text-ink mb-6">
            Reviews
          </h2>

          <div className="flex flex-col gap-4">
            {d.reviews && d.reviews.length > 0 ? (
              d.reviews.map(r => (
                <div
                  key={r._id}
                  className="bg-surface/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-colors"
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-base text-ink">
                        {r.userId?.displayName || 'You'}
                      </span>
                      {r.rating && (
                        <span className="text-xs font-semibold text-gold">
                          ★ {Number(r.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-ink-muted">
                      {formatLogDate(r.createdAt)}
                    </span>
                  </div>

                  {r.title && (
                    <div className="font-serif text-base text-ink mb-1.5 font-medium">
                      {r.title}
                    </div>
                  )}

                  <p className="font-serif italic text-sm sm:text-base text-ink-muted leading-relaxed">
                    "{r.body}"
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-surface/40 border border-dashed border-white/10 rounded-2xl p-10 text-center text-xs text-ink-muted">
                No reviews yet. Be the first to write one.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
