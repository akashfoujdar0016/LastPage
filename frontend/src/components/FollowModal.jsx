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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-bg-surface border border-theme-border shadow-luxury overflow-hidden flex flex-col max-h-[85vh] relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl text-text-primary font-normal">
              {type === 'FOLLOWING' ? 'Following' : 'Followers'}
            </span>
            <span className="text-xs text-text-secondary font-mono">
              ({displayedAccounts.length}{filterQuery ? ` of ${accounts.length}` : ''})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Search Filter */}
        <div className="px-5 py-2.5 border-b border-theme-border bg-bg-surface-subtle">
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-3 text-text-secondary pointer-events-none" />
            <input
              type="text"
              suppressHydrationWarning
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              placeholder={`Search ${type === 'FOLLOWING' ? 'following' : 'followers'}…`}
              className="w-full bg-bg-surface-raised border border-theme-border rounded-full pl-8 pr-7 py-1.5 text-xs text-text-primary placeholder-text-muted outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent-dim transition-all"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                className="absolute right-2.5 text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Account List */}
        <div className="overflow-y-auto p-4 divide-y divide-theme-border-subtle space-y-1">
          {displayedAccounts.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-secondary">
              {filterQuery ? `No matches found for "${filterQuery}"` : 'No accounts in this list yet.'}
            </div>
          ) : (
            displayedAccounts.map((acc) => {
              const following = isFollowingUser(acc.username);
              const isHovered = hoveredBtnUser === acc.username;

              return (
                <div
                  key={acc.username}
                  className="flex items-center justify-between py-3.5 px-2 hover:bg-bg-surface-subtle rounded-xl transition-colors gap-3"
                >
                  <Link
                    href={`/user/${acc.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 min-w-0 flex-1 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-theme-accent-dim border border-theme-accent-border text-theme-accent flex items-center justify-center font-serif text-base font-medium shrink-0 group-hover:scale-105 transition-transform">
                      {acc.initial || acc.username.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-text-primary truncate group-hover:text-theme-accent transition-colors">
                          {acc.displayName}
                        </span>
                        <span className="text-xs text-text-secondary truncate">
                          @{acc.username}
                        </span>
                      </div>

                      {acc.bio && (
                        <p className="text-xs text-text-secondary truncate mt-0.5 font-normal">
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
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      following
                        ? 'border border-theme-border text-text-secondary hover:border-white/30 hover:text-white hover:bg-white/5'
                        : 'btn-highlight'
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
