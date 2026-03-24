"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useNews } from "@/app/context/NewsContext";
import { predictVideo } from "@/app/lib/api-client";
import { Upload, Loader, ArrowLeft } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import styles from "./edit.module.css";

interface DBArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  tags: string[];
  aiResult: string | null;
  aiConfidence: number | null;
  aiVerified: boolean;
  publishedAt: string;
  author: { name: string; email: string };
}

interface ValidationResult {
  status: "pending" | "success" | "error";
  label?: "Real" | "AI-generated";
  confidence?: number;
  message?: string;
}

export default function EditArticlePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user, isPublisher } = useAuth();
  const { refreshArticles } = useNews();

  const [article, setArticle] = useState<DBArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Politics");
  const [tags, setTags] = useState("");

  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!isPublisher) {
      router.push("/");
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        if (data.article) {
          const a = data.article;
          setArticle(a);
          setTitle(a.title);
          setExcerpt(a.excerpt || "");
          setContent(a.content);
          setCategory(a.category || "Politics");
          setTags(a.tags?.join(", ") || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isPublisher, router]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
  };

  const validateMedia = async () => {
    if (!media || mediaType !== "video") {
      setValidationResult({
        status: "error",
        message: "Only video files can be validated.",
      });
      return;
    }
    setIsValidating(true);
    setValidationResult({ status: "pending" });
    try {
      const data = await predictVideo(media);
      if (!data) throw new Error("No prediction returned");
      const label = data.label === "Real" ? "Real" : "AI-generated";
      const confidencePercent = Math.round(data.confidence * 100);
      setValidationResult({
        status: "success",
        label: label as "Real" | "AI-generated",
        confidence: confidencePercent,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Validation failed.";
      setValidationResult({ status: "error", message });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (media && mediaType === "video" && !validationResult?.label) {
      alert("Please validate the new video before saving");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = article?.imageUrl || null;
      let videoUrl = article?.videoUrl || null;
      let aiResult = article?.aiResult || null;
      let aiConfidence = article?.aiConfidence || null;

      // Upload new media if provided
      if (media) {
        const formData = new FormData();
        formData.append("file", media);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        if (mediaType === "image") {
          imageUrl = uploadData.url;
          videoUrl = null;
        } else {
          videoUrl = uploadData.url;
          imageUrl = null;
          aiResult = validationResult?.label || null;
          aiConfidence = validationResult?.confidence
            ? validationResult.confidence / 100
            : null;
        }
      }

      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          category,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          imageUrl,
          videoUrl,
          aiResult,
          aiConfidence,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      refreshArticles();
      router.push(`/news/${id}`);
    } catch (err) {
      alert("Failed to save article");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div style={{ padding: "2rem", color: "white", textAlign: "center" }}>
          Loading...
        </div>
        <Footer />
      </>
    );

  if (!article)
    return (
      <>
        <Header />
        <div style={{ padding: "2rem", color: "white", textAlign: "center" }}>
          Article not found
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.formCard}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className={styles.heading}>Edit Article</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Excerpt</label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Category</label>
              <select
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

            <div className={styles.formGroup}>
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. politics, nepal, news"
              />
            </div>

            {/* Current Media */}
            <div className={styles.formGroup}>
              <label>Current Media</label>
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt="current"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                />
              )}
              {article.videoUrl && (
                <video
                  src={article.videoUrl}
                  controls
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                />
              )}
            </div>

            {/* Replace Media */}
            <div className={styles.formGroup}>
              <label>Replace Media (optional)</label>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className={styles.fileInput}
                />
                <div className={styles.uploadPlaceholder}>
                  <Upload size={28} />
                  <p>Click to upload new image or video</p>
                </div>
              </div>
              {mediaPreview && (
                <div style={{ marginTop: "8px" }}>
                  {mediaType === "image" ? (
                    <img
                      src={mediaPreview}
                      alt="preview"
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      controls
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Validation for new video */}
            {media && mediaType === "video" && (
              <div className={styles.formGroup}>
                <label>Media Validation</label>
                {!validationResult && (
                  <button
                    type="button"
                    className={styles.validateButton}
                    onClick={validateMedia}
                    disabled={isValidating}
                  >
                    {isValidating ? (
                      <>
                        <Loader size={16} /> Validating...
                      </>
                    ) : (
                      "Validate Video"
                    )}
                  </button>
                )}
                {validationResult?.status === "success" && (
                  <div
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      backgroundColor:
                        validationResult.label === "Real"
                          ? "rgba(22,163,74,0.15)"
                          : "rgba(220,38,38,0.15)",
                      color:
                        validationResult.label === "Real"
                          ? "#22c55e"
                          : "#ef4444",
                      border: `1px solid ${validationResult.label === "Real" ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`,
                    }}
                  >
                    {validationResult.label === "Real"
                      ? "✓ Real"
                      : "⚠ AI-Generated"}{" "}
                    — {validationResult.confidence}% confidence
                    <button
                      type="button"
                      onClick={() => setValidationResult(null)}
                      style={{
                        marginLeft: "12px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "inherit",
                      }}
                    >
                      Re-validate
                    </button>
                  </div>
                )}
                {validationResult?.status === "error" && (
                  <div style={{ color: "#ef4444", padding: "8px" }}>
                    {validationResult.message}
                  </div>
                )}
              </div>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader size={16} /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
