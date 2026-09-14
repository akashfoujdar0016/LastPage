'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowUpRight } from 'lucide-react';
import { api, getToken } from '../lib/api';
import { recordActivity, formatLogDate } from '../lib/activityStore';

export default function ContentCard({ item, onLikeToggle, onFavoriteToggle }) {
  const isMovie = item.type === 'MOVIE';
  const href = `/${isMovie ? 'movies' : 'books'}/${item._id}`;
  const creator = item.director || item.creatorNames?.[0] || item.author || item.authorNames?.[0] || '';
  const rating = Number(item.averageRating || 0);

  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [loggedStatus, setLoggedStatus] = useState(null);
  const [loggedDate, setLoggedDate] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(`like_${item._id}`) === 'true');
      setFavorited(localStorage.getItem(`fav_${item._id}`) === 'true');
      setLoggedStatus(localStorage.getItem(`status_${item._id}`));
      setLoggedDate(localStorage.getItem(`logged_date_${item._id}`));
      const r = localStorage.getItem(`rating_${item._id}`);
      if (r) setUserRating(Number(r));
    } catch {}
  }, [item._id]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    try {
      localStorage.setItem(`like_${item._id}`, String(next));
    } catch {}
    if (next) {
      recordActivity({
        type: 'LIKED',
        contentId: item._id,
        contentType: item.type,
        title: item.title,
        creator,
      });
    }
    if (onLikeToggle) onLikeToggle(item._id, next);
    try {
      if (getToken()) await api(`/content/${item._id}/like`, { method: 'POST' });
    } catch {}
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorited;
    setFavorited(next);
    try {
      localStorage.setItem(`fav_${item._id}`, String(next));
    } catch {}
    if (next) {
      recordActivity({
        type: 'FAVORITED',
        contentId: item._id,
        contentType: item.type,
        title: item.title,
        creator,
      });
    }
    if (onFavoriteToggle) onFavoriteToggle(item._id, next);
    try {
      if (getToken()) await api(`/content/${item._id}/favorite`, { method: 'POST' });
    } catch {}
  };

  const displayedRating = userRating || rating;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col transition-all duration-300 ease-out"
    >
      {/* ── Artwork Container ── */}
      <div
        className={`relative w-full aspect-[2/3] overflow-hidden bg-surface-raised border border-white/[0.07] transition-all duration-300 ease-out group-hover:border-white/20 group-hover:shadow-2xl group-hover:shadow-black/60 ${
          isMovie
            ? 'rounded-lg'
            : 'rounded-xl shadow-[2px_4px_16px_rgba(0,0,0,0.5),-1px_0_3px_rgba(255,255,255,0.06)_inset]'
        }`}
      >
        <Link
          href={href}
          className="block w-full h-full relative"
          tabIndex={-1}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-b from-surface to-surface-raised">
              <div className="font-serif text-base text-ink leading-snug line-clamp-2 mb-1">
                {item.title}
              </div>
              {creator && (
                <div className="text-xs text-ink-muted line-clamp-1">
                  {creator}
                </div>
              )}
            </div>
          )}

          {/* Book spine highlight effect */}
          {!isMovie && (
            <div className="absolute inset-y-0 left-0 w-3 pointer-events-none bg-gradient-to-r from-white/10 via-white/5 to-transparent mix-blend-overlay" />
          )}

          {/* Vignette on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* ── Hover Actions Overlay ── */}
        <div
          className={`absolute bottom-0 inset-x-0 p-2.5 flex items-center justify-between z-10 transition-all duration-300 ease-out ${
            hovered
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {/* Like */}
            <button
              onClick={handleLike}
              title={liked ? 'Unlike' : 'Like'}
              aria-label="Like"
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 backdrop-blur-md ${
                liked
                  ? 'bg-ember text-white shadow-sm'
                  : 'bg-black/60 text-ink hover:bg-black/90 border border-white/15'
              }`}
            >
              <Heart
                size={10}
                className={liked ? 'fill-white stroke-white' : 'stroke-current'}
              />
              <span>{liked ? 'Liked' : 'Like'}</span>
            </button>

            {/* Favourite */}
            <button
              onClick={handleFavorite}
              title={favorited ? 'Remove from favourites' : 'Favourite'}
              aria-label="Favourite"
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200 backdrop-blur-md ${
                favorited
                  ? 'bg-gold text-black font-semibold shadow-sm'
                  : 'bg-black/60 text-ink hover:bg-black/90 border border-white/15'
              }`}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                className={favorited ? 'fill-black stroke-black' : 'fill-none stroke-current'}
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{favorited ? 'Fav' : 'Fav'}</span>
            </button>
          </div>

          {/* View link */}
          <Link
            href={href}
            title={isMovie ? 'View film' : 'View book'}
            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-medium bg-white/90 text-black hover:bg-white transition-colors duration-200 shadow-sm"
          >
            <span>View</span>
            <ArrowUpRight size={10} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* ── Metadata Underneath ── */}
      <div className="mt-3 flex flex-col">
        {/* Title */}
        <Link
          href={href}
          className="font-serif text-[17px] text-ink font-normal leading-tight truncate transition-colors duration-200 hover:text-ember mb-0.5"
        >
          {item.title}
        </Link>

        {/* Author / Director */}
        {creator && (
          <div className="text-[12px] text-ink-muted truncate tracking-tight mb-1.5">
            {creator}
          </div>
        )}

        {/* Rating & Log Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {displayedRating > 0 && (
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-gold">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                className="fill-gold stroke-gold"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{displayedRating.toFixed(1)}</span>
            </div>
          )}

          {/* Log date if marked as watched or read */}
          {(loggedStatus === 'WATCHED' || loggedStatus === 'READ') && loggedDate && (
            <span className="text-[10.5px] text-ink-faint tracking-tight">
              {isMovie ? 'Watched' : 'Read'} {formatLogDate(loggedDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
