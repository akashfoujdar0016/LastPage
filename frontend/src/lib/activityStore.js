'use client';

import { CURATED_MOVIES, CURATED_BOOKS } from './curatedCatalogue';

const ALL_CURATED = [...CURATED_MOVIES, ...CURATED_BOOKS];

// Format date into "Sep 14, 2026"
export function formatLogDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Relative day label: "Today", "Yesterday", or "Sep 12, 2026"
export function getRelativeDayLabel(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Earlier';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfEvent = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (startOfEvent.getTime() === startOfToday.getTime()) {
    return 'Today';
  } else if (startOfEvent.getTime() === startOfYesterday.getTime()) {
    return 'Yesterday';
  } else {
    return formatLogDate(d);
  }
}

// Default initial activities - clean with zero dummy data
const DEFAULT_ACTIVITIES = [];

const LEGACY_DUMMY_IDS = new Set([
  'm-in-the-mood-for-love',
  'm-stalker',
  'b-ficciones',
  'm-paris-texas',
  'm-persona',
  'b-the-secret-history',
  'b-invisible-cities',
  'm-drive-my-car',
  'm-yi-yi',
  'act-1',
  'act-2',
  'act-3',
  'act-4',
  'act-5',
]);

export function getActivities(type) {
  let all = DEFAULT_ACTIVITIES;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('user_activities');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out any legacy dummy records
          all = parsed.filter(
            (a) => !LEGACY_DUMMY_IDS.has(a.id) && !LEGACY_DUMMY_IDS.has(a.contentId)
          );
        }
      }
    } catch {}
  }
  if (!type) return all;
  return all.filter((a) => a.contentType === type);
}

export function recordActivity(entry) {
  if (typeof window === 'undefined') return;
  try {
    const current = getActivities();
    const newEntry = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      ...entry,
    };
    const updated = [newEntry, ...current].slice(0, 150);
    localStorage.setItem('user_activities', JSON.stringify(updated));
    window.dispatchEvent(new Event('activityUpdated'));
    return newEntry;
  } catch {}
}

export function getUserFavourites(type) {
  if (typeof window === 'undefined') return [];
  const pool = type ? (type === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS) : ALL_CURATED;
  const results = [];
  for (const item of pool) {
    try {
      if (localStorage.getItem(`fav_${item._id}`) === 'true') {
        results.push(item);
      }
    } catch {}
  }
  return results;
}

export function getUserLiked(type) {
  if (typeof window === 'undefined') return [];
  const pool = type ? (type === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS) : ALL_CURATED;
  const results = [];
  for (const item of pool) {
    try {
      if (localStorage.getItem(`like_${item._id}`) === 'true') {
        results.push(item);
      }
    } catch {}
  }
  return results;
}

export function getUserWatched(type = 'MOVIE') {
  if (typeof window === 'undefined') return [];
  const pool = type === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS;
  const targetStatus = type === 'MOVIE' ? 'WATCHED' : 'READ';
  const results = [];
  for (const item of pool) {
    try {
      if (localStorage.getItem(`status_${item._id}`) === targetStatus) {
        results.push(item);
      }
    } catch {}
  }
  return results;
}

export function getUserWatchlist(type = 'MOVIE') {
  if (typeof window === 'undefined') return [];
  const pool = type === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS;
  const targetStatuses = type === 'MOVIE' ? ['WATCHLIST'] : ['WANT_TO_READ', 'CURRENTLY_READING'];
  const results = [];
  for (const item of pool) {
    try {
      const s = localStorage.getItem(`status_${item._id}`);
      if (s && targetStatuses.includes(s)) {
        results.push(item);
      }
    } catch {}
  }
  return results;
}

export function getUserRatings() {
  if (typeof window === 'undefined') return [];
  const results = [];
  for (const item of ALL_CURATED) {
    try {
      const score = localStorage.getItem(`rating_${item._id}`);
      if (score && Number(score) > 0) {
        results.push({
          ...item,
          userRating: Number(score),
          loggedDate: localStorage.getItem(`logged_date_${item._id}`) || new Date().toISOString(),
        });
      }
    } catch {}
  }
  return results;
}

export function getUserReviews() {
  if (typeof window === 'undefined') return [];
  const results = [];
  for (const item of ALL_CURATED) {
    try {
      const raw = localStorage.getItem(`review_${item._id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.body) {
          results.push({
            ...item,
            reviewBody: parsed.body,
            reviewTitle: parsed.title,
            rating: parsed.rating || Number(localStorage.getItem(`rating_${item._id}`)) || null,
            createdAt: parsed.createdAt || new Date().toISOString(),
          });
        }
      }
    } catch {}
  }
  return results;
}


export function getLoggedDate(contentId) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`logged_date_${contentId}`) || null;
  } catch {
    return null;
  }
}

export function getLoggedStatus(contentId) {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`status_${contentId}`) || null;
  } catch {
    return null;
  }
}
