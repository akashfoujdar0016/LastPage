'use client';

import { CURATED_MOVIES, CURATED_BOOKS } from './curatedCatalogue';

// Pre-seeded peer users
// Pre-seeded community peer profiles (Zero dummy reviews/ratings/likes/favorites)
export const PEER_USERS = [
  {
    _id: 'user-elena-v',
    username: 'elena_v',
    displayName: 'Elena Vance',
    bio: 'Film archivist & essayist. Obsessed with cinematic history and classical literature.',
    avatarUrl: '',
    initial: 'E',
    followersCount: 0,
    followingCount: 0,
    reviewsCount: 0,
    watched: [],
    favourites: [],
    likes: [],
    watchlist: [],
    activities: [],
  },
  {
    _id: 'user-marcus-k',
    username: 'marcus_k',
    displayName: 'Marcus Klein',
    bio: 'Literary critic and late-night cinephile. Exploring world classics.',
    avatarUrl: '',
    initial: 'M',
    followersCount: 0,
    followingCount: 0,
    reviewsCount: 0,
    watched: [],
    favourites: [],
    likes: [],
    watchlist: [],
    activities: [],
  },
  {
    _id: 'user-sophia-r',
    username: 'sophia_r',
    displayName: 'Sophia Ren',
    bio: 'Cinematographer and journal writer.',
    avatarUrl: '',
    initial: 'S',
    followersCount: 0,
    followingCount: 0,
    reviewsCount: 0,
    watched: [],
    favourites: [],
    likes: [],
    watchlist: [],
    activities: [],
  },
  {
    _id: 'user-julian-b',
    username: 'julian_b',
    displayName: 'Julian Barnes',
    bio: 'Independent bookstore curator and projectionist.',
    avatarUrl: '',
    initial: 'J',
    followersCount: 0,
    followingCount: 0,
    reviewsCount: 0,
    watched: [],
    favourites: [],
    likes: [],
    watchlist: [],
    activities: [],
  },
];

// Read active user's followed list from localStorage
export function getFollowingList() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('user_following_list');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

// Read active user's followers list from localStorage
export function getFollowersList() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('user_followers_list');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

// Check if currently following username
export function isFollowingUser(username) {
  const list = getFollowingList();
  return list.includes(username.toLowerCase());
}

// Toggle follow / unfollow
export function toggleFollowUser(username) {
  if (typeof window === 'undefined') return false;
  const uname = username.toLowerCase();
  const list = getFollowingList();
  const nextFollowing = !list.includes(uname);
  let updatedList;
  if (nextFollowing) {
    updatedList = [...list, uname];
  } else {
    updatedList = list.filter(u => u !== uname);
  }
  try {
    localStorage.setItem('user_following_list', JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('socialUpdated', { detail: { username: uname, following: nextFollowing } }));
  } catch {}
  return nextFollowing;
}

// Get user profile by username
export function getUserByUsername(username) {
  if (!username) return null;
  const uname = username.toLowerCase();
  // Check active user
  let activeUser = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) activeUser = JSON.parse(raw);
    } catch {}
  }

  const isCurrent =
    (activeUser && (activeUser.username?.toLowerCase() === uname || activeUser.id === uname || activeUser._id === uname)) ||
    uname === 'me' ||
    uname === 'member';

  if (isCurrent) {
    const following = getFollowingList();
    const followers = getFollowersList();
    return {
      _id: activeUser?._id || activeUser?.id || 'user-active-me',
      username: activeUser?.username || 'curator',
      displayName: activeUser?.displayName || activeUser?.username || 'Curator',
      bio: activeUser?.bio || '',
      avatarUrl: activeUser?.avatarUrl || '',
      location: activeUser?.location || '',
      website: activeUser?.website || '',
      favoriteGenres: activeUser?.favoriteGenres || [],
      initial: (activeUser?.displayName || activeUser?.username || 'C').charAt(0).toUpperCase(),
      followersCount: followers.length,
      followingCount: following.length,
      isSelf: true,
      watched: [],
      favourites: [],
      likes: [],
      watchlist: [],
      activities: [],
    };
  }

  // Find in peer users
  const peer = PEER_USERS.find(u => u.username.toLowerCase() === uname);
  if (peer) {
    const followingList = getFollowingList().map(x => x.toLowerCase());
    const isFollowed = followingList.includes(uname);
    return {
      ...peer,
      followersCount: peer.followersCount + (isFollowed ? 1 : 0),
      isFollowing: isFollowed,
      isSelf: false,
    };
  }

  return null;
}

