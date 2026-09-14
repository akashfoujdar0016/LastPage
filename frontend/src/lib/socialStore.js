'use client';

import { CURATED_MOVIES, CURATED_BOOKS } from './curatedCatalogue';

// Pre-seeded peer users
export const PEER_USERS = [
  {
    _id: 'user-elena-v',
    username: 'elena_v',
    displayName: 'Elena Vance',
    bio: 'Film archivist & essayist. Obsessed with 1960s Japanese cinema, Wong Kar-wai, and French New Wave.',
    avatarUrl: '',
    initial: 'E',
    followersCount: 342,
    followingCount: 188,
    reviewsCount: 46,
    watched: [
      {
        ...CURATED_MOVIES[0], // In the Mood for Love
        userRating: 5.0,
        loggedDate: '2026-09-14T18:30:00.000Z',
        reviewText: 'The slow-motion corridor scenes set to Yumeji\'s Theme will never not devastate me. A masterwork of longing and color.',
      },
      {
        ...CURATED_MOVIES[1], // Yi Yi
        userRating: 4.8,
        loggedDate: '2026-09-10T14:20:00.000Z',
        reviewText: 'Edward Yang shows life in all its messy, simultaneous beauty.',
      },
      {
        ...CURATED_MOVIES[2], // Stalker
        userRating: 4.9,
        loggedDate: '2026-09-02T20:00:00.000Z',
      },
      {
        ...CURATED_MOVIES[3], // Past Lives
        userRating: 4.7,
        loggedDate: '2026-08-28T21:15:00.000Z',
      },
      {
        ...CURATED_BOOKS[0], // Ficciones
        userRating: 5.0,
        loggedDate: '2026-09-13T12:00:00.000Z',
        reviewText: 'Borges creates infinite universes in 4-page stories. The Library of Babel is permanently etched in my mind.',
      },
      {
        ...CURATED_BOOKS[1], // Invisible Cities
        userRating: 4.6,
        loggedDate: '2026-09-04T09:30:00.000Z',
      },
    ],
    favourites: [
      CURATED_MOVIES[0], // In the Mood for Love
      CURATED_MOVIES[2], // Stalker
      CURATED_BOOKS[0],  // Ficciones
    ],
    likes: [
      CURATED_MOVIES[4], // Drive My Car
      CURATED_BOOKS[2],  // The Secret History
    ],
    watchlist: [
      CURATED_MOVIES[5], // Persona
      CURATED_BOOKS[3],  // Kafka on the Shore
    ],
    activities: [
      {
        id: 'elena-act-1',
        type: 'REVIEWED',
        contentType: 'MOVIE',
        contentId: 'm-in-the-mood-for-love',
        title: 'In the Mood for Love',
        creator: 'Wong Kar-wai',
        score: 5.0,
        reviewSnippet: 'The slow-motion corridor scenes set to Yumeji\'s Theme will never not devastate me.',
        createdAt: '2026-09-14T18:30:00.000Z',
        likesCount: 14,
        isLiked: false,
      },
      {
        id: 'elena-act-2',
        type: 'READ',
        contentType: 'BOOK',
        contentId: 'b-ficciones',
        title: 'Ficciones',
        creator: 'Jorge Luis Borges',
        score: 5.0,
        createdAt: '2026-09-13T12:00:00.000Z',
        likesCount: 9,
        isLiked: false,
      },
      {
        id: 'elena-act-3',
        type: 'FAVORITED',
        contentType: 'MOVIE',
        contentId: 'm-stalker',
        title: 'Stalker',
        creator: 'Andrei Tarkovsky',
        createdAt: '2026-09-11T20:00:00.000Z',
        likesCount: 12,
        isLiked: false,
      },
      {
        id: 'elena-act-4',
        type: 'WATCHED',
        contentType: 'MOVIE',
        contentId: 'm-yi-yi',
        title: 'Yi Yi',
        creator: 'Edward Yang',
        score: 4.8,
        createdAt: '2026-09-10T14:20:00.000Z',
        likesCount: 6,
        isLiked: false,
      },
    ],
  },
  {
    _id: 'user-marcus-k',
    username: 'marcus_k',
    displayName: 'Marcus Klein',
    bio: 'Literary critic and late-night cinephile. Reading through 20th-century translations.',
    avatarUrl: '',
    initial: 'M',
    followersCount: 520,
    followingCount: 215,
    reviewsCount: 84,
    watched: [
      {
        ...CURATED_BOOKS[2], // The Secret History
        userRating: 4.9,
        loggedDate: '2026-09-14T16:10:00.000Z',
        reviewText: 'Donna Tartt crafts Greek tragedy in a snowy New England college town. Intoxicating prose.',
      },
      {
        ...CURATED_BOOKS[0], // Ficciones
        userRating: 4.8,
        loggedDate: '2026-09-08T11:00:00.000Z',
      },
      {
        ...CURATED_MOVIES[2], // Stalker
        userRating: 4.9,
        loggedDate: '2026-09-05T22:30:00.000Z',
        reviewText: 'The transition from sepia industrial decay into the lush green Zone remains one of cinema\'s greatest moments.',
      },
      {
        ...CURATED_MOVIES[6], // Blade Runner 2049
        userRating: 4.5,
        loggedDate: '2026-08-30T23:00:00.000Z',
      },
    ],
    favourites: [
      CURATED_BOOKS[2], // The Secret History
      CURATED_MOVIES[2], // Stalker
    ],
    likes: [
      CURATED_BOOKS[1], // Invisible Cities
      CURATED_MOVIES[0], // In the Mood for Love
    ],
    watchlist: [
      CURATED_BOOKS[4], // The Master and Margarita
      CURATED_MOVIES[4], // Drive My Car
    ],
    activities: [
      {
        id: 'marcus-act-1',
        type: 'REVIEWED',
        contentType: 'BOOK',
        contentId: 'b-the-secret-history',
        title: 'The Secret History',
        creator: 'Donna Tartt',
        score: 4.9,
        reviewSnippet: 'Donna Tartt crafts Greek tragedy in a snowy New England college town. Intoxicating prose.',
        createdAt: '2026-09-14T16:10:00.000Z',
        likesCount: 21,
        isLiked: false,
      },
      {
        id: 'marcus-act-2',
        type: 'RATED',
        contentType: 'MOVIE',
        contentId: 'm-stalker',
        title: 'Stalker',
        creator: 'Andrei Tarkovsky',
        score: 4.9,
        createdAt: '2026-09-05T22:30:00.000Z',
        likesCount: 15,
        isLiked: false,
      },
    ],
  },
  {
    _id: 'user-sophia-r',
    username: 'sophia_r',
    displayName: 'Sophia Ren',
    bio: 'Cinematographer based in London. Chasing golden hour and quiet domestic dramas.',
    avatarUrl: '',
    initial: 'S',
    followersCount: 890,
    followingCount: 412,
    reviewsCount: 62,
    watched: [
      {
        ...CURATED_MOVIES[3], // Past Lives
        userRating: 5.0,
        loggedDate: '2026-09-14T19:45:00.000Z',
        reviewText: 'A masterclass in framing space between two people who know what could have been.',
      },
      {
        ...CURATED_MOVIES[4], // Drive My Car
        userRating: 4.9,
        loggedDate: '2026-09-07T21:00:00.000Z',
      },
      {
        ...CURATED_MOVIES[0], // In the Mood for Love
        userRating: 4.8,
        loggedDate: '2026-08-25T20:30:00.000Z',
      },
    ],
    favourites: [
      CURATED_MOVIES[3], // Past Lives
      CURATED_MOVIES[4], // Drive My Car
    ],
    likes: [
      CURATED_MOVIES[1], // Yi Yi
    ],
    watchlist: [
      CURATED_MOVIES[5], // Persona
    ],
    activities: [
      {
        id: 'sophia-act-1',
        type: 'REVIEWED',
        contentType: 'MOVIE',
        contentId: 'm-past-lives',
        title: 'Past Lives',
        creator: 'Celine Song',
        score: 5.0,
        reviewSnippet: 'A masterclass in framing space between two people who know what could have been.',
        createdAt: '2026-09-14T19:45:00.000Z',
        likesCount: 38,
        isLiked: false,
      },
      {
        id: 'sophia-act-2',
        type: 'FAVORITED',
        contentType: 'MOVIE',
        contentId: 'm-drive-my-car',
        title: 'Drive My Car',
        creator: 'Ryusuke Hamaguchi',
        createdAt: '2026-09-07T21:00:00.000Z',
        likesCount: 19,
        isLiked: false,
      },
    ],
  },
  {
    _id: 'user-julian-b',
    username: 'julian_b',
    displayName: 'Julian Barnes',
    bio: 'Independent bookstore curator and 35mm projectionist.',
    avatarUrl: '',
    initial: 'J',
    followersCount: 198,
    followingCount: 140,
    reviewsCount: 31,
    watched: [
      {
        ...CURATED_BOOKS[1], // Invisible Cities
        userRating: 4.8,
        loggedDate: '2026-09-12T15:00:00.000Z',
      },
      {
        ...CURATED_MOVIES[5], // Persona
        userRating: 4.9,
        loggedDate: '2026-09-03T21:40:00.000Z',
      },
    ],
    favourites: [
      CURATED_BOOKS[1],
      CURATED_MOVIES[5],
    ],
    likes: [],
    watchlist: [],
    activities: [
      {
        id: 'julian-act-1',
        type: 'READ',
        contentType: 'BOOK',
        contentId: 'b-invisible-cities',
        title: 'Invisible Cities',
        creator: 'Italo Calvino',
        score: 4.8,
        createdAt: '2026-09-12T15:00:00.000Z',
        likesCount: 8,
        isLiked: false,
      },
    ],
  },
];

