'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, User, PenTool, ArrowLeft } from 'lucide-react';
import { FaGoogle, FaMicrosoft, FaApple } from 'react-icons/fa';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { useAuth } from '@/app/context/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, signUp, socialLogin } = useAuth();
  const [mode, setMode] = useState<'role-select' | 'publisher-login' | 'reader-signup'>('role-select');
  const [selectedRole, setSelectedRole] = useState<'user' | 'publisher' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    try {
      login(formData.email, formData.password, 'publisher');
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    signUp(formData.email, formData.password, formData.name);
    router.push('/');
  };

  const handleSocialLogin = (provider: 'google' | 'microsoft' | 'apple') => {
    // In a real app, this would redirect to OAuth provider
    const mockName = `User_${Math.random().toString(36).substr(2, 5)}`;
    const mockEmail = `${mockName}@${provider}.com`;
    socialLogin(mockEmail, mockName, provider);
    router.push('/');
  };

  const handleRoleSelect = (role: 'user' | 'publisher') => {
    setSelectedRole(role);
    if (role === 'publisher') {
      setMode('publisher-login');
    } else {
      setMode('reader-signup');
    }
    setError('');
  };

  const handleBackToRole = () => {
    setMode('role-select');
    setSelectedRole(null);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
    setError('');
  };

  return (
    <>
      <Header />
      <div className={styles.loginContainer}>
        <div className={styles.loginContent}>
          {/* Back Button */}
          {mode !== 'role-select' && (
            <button className={styles.backButton} onClick={handleBackToRole}>
              <ArrowLeft size={20} />
              Back
            </button>
          )}

          <div className={styles.header}>
            <h1>Welcome to NewsHub</h1>
            <p>
              {mode === 'role-select' && 'Choose your account type'}
              {mode === 'publisher-login' && 'Publisher Sign In'}
              {mode === 'reader-signup' && 'Create Reader Account'}
            </p>
          </div>

          {/* Role Selection Screen */}
          {mode === 'role-select' && (
            <div className={styles.roleSection}>
              <p className={styles.roleLabel}>Select your role:</p>
              <div className={styles.roleButtons}>
                <button
                  className={`${styles.roleButton} ${selectedRole === 'user' ? styles.active : ''}`}
                  onClick={() => handleRoleSelect('user')}
                >
                  <User size={24} />
                  <span>Reader</span>
                  <small>Read and explore news</small>
                </button>
                <button
                  className={`${styles.roleButton} ${selectedRole === 'publisher' ? styles.active : ''}`}
                  onClick={() => handleRoleSelect('publisher')}
                >
                  <PenTool size={24} />
                  <span>Publisher</span>
                  <small>Create and manage articles</small>
                </button>
              </div>
            </div>
          )}

          {/* Publisher Login Screen */}
          {mode === 'publisher-login' && (
            <form className={styles.form} onSubmit={handleLogin}>
              {error && <div className={styles.error}>{error}</div>}

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
                    type={showPassword ? 'text' : 'password'}
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
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submitButton}>
                <LogIn size={20} />
                Sign In as Publisher
              </button>
            </form>
          )}

          {/* Reader Sign Up Screen */}
          {mode === 'reader-signup' && (
            <>
              {/* Social Login Buttons */}
              <div className={styles.socialSection}>
                <p className={styles.socialLabel}>Sign up with:</p>
                <div className={styles.socialButtons}>
                  <button
                    type="button"
                    className={styles.socialButton}
                    onClick={() => handleSocialLogin('google')}
                  >
                    <FaGoogle size={20} />
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className={styles.socialButton}
                    onClick={() => handleSocialLogin('microsoft')}
                  >
                    <FaMicrosoft size={20} />
                    <span>Microsoft</span>
                  </button>
                  <button
                    type="button"
                    className={styles.socialButton}
                    onClick={() => handleSocialLogin('apple')}
                  >
                    <FaApple size={20} />
                    <span>Apple</span>
                  </button>
                </div>
              </div>

              <div className={styles.divider}>
                <span>or</span>
              </div>

              {/* Email Sign Up Form */}
              <form className={styles.form} onSubmit={handleSignUp}>
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
                      type={showPassword ? 'text' : 'password'}
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
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Confirm Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={20} className={styles.icon} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
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
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitButton}>
                  <Mail size={20} />
                  Create Account
                </button>
              </form>
            </>
          )}

          <div className={styles.divider} />

          <p className={styles.footer}>
            {mode === 'role-select' && 'Demo credentials (any email/password pair works) for Publisher'}
            {mode === 'publisher-login' && 'Demo: Use any email and password to sign in'}
            {mode === 'reader-signup' && 'Create a free account to read all articles'}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
