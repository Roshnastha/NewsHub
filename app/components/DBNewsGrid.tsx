"use client";

import { useNews } from "@/app/context/NewsContext";
import { useRouter } from "next/navigation";
import styles from "./NewsGrid.module.css";

export default function DBNewsGrid() {
  const { dbArticles } = useNews();
  const router = useRouter();

  if (dbArticles.length === 0) return null;

  return (
    <div>
      <h2 style={{ padding: "1rem", fontSize: "1.5rem", fontWeight: "bold" }}>
        Latest Articles
      </h2>
      <div className={styles.grid}>
        {dbArticles.map((article) => (
          <div
            key={article.id}
            className={styles.card}
            onClick={() => router.push(`/news/${article.id}`)}
            style={{ cursor: "pointer" }}
          >
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            )}
            {article.videoUrl && (
              <video
                src={article.videoUrl}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            )}
            <div style={{ padding: "1rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#60a5fa" }}>
                {article.category}
              </span>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  margin: "0.5rem 0",
                }}
              >
                {article.title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                {article.excerpt}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                }}
              >
                <span>{article.author.name}</span>
                <span
                  style={{
                    color: article.aiResult === "Real" ? "#22c55e" : "#ef4444",
                    fontWeight: "600",
                  }}
                >
                  {article.aiResult === "Real" ? "✓ Real" : "⚠ AI-Generated"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
