'use client';

import styles from './BreakingNews.module.css';
import { useNews } from '@/app/context/NewsContext';
import { useRouter } from 'next/navigation';

export default function BreakingNews() {
  const { articles } = useNews();
  const router = useRouter();

  // show only articles marked as breaking news
  const breaking = articles.filter(a => a.category === 'Breaking News');

  if (breaking.length === 0) {
    return null; // no breaking news to display
  }

  // join titles or show first one
  //const content = breaking.map(a => a.title).join(' | ');

  return (
    <div
      className={styles.breakingNews}
      onClick={() => {
        // navigate to first breaking news article when clicked
        router.push(`/news/${breaking[0].id}`);
      }}
      style={{ cursor: 'pointer' }}
    >
      🔴 Breaking News: {'HERE'}
    </div>
  );
}
