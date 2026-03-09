'use client';

import { useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useNews } from '@/app/context/NewsContext';
import NewsModal from '@/app/components/NewsModal';
import styles from '@/app/components/NewsGrid.module.css';
import pageStyles from './category.module.css';
import { Bookmark, MessageCircle, Eye } from 'lucide-react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useState } from 'react';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { articles, deleteArticle } = useNews();
  
  // Decode the slug and find matching articles
  const category = decodeURIComponent(slug).replace(/-/g, ' ');
  const categoryArticles = articles.filter(
    article => article.category.toLowerCase() === category.toLowerCase()
  );

  const [bookmarkedArticles, setBookmarkedArticles] = useState<number[]>([]);
  const [editingArticle, setEditingArticle] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleBookmark = (id: number) => {
    setBookmarkedArticles(prev =>
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
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
      <div>
        <Header />
        <main className={pageStyles.categoryContainer}>
          <div className={pageStyles.header}>
            <h1 className={pageStyles.title}>{category}</h1>
            <p className={pageStyles.subtitle}>
              {categoryArticles.length} {categoryArticles.length === 1 ? 'article' : 'articles'} found
            </p>
          </div>

          {categoryArticles.length > 0 ? (
            <div className={pageStyles.articlesGrid}>
              {categoryArticles.map((article) => (
                <article key={article.id} className={styles.newsCard}>
                  <div className={styles.cardImage}>
                    <img
                      src={article.image}
                      alt={article.title}
                    />
                    <div className={styles.cardActions}>
                      <button
                        className={styles.editButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(article.id);
                        }}
                        title="Edit article"
                      >
                        <MdEdit size={20} />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(article.id);
                        }}
                        title="Delete article"
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                    <div className={styles.cardBadges}>
                      <div className={styles.badge}>{article.category}</div>
                      {article.trending && (
                        <div className={`${styles.badge} ${styles.trending}`}>Trending</div>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h2 className={styles.cardTitle}>{article.title}</h2>
                    <p className={styles.cardExcerpt}>{article.excerpt}</p>

                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        <Eye size={16} /> {article.views}
                      </div>
                      <div className={styles.metaItem}>
                        <span>{article.author}</span>
                      </div>
                      <span>{article.publishedAt}</span>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.commentCount}>
                        <MessageCircle size={16} /> {article.comments}
                      </div>
                    </div>

                    <div className={styles.modelResult}>
                      <span className={styles.modelLabel}>Model Result:</span>
                      <span className={`${styles.modelValue} ${styles[`result${article.modelResult}`]}`}>
                        {article.modelResult || 'Unverified'}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={pageStyles.noArticles}>
              <p>No articles found in this category.</p>
            </div>
          )}
        </main>
        <Footer />
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
    </>
  );
}
