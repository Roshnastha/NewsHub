'use client';

import { useState } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { useNews } from '@/app/context/NewsContext';
import { predictVideo } from '@/app/lib/api-client';
import styles from './AddNewsModal.module.css';

interface ValidationResult {
  status: 'pending' | 'success' | 'error';
  label?: 'Real' | 'AI-generated';
  confidence?: number;
  message?: string;
}

interface AddNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNewsModal({ isOpen, onClose }: AddNewsModalProps) {
  const { addArticle } = useNews();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  // default to first non-breaking category
  const [category, setCategory] = useState('Politics');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    // Reset all form state when closing
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('Politics');
    setMedia(null);
    setMediaPreview('');
    setMediaType(null);
    setValidationResult(null);
    setIsValidating(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setValidationResult(null); // Reset validation

      // Determine media type
      if (file.type.startsWith('image/')) {
        setMediaType('image');
        const reader = new FileReader();
        reader.onload = (e) => setMediaPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
        const reader = new FileReader();
        reader.onload = (e) => setMediaPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };


  const validateMedia = async () => {
    if (!media) return;

    // only videos are supported by the detection model
    if (mediaType !== 'video') {
      setValidationResult({
        status: 'error',
        message: 'Only video files can be validated at the moment.',
      });
      return;
    }

    setIsValidating(true);
    setValidationResult({ status: 'pending' });

    try {
      // use shared API client so the url from NEXT_PUBLIC_API_URL is respected
      const data = await predictVideo(media);
      if (!data) {
        throw new Error('No prediction returned from server');
      }

      const label = data.label === 'Real' ? 'Real' : 'AI-generated';
      const confidencePercent = Math.round(data.confidence * 100);

      setValidationResult({
        status: 'success',
        label: label as 'Real' | 'AI-generated',
        confidence: confidencePercent,
        message: `${label} (${confidencePercent}% confidence)`,
      });
    } catch (error: any) {
      // the api-client throws with a message from the response or default
      setValidationResult({
        status: 'error',
        message: error.message || 'Validation failed. Please try again.',
      });
      console.error('validation error', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !excerpt || !content || !media || !validationResult?.label) {
      alert('Please fill all fields and validate media');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new article with validation result
      const newArticle = {
        id: Date.now(),
        title,
        excerpt,
        content,
        category,
        author: 'You',
        publishedAt: 'just now',
        readTime: '3 min',
        image: mediaPreview,
        views: '0',
        comments: 0,
        tags: category.toLowerCase().split(' '),
        trending: true,
        featured: false,
        modelResult: validationResult.label as 'Real' | 'AI-generated',
      };

      addArticle(newArticle);

      // Reset form and close modal
      handleClose();
    } catch (error) {
      alert('Failed to add article');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Add New Article</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.formGroup}>
            <label htmlFor="title">Article Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title"
              required
            />
          </div>

          {/* Excerpt */}
          <div className={styles.formGroup}>
            <label htmlFor="excerpt">Excerpt</label>
            <input
              id="excerpt"
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the article"
              required
            />
          </div>

          {/* Content */}
          <div className={styles.formGroup}>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full article content"
              rows={6}
              required
            />
          </div>

          {/* Category */}
          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
                      <option>Technology</option>
              <option>Science</option>
              <option>Business</option>
              <option>Sports</option>
              <option>Entertainment</option>
              <option>Politics</option>
            </select>
          </div>

          {/* Media Upload */}
          <div className={styles.formGroup}>
            <label htmlFor="media">Upload Image or Video</label>
            <div className={styles.uploadArea}>
              <input
                id="media"
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className={styles.fileInput}
              />
              <div className={styles.uploadPlaceholder}>
                <Upload size={32} />
                <p>Click to upload or drag and drop</p>
                <span>PNG, JPG, MP4, WebM up to 100MB</span>
              </div>
            </div>

            {/* Media Preview */}
            {mediaPreview && (
              <div className={styles.previewContainer}>
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Preview" className={styles.preview} />
                ) : (
                  <video src={mediaPreview} controls className={styles.preview} />
                )}
              </div>
            )}
          </div>

          {/* Validation Section */}
          {media && (
            <div className={styles.validationSection}>
              <div className={styles.validationHeader}>
                <h3>Media Verification</h3>
                {validationResult?.status !== 'pending' && (
                  <button
                    type="button"
                    onClick={validateMedia}
                    disabled={isValidating}
                    className={styles.validateButton}
                  >
                    {isValidating ? (
                      <>
                        <Loader size={16} className={styles.spinner} />
                        Validating...
                      </>
                    ) : validationResult ? (
                      'Re-validate'
                    ) : (
                      'Validate Media'
                    )}
                  </button>
                )}
              </div>

              {isValidating && (
                <div className={styles.loadingState}>
                  <Loader size={20} className={styles.spinner} />
                  <p>Analyzing media with AI model...</p>
                </div>
              )}

              {validationResult?.status === 'success' && (
                <div className={`${styles.result} ${styles.success}`}>
                  <div className={styles.resultContent}>
                    <p className={styles.label}>
                      {validationResult.label === 'Real' ? '✓ Real' : '⚠ AI-Generated'}
                    </p>
                    <p className={styles.confidence}>
                      Confidence: {validationResult.confidence}%
                    </p>
                  </div>
                  <div className={styles.badge}>
                    {validationResult.label === 'Real' ? '✓ Verified' : '⚠ Warning'}
                  </div>
                </div>
              )}

              {validationResult?.status === 'error' && (
                <div className={`${styles.result} ${styles.error}`}>
                  <p>{validationResult.message}</p>
                </div>
              )}

              {!validationResult && !isValidating && (
                <button
                  type="button"
                  onClick={validateMedia}
                  disabled={isValidating}
                  className={styles.validateButton}
                >
                  {isValidating ? (
                    <>
                      <Loader size={16} className={styles.spinner} />
                      Validating...
                    </>
                  ) : (
                    'Validate Media'
                  )}
                </button>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || !validationResult?.label}
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className={styles.spinner} />
                  Publishing...
                </>
              ) : (
                'Publish Article'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
