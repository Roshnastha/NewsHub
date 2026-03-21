"use client";

import { useState } from "react";
import { X, Upload, Loader } from "lucide-react";
import { useNews } from "@/app/context/NewsContext";
import { useAuth } from "@/app/context/AuthContext";
import { predictVideo } from "@/app/lib/api-client";
import styles from "./AddNewsModal.module.css";

interface ValidationResult {
  status: "pending" | "success" | "error";
  label?: "Real" | "AI-generated";
  confidence?: number;
  message?: string;
}

interface AddNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNewsModal({ isOpen, onClose }: AddNewsModalProps) {
  const { refreshArticles } = useNews();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Politics");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategory("Politics");
    setMedia(null);
    setMediaPreview("");
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
      setValidationResult(null);

      if (file.type.startsWith("image/")) {
        setMediaType("image");
        const reader = new FileReader();
        reader.onload = (e) => setMediaPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        setMediaType("video");
        const reader = new FileReader();
        reader.onload = (e) => setMediaPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const validateMedia = async () => {
    if (!media) return;

    if (mediaType !== "video") {
      setValidationResult({
        status: "error",
        message: "Only video files can be validated at the moment.",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult({ status: "pending" });

    try {
      const data = await predictVideo(media);
      if (!data) throw new Error("No prediction returned from server");

      const label = data.label === "Real" ? "Real" : "AI-generated";
      const confidencePercent = Math.round(data.confidence * 100);

      setValidationResult({
        status: "success",
        label: label as "Real" | "AI-generated",
        confidence: confidencePercent,
        message: `${label} (${confidencePercent}% confidence)`,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Validation failed. Please try again.";
      setValidationResult({
        status: "error",
        message,
      });
      console.error("validation error", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !excerpt || !content || !media || !validationResult?.label) {
      alert("Please fill all fields and validate media");
      return;
    }

    if (!user?.id) {
      alert("You must be logged in to publish");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload media to Cloudinary
      const formData = new FormData();
      formData.append("file", media);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        console.error("Upload failed:", errData);
        throw new Error("Media upload failed");
      }
      const uploadData = await uploadRes.json();
      console.log("Upload success:", uploadData);

      const imageUrl = mediaType === "image" ? uploadData.url : null;
      const videoUrl = mediaType === "video" ? uploadData.url : null;

      // Step 2: Save article to database
      const articleRes = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          category,
          imageUrl,
          videoUrl,
          tags: [category.toLowerCase()],
          featured: false,
          aiResult: validationResult.label,
          aiConfidence: validationResult.confidence
            ? validationResult.confidence / 100
            : null,
          aiVerified: true,
          authorId: user.id,
        }),
      });

      if (!articleRes.ok) throw new Error("Failed to save article");

      // Refresh DB articles
      refreshArticles();
      handleClose();
    } catch (error) {
      alert("Failed to publish article. Please try again.");
      console.error(error);
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
                {mediaType === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className={styles.preview}
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className={styles.preview}
                  />
                )}
              </div>
            )}
          </div>

          {/* Validation Section */}
          {media && (
            <div className={styles.validationSection}>
              <div className={styles.validationHeader}>
                <h3>Media Verification</h3>
                {validationResult?.status !== "pending" && (
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
                      "Re-validate"
                    ) : (
                      "Validate Media"
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

              {validationResult?.status === "success" && (
                <div
                  className={`${styles.result} ${
                    validationResult.label === "Real"
                      ? styles.success
                      : styles.danger
                  }`}
                >
                  <div className={styles.resultContent}>
                    <p
                      className={
                        validationResult.label === "Real"
                          ? styles.labelReal
                          : styles.labelFake
                      }
                    >
                      {validationResult.label === "Real"
                        ? "✓ Real"
                        : "⚠ AI-Generated"}
                    </p>
                    <p className={styles.confidence}>
                      Confidence: {validationResult.confidence}%
                    </p>
                  </div>
                  <div className={styles.badge}>
                    {validationResult.label === "Real"
                      ? "✓ Verified"
                      : "⚠ Warning"}
                  </div>
                </div>
              )}

              {validationResult?.status === "error" && (
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
                  Validate Media
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
                "Publish Article"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
