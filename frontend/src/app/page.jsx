'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import AuthCard from '../components/AuthCard';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-[#E0E0E0] flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden selection:bg-white/15 selection:text-white">
      {/* Subtle vignette */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.02] via-transparent to-transparent pointer-events-none" />

      {/* Main Grid: Platform Vision (Left) + Auth Card (Right) */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

        {/* ── Left Column: Platform Vision Statement ── */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          {/* Brand Tagline */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#888888] font-sans">
              LASTPAGE JOURNAL
            </p>
          </div>

          {/* Vision Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#FFFFFF] tracking-tight leading-[1.12]">
            A sanctuary for <br />
            <span className="italic text-[#E0E0E0]">
              cinema &amp; literature.
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed max-w-xl font-normal">
            Where the films that moved you and the books that stayed with you become a lifelong personal journal. Reflect, rate, curate your private canon, and connect with peers of refined taste.
          </p>

          {/* Already logged in shortcut banner */}
          {user && (
            <div className="mt-2 p-3.5 rounded-xl bg-white/[0.04] border border-[#222222] flex items-center justify-between">
              <div className="text-xs text-[#888888]">
                Logged in as <span className="font-semibold text-[#FFFFFF]">@{user.username}</span>
              </div>
              <button
                onClick={() => router.push('/hub')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-[#000000] font-semibold text-xs hover:bg-[#E0E0E0] transition-all"
              >
                <span>Enter Collection</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* ── Right Column: Sleek Auth Card (Sign In / Register) ── */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto relative">
          <AuthCard />
        </div>

      </div>

      {/* Footer Branding */}
      <div className="w-full max-w-6xl mx-auto pt-16 flex items-center justify-between text-[11px] text-[#555555] border-t border-[#222222] relative z-10 mt-12">
        <span>© LastPage · The Literary & Cinematic Journal</span>
        <span className="font-mono text-[10px]">v2.0 · Ultra-Clean Edition</span>
      </div>
    </div>
  );
}
