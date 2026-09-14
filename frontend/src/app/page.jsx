'use client';

import Link from 'next/link';
import AuthCard from '../components/AuthCard';

export default function Home() {
  return (
    <main className="h-screen overflow-hidden flex items-center justify-center px-8 md:px-16 bg-page text-ink relative selection:bg-ember/30 selection:text-ink">
      {/* Subtle ambient lighting cones */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/[0.04] via-transparent to-transparent pointer-events-none" />
      <div className="fixed -top-24 left-1/4 w-[36rem] h-[36rem] rounded-full bg-radial from-ember/[0.05] to-transparent blur-3xl pointer-events-none" />
      <div className="fixed -bottom-24 right-1/4 w-[30rem] h-[30rem] rounded-full bg-radial from-gold/[0.035] to-transparent blur-3xl pointer-events-none" />

      {/* Symmetrical Two-Column Container */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">

        {/* ── Left Column: Editorial Statement & Gateways (7 cols) ── */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-8">
          
          {/* 1. Hero Typography Block */}
          <div className="space-y-4">
            <p className="tracking-[0.2em] text-xs font-semibold uppercase text-[#F87171]">
              CURATED PERSONAL JOURNAL
            </p>
            <h1 className="text-6xl md:text-7xl font-serif tracking-tight leading-none text-zinc-100">
              LastPage
            </h1>
            <p className="text-xl font-serif italic text-zinc-300 max-w-lg leading-relaxed pt-1">
              A quiet, personal journal for the films that stayed with you and the books that changed how you think.
            </p>
          </div>

          {/* 2. Redesigned Portal Gateway Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link
              href="/movies"
              className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 p-5 rounded-2xl transition duration-300 group cursor-pointer shadow-lg backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif text-xl text-zinc-100 font-normal group-hover:text-ember transition-colors">
                  Cinema
                </span>
                <span className="text-sm text-zinc-400 group-hover:text-ember group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                  ↗
                </span>
              </div>
              <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors font-sans">
                Films that stayed.
              </p>
            </Link>

            <Link
              href="/books"
              className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 p-5 rounded-2xl transition duration-300 group cursor-pointer shadow-lg backdrop-blur-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-serif text-xl text-zinc-100 font-normal group-hover:text-ember transition-colors">
                  Library
                </span>
                <span className="text-sm text-zinc-400 group-hover:text-ember group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200">
                  ↗
                </span>
              </div>
              <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors font-sans">
                Books that changed you.
              </p>
            </Link>
          </div>

        </div>

        {/* ── Right Column: Streamlined Auth Card (5 cols) ── */}
        <div className="md:col-span-5 w-full max-w-sm md:ml-auto md:mr-0 mx-auto md:translate-x-6 flex items-center justify-end">
          <AuthCard />
        </div>

      </div>
    </main>
  );
}
