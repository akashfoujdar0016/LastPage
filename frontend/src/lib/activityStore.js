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
  const addedIds = new Set();

  for (const item of pool) {
    try {
      const f1 = localStorage.getItem(`fav_${item._id}`);
      const f2 = item.slug ? localStorage.getItem(`fav_${item.slug}`) : null;
      if (f1 === 'true' || f2 === 'true') {
        results.push(item);
        addedIds.add(item._id);
        if (item.slug) addedIds.add(item.slug);
      }
    } catch {}
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fav_') && localStorage.getItem(key) === 'true') {
        const rawId = key.replace('fav_', '');
        if (!addedIds.has(rawId)) {
          const found = ALL_CURATED.find((c) => c._id === rawId || c.slug === rawId);
          if (found && (type ? found.type === type : true) && !addedIds.has(found._id)) {
            results.push(found);
            addedIds.add(found._id);
          }
        }
      }
    }
  } catch {}

  return results;
}

export function getUserLiked(type) {
  if (typeof window === 'undefined') return [];
  const pool = type ? (type === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS) : ALL_CURATED;
  const results = [];
  const addedIds = new Set();

  for (const item of pool) {
    try {
      const l1 = localStorage.getItem(`like_${item._id}`);
      const l2 = item.slug ? localStorage.getItem(`like_${item.slug}`) : null;
      if (l1 === 'true' || l2 === 'true') {
        results.push(item);
        addedIds.add(item._id);
        if (item.slug) addedIds.add(item.slug);
      }
    } catch {}
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('like_') && localStorage.getItem(key) === 'true') {
        const rawId = key.replace('like_', '');
        if (!addedIds.has(rawId)) {
          const found = ALL_CURATED.find((c) => c._id === rawId || c.slug === rawId);
          if (found && (type ? found.type === type : true) && !addedIds.has(found._id)) {
            results.push(found);
            addedIds.add(found._id);
          }
        }
      }
    }
  } catch {}

  return results;
}

export function getUserWatched(type = 'MOVIE') {
  if (typeof window === 'undefined') return [];
  const pool = type === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS;
  const targetStatus = type === 'MOVIE' ? 'WATCHED' : 'READ';
  const results = [];
  const addedIds = new Set();

  for (const item of pool) {
    try {
      const s1 = localStorage.getItem(`status_${item._id}`);
      const s2 = item.slug ? localStorage.getItem(`status_${item.slug}`) : null;
      if (s1 === targetStatus || s2 === targetStatus) {
        results.push(item);
        addedIds.add(item._id);
        if (item.slug) addedIds.add(item.slug);
      }
    } catch {}
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('status_')) {
        const val = localStorage.getItem(key);
        if (val === targetStatus) {
          const rawId = key.replace('status_', '');
          if (!addedIds.has(rawId)) {
            const found = ALL_CURATED.find((c) => c._id === rawId || c.slug === rawId);
            if (found && (type ? found.type === type : true) && !addedIds.has(found._id)) {
              results.push(found);
              addedIds.add(found._id);
            }
          }
        }
      }
    }
  } catch {}

  return results;
}

export function getUserWatchlist(type = 'MOVIE') {
  if (typeof window === 'undefined') return [];
  const pool = type === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS;
  const targetStatuses = type === 'MOVIE' ? ['WATCHLIST'] : ['WANT_TO_READ', 'CURRENTLY_READING'];
  const results = [];
  const addedIds = new Set();

  for (const item of pool) {
    try {
      const s1 = localStorage.getItem(`status_${item._id}`);
      const s2 = item.slug ? localStorage.getItem(`status_${item.slug}`) : null;
      const s = s1 || s2;
      if (s && targetStatuses.includes(s)) {
        results.push(item);
        addedIds.add(item._id);
        if (item.slug) addedIds.add(item.slug);
      }
    } catch {}
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('status_')) {
        const val = localStorage.getItem(key);
        if (val && targetStatuses.includes(val)) {
          const rawId = key.replace('status_', '');
          if (!addedIds.has(rawId)) {
            const found = ALL_CURATED.find((c) => c._id === rawId || c.slug === rawId);
            if (found && (type ? found.type === type : true) && !addedIds.has(found._id)) {
              results.push(found);
              addedIds.add(found._id);
            }
          }
        }
      }
    }
  } catch {}

  return results;
}

export function getUserRatings() {
  if (typeof window === 'undefined') return [];
  const results = [];
  const addedIds = new Set();

  for (const item of ALL_CURATED) {
    try {
      const r1 = localStorage.getItem(`rating_${item._id}`);
      const r2 = item.slug ? localStorage.getItem(`rating_${item.slug}`) : null;
      const score = r1 || r2;
      if (score && Number(score) > 0) {
        results.push({
          ...item,
          userRating: Number(score),
          loggedDate: localStorage.getItem(`logged_date_${item._id}`) || localStorage.getItem(`logged_date_${item.slug}`) || new Date().toISOString(),
        });
        addedIds.add(item._id);
        if (item.slug) addedIds.add(item.slug);
      }
    } catch {}
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('rating_')) {
        const val = localStorage.getItem(key);
        if (val && Number(val) > 0) {
          const rawId = key.replace('rating_', '');
          if (!addedIds.has(rawId)) {
            const found = ALL_CURATED.find((c) => c._id === rawId || c.slug === rawId);
            if (found && !addedIds.has(found._id)) {
              results.push({
                ...found,
                userRating: Number(val),
                loggedDate: localStorage.getItem(`logged_date_${rawId}`) || new Date().toISOString(),
              });
              addedIds.add(found._id);
            }
          }
        }
      }
    }
  } catch {}

  return results;
}

export function getUserReviews() {
  if (typeof window === 'undefined') return [];
  const results = [];
  const addedIds = new Set();

  for (const item of ALL_CURATED) {
    try {
      const r1 = localStorage.getItem(`review_${item._id}`);
      const r2 = item.slug ? localStorage.getItem(`review_${item.slug}`) : null;
      const raw = r1 || r2;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.body) {
          results.push({
            ...item,
            reviewBody: parsed.body,
            reviewTitle: parsed.title,
            rating: parsed.rating || Number(localStorage.getItem(`rating_${item._id}`)) || Number(localStorage.getItem(`rating_${item.slug}`)) || null,
            createdAt: parsed.createdAt || new Date().toISOString(),
          });
          addedIds.add(item._id);
          if (item.slug) addedIds.add(item.slug);
        }
      }
    } catch {}
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('review_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const rawId = key.replace('review_', '');
          if (!addedIds.has(rawId)) {
            const parsed = JSON.parse(raw);
            if (parsed?.body) {
              const found = ALL_CURATED.find((c) => c._id === rawId || c.slug === rawId);
              if (found && !addedIds.has(found._id)) {
                results.push({
                  ...found,
                  reviewBody: parsed.body,
                  reviewTitle: parsed.title,
                  rating: parsed.rating || Number(localStorage.getItem(`rating_${rawId}`)) || null,
                  createdAt: parsed.createdAt || new Date().toISOString(),
                });
                addedIds.add(found._id);
              }
            }
          }
        }
      }
    }
  } catch {}

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
