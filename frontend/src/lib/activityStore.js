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

// Default initial activities
const DEFAULT_ACTIVITIES = [
  {
    id: 'act-1',
    type: 'RATED',
    title: 'In the Mood for Love',
    contentType: 'MOVIE',
    contentId: 'm-in-the-mood-for-love',
    creator: 'Wong Kar-wai',
    score: 4.9,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'act-2',
    type: 'LIKED',
    title: 'Stalker',
    contentType: 'MOVIE',
    contentId: 'm-stalker',
    creator: 'Andrei Tarkovsky',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-3',
    type: 'FAVORITED',
    title: 'Ficciones',
    contentType: 'BOOK',
    contentId: 'b-ficciones',
    creator: 'Jorge Luis Borges',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-4',
    type: 'WATCHED',
    title: 'Paris, Texas',
    contentType: 'MOVIE',
    contentId: 'm-paris-texas',
    creator: 'Wim Wenders',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-5',
    type: 'REVIEWED',
    title: 'Persona',
    contentType: 'MOVIE',
    contentId: 'm-persona',
    creator: 'Ingmar Bergman',
    reviewSnippet: 'A haunting psychological exploration of identity and silence.',
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
  },
];

export function getActivities(type) {
  let all = DEFAULT_ACTIVITIES;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('user_activities');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          all = parsed;
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
  // Default fallback items if none favorited yet
  if (results.length === 0) {
    if (!type) {
      return pool.filter(c => ['m-in-the-mood-for-love', 'b-ficciones', 'm-stalker'].includes(c._id));
    }
    if (type === 'MOVIE') {
      return pool.filter(c => ['m-in-the-mood-for-love', 'm-stalker'].includes(c._id));
    }
    if (type === 'BOOK') {
      return pool.filter(c => ['b-ficciones', 'b-the-secret-history'].includes(c._id));
    }
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
  if (results.length === 0) {
    if (!type) {
      return pool.filter(c => ['m-stalker', 'b-the-secret-history', 'm-paris-texas'].includes(c._id));
    }
    if (type === 'MOVIE') {
      return pool.filter(c => ['m-stalker', 'm-paris-texas'].includes(c._id));
    }
    if (type === 'BOOK') {
      return pool.filter(c => ['b-the-secret-history', 'b-dune'].includes(c._id));
    }
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
  if (results.length === 0) {
    if (type === 'MOVIE') {
      return pool.filter(c => ['m-in-the-mood-for-love', 'm-paris-texas'].includes(c._id));
    } else {
      return pool.filter(c => ['b-the-secret-history', 'b-the-master-and-margarita'].includes(c._id));
    }
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
  if (results.length === 0) {
    if (type === 'MOVIE') {
      return pool.filter(c => ['m-stalker', 'm-persona'].includes(c._id));
    } else {
      return pool.filter(c => ['b-ficciones', 'b-dune'].includes(c._id));
    }
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
