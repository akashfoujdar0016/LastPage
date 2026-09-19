'use client';

import CollectionLayout from '../../components/CollectionLayout';
import { getUserFavourites } from '../../lib/activityStore';

export default function FavouritesPage() {
  return (
    <CollectionLayout
      title="Favourites"
      kicker="YOUR COLLECTION"
      mode="DUAL"
      getItems={(category) => getUserFavourites(category)}
      emptyConfig={(category) => ({
        title: `No favourite ${category === 'MOVIE' ? 'films' : 'books'} yet.`,
        subtitle: `Click favourite on any ${category === 'MOVIE' ? 'film' : 'book'} to add it here.`,
        ctaText: `Browse ${category === 'MOVIE' ? 'Films' : 'Books'} →`,
        ctaHref: category === 'MOVIE' ? '/movies' : '/books',
      })}
    />
  );
}
