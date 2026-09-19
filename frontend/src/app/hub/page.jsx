'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Film, BookOpen, ArrowRight, User } from 'lucide-react';
import { getUserWatched } from '../../lib/activityStore';

export default function HubPage() {
  const [stats, setStats] = useState({ movies: 0, books: 0 });
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) setUser(JSON.parse(stored));
      const m = getUserWatched('MOVIE').length;
      const b = getUserWatched('BOOK').length;
      setStats({ movies: m, books: b });
    } catch {}
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#000000] text-[#E0E0E0] flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden selection:bg-white/15 selection:text-white">
      {/* Subtle vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.015] via-transparent to-transparent pointer-events-none" />

      {/* ── Top Header: Centered & Refined ── */}
      <div className="w-full max-w-4xl text-center relative z-10 mb-8 sm:mb-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#888888] mb-2.5 font-sans">
          CHOOSE YOUR PATHWAY
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight leading-tight mb-3">
          Where would you like to explore?
        </h1>
        <p className="text-xs sm:text-sm text-[#A0A0A0] max-w-md mx-auto">
          Select between your Cinema collection and Literary library.
        </p>
      </div>

      {/* ── Center: Two Dominant Feature Cards (Cinema & Library) ── */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">

        {/* ── Cinema Portal Card ── */}
        <Link
          href="/movies"
          className="group relative block h-[380px] sm:h-[430px] rounded-2xl overflow-hidden border border-[#222222] hover:border-white/[0.25] shadow-2xl transition-all duration-500 ease-out hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.06)]"
        >
          {/* Background Photography with Zoom Hover */}
          <img
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=85"
            alt="Cinema"
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Obsidian Multi-stop Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/96 via-[#000000]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/35 via-transparent to-transparent" />

          {/* Typography & Call to Action */}
          <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-end">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Film size={15} className="text-white" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Movie Section
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#888888] bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-[#222222]">
                {stats.movies} logged
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal leading-tight mb-2.5">
              Cinema
            </h2>

            <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed max-w-sm mb-6 font-normal">
              Films that stayed with you. Track watched works, queue watchlists, like favourites, and review cinema.
            </p>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="btn-highlight inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold">
                <span>Enter Movie Section</span>
                <span className="text-sm font-bold transform group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </Link>

        {/* ── Library Portal Card ── */}
        <Link
          href="/books"
          className="group relative block h-[380px] sm:h-[430px] rounded-2xl overflow-hidden border border-[#222222] hover:border-white/[0.25] shadow-2xl transition-all duration-500 ease-out hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.06)]"
        >
          {/* Background Photography with Zoom Hover */}
          <img
            src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=85"
            alt="Library"
            className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Obsidian Multi-stop Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/95 via-[#000000]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/30 via-transparent to-transparent" />

          {/* Typography & Call to Action */}
          <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-end">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-white" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Book Section
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#888888] bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-[#222222]">
                {stats.books} logged
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal leading-tight mb-2.5">
              Library
            </h2>

            <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed max-w-sm mb-6 font-normal">
              Books that made an impression. Track what you've read, organize TBR readlists, like, and review literature.
            </p>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="btn-highlight inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold">
                <span>Enter Book Section</span>
                <span className="text-sm font-bold transform group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </Link>

      </div>

      {/* Profile quick access link */}
      <div className="mt-8 relative z-10">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-xs text-[#888888] hover:text-[#FFFFFF] transition-colors"
        >
          <User size={13} className="text-white/70" />
          <span>Curator Profile & Social Connections →</span>
        </Link>
      </div>
    </div>
  );
}
