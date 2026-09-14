'use client';

import Link from 'next/link';
import { Film, BookOpen } from 'lucide-react';

export default function HubPage() {
  return (
    <div className="min-h-screen bg-page text-ink flex flex-col justify-center items-center py-12 px-6 relative overflow-hidden selection:bg-ember/30 selection:text-ink">
      {/* Subtle ambient lighting cones */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/[0.04] via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-[32rem] h-[32rem] rounded-full bg-radial from-ember/[0.05] to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[28rem] h-[28rem] rounded-full bg-radial from-gold/[0.035] to-transparent blur-3xl pointer-events-none" />

      {/* ── Top Header: Centered & Refined ── */}
      <div className="w-full max-w-4xl text-center relative z-10 mb-8 sm:mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F87171] mb-2.5">
          PORTAL GATEWAY
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-zinc-100 tracking-tight leading-tight">
          Where would you like to go?
        </h1>
      </div>

      {/* ── Center: Two Dominant Feature Cards (Cinema & Library) ── */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">

        {/* ── Cinema Portal Card ── */}
        <Link
          href="/movies"
          className="group relative block h-[360px] sm:h-[410px] lg:h-[460px] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.20] shadow-2xl transition-all duration-500 ease-out"
        >
          {/* Background Photography with Zoom Hover */}
          <img
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=85"
            alt="Cinema"
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Graphite Multi-stop Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121216]/95 via-[#121216]/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121216]/30 via-transparent to-transparent" />

          {/* Typography & Call to Action */}
          <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-3">
              <Film size={15} className="text-[#F87171]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Cinema
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-100 font-normal leading-tight mb-2.5">
              Cinema
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-sm mb-6 font-normal">
              Films that stayed with you. Track what you've watched, save favourites, and write reviews.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs font-medium text-zinc-200">
              <span className="group-hover:text-ember transition-colors duration-200">
                Open cinema
              </span>
              <span className="text-base text-ember transform group-hover:translate-x-1.5 transition-transform duration-200">
                →
              </span>
            </div>
          </div>
        </Link>

        {/* ── Library Portal Card ── */}
        <Link
          href="/books"
          className="group relative block h-[360px] sm:h-[410px] lg:h-[460px] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.20] shadow-2xl transition-all duration-500 ease-out"
        >
          {/* Background Photography with Zoom Hover */}
          <img
            src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&q=85"
            alt="Library"
            className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Graphite Multi-stop Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121216]/95 via-[#121216]/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#121216]/30 via-transparent to-transparent" />

          {/* Typography & Call to Action */}
          <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={15} className="text-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Library
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-100 font-normal leading-tight mb-2.5">
              Library
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-sm mb-6 font-normal">
              Books that made an impression. Track what you've read, save favourites, and write reviews.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs font-medium text-zinc-200">
              <span className="group-hover:text-gold transition-colors duration-200">
                Open library
              </span>
              <span className="text-base text-gold transform group-hover:translate-x-1.5 transition-transform duration-200">
                →
              </span>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
