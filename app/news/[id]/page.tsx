"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  User,
} from "lucide-react";
import { useNews } from "@/app/context/NewsContext";
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

const aiBadgeStyle = (result: string | null) => ({
  position: "absolute" as const,
  bottom: "65px",
  left: "16px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  backgroundColor: result === "Real" ? "#16a34a" : "#dc2626",
  color: "white",
  padding: "6px 14px",
  borderRadius: "9999px",
  fontSize: "0.8rem",
  fontWeight: "700",
  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
});

export default function ArticleDetail() {
  const router = useRouter();
  const params = useParams();
  const { articles } = useNews();
  const [dbArticle, setDbArticle] = useState<DBArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const id = params.id as string;
  const numericId = parseInt(id);
  const isDummyArticle = !isNaN(numericId);

  const dummyArticle = isDummyArticle
    ? articles.find((a) => a.id === numericId)
    : null;

  useEffect(() => {
    if (isDummyArticle) {
      setLoading(false);
      return;
    }
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
  }, [id, isDummyArticle]);

  const getModelBadgeColor = (result?: string | null) => {
    switch (result) {
      case "Real":
        return styles.badgeReal;
      case "AI-generated":
        return styles.badgeAIGenerated;
      case "Fake":
        return styles.badgeFake;
      case "Suspicious":
        return styles.badgeSuspicious;
      default:
        return styles.badgeUnverified;
    }
  };

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

  if (!dummyArticle && !dbArticle) {
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

  // Render DB article
  if (dbArticle) {
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
                  <div style={aiBadgeStyle(dbArticle.aiResult)}>
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

  // Render dummy article
  const article = dummyArticle!;
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
              <span className={styles.category}>{article.category}</span>
              {article.trending && (
                <span className={styles.trending}>📈 Trending</span>
              )}
            </div>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.excerpt}>{article.excerpt}</p>

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
          </header>

          {/* Dummy article image with badge overlay */}
          {article.image && (
            <div
              className={styles.imageContainer}
              style={{ position: "relative" }}
            >
              <img
                src={article.image}
                alt={article.title}
                className={styles.articleImage}
              />
              {article.modelResult && (
                <div
                  style={aiBadgeStyle(
                    article.modelResult === "Real" ? "Real" : "AI-generated",
                  )}
                >
                  {article.modelResult === "Real" && "✓ Real"}
                  {article.modelResult === "AI-generated" && "⚠ AI Generated"}
                  {article.modelResult === "Fake" && "✗ Fake"}
                  {article.modelResult === "Suspicious" && "❓ Suspicious"}
                  {article.modelResult === "Unverified" && "❔ Unverified"}
                </div>
              )}
            </div>
          )}

          <div className={styles.content}>
            <div
              className={styles.articleText}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className={styles.tags}>
              {article.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <footer className={styles.articleFooter}>
            <div className={styles.stats}>
              <span className={styles.stat}>
                <MessageCircle size={18} />
                {article.comments} Comments
              </span>
              <span className={styles.stat}>{article.views} Views</span>
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
