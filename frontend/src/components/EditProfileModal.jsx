'use client';

import { useState, useEffect } from 'react';
import { X, Check, Camera, Sparkles, Globe, MapPin, Tag, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

const PRESET_AVATARS = [
  {
    id: 'av-1',
    label: 'Cinephile',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'av-2',
    label: 'Scholar',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'av-3',
    label: 'Archivist',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'av-4',
    label: 'Modernist',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'av-5',
    label: 'Auteur',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'av-6',
    label: 'Bibliophile',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  },
];

const CURATED_GENRES = [
  'Film Noir',
  'Psychological Drama',
  'Sci-Fi & Speculative',
  'Literary Fiction',
  'Philosophical',
  'Art House & World',
  'Crime & Mystery',
  'Magical Realism',
  'Neo-Realism',
  'Cyberpunk',
];

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [avatarTab, setAvatarTab] = useState('PRESETS'); // 'PRESETS' | 'CUSTOM'
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(user.displayName || user.username || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setFavoriteGenres(Array.isArray(user.favoriteGenres) ? user.favoriteGenres : []);
      setIsSuccess(false);
      setErrorMsg('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const toggleGenre = (genre) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter(g => g !== genre));
    } else {
      if (favoriteGenres.length >= 4) return; // limit to 4 key aesthetics
      setFavoriteGenres([...favoriteGenres, genre]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Display name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    const updatedProfile = {
      ...(user || {}),
      displayName: displayName.trim(),
      username: (username.trim() || user?.username || 'curator').toLowerCase(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      location: location.trim(),
      website: website.trim(),
      favoriteGenres,
    };

    try {
      // 1. Optimistic local persistence
      localStorage.setItem('currentUser', JSON.stringify(updatedProfile));
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedProfile }));
      window.dispatchEvent(new Event('socialUpdated'));

      // 2. Cloud DB update via PATCH /api/auth/me
      await api('/auth/me', {
        method: 'PATCH',
        body: {
          displayName: updatedProfile.displayName,
          bio: updatedProfile.bio,
          avatarUrl: updatedProfile.avatarUrl,
          location: updatedProfile.location,
          website: updatedProfile.website,
          favoriteGenres: updatedProfile.favoriteGenres,
        },
      }).catch(() => {});

      setIsSuccess(true);
      if (onSave) onSave(updatedProfile);

      setTimeout(() => {
        setIsSaving(false);
        setIsSuccess(false);
        onClose();
      }, 600);
    } catch (err) {
      setIsSaving(false);
      setErrorMsg('Failed to update profile. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-bg-surface border border-theme-border shadow-luxury overflow-hidden flex flex-col max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-bg-surface-raised/40">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl text-text-primary font-normal">Edit Profile</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-theme-accent-dim text-theme-accent border border-theme-accent-border font-mono">
              Cultural Passport
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {errorMsg}
            </div>
          )}

          {/* 1. Avatar Customization */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Profile Portrait / Avatar
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-bg-surface-raised/40 border border-theme-border">
              {/* Avatar Preview */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-theme-accent shadow-luxury shrink-0 bg-theme-accent-dim flex items-center justify-center text-theme-accent font-serif text-2xl font-semibold">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarUrl('')}
                  />
                ) : (
                  <span>{(displayName || username || 'C').charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Avatar Selector Switcher */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 mb-2.5">
                  <button
                    type="button"
                    onClick={() => setAvatarTab('PRESETS')}
                    className={`text-xs px-3 py-1 rounded-full transition-all ${
                      avatarTab === 'PRESETS'
                        ? 'bg-theme-accent text-bg-base font-semibold shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Curated Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarTab('CUSTOM')}
                    className={`text-xs px-3 py-1 rounded-full transition-all ${
                      avatarTab === 'CUSTOM'
                        ? 'bg-theme-accent text-bg-base font-semibold shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Direct Image URL
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-[11px] text-text-muted hover:text-red-400 ml-auto transition-colors"
                    >
                      Reset to Monogram
                    </button>
                  )}
                </div>

                {avatarTab === 'PRESETS' ? (
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatarUrl(av.url)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all relative ${
                          avatarUrl === av.url
                            ? 'border-theme-accent scale-105 ring-2 ring-theme-accent/40'
                            : 'border-theme-border opacity-70 hover:opacity-100 hover:border-theme-border-strong'
                        }`}
                        title={av.label}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/my-portrait.jpg"
                      className="w-full bg-bg-surface-raised border border-theme-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder-text-muted outline-none focus:border-theme-accent transition-colors font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Names & Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Curator Name"
                maxLength={40}
                className="w-full bg-bg-surface-raised border border-theme-border rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent-dim transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Username Handle
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  placeholder="handle"
                  maxLength={25}
                  className="w-full bg-bg-surface-raised border border-theme-border rounded-xl pl-8 pr-3.5 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent-dim font-mono transition-all"
                />
              </div>
            </div>
          </div>

          {/* 3. Bio / Philosophy */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Bio & Aesthetic Philosophy
              </label>
              <span className="text-[10px] font-mono text-text-muted">{bio.length} / 250</span>
            </div>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 250))}
              placeholder="A few words on what drives your cinema and literature passions..."
              className="w-full bg-bg-surface-raised border border-theme-border rounded-xl p-3 text-xs text-text-primary placeholder-text-muted outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent-dim resize-none transition-all leading-relaxed"
            />
          </div>

          {/* 4. Location & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin size={12} className="text-theme-accent" />
                <span>Location / City</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kyoto, Japan / Berlin"
                maxLength={50}
                className="w-full bg-bg-surface-raised border border-theme-border rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent-dim transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe size={12} className="text-theme-accent" />
                <span>Website / Link</span>
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourportfolio.com"
                maxLength={100}
                className="w-full bg-bg-surface-raised border border-theme-border rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent-dim transition-all font-mono"
              />
            </div>
          </div>

          {/* 5. Favorite Aesthetic Genres */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={12} className="text-theme-accent" />
                <span>Favorite Aesthetics & Genres (Select up to 4)</span>
              </label>
              <span className="text-[10px] font-mono text-text-muted">
                {favoriteGenres.length} / 4 selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CURATED_GENRES.map((genre) => {
                const isSelected = favoriteGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-theme-accent text-bg-base font-semibold shadow-sm'
                        : 'bg-bg-surface-raised text-text-secondary hover:text-text-primary hover:bg-bg-surface-subtle border border-theme-border'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-theme-border bg-bg-surface-raised/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-full border border-theme-border text-xs text-text-secondary hover:text-text-primary hover:border-theme-border-strong transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-full bg-theme-accent text-bg-base text-xs font-semibold hover:bg-theme-accent-hover transition-all shadow-luxury flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check size={13} />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
