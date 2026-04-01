"use client";

import Header from "./Header";
import HeroSection from "./HeroSection";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import BreakingNews from "./BreakingNews";
import DBNewsGrid from "./DBNewsGrid";
import styles from "./Home.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Header />
      <BreakingNews />
      <HeroSection />
      <main className={styles.main}>
        <div className={styles.mainGrid}>
          <div>
            <DBNewsGrid />
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
