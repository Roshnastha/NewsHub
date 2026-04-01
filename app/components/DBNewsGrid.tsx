"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  User,
  Bookmark,
  Share2,
  MessageCircle,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useNews } from "@/app/context/NewsContext";
import { useAuth } from "@/app/context/AuthContext";
import AddNewsModal from './AddNewsModal';
import { MdEdit, MdDelete } from "react-icons/md";
import styles from "./NewsGrid.module.css";

export default function DBNewsGrid() {
  const { dbArticles, refreshArticles } = useNews();
  const { isPublisher } = useAuth();
  const router = useRouter();
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  const [isAddNewsModalOpen, setIsAddNewsModalOpen] = useState(false);



  const toggleBookmark = (id: string) => {
    setBookmarkedArticles((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) refreshArticles();
      else alert("Failed to delete article");
    } catch {
      alert("Failed to delete article");
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/news/${id}/edit`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.trendingHeader}>
        <TrendingUp className={styles.trendingIcon} />
        <span className={styles.trendingTitle}>Latest Articles</span>
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

      <div className={styles.newsGrid}>
        {dbArticles.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
            No articles found. Check back later or add new ones.
          </div>
        ) : (
          dbArticles.map((article) => (
          <article key={article.id} className={styles.newsCard}>
            <div className={styles.cardImage}>
              {article.imageUrl ? (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  onClick={() => router.push(`/news/${article.id}`)}
                  style={{
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : article.videoUrl ? (
                <video
                  src={article.videoUrl}
                  onClick={() => router.push(`/news/${article.id}`)}
                  style={{
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : null}

              {/* Category badge - top left */}
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

              {/* Actions - top right */}
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
                      onClick={(e) => handleEdit(e, article.id)}
                      title="Edit article"
                    >
                      <MdEdit size={22} />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDelete(e, article.id)}
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
                style={{ cursor: "pointer" }}
              >
                {article.title}
              </h3>

              <p className={styles.cardExcerpt}>{article.excerpt}</p>

              <div className={styles.cardMeta}>
                <div className={styles.metaItem}>
                  <User className={styles.metaIcon} />
                  <span>{article.author.name}</span>
                </div>
                <div className={styles.metaItem}>
                  <Clock className={styles.metaIcon} />
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.commentCount}>
                  <MessageCircle size={16} />
                  <span>0</span>
                </div>
                <button className={styles.readMore}>
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </article>
        )))}
      </div>
      
      <AddNewsModal
        isOpen={isAddNewsModalOpen}
        onClose={() => setIsAddNewsModalOpen(false)}
      />
    </div>
  );
}
