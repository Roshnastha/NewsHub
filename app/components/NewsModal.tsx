'use client';
import { useEffect } from "react";
import { useState } from 'react';
import { X } from 'lucide-react';
import { useNews } from '@/app/context/NewsContext';
import { NewsArticle } from '@/lib/news-data';
import styles from './NewsModal.module.css';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: NewsArticle;
  isEdit?: boolean;
}

export default function NewsModal({ isOpen, onClose, article, isEdit }: NewsModalProps) {
  const { addArticle, updateArticle } = useNews();
  const [formData, setFormData] = useState({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    category: article?.category || 'Breaking News',
    author: article?.author || '',
    image: article?.image || '',
    readTime: article?.readTime || '5 मिनेट',
    tags: article?.tags?.join(', ') || '',
    trending: article?.trending || false,
    featured: article?.featured || false,
  });

  // if the article prop changes while the modal is open, refresh the form values
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        author: article.author,
        image: article.image,
        readTime: article.readTime,
        tags: article.tags.join(', '),
        trending: article.trending || false,
        featured: article.featured || false,
      });
    } else {
      // reset when switching to add mode
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: 'Breaking News',
        author: '',
        image: '',
        readTime: '5 मिनेट',
        tags: '',
        trending: false,
        featured: false,
      });
    }
  }, [article]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = ['Breaking News', 'Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newsData = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      author: formData.author,
      publishedAt: 'अभी',
      readTime: formData.readTime,
      image: formData.image,
      views: '0',
      comments: 0,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      trending: formData.trending,
      featured: formData.featured,
    };

    if (isEdit && article) {
      updateArticle(article.id, newsData);
    } else {
      addArticle(newsData);
    }

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Breaking News',
      author: '',
      image: '',
      readTime: '5 मिनेट',
      tags: '',
      trending: false,
      featured: false,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{isEdit ? 'Edit News' : 'Add New News'}</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter news title..."
              className={errors.title ? styles.error : ''}
            />
            {errors.title && <span className={styles.errorText}>{errors.title}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Excerpt *</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Enter news excerpt..."
              className={errors.excerpt ? styles.error : ''}
              rows={3}
            />
            {errors.excerpt && <span className={styles.errorText}>{errors.excerpt}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter full news content..."
              className={errors.content ? styles.error : ''}
              rows={5}
            />
            {errors.content && <span className={styles.errorText}>{errors.content}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Author *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Enter author name..."
                className={errors.author ? styles.error : ''}
              />
              {errors.author && <span className={styles.errorText}>{errors.author}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Image URL *</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className={errors.image ? styles.error : ''}
            />
            {errors.image && <span className={styles.errorText}>{errors.image}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Read Time</label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                placeholder="e.g., 5 मिनेट"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={formData.trending}
                onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
              />
              <span>Mark as Trending</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <span>Mark as Featured</span>
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {isEdit ? 'Update News' : 'Add News'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
