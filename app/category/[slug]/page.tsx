'use client';

import { useParams, useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useNews } from '@/app/context/NewsContext';
import styles from '@/app/components/NewsGrid.module.css';
import pageStyles from './category.module.css';
import { Bookmark, Clock, User } from 'lucide-react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { dbArticles, refreshArticles } = useNews();
  const { isPublisher } = useAuth();
  
  // Decode the slug and find matching articles
  const category = decodeURIComponent(slug).replace(/-/g, ' ');
  const categoryArticles = dbArticles.filter(
    article => article.category && article.category.toLowerCase() === category.toLowerCase()
  );

  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    setBookmarkedArticles(prev =>
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const handleEdit = (articleId: string) => {
    router.push(`/news/${articleId}/edit`);
  };

  const handleDelete = async (articleId: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
        if (res.ok) refreshArticles();
        else alert("Failed to delete article");
      } catch {
        alert("Failed to delete article");
      }
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
                <article 
                  key={article.id} 
                  className={styles.newsCard}
                  onClick={() => router.push(`/news/${article.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardImage}>
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                      />
                    ) : article.videoUrl ? (
                      <video
                        src={article.videoUrl}
                        className={styles.articleImage}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
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
                          fill={
                            bookmarkedArticles.includes(article.id)
                              ? "currentColor"
                              : "none"
                          }
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
                        </>
                      )}
                    </div>
                    <div className={styles.cardBadges}>
                      <div className={styles.badge}>{article.category}</div>
                    </div>
                    {/* AI/Real badge - bottom left of thumbnail */}
                    {article.aiResult && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "12px",
                          left: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          backgroundColor:
                            article.aiResult === "Real" ? "#16a34a" : "#dc2626",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                          zIndex: 10,
                        }}
                      >
                        {article.aiResult === "Real" ? "✓ Real" : "⚠ AI Generated"}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardContent}>
                    <h2 className={styles.cardTitle}>{article.title}</h2>
                    <p className={styles.cardExcerpt}>{article.excerpt}</p>

                    <div className={styles.cardMeta}>
                      <div className={styles.metaItem}>
                        <User size={16} />
                        <span>{article.author.name}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
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
    </>
  );
}
