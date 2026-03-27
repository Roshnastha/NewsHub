'use client';

import { useEffect, useRef } from 'react';
import styles from './BreakingNews.module.css';
import { useNews } from '@/app/context/NewsContext';
import { useRouter } from 'next/navigation';

export default function BreakingNews() {
  const { articles, dbArticles } = useNews();
  const router = useRouter();
  const tickerRef = useRef<HTMLDivElement>(null);

  const breaking = articles.filter(a => a.category === 'Breaking News');
  const allHeadlines = [
    ...breaking.map(a => ({ title: a.title, id: String(a.id) })),
    ...dbArticles.map(a => ({ title: a.title, id: a.id })),
  ];

  if (allHeadlines.length === 0) return null;

  const tickerContent = allHeadlines.map(a => a.title).join('   •   ');

  return (
    <div className={styles.breakingNews}>
      <span className={styles.breakingLabel}>🔴 Breaking News</span>
      <div className={styles.tickerWrapper}>
        <div className={styles.ticker}>
          <span className={styles.tickerContent}>
            {tickerContent}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{tickerContent}
          </span>
        </div>
      </div>
    </div>
  );
}