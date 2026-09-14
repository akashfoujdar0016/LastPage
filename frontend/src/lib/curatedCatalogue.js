// ── Curated Masterpieces Dataset ──
// Uses specific Unsplash photo IDs (not search queries) for reliable delivery

export const CURATED_MOVIES = [
  {
    _id: 'm-in-the-mood-for-love',
    type: 'MOVIE',
    title: 'In the Mood for Love',
    year: 2000,
    genres: ['Romance', 'Drama', 'Art House'],
    creatorNames: ['Wong Kar-wai'],
    director: 'Wong Kar-wai',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    description: 'Two neighbors form a delicate, unspoken bond after discovering their spouses are having an affair. Set against the tight corridors of 1962 British Hong Kong, it is a masterwork of longing, color, and restraint.',
    averageRating: 4.9, ratingCount: 1840, likeCount: 1420, favoriteCount: 980, featured: true,
  },
  {
    _id: 'm-yi-yi',
    type: 'MOVIE',
    title: 'Yi Yi',
    year: 2000,
    genres: ['Drama', 'Family', 'Art House'],
    creatorNames: ['Edward Yang'],
    director: 'Edward Yang',
    // Night city lights — reflects Yi Yi's Taipei urban world
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
    description: 'A luminous, multi-perspective examination of a modern Taipei family\'s emotional and philosophical lives.',
    averageRating: 4.9, ratingCount: 1150, likeCount: 880, favoriteCount: 740,
  },
  {
    _id: 'm-stalker',
    type: 'MOVIE',
    title: 'Stalker',
    year: 1979,
    genres: ['Sci-Fi', 'Philosophy', 'Art House'],
    creatorNames: ['Andrei Tarkovsky'],
    director: 'Andrei Tarkovsky',
    // Foggy abandoned industrial / overgrown structure
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
    description: 'A guide leads a writer and a scientist through a forbidden \'Zone\' to a room said to fulfill humanity\'s deepest desires.',
    averageRating: 4.8, ratingCount: 1120, likeCount: 780, favoriteCount: 610,
  },
  {
    _id: 'm-blade-runner-2049',
    type: 'MOVIE',
    title: 'Blade Runner 2049',
    year: 2017,
    genres: ['Sci-Fi', 'Neo-Noir', 'Atmospheric'],
    creatorNames: ['Denis Villeneuve'],
    director: 'Denis Villeneuve',
    // Vast golden desert — fits BR2049's landscape cinematography
    imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80',
    description: 'Officer K uncovers a secret that leads him to Rick Deckard in a stunning neo-noir vision of future Los Angeles.',
    averageRating: 4.8, ratingCount: 2650, likeCount: 1980, favoriteCount: 1240,
  },
  {
    _id: 'm-paris-texas',
    type: 'MOVIE',
    title: 'Paris, Texas',
    year: 1984,
    genres: ['Drama', 'Road Movie', 'Poetic'],
    creatorNames: ['Wim Wenders'],
    director: 'Wim Wenders',
    // Empty road stretching to horizon — quintessential road movie
    imageUrl: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=800&q=80',
    description: 'A silent wanderer emerges from the Texas desert, trying to reconstruct his shattered past and find his estranged family.',
    averageRating: 4.8, ratingCount: 1290, likeCount: 940, favoriteCount: 710,
  },
  {
    _id: 'm-persona',
    type: 'MOVIE',
    title: 'Persona',
    year: 1966,
    genres: ['Psychological Drama', 'Mystery'],
    creatorNames: ['Ingmar Bergman'],
    director: 'Ingmar Bergman',
    // Stark black and white portrait — Bergman's psychological vision
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
    description: 'An acclaimed actress goes mute; her nurse\'s identity slowly fuses with her own in this psychological masterwork.',
    averageRating: 4.7, ratingCount: 890, likeCount: 620, favoriteCount: 450,
  },
  {
    _id: 'm-grand-budapest',
    type: 'MOVIE',
    title: 'The Grand Budapest Hotel',
    year: 2014,
    genres: ['Comedy', 'Drama', 'Aesthetic'],
    creatorNames: ['Wes Anderson'],
    director: 'Wes Anderson',
    // European ornate building / symmetrical architecture
    imageUrl: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80',
    description: 'The exploits of legendary concierge M. Gustave in a fictional Central European spa town between the wars.',
    averageRating: 4.7, ratingCount: 2310, likeCount: 1680, favoriteCount: 990,
  },
  {
    _id: 'm-drive-my-car',
    type: 'MOVIE',
    title: 'Drive My Car',
    year: 2021,
    genres: ['Drama', 'Meditative'],
    creatorNames: ['Ryusuke Hamaguchi'],
    director: 'Ryusuke Hamaguchi',
    // Quiet mountain road at dawn — reflective and understated
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    description: 'A widowed theater director assigned a driver for his red Saab 900 while mounting Chekhov\'s Uncle Vanya.',
    averageRating: 4.7, ratingCount: 920, likeCount: 680, favoriteCount: 510,
  },
];