// Read active user's followed list from localStorage
export function getFollowingList() {
  if (typeof window === 'undefined') return ['elena_v'];
  try {
    const raw = localStorage.getItem('user_following_list');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return ['elena_v']; // default follow Elena Vance
}

// Read active user's followers list from localStorage
export function getFollowersList() {
  if (typeof window === 'undefined') return ['marcus_k', 'sophia_r'];
  try {
    const raw = localStorage.getItem('user_followers_list');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return ['marcus_k', 'sophia_r'];
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
  const uname = username.toLowerCase();
  // Check active user
  let activeUser = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) activeUser = JSON.parse(raw);
    } catch {}
  }

  if (activeUser && (activeUser.username?.toLowerCase() === uname || uname === 'me')) {
    const following = getFollowingList();
    const followers = getFollowersList();
    return {
      _id: activeUser._id || 'user-active-me',
      username: activeUser.username || 'member',
      displayName: activeUser.displayName || activeUser.username || 'Member',
      bio: activeUser.bio || 'Tracking cinema and literature in a private journal.',
      avatarUrl: activeUser.avatarUrl || '',
      initial: (activeUser.username || 'M').charAt(0).toUpperCase(),
      followersCount: followers.length,
      followingCount: following.length,
      reviewsCount: 8,
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
    const followingList = getFollowingList();
    const isFollowed = followingList.includes(uname);
    return {
      ...peer,
      followersCount: peer.followersCount + (isFollowed && !followingList.includes(uname) ? 0 : isFollowed ? 1 : 0),
      isFollowing: isFollowed,
      isSelf: false,
    };
  }

  return null;
}

// Get accounts list for modal (Following or Followers)
export function getAccountsForModal(type, targetUsername) {
  const followingList = getFollowingList();
  const followersList = getFollowersList();

  if (type === 'FOLLOWING') {
    if (targetUsername === 'me' || targetUsername === 'member') {
      return PEER_USERS.filter(p => followingList.includes(p.username));
    }
    // For peer users, return sample peers they follow
    return PEER_USERS.filter(p => p.username !== targetUsername);
  } else {
    // Followers
    if (targetUsername === 'me' || targetUsername === 'member') {
      return PEER_USERS.filter(p => followersList.includes(p.username));
    }
    return PEER_USERS.filter(p => p.username !== targetUsername);
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
