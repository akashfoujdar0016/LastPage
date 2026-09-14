'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { getUserWatched } from '../../lib/activityStore';
import {
  getFollowingList,
  getFollowersList,
} from '../../lib/socialStore';
import FollowModal from '../../components/FollowModal';
import { Film, BookOpen, ArrowLeft } from 'lucide-react';

export default function Profile() {
  const [u, setU] = useState(null);
  const [stats, setStats] = useState({
    movies: 0,
    books: 0,
  });
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'FOLLOWING' });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('Tracking cinema and literature in a private journal.');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        setU(parsed);
        if (parsed.bio) setBioText(parsed.bio);
      }
    } catch {}

    api('/auth/me')
      .then(x => {
        if (x?.user) {
          setU(x.user);
          if (x.user.bio) setBioText(x.user.bio);
        }
      })
      .catch(() => {});

    try {
      const m = getUserWatched('MOVIE').length;
      const b = getUserWatched('BOOK').length;
      setStats({ movies: m, books: b });
    } catch {}

    setFollowing(getFollowingList());
    setFollowers(getFollowersList());
  }, [refreshTrigger]);

  useEffect(() => {
    const handleSocialUpdate = () => setRefreshTrigger(p => p + 1);
    window.addEventListener('socialUpdated', handleSocialUpdate);
    return () => window.removeEventListener('socialUpdated', handleSocialUpdate);
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('accessToken');
    } catch {}
    window.location.href = '/';
  };

  const handleSaveBio = () => {
    setIsEditingBio(false);
    if (u) {
      const updated = { ...u, bio: bioText };
      setU(updated);
      try {
        localStorage.setItem('currentUser', JSON.stringify(updated));
      } catch {}
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] bg-page text-ink pb-24 selection:bg-ember/30 selection:text-ink relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/[0.035] via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-12 left-1/3 w-96 h-96 rounded-full bg-radial from-ember/[0.05] to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-12 right-1/4 w-96 h-96 rounded-full bg-radial from-gold/[0.03] to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">

        {/* Top Back Link */}
        <div className="pt-8 pb-4 border-b border-white/[0.08] mb-8 flex items-center justify-between">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft size={13} />
            <span>Back to collection</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="text-xs text-zinc-400 hover:text-ember transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* ── 1. Profile Header: Social Stats & Follow Actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/[0.08] mb-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-ember/15 border-2 border-ember/30 text-ember flex items-center justify-center font-serif text-2xl sm:text-3xl font-medium shadow-2xl shrink-0">
              {(u?.username || 'M').charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-100 tracking-tight">
                  {u?.username || 'Curator'}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono">
                  @{u?.username || 'journal'}
                </span>
              </div>

              {/* Bio display or edit */}
              {!isEditingBio ? (
                <p className="text-xs text-zinc-300 max-w-md mt-2 leading-relaxed">
                  {bioText}
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2 max-w-md">
                  <textarea
                    value={bioText}
                    onChange={e => setBioText(e.target.value)}
                    rows={2}
                    className="w-full bg-[#1A1A20] border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20 focus:bg-[#202028] resize-none font-sans"
                    placeholder="Write a brief kicker or aesthetic bio..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveBio}
                      className="px-3 py-1 rounded-full bg-[#F4F4F5] text-[#121216] text-xs font-semibold hover:bg-white transition-colors shadow-sm"
                    >
                      Save Bio
                    </button>
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-3 py-1 rounded-full border border-white/20 text-zinc-400 hover:text-white text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Clickable Social Stats */}
              <div className="flex items-center gap-5 mt-3 text-xs">
                <button
                  onClick={() => setModalState({ isOpen: true, type: 'FOLLOWING' })}
                  className="text-zinc-400 hover:text-white transition-colors flex items-baseline gap-1"
                >
                  <span className="font-mono text-sm font-semibold text-zinc-100">
                    {following.length}
                  </span>
                  <span>Following</span>
                </button>

                <span className="text-zinc-600">•</span>

                <button
                  onClick={() => setModalState({ isOpen: true, type: 'FOLLOWERS' })}
                  className="text-zinc-400 hover:text-white transition-colors flex items-baseline gap-1"
                >
                  <span className="font-mono text-sm font-semibold text-zinc-100">
                    {followers.length}
                  </span>
                  <span>Followers</span>
                </button>
              </div>
            </div>
          </div>

          {/* Edit Profile Pill */}
          <button
            onClick={() => setIsEditingBio(!isEditingBio)}
            className="self-start sm:self-center px-5 py-2 rounded-full border border-white/20 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/40 transition-all shadow-sm"
          >
            {isEditingBio ? 'Close Editor' : 'Edit Profile'}
          </button>
        </div>

        {/* ── Bento Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          <div className="bg-surface border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-6 shadow-xl transition-all">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <span className="font-medium uppercase tracking-wider">Films Watched</span>
              <Film size={15} className="text-[#F87171]" />
            </div>
            <div className="font-serif text-4xl text-zinc-100 font-normal">
              {stats.movies}
            </div>
          </div>

          <div className="bg-surface border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-6 shadow-xl transition-all">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <span className="font-medium uppercase tracking-wider">Books Read</span>
              <BookOpen size={15} className="text-gold" />
            </div>
            <div className="font-serif text-4xl text-zinc-100 font-normal">
              {stats.books}
            </div>
          </div>
        </div>

        {/* Quick Links to Personal Journal Sections */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/movies"
            className="px-5 py-2.5 rounded-full text-xs font-medium bg-white/[0.05] text-zinc-200 hover:text-white hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.16] transition-all shadow-sm"
          >
            Explore Cinema →
          </Link>
          <Link
            href="/books"
            className="px-5 py-2.5 rounded-full text-xs font-medium bg-white/[0.05] text-zinc-200 hover:text-white hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.16] transition-all shadow-sm"
          >
            Explore Library →
          </Link>
          <Link
            href="/activity"
            className="px-5 py-2.5 rounded-full text-xs font-medium bg-white/[0.05] text-zinc-200 hover:text-white hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.16] transition-all shadow-sm"
          >
            View Activity Feed →
          </Link>
        </div>

      </div>

      {/* Followers / Following Modal */}
      <FollowModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: 'FOLLOWING' })}
        type={modalState.type}
        username={u?.username || 'me'}
      />
    </div>
  );
}
