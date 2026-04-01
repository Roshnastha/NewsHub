"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Clock,
  User,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import styles from "./article.module.css";

interface DBArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  tags: string[];
  featured: boolean;
  aiResult: string | null;
  aiConfidence: number | null;
  aiVerified: boolean;
  publishedAt: string;
  author: { name: string; email: string };
}



export default function ArticleDetail() {
  const router = useRouter();
  const params = useParams();
  const [dbArticle, setDbArticle] = useState<DBArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        if (!cancelled && data.article) setDbArticle(data.article);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h1>Loading...</h1>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!dbArticle) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h1>Article not found</h1>
            <button
              onClick={() => router.push("/")}
              className={styles.backButton}
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <article className={styles.articleContainer}>
          <button
            className={styles.backButton}
            onClick={() => router.push("/")}
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <header className={styles.articleHeader}>
            <div className={styles.headerTop}>
              <span className={styles.category}>{dbArticle.category}</span>
            </div>
            <h1 className={styles.title}>{dbArticle.title}</h1>
            <p className={styles.excerpt}>{dbArticle.excerpt}</p>

            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <User size={16} />
                <span>{dbArticle.author.name}</span>
              </div>
              <div className={styles.metaItem}>
                <Clock size={16} />
                <span>
                  {new Date(dbArticle.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </header>

          {/* Media with badge overlay */}
          {(dbArticle.imageUrl || dbArticle.videoUrl) && (
            <div
              className={styles.imageContainer}
              style={{ position: "relative" }}
            >
              {dbArticle.imageUrl ? (
                <img
                  src={dbArticle.imageUrl}
                  alt={dbArticle.title}
                  className={styles.articleImage}
                />
              ) : (
                <video
                  src={dbArticle.videoUrl!}
                  controls
                  className={styles.articleImage}
                  style={{ width: "100%" }}
                />
              )}
              {dbArticle.aiResult && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: dbArticle.aiResult === "Real" ? "#16a34a" : "#dc2626",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    zIndex: 10,
                  }}
                >
                  {dbArticle.aiResult === "Real"
                    ? "✓ Real"
                    : "⚠ AI Generated"}
                </div>
              )}
            </div>
          )}

          <div className={styles.content}>
            <div className={styles.articleText}>{dbArticle.content}</div>
          </div>

          {dbArticle.tags && dbArticle.tags.length > 0 && (
            <div className={styles.tags}>
              {dbArticle.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <footer className={styles.articleFooter}>
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
