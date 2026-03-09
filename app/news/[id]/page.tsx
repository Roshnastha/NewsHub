'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Share2, Bookmark, Clock, User } from 'lucide-react';
import { useNews } from '@/app/context/NewsContext';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import styles from './article.module.css';

export default function ArticleDetail() {
  const router = useRouter();
  const params = useParams();
  const { articles } = useNews();
  const articleId = parseInt(params.id as string);
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h1>Article not found</h1>
            <button onClick={() => router.push('/')} className={styles.backButton}>
              <ArrowLeft size={20} />
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getModelBadgeColor = (result?: string) => {
    switch (result) {
      case 'Real':
        return styles.badgeReal;
      case 'AI-generated':
        return styles.badgeAIGenerated;
      case 'Fake':
        return styles.badgeFake;
      case 'Suspicious':
        return styles.badgeSuspicious;
      default:
        return styles.badgeUnverified;
    }
  };

  return (
    <>
      <Header />
      <main className={styles.container}>
        <article className={styles.articleContainer}>
          {/* Back Button */}
          <button className={styles.backButton} onClick={() => router.push('/')}>
            <ArrowLeft size={20} />
            Back
          </button>

          {/* Article Header */}
          <header className={styles.articleHeader}>
            <div className={styles.headerTop}>
              <span className={styles.category}>{article.category}</span>
              {article.trending && (
                <span className={styles.trending}>📈 Trending</span>
              )}
            </div>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.excerpt}>{article.excerpt}</p>

            {/* Article Meta */}
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <User size={16} />
                <span>{article.author}</span>
              </div>
              <div className={styles.metaItem}>
                <Clock size={16} />
                <span>{article.publishedAt}</span>
              </div>
              <span className={styles.readTime}>{article.readTime}</span>
            </div>

            {/* Model Result Badge */}
            {article.modelResult && (
              <div className={styles.modelResultContainer}>
                <span className={`${styles.modelBadge} ${getModelBadgeColor(article.modelResult)}`}>
                  {article.modelResult === 'Real' && '✓ Real'}
                  {article.modelResult === 'AI-generated' && '⚠️ AI-Generated'}
                  {article.modelResult === 'Fake' && '✗ Fake'}
                  {article.modelResult === 'Suspicious' && '❓ Suspicious'}
                  {article.modelResult === 'Unverified' && '❔ Unverified'}
                </span>
              </div>
            )}
          </header>

          {/* Article Image */}
          {article.image && (
            <div className={styles.imageContainer}>
              <img 
                src={article.image} 
                alt={article.title}
                className={styles.articleImage}
              />
            </div>
          )}

          {/* Article Content */}
          <div className={styles.content}>
            <div 
              className={styles.articleText}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className={styles.tags}>
              {article.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Article Footer */}
          <footer className={styles.articleFooter}>
            <div className={styles.stats}>
              <span className={styles.stat}>
                <MessageCircle size={18} />
                {article.comments} Comments
              </span>
              <span className={styles.stat}>
                {article.views} Views
              </span>
            </div>
            <div className={styles.actions}>
              <button className={styles.actionButton} title="Bookmark">
                <Bookmark size={20} />
              </button>
              <button className={styles.actionButton} title="Share">
                <Share2 size={20} />
              </button>
            </div>
          </footer>
        </article>
      </main>
      <Footer />
    </>
  );
}
