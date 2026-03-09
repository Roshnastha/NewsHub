'use client';

import { useState } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Separator } from '@/app/components/ui/separator';
import { TrendingUp, Calendar, Mail, Cloud, DollarSign, Users } from 'lucide-react';
import styles from './Sidebar.module.css';

const trendingTopics = [
  { topic: 'Artificial Intelligence', posts: 234 },
  { topic: 'Climate Change', posts: 189 },
  { topic: 'Cryptocurrency', posts: 156 },
  { topic: 'Space Exploration', posts: 143 },
  { topic: 'Healthcare Innovation', posts: 128 },
];

const popularArticles = [
  {
    title: 'The Future of Work in AI Era',
    readTime: '7 min read',
    views: '12.3k',
  },
  {
    title: 'Understanding Quantum Physics',
    readTime: '5 min read',
    views: '8.7k',
  },
  {
    title: 'Sustainable Living Guide',
    readTime: '9 min read',
    views: '6.2k',
  },
];

const stockData = [
  { symbol: 'AAPL', price: '$182.52', change: '+2.4%', positive: true },
  { symbol: 'GOOGL', price: '$138.21', change: '+1.8%', positive: true },
  { symbol: 'TSLA', price: '$248.50', change: '-0.7%', positive: false },
  { symbol: 'MSFT', price: '$378.85', change: '+3.1%', positive: true },
];

export default function Sidebar() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <aside className={styles.sidebar}>
      {/* Weather Widget */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Cloud className={styles.cardIcon} />
            <span>Weather</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.weatherWidget}>
            <div className={styles.weatherValue}>18°C</div>
            <div className={styles.weatherCondition}>Partly Cloudy</div>
            <div className={styles.weatherGrid}>
              <div className={styles.weatherItem}>
                <div className={styles.weatherLabel}>High</div>
                <div className={styles.weatherData}>22°C</div>
              </div>
              <div className={styles.weatherItem}>
                <div className={styles.weatherLabel}>Low</div>
                <div className={styles.weatherData}>15°C</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Mail className={styles.cardIcon} />
            <span>Newsletter</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          <p className={styles.formDescription}>Get the latest news delivered to your inbox daily.</p>
          <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
            <input
              type="email"
              className={styles.formInput}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className={styles.submitButton}>
              Subscribe Now
            </button>
          </form>
          <p className={styles.formNote}>Join 50,000+ subscribers. Unsubscribe anytime.</p>
        </div>
      </div>

      {/* Trending Topics */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <TrendingUp className={styles.cardIcon} />
            <span>Trending Topics</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.topicsList}>
            {trendingTopics.map((item, index) => (
              <div key={item.topic} className={styles.topicItem}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <span className={styles.topicNumber}>#{index + 1}</span>
                  <span className={styles.topicName}>{item.topic}</span>
                </div>
                <div className={styles.topicCount}>
                  {item.posts}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Ticker */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <DollarSign className={styles.cardIcon} />
            <span>Market Watch</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.stockList}>
            {stockData.map((stock) => (
              <div key={stock.symbol} className={styles.stockItem}>
                <div className={styles.stockInfo}>
                  <div className={styles.stockSymbol}>{stock.symbol}</div>
                  <div className={styles.stockPrice}>{stock.price}</div>
                </div>
                <div className={`${styles.stockChange} ${stock.positive ? styles.positive : styles.negative}`}>
                  {stock.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular This Week */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            <Users className={styles.cardIcon} />
            <span>Popular This Week</span>
          </h3>
        </div>
        <div className={styles.cardContent}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {popularArticles.map((article, index) => (
              <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <h4 style={{ margin: 0, marginBottom: '4px', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-600)', color: 'var(--color-text-primary)' }}>
                  {article.title}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  <span>{article.readTime}</span>
                  <span>{article.views} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Follow Us</h3>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.socialGrid}>
            <button className={styles.socialButton}>Twitter</button>
            <button className={styles.socialButton}>Facebook</button>
            <button className={styles.socialButton}>LinkedIn</button>
            <button className={styles.socialButton}>Instagram</button>
          </div>
        </div>
      </div>
    </aside>
  );
}