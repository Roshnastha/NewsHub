'use client';

import { useState } from 'react';
import { Menu, X, Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './Header.module.css';

const categories = ['Politics','Technology','Business','Sports','Entertainment','Science','Health'];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { user, logout, isLoggedIn } = useAuth();

  const handleCategoryClick = (category: string) => {
    const slug = category.toLowerCase().replace(/\s+/g, '-');
    router.push(`/category/${slug}`);
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo} onClick={handleLogoClick} style={{ cursor: 'pointer' }}>NewsHub</div>
        <nav className={styles.nav}>
          {categories.map(cat => (
            <button
              key={cat}
              className={styles.navItem}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
        <div className={styles.actions}>
          <button className={styles.themeToggle} onClick={() => setTheme(theme==='dark'?'light':'dark')}>
            {theme==='dark'?<Sun size={20} />:<Moon size={20} />}
          </button>
          
          {isLoggedIn && user ? (
            <div className={styles.userProfile}>
              <div className={styles.userInfo}>
                <User size={20} />
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userRole}>{user.role}</span>
              </div>
              <button 
                className={styles.logoutButton}
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button className={styles.loginButton} onClick={handleLoginClick}>
              Sign In
            </button>
          )}
          
          <button className={styles.menuButton} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen?<X size={24} />:<Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav className={styles.mobileNav}>
          {categories.map(cat => (
            <button
              key={cat}
              className={styles.mobileNavItem}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