export const CURATED_BOOKS = [
  {
    _id: 'b-ficciones',
    type: 'BOOK',
    title: 'Ficciones',
    year: 1944,
    genres: ['Philosophical Fiction', 'Short Stories', 'Labyrinthine'],
    authorNames: ['Jorge Luis Borges'],
    author: 'Jorge Luis Borges',
    // Open book on table with coffee — literary study atmosphere
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    description: 'A labyrinth of metaphysical paradoxes, infinite hexagonal libraries, and imaginary encyclopedias that transformed world literature.',
    averageRating: 4.9, ratingCount: 1420, likeCount: 1180, favoriteCount: 960, featured: true,
  },
  {
    _id: 'b-invisible-cities',
    type: 'BOOK',
    title: 'Invisible Cities',
    year: 1972,
    genres: ['Poetic Fiction', 'Philosophy', 'Architecture'],
    authorNames: ['Italo Calvino'],
    author: 'Italo Calvino',
    // Ancient misty city architecture — ethereal
    imageUrl: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&q=80',
    description: 'Marco Polo recounts dazzling, impossible descriptions of fifty-five imaginary cities to Kublai Khan.',
    averageRating: 4.8, ratingCount: 1250, likeCount: 980, favoriteCount: 810,
  },
  {
    _id: 'b-the-secret-history',
    type: 'BOOK',
    title: 'The Secret History',
    year: 1992,
    genres: ['Psychological Fiction', 'Dark Academia', 'Mystery'],
    authorNames: ['Donna Tartt'],
    author: 'Donna Tartt',
    // Autumn ivy campus / old university architecture
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
    description: 'A cloistered Greek scholars group at a Vermont college descends irrevocably into betrayal and murder.',
    averageRating: 4.8, ratingCount: 2450, likeCount: 1890, favoriteCount: 1340,
  },
  {
    _id: 'b-dune',
    type: 'BOOK',
    title: 'Dune',
    year: 1965,
    genres: ['Science Fiction', 'Epic', 'Ecology'],
    authorNames: ['Frank Herbert'],
    author: 'Frank Herbert',
    // Vast sand dunes under dramatic sky
    imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80',
    description: 'Feudal geopolitics, messianic destiny, and ecology on the hostile desert world of Arrakis.',
    averageRating: 4.8, ratingCount: 3100, likeCount: 2400, favoriteCount: 1650,
  },
  {
    _id: 'b-the-master-and-margarita',
    type: 'BOOK',
    title: 'The Master and Margarita',
    year: 1967,
    genres: ['Satire', 'Magic Realism', 'Russian Classic'],
    authorNames: ['Mikhail Bulgakov'],
    author: 'Mikhail Bulgakov',
    // Golden lamplight European street at night
    imageUrl: 'https://images.unsplash.com/photo-1538681105587-85640961bf8b?w=800&q=80',
    description: 'Satan arrives in atheistic 1930s Moscow alongside a demonic black cat, upending Soviet bureaucracy.',
    averageRating: 4.8, ratingCount: 1140, likeCount: 890, favoriteCount: 710,
  },
  {
    _id: 'b-norwegian-wood',
    type: 'BOOK',
    title: 'Norwegian Wood',
    year: 1987,
    genres: ['Literary Fiction', 'Memory', 'Tokyo'],
    authorNames: ['Haruki Murakami'],
    author: 'Haruki Murakami',
    // Golden autumn forest path
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    description: 'A Beatles song sends Toru Watanabe into his youth amidst turbulent 1960s Tokyo student movements.',
    averageRating: 4.6, ratingCount: 1920, likeCount: 1350, favoriteCount: 920,
  },
  {
    _id: 'b-the-remains-of-the-day',
    type: 'BOOK',
    title: 'The Remains of the Day',
    year: 1989,
    genres: ['Literary Fiction', 'English Period', 'Nobel'],
    authorNames: ['Kazuo Ishiguro'],
    author: 'Kazuo Ishiguro',
    // English countryside rolling mist-covered hills
    imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
    description: 'A loyal English butler\'s motoring journey quietly reveals the tragic cost of unexamined devotion.',
    averageRating: 4.8, ratingCount: 1080, likeCount: 840, favoriteCount: 670,
  },
  {
    _id: 'b-the-dispossessed',
    type: 'BOOK',
    title: 'The Dispossessed',
    year: 1974,
    genres: ['Science Fiction', 'Utopian Theory', 'Philosophy'],
    authorNames: ['Ursula K. Le Guin'],
    author: 'Ursula K. Le Guin',
    // Barren rocky otherworldly landscape / philosophic solitude
    imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80',
    description: 'A physicist from an anarchist moon travels to its decadent twin planet to bridge their divided worlds.',
    averageRating: 4.8, ratingCount: 940, likeCount: 730, favoriteCount: 590,
  },
];

export function getCuratedItems(type) {
  return type === 'MOVIE' ? CURATED_MOVIES : CURATED_BOOKS;
}
