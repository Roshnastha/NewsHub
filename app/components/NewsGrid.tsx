'use client';
import { useEffect } from "react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, User, Bookmark, Share2, MessageCircle, TrendingUp, Plus } from 'lucide-react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useNews } from '@/app/context/NewsContext';
import { useAuth } from '@/app/context/AuthContext';
import NewsModal from './NewsModal';
import AddNewsModal from './AddNewsModal';
import styles from './NewsGrid.module.css';

export function NewsGrid() {
  const { articles, deleteArticle } = useNews();
  const { user, isPublisher } = useAuth();
  const [bookmarkedArticles, setBookmarkedArticles] = useState<number[]>([]);
  const [editingArticle, setEditingArticle] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddNewsModalOpen, setIsAddNewsModalOpen] = useState(false);
  const router = useRouter();

  const toggleBookmark = (articleId: number) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleEdit = (articleId: number) => {
    setEditingArticle(articleId);
    setIsModalOpen(true);
  };

  const handleDelete = (articleId: number) => {
    if (confirm('Are you sure you want to delete this article?')) {
      deleteArticle(articleId);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div>
          <div className={styles.trendingHeader}>
            <TrendingUp className={styles.trendingIcon} />
            <span className={styles.trendingTitle}>Trending Now</span>
            {isPublisher && (
              <button 
                className={styles.addNewsButton}
                onClick={() => setIsAddNewsModalOpen(true)}
                title="Add new article"
              >
                <Plus size={18} />
                Add News
              </button>
            )}
          </div>
        </div>

        <div>
          <div className={styles.newsGrid}>
            {articles.map((article) => (
              <article 
                key={article.id}
                className={styles.newsCard}
              >
                <div className={styles.cardImage}>
                  <img
                    src={article.image}
                    alt={article.title}
                    onClick={() => router.push(`/news/${article.id}`)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className={styles.cardBadges}>
                    <div className={styles.badge}>
                      {article.category}
                    </div>
                    {article.trending && (
                      <div className={`${styles.badge} ${styles.trending}`}>
                        <TrendingUp className={styles.badgeIcon} />
                        Trending
                      </div>
                    )}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.bookmarkButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(article.id);
                      }}
                      title="Bookmark"
                    >
                      <Bookmark 
                        size={20}
                        fill={bookmarkedArticles.includes(article.id) ? "currentColor" : "none"}
                      />
                    </button>
                    {isPublisher && (
                      <>
                        <button
                          className={styles.editButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(article.id);
                          }}
                          title="Edit article"
                        >
                          <MdEdit size={22} />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(article.id);
                          }}
                          title="Delete article"
                        >
                          <MdDelete size={22} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <h3 
                    className={styles.cardTitle}
                    onClick={() => router.push(`/news/${article.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {article.title}
                  </h3>
                  
                  <p className={styles.cardExcerpt}>
                    {article.excerpt}
                  </p>

                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <User className={styles.metaIcon} />
                      <span>{article.author}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Clock className={styles.metaIcon} />
                      <span>{article.publishedAt}</span>
                    </div>
                    <span>{article.readTime}</span>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.commentCount}>
                      <MessageCircle size={16} />
                      <span>{article.comments}</span>
                    </div>
                    <button className={styles.readMore}>
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.loadMore}>
          <button className={styles.loadMoreButton}>
            Load More Articles
          </button>
        </div>
      </div>

      <NewsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingArticle(null);
        }}
        article={editingArticle ? articles.find(a => a.id === editingArticle) : undefined}
        isEdit={editingArticle !== null}
      />

      <AddNewsModal
        isOpen={isAddNewsModalOpen}
        onClose={() => setIsAddNewsModalOpen(false)}
      />
    </>
  );
}

export default NewsGrid;
