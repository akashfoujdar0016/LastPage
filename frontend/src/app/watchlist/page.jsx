'use client';

import { Film } from 'lucide-react';
import CollectionLayout from '../../components/CollectionLayout';
import { getUserWatchlist } from '../../lib/activityStore';

export default function WatchlistPage() {
  return (
    <CollectionLayout
      title="Watchlist"
      kicker="CINEMA JOURNAL"
      mode="SINGLE"
      contentType="MOVIE"
      icon={Film}
      getItems={() => getUserWatchlist('MOVIE')}
      emptyConfig={() => ({
        title: 'Your watchlist is empty.',
        subtitle: 'Explore cinema and queue films you wish to experience.',
        ctaText: 'Browse Cinema →',
        ctaHref: '/movies',
      })}
    />
  );
}
