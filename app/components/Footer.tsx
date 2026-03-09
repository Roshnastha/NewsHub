'use client';

import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerGrid}>
          <div className={styles.footerSection}>
            <h3>NewsPortal</h3>
            <p>Your trusted source for breaking news and analysis.</p>
            <div className={styles.socialLinks}>
              <div className={styles.socialLink}><Facebook size={20} /></div>
              <div className={styles.socialLink}><Twitter size={20} /></div>
              <div className={styles.socialLink}><Instagram size={20} /></div>
              <div className={styles.socialLink}><Youtube size={20} /></div>
            </div>
          </div>
          <div className={styles.footerSection}>
            <h4>Quick Links</h4>
            <ul className={styles.footerLinks}>
              {['Home','Politics','Business','Technology','Sports'].map(link => (
                <li key={link}><a href="#">{link}</a></li>
              ))}
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Categories</h4>
            <ul className={styles.footerLinks}>
              {['World News','Entertainment','Health','Science','Opinion'].map(cat => (
                <li key={cat}><a href="#">{cat}</a></li>
              ))}
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Contact</h4>
            <div className={styles.contactItem}><Mail size={16} /> news@newsportal.com</div>
            <div className={styles.contactItem}><Phone size={16} /> +1 (555) 123-4567</div>
            <div className={styles.contactItem}><MapPin size={16} /> 123 News Street</div>
          </div>
        </div>
        <div className={styles.footerDivider}>
          <div className={styles.footerBottom}>
            <span>© 2025 NewsPortal. All rights reserved.</span>
            <div>Designed with ❤️</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
