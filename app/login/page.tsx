"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  LogIn,
  User,
  PenTool,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { FaGoogle, FaMicrosoft, FaApple } from "react-icons/fa";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const urlError = searchParams.get("error");
  const { setUser } = useAuth();

  const [mode, setMode] = useState<
    | "role-select"
    | "publisher-login"
    | "publisher-register"
    | "reader-signup"
    | "admin-login"
  >("role-select");
  const [selectedRole, setSelectedRole] = useState<
    "user" | "publisher" | "admin" | null
  >(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleLogin = async (e: React.FormEvent, role: string) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        provider: "email",
      });
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReaderSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) {
      setError("Please fill in all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "reader",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      setSuccessMessage(
        "Account created! Please check your email to verify your account.",
      );
      setFormData({ email: "", password: "", name: "", confirmPassword: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublisherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) {
      setError("Please fill in all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "publisher",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      setSuccessMessage(
        "Publisher account requested! Please verify your email. Once verified, an admin will review and approve your account.",
      );
      setFormData({ email: "", password: "", name: "", confirmPassword: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "microsoft" | "apple") => {
    const mockName = `User_${Math.random().toString(36).substr(2, 5)}`;
    const mockEmail = `${mockName}@${provider}.com`;
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      email: mockEmail,
      role: "reader",
      name: mockName,
      provider,
    });
    router.push("/");
  };

  const handleRoleSelect = (role: "user" | "publisher" | "admin") => {
    setSelectedRole(role);
    if (role === "publisher") setMode("publisher-login");
    else if (role === "admin") setMode("admin-login");
    else setMode("reader-signup");
    setError("");
    setSuccessMessage("");
  };

  const handleBackToRole = () => {
    setMode("role-select");
    setSelectedRole(null);
    setFormData({ email: "", password: "", name: "", confirmPassword: "" });
    setError("");
    setSuccessMessage("");
  };

  return (
    <>
      <Header />
      <div className={styles.loginContainer}>
        <div className={styles.loginContent}>
          {mode !== "role-select" && (
            <button className={styles.backButton} onClick={handleBackToRole}>
              <ArrowLeft size={20} />
              Back
            </button>
          )}

          <div className={styles.header}>
            <h1>Welcome to NewsHub</h1>
            <p>
              {mode === "role-select" && "Choose your account type"}
              {mode === "publisher-login" && "Publisher Sign In"}
              {mode === "publisher-register" && "Request Publisher Account"}
              {mode === "reader-signup" && "Create Reader Account"}
              {mode === "admin-login" && "Admin Sign In"}
            </p>
          </div>

          {/* Verified / Error messages */}
          {verified && (
            <div className={styles.success}>
              ✓ Email verified successfully! You can now log in.
            </div>
          )}
          {urlError === "TokenExpired" && (
            <div className={styles.error}>
              Verification link expired. Please register again.
            </div>
          )}

          {/* Role Selection */}
          {mode === "role-select" && (
            <div className={styles.roleSection}>
              <p className={styles.roleLabel}>Select your role:</p>
              <div className={styles.roleButtons}>
                <button
                  className={`${styles.roleButton} ${selectedRole === "user" ? styles.active : ""}`}
                  onClick={() => handleRoleSelect("user")}
                >
                  <User size={24} />
                  <span>Reader</span>
                  <small>Read and explore news</small>
                </button>
                <button
                  className={`${styles.roleButton} ${selectedRole === "publisher" ? styles.active : ""}`}
                  onClick={() => handleRoleSelect("publisher")}
                >
                  <PenTool size={24} />
                  <span>Publisher</span>
                  <small>Create and manage articles</small>
                </button>
                <button
                  className={`${styles.roleButton} ${selectedRole === "admin" ? styles.active : "none"}`}
                  onClick={() => handleRoleSelect("admin")}
                  style={{ display: "none" }}
                >
                  <Shield size={24} />
                  <span>Admin</span>
                  <small>Manage the platform</small>
                </button>
              </div>
            </div>
          )}

          {/* Publisher Login */}
          {mode === "publisher-login" && (
            <>
              <form
                className={styles.form}
                onSubmit={(e) => handleLogin(e, "publisher")}
              >
                {error && <div className={styles.error}>{error}</div>}
                {successMessage && (
                  <div className={styles.success}>{successMessage}</div>
                )}

                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={20} className={styles.icon} />
                    <input
                      type="email"
                      name="email"
                      placeholder="publisher@newsportal.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={20} className={styles.icon} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className={styles.showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  <LogIn size={20} />
                  {loading ? "Signing in..." : "Sign In as Publisher"}
                </button>
              </form>

              <div className={styles.divider}>
                <span>or</span>
              </div>

              <button
                className={styles.secondaryButton}
                onClick={() => {
                  setMode("publisher-register");
                  setError("");
                }}
              >
                Request Publisher Account
              </button>
            </>
          )}

          {/* Publisher Register */}
          {mode === "publisher-register" && (
            <form className={styles.form} onSubmit={handlePublisherRegister}>
              {error && <div className={styles.error}>{error}</div>}
              {successMessage && (
                <div className={styles.success}>{successMessage}</div>
              )}

              <div className={styles.formGroup}>
                <label>Full Name</label>
                <div className={styles.inputWrapper}>
                  <User size={20} className={styles.icon} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={20} className={styles.icon} />
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={20} className={styles.icon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className={styles.showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={20} className={styles.icon} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className={styles.showPassword}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                <Mail size={20} />
                {loading ? "Submitting..." : "Request Publisher Account"}
              </button>
            </form>
          )}

          {/* Admin Login */}
          {mode === "admin-login" && (
            <form
              className={styles.form}
              onSubmit={(e) => handleLogin(e, "admin")}
            >
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.formGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={20} className={styles.icon} />
                  <input
                    type="email"
                    name="email"
                    placeholder="admin@newsportal.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock size={20} className={styles.icon} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className={styles.showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                <Shield size={20} />
                {loading ? "Signing in..." : "Sign In as Admin"}
              </button>
            </form>
          )}

          {/* Reader Sign Up */}
          {mode === "reader-signup" && (
            <>
              <div className={styles.socialSection}>
                <p className={styles.socialLabel}>Sign up with:</p>
                <div className={styles.socialButtons}>
                  <button
                    type="button"
                    className={styles.socialButton}
                    onClick={() => handleSocialLogin("google")}
                  >
                    <FaGoogle size={20} />
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className={styles.socialButton}
                    onClick={() => handleSocialLogin("microsoft")}
                  >
                    <FaMicrosoft size={20} />
                    <span>Microsoft</span>
                  </button>
                  <button
                    type="button"
                    className={styles.socialButton}
                    onClick={() => handleSocialLogin("apple")}
                  >
                    <FaApple size={20} />
                    <span>Apple</span>
                  </button>
                </div>
              </div>

              <div className={styles.divider}>
                <span>or</span>
              </div>

              {successMessage && (
                <div className={styles.success}>{successMessage}</div>
              )}

              <form className={styles.form} onSubmit={handleReaderSignUp}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <div className={styles.inputWrapper}>
                    <User size={20} className={styles.icon} />
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={20} className={styles.icon} />
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={20} className={styles.icon} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className={styles.showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Confirm Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={20} className={styles.icon} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className={styles.showPassword}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  <Mail size={20} />
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          <div className={styles.divider} />
          <p className={styles.footer}>
            {mode === "role-select" && "Choose your role to get started"}
            {mode === "publisher-login" &&
              "Sign in with your approved publisher credentials"}
            {mode === "publisher-register" &&
              "Your account will be reviewed by an admin"}
            {mode === "reader-signup" &&
              "Create a free account to read all articles"}
            {mode === "admin-login" &&
              "Restricted access — authorized personnel only"}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
