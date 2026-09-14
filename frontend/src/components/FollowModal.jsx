'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { X, Search, UserPlus, Check } from 'lucide-react';
import { getAccountsForModal, isFollowingUser, toggleFollowUser } from '../lib/socialStore';

export default function FollowModal({ isOpen, onClose, type, username }) {
  const [accounts, setAccounts] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [hoveredBtnUser, setHoveredBtnUser] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAccounts(getAccountsForModal(type, username));
      setFilterQuery('');
    }
  }, [isOpen, type, username, refresh]);

  useEffect(() => {
    const handleSocialUpdate = () => setRefresh(p => p + 1);
    window.addEventListener('socialUpdated', handleSocialUpdate);
    return () => window.removeEventListener('socialUpdated', handleSocialUpdate);
  }, []);

  const displayedAccounts = useMemo(() => {
    if (!filterQuery.trim()) return accounts;
    const q = filterQuery.trim().toLowerCase();
    return accounts.filter(
      acc =>
        acc.username.toLowerCase().includes(q) ||
        (acc.displayName && acc.displayName.toLowerCase().includes(q)) ||
        (acc.bio && acc.bio.toLowerCase().includes(q))
    );
  }, [accounts, filterQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in selection:bg-ember/30 selection:text-ink"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#1C1C22] border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl text-zinc-100 font-normal">
              {type === 'FOLLOWING' ? 'Following' : 'Followers'}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              ({displayedAccounts.length}{filterQuery ? ` of ${accounts.length}` : ''})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Search Filter */}
        <div className="px-5 py-2.5 border-b border-white/[0.06] bg-[#17171C]">
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-3 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              suppressHydrationWarning
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder={`Search ${type === 'FOLLOWING' ? 'following' : 'followers'}…`}
              className="w-full bg-[#1F1F26] border border-white/10 rounded-full pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20 transition-all"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="absolute right-2.5 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Account List */}
        <div className="overflow-y-auto p-4 divide-y divide-white/5 space-y-1">
          {displayedAccounts.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              {filterQuery ? `No matches found for "${filterQuery}"` : 'No accounts in this list yet.'}
            </div>
          ) : (
            displayedAccounts.map((acc) => {
              const following = isFollowingUser(acc.username);
              const isHovered = hoveredBtnUser === acc.username;

              return (
                <div
                  key={acc.username}
                  className="flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.02] rounded-xl transition-colors gap-3"
                >
                  <Link
                    href={`/user/${acc.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 min-w-0 flex-1 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-ember/15 border border-ember/30 text-ember flex items-center justify-center font-serif text-base font-medium shrink-0 group-hover:border-ember transition-colors">
                      {acc.initial || acc.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-white truncate group-hover:text-ember transition-colors">
                          {acc.displayName}
                        </span>
                        <span className="text-xs text-zinc-400 truncate">
                          @{acc.username}
                        </span>
                      </div>

                      {acc.bio && (
                        <p className="text-xs text-zinc-300 truncate mt-0.5 font-normal">
                          {acc.bio}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Follow / Following Toggle Button */}
                  <button
                    onClick={() => toggleFollowUser(acc.username)}
                    onMouseEnter={() => setHoveredBtnUser(acc.username)}
                    onMouseLeave={() => setHoveredBtnUser(null)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      following
                        ? 'border border-white/20 text-zinc-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10'
                        : 'bg-[#F4F4F5] text-[#121216] hover:bg-white font-medium shadow-sm'
                    }`}
                  >
                    {following
                      ? isHovered ? 'Unfollow' : 'Following'
                      : 'Follow'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
