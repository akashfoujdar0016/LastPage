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
  const primaryGenre = item.genres?.[0];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col transition-all duration-300 ease-out"
    >
      {/* ── Artwork Container ── */}
      <div
        className={`relative w-full aspect-[2/3] overflow-hidden bg-[#111111] border transition-all duration-300 ease-out group-hover:shadow-2xl group-hover:shadow-black/95 ${
          isMovie
            ? 'rounded-xl border-[#222222] group-hover:border-white/[0.18]'
            : 'rounded-xl border-[#222222] group-hover:border-white/[0.18] shadow-[4px_8px_24px_rgba(0,0,0,0.85),-2px_0_4px_rgba(255,255,255,0.04)_inset]'
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
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-b from-[#111111] to-[#1A1A1A]">
              <div className="font-serif text-base text-[#FFFFFF] leading-snug line-clamp-2 mb-1">
                {item.title}
              </div>
              {creator && (
                <div className="text-xs text-[#888888] line-clamp-1">
                  {creator}
                </div>
              )}
            </div>
          )}

          {/* Book Spine Emboss Highlight for Literature */}
          {!isMovie && (
            <div className="absolute inset-y-0 left-0 w-3.5 pointer-events-none bg-gradient-to-r from-white/20 via-white/5 to-transparent mix-blend-overlay z-10" />
          )}

          {/* Cinema Glass Gradient for Movies */}
          {isMovie && (
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.06] via-transparent to-black/60 mix-blend-soft-light" />
          )}

          {/* Top Overlays: Media & Genre Pill */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
            <span
              className="text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md backdrop-blur-md border shadow-sm bg-black/75 text-white border-white/20"
            >
              {isMovie ? 'Film' : 'Book'}
            </span>

            {primaryGenre && (
              <span className="text-[9.5px] font-medium text-zinc-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 truncate max-w-[90px]">
                {primaryGenre}
              </span>
            )}
          </div>

          {/* Vignette on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>

        {/* ── Hover Actions Overlay ── */}
        <div
          className={`absolute bottom-0 inset-x-0 p-2.5 flex items-center justify-between z-20 transition-all duration-300 ease-out ${
            hovered
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {/* Like Button */}
            <button
              onClick={handleLike}
              title={liked ? 'Unlike' : 'Like'}
              aria-label="Like"
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-200 backdrop-blur-md ${
                liked
                  ? 'bg-white text-black shadow-sm border border-white font-semibold'
                  : 'bg-black/70 text-zinc-300 hover:text-white hover:bg-black/90 border border-white/15'
              }`}
            >
              <Heart
                size={10}
                className={liked ? 'fill-black stroke-black' : 'stroke-current'}
              />
              <span>{liked ? 'Liked' : 'Like'}</span>
            </button>

            {/* Favourite Button */}
            <button
              onClick={handleFavorite}
              title={favorited ? 'Remove from favourites' : 'Favourite'}
              aria-label="Favourite"
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-200 backdrop-blur-md ${
                favorited
                  ? 'bg-white text-black font-semibold shadow-sm border border-white'
                  : 'bg-black/70 text-zinc-300 hover:text-white hover:bg-black/90 border border-white/15'
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

          {/* Direct Detail View Pill */}
          <Link
            href={href}
            title={isMovie ? 'View film review' : 'View book review'}
            className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white text-[#000000] hover:bg-[#E0E0E0] transition-colors duration-200"
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
          className="font-serif text-[17px] text-[#FFFFFF] font-normal leading-tight truncate transition-colors duration-200 hover:text-[#E0E0E0] mb-0.5"
        >
          {item.title}
        </Link>

        {/* Author / Director & Year */}
        <div className="text-[12px] text-[#888888] truncate tracking-tight mb-1 flex items-center justify-between">
          <span className="truncate">{creator || 'Unknown'}</span>
          {item.year && (
            <span className="text-zinc-500 font-mono text-[11px] shrink-0 ml-1.5">{item.year}</span>
          )}
        </div>

        {/* Star Rating & Log Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {displayedRating > 0 ? (
            <div className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-white">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                className="fill-white stroke-white"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{displayedRating.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-500">Unrated</span>
          )}

          {/* Log status badge */}
          {(loggedStatus === 'WATCHED' || loggedStatus === 'READ') && loggedDate ? (
            <span className="text-[10px] text-zinc-500 font-mono">
              {isMovie ? 'Watched' : 'Read'} {formatLogDate(loggedDate)}
            </span>
          ) : item.expertScore ? (
            <span className="text-[10px] text-zinc-500 font-mono">
              {item.expertScore}% score
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
