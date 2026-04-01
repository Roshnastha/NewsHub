"use client";

import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  useCallback,
} from "react";
import { newsArticles, NewsArticle } from "@/lib/news-data";

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

interface NewsContextType {
  articles: NewsArticle[];
  dbArticles: DBArticle[];
  addArticle: (article: Omit<NewsArticle, "id">) => void;
  updateArticle: (id: number, article: Partial<NewsArticle>) => void;
  deleteArticle: (id: number) => void;
  refreshArticles: () => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<NewsArticle[]>(newsArticles);
  const [dbArticles, setDbArticles] = useState<DBArticle[]>([]);

  const fetchDBArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        const data = await res.json();
        setDbArticles(data.articles || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/articles");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setDbArticles(data.articles || []);
        }
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addArticle = useCallback(
    (article: Omit<NewsArticle, "id">) => {
      const newId = Math.max(...articles.map((a) => a.id), 0) + 1;
      setArticles((prev) => [{ ...article, id: newId }, ...prev]);
    },
    [articles],
  );

  const updateArticle = useCallback(
    (id: number, updates: Partial<NewsArticle>) => {
      setArticles((prev) =>
        prev.map((article) =>
          article.id === id ? { ...article, ...updates } : article,
        ),
      );
    },
    [],
  );

  const deleteArticle = useCallback((id: number) => {
    setArticles((prev) => prev.filter((article) => article.id !== id));
  }, []);

  return (
    <NewsContext.Provider
      value={{
        articles,
        dbArticles,
        addArticle,
        updateArticle,
        deleteArticle,
        refreshArticles: fetchDBArticles,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) throw new Error("useNews must be used within NewsProvider");
  return context;
}
