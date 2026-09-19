'use client';

import CollectionLayout from '../../components/CollectionLayout';
import { getUserLiked } from '../../lib/activityStore';

export default function LikedPage() {
  return (
    <CollectionLayout
      title="Liked"
      kicker="YOUR COLLECTION"
      mode="DUAL"
      getItems={(category) => getUserLiked(category)}
      emptyConfig={(category) => ({
        title: `No liked ${category === 'MOVIE' ? 'films' : 'books'} yet.`,
        subtitle: `Click like on any ${category === 'MOVIE' ? 'film' : 'book'} to add it here.`,
        ctaText: `Browse ${category === 'MOVIE' ? 'Films' : 'Books'} →`,
        ctaHref: category === 'MOVIE' ? '/movies' : '/books',
      })}
    />
  );
}
