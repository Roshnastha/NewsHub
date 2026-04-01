"use client";

import { useState, useEffect } from "react";
import styles from "./HeroSection.module.css";
import { useNews  } from '@/context';

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const { dbArticles } = useNews();
  const slides = dbArticles.slice(0, 5);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(
      () => setCurrent((prev) => (prev + 1) % slides.length),
      5000,
    );
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className={styles.hero}>
      {slides[current].imageUrl ? (
        <img
          src={slides[current].imageUrl}
          alt={slides[current].title}
          className={styles.heroImage}
        />
      ) : slides[current].videoUrl ? (
        <video
          src={slides[current].videoUrl}
          className={styles.heroImage}
          autoPlay
          muted
          loop
          style={{ objectFit: 'cover' }}
        />
      ) : null}
      <div className={styles.heroOverlay}>
        <h2 className={styles.heroTitle}>{slides[current].title}</h2>
      </div>
    </section>
  );
}
