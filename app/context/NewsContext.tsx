'use client';

import React, { createContext, useEffect,useContext, useState, useCallback } from 'react';
import { newsArticles, NewsArticle } from '@/lib/news-data';

interface NewsContextType {
  articles: NewsArticle[];
  addArticle: (article: Omit<NewsArticle, 'id'>) => void;
  updateArticle: (id: number, article: Partial<NewsArticle>) => void;
  deleteArticle: (id: number) => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export function NewsProvider({ children }: { children: React.ReactNode }) {
  // start with default list; we'll replace with localStorage data on client
  const [articles, setArticles] = useState<NewsArticle[]>(newsArticles);

  // after mount, read any stored articles
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('newsArticles');
      if (stored) {
        setArticles(JSON.parse(stored) as NewsArticle[]);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const addArticle = useCallback((article: Omit<NewsArticle, 'id'>) => {
    const newId = Math.max(...articles.map(a => a.id), 0) + 1;
    setArticles(prev => [
      { ...article, id: newId },
      ...prev,
    ]);
  }, [articles]);

  const updateArticle = useCallback((id: number, updates: Partial<NewsArticle>) => {
    setArticles(prev =>
      prev.map(article =>
        article.id === id ? { ...article, ...updates } : article
      )
    );
  }, []);

  const deleteArticle = useCallback((id: number) => {
    setArticles(prev => prev.filter(article => article.id !== id));
  }, []);

  // persist changes to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('newsArticles', JSON.stringify(articles));
      }
    } catch {
      // ignore write errors (e.g., quota)
    }
  }, [articles]);

  return (
    <NewsContext.Provider value={{ articles, addArticle, updateArticle, deleteArticle }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within NewsProvider');
  }
  return context;
}
