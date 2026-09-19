'use client';

import { BookOpen } from 'lucide-react';
import CollectionLayout from '../../components/CollectionLayout';
import { getUserWatchlist } from '../../lib/activityStore';

export default function ReadingListPage() {
  return (
    <CollectionLayout
      title="Reading List"
      kicker="LIBRARY JOURNAL"
      mode="SINGLE"
      contentType="BOOK"
      icon={BookOpen}
      getItems={() => getUserWatchlist('BOOK')}
      emptyConfig={() => ({
        title: 'Your reading list is empty.',
        subtitle: 'Explore the library and queue works that will expand your mind.',
        ctaText: 'Browse Library →',
        ctaHref: '/books',
      })}
    />
  );
}
