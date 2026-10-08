'use client';

import { useState, useEffect } from 'react';
import { X, Check, MapPin, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { api } from '../lib/api';

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [location, setLocation] = useState('');
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
      setIsSuccess(false);
      setErrorMsg('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

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
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          avatarUrl: updatedProfile.avatarUrl,
          location: updatedProfile.location,
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
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Profile Portrait / Avatar</span>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-[11px] text-text-muted hover:text-red-400 font-normal normal-case transition-colors"
                >
                  Reset to Monogram
                </button>
              )}
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-bg-surface-raised/40 border border-theme-border">
              {/* Avatar Preview */}
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-theme-accent shadow-luxury shrink-0 bg-theme-accent-dim flex items-center justify-center text-theme-accent font-serif text-xl font-semibold">
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

              {/* Avatar Image URL Input */}
              <div className="flex-1 min-w-0 w-full">
                <div className="relative flex items-center">
                  <ImageIcon size={13} className="absolute left-3 text-text-muted pointer-events-none" />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg (Image URL)"
                    className="w-full bg-bg-surface-raised border border-theme-border rounded-xl pl-8 pr-3 py-2 text-xs text-text-primary placeholder-text-muted outline-none focus:border-theme-accent transition-colors font-mono"
                  />
                </div>
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

          {/* 4. Location / City */}
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
