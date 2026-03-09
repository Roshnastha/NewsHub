'use client';

import Header from './Header';
import HeroSection from './HeroSection';
import NewsGrid from './NewsGrid';
import Sidebar from './Sidebar';
import Footer from './Footer';
import BreakingNews from './BreakingNews';
import styles from './Home.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Header />
      <BreakingNews />
      <HeroSection />
      <main className={styles.main}>
        <div className={styles.mainGrid}>
          <div>
            <NewsGrid />
          </div>
          <div>
            <Sidebar />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