// Get accounts list for modal (Following or Followers)
export function getAccountsForModal(type, targetUsername) {
  const followingList = getFollowingList().map(x => x.toLowerCase());
  const followersList = getFollowersList().map(x => x.toLowerCase());

  let currentUsername = 'curator';
  let activeUser = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        activeUser = JSON.parse(raw);
        if (activeUser?.username) currentUsername = activeUser.username.toLowerCase();
      }
    } catch {}
  }

  const isCurrentUser =
    !targetUsername ||
    targetUsername === 'me' ||
    targetUsername === 'member' ||
    targetUsername.toLowerCase() === currentUsername;

  if (isCurrentUser) {
    if (type === 'FOLLOWING') {
      return PEER_USERS.filter(p => followingList.includes(p.username.toLowerCase()));
    } else {
      return PEER_USERS.filter(p => followersList.includes(p.username.toLowerCase()));
    }
  } else {
    // For peer user
    const targetUname = targetUsername.toLowerCase();
    if (type === 'FOLLOWERS') {
      const list = [];
      if (followingList.includes(targetUname)) {
        list.push({
          username: activeUser?.username || 'curator',
          displayName: activeUser?.displayName || activeUser?.username || 'You (Curator)',
          bio: activeUser?.bio || 'Cultural journal curator.',
          initial: (activeUser?.displayName || activeUser?.username || 'Y').charAt(0).toUpperCase(),
          isSelf: true,
        });
      }
      return list;
    }
    return [];
  }
}

// Aggregate Friends Activity Stream
export function getFriendsActivity() {
  const followingList = getFollowingList();
  const friends = PEER_USERS.filter(u => followingList.includes(u.username));
  const feed = [];
  for (const friend of friends) {
    for (const act of friend.activities) {
      feed.push({
        ...act,
        user: {
          username: friend.username,
          displayName: friend.displayName,
          initial: friend.initial,
        },
      });
    }
  }
  // Sort descending by date
  feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return feed;
}

// Toggle like on a friend activity entry
export function toggleActivityLike(activityId) {
  if (typeof window === 'undefined') return false;
  try {
    const key = `act_like_${activityId}`;
    const next = localStorage.getItem(key) !== 'true';
    localStorage.setItem(key, String(next));
    window.dispatchEvent(new CustomEvent('socialUpdated', { detail: { activityId, liked: next } }));
    return next;
  } catch {}
  return false;
}

export function isActivityLiked(activityId) {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`act_like_${activityId}`) === 'true';
  } catch {}
  return false;
}

// Search peers/friends by query across username, displayName, and bio
export function searchUsers(query = '', excludeUsername = '') {
  const cleanQ = (query || '').trim().toLowerCase();
  const followingList = getFollowingList();

  return PEER_USERS
    .filter(u => {
      if (excludeUsername && u.username.toLowerCase() === excludeUsername.toLowerCase()) {
        return false;
      }
      if (!cleanQ) return true;
      return (
        u.username.toLowerCase().includes(cleanQ) ||
        (u.displayName && u.displayName.toLowerCase().includes(cleanQ)) ||
        (u.bio && u.bio.toLowerCase().includes(cleanQ))
      );
    })
    .map(u => ({
      ...u,
      isFollowing: followingList.includes(u.username),
    }));
}

