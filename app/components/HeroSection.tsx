'use client';

import { useState, useEffect } from 'react';
import styles from './HeroSection.module.css';
import { newsArticles } from '@/lib/news-data';

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const slides = newsArticles.slice(0, 10);
  
  useEffect(() => { 
    const t = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 5000); 
    return () => clearInterval(t);
  }, [slides.length]);
  
  return (
    <section className={styles.hero}>
      <img src={slides[current].image} alt={slides[current].title} className={styles.heroImage} />
      <div className={styles.heroOverlay}>
        <h2 className={styles.heroTitle}>{slides[current].title}</h2>
      </div>
    </section>
  );
}
