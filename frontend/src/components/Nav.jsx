'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Command,
  Film,
  BookOpen,
  User,
  X,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';
import { getAllCuratedItems } from '../lib/curatedCatalogue';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchInputRef = useRef(null);
  const catalogue = useMemo(() => getAllCuratedItems(), []);

  // Sync user from localStorage
  const syncUser = () => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {}
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('storage', syncUser);
    window.addEventListener('userProfileUpdated', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('userProfileUpdated', syncUser);
    };
  }, []);

  // Scroll detection for backdrop saturation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      } else if (e.key === 'Escape' && paletteOpen) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paletteOpen]);

  // Focus search input on open
  useEffect(() => {
    if (paletteOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [paletteOpen]);

  // Filter items in palette
  const filteredPalette = useMemo(() => {
    if (!searchQuery.trim()) return catalogue.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return catalogue.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        (item.director && item.director.toLowerCase().includes(q)) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        (item.genres && item.genres.some(g => g.toLowerCase().includes(q)))
    ).slice(0, 10);
  }, [catalogue, searchQuery]);

  // Keyboard navigation inside palette
  const handlePaletteKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredPalette.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredPalette.length) % Math.max(1, filteredPalette.length));
    } else if (e.key === 'Enter' && filteredPalette[selectedIndex]) {
      e.preventDefault();
      const target = filteredPalette[selectedIndex];
      const url = `/${target.type === 'MOVIE' ? 'movies' : 'books'}/${target._id}`;
      setPaletteOpen(false);
      router.push(url);
    }
  };

  // Requirement: NO navigation bar on the Homepage / Landing Page ('/')
  if (pathname === '/') {
    return null;
  }

  // Determine section context
  const isMovieSection = pathname?.startsWith('/movies');
  const isBookSection = pathname?.startsWith('/books');
  const isProfile = pathname?.startsWith('/profile') || pathname?.startsWith('/user');
  const isHub = pathname === '/hub';

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#000000]/95 backdrop-blur-xl border-b border-[#212121] shadow-2xl'
            : 'bg-[#000000]/80 backdrop-blur-md border-b border-[#212121]/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

          {/* ── Left: Section Branding ── */}
          <div className="flex items-center gap-3 shrink-0">
            {isMovieSection ? (
              <Link
                href="/movies"
                className="flex items-center gap-2.5 text-white hover:text-[#E0E0E0] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <Film size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-base sm:text-lg font-normal tracking-tight text-white leading-tight">
                    LastPage
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-[#888888] font-semibold leading-none">
                    Cinema
                  </span>
                </div>
              </Link>
            ) : isBookSection ? (
              <Link
                href="/books"
                className="flex items-center gap-2.5 text-white hover:text-[#E0E0E0] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <BookOpen size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-base sm:text-lg font-normal tracking-tight text-white leading-tight">
                    LastPage
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-[#888888] font-semibold leading-none">
                    Library
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                href="/hub"
                className="flex items-center gap-2.5 text-white hover:text-[#E0E0E0] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.10] border border-white/[0.16] flex items-center justify-center text-white font-serif font-bold text-sm group-hover:scale-105 transition-transform">
                  CL
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-base sm:text-lg font-normal tracking-tight text-white leading-tight">
                    LastPage
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-[#888888] font-semibold leading-none">
                    Journal
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* ── Center: Quick-Switch Toggle & Search Trigger ── */}
          <div className="flex items-center gap-3">
            {/* Quick Switch Button (Movies <-> Books) */}
            {isMovieSection ? (
              <Link
                href="/books"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#888888] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.20] hover:text-white transition-all shadow-sm group"
                title="Switch to Library (Books)"
              >
                <BookOpen size={13} className="text-white/50" />
                <span className="hidden sm:inline">Switch to Library</span>
                <span className="text-[#888888] group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            ) : isBookSection ? (
              <Link
                href="/movies"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#888888] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.20] hover:text-white transition-all shadow-sm group"
                title="Switch to Cinema (Movies)"
              >
                <Film size={13} className="text-white/50" />
                <span className="hidden sm:inline">Switch to Cinema</span>
                <span className="text-[#888888] group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            ) : isProfile ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/movies"
                  className="px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cinema
                </Link>
                <span className="text-zinc-600">•</span>
                <Link
                  href="/books"
                  className="px-3 py-1 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Library
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3 text-xs text-zinc-400">
                <span>Select a gateway below</span>
              </div>
            )}

            {/* Quick Cmd+K Search Capsule */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-xs text-zinc-400 hover:text-zinc-200 transition-all duration-200"
              aria-label="Search all media (Cmd+K)"
            >
              <Search size={13} className="text-zinc-400" />
              <span className="text-[11px] font-normal">Search titles, creators…</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* ── Far Right: Profile Pinned Corner ── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="lg:hidden p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            {/* Pinned Profile Button */}
            <Link
              href="/profile"
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all duration-200 shadow-sm ${
                isProfile
                  ? 'bg-white/[0.08] border-white/[0.20] text-white'
                  : 'bg-white/[0.05] border-white/[0.08] hover:border-white/[0.20] text-[#888888] hover:text-white'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white/10 text-white border border-white/20 overflow-hidden flex items-center justify-center font-serif text-xs font-semibold shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (user?.displayName || user?.username || 'C').charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-xs font-medium tracking-wide hidden sm:inline truncate max-w-[120px]">
                {user?.displayName || user?.username || 'Profile'}
              </span>
            </Link>
          </div>

        </div>
      </header>

      {/* ── Command Palette Modal (Cmd+K) ── */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-[#121212] border border-[#212121] shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[75vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#222222] bg-[#111111]/80">
              <Search size={16} className="text-white/50 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handlePaletteKeyDown}
                placeholder="Search across all Cinema & Literature…"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Results Stream */}
            <div className="overflow-y-auto p-2 flex flex-col gap-1 max-h-[50vh] no-scrollbar">
              {filteredPalette.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  No cinema or books found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredPalette.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isMov = item.type === 'MOVIE';
                  const href = `/${isMov ? 'movies' : 'books'}/${item._id}`;
                  const creator = item.director || item.author || '';

                  return (
                    <Link
                      key={item._id}
                      href={href}
                      onClick={() => setPaletteOpen(false)}
                      className={`flex items-center gap-3.5 p-2.5 rounded-xl transition-all duration-150 ${
                        isSelected
                          ? 'bg-white/10 text-white'
                          : 'hover:bg-white/[0.05] text-zinc-300'
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-10 aspect-[2/3] object-cover rounded shadow-md shrink-0 border border-white/10"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm text-white font-normal truncate">
                            {item.title}
                          </span>
                          <span
                            className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-white/[0.08] text-[#888888] border border-white/[0.10]"
                          >
                            {isMov ? 'Film' : 'Book'}
                          </span>
                        </div>

                        <div className="text-[11px] text-zinc-400 truncate">
                          {creator} {item.year ? `(${item.year})` : ''}
                        </div>
                      </div>

                      <div className="text-xs text-[#888888] font-semibold shrink-0">
                        ★ {Number(item.averageRating || 0).toFixed(1)}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2 border-t border-[#222222] bg-[#000000] flex items-center justify-between text-[11px] text-[#555555]">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Open</span>
                <span>ESC Close</span>
              </div>
              <span className="text-[#888888]">LastPage</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
