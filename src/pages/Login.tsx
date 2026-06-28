import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/todos');
    }
  }, [currentUser, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    try {
      setError('');
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError('로그인에 실패했습니다: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError('구글 로그인에 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error(err);
      setError('테스트 모드 접속에 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">할 일 목록 서비스에 오신 것을 환영합니다.</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form className="email-login-form" onSubmit={handleEmailLogin}>
          <div className="input-group">
            <label>Username (Email)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-links">
          <span>계정이 없으신가요?</span>
          <Link to="/signup" className="signup-link">회원가입</Link>
        </div>

        <div className="divider">
          <span>또는</span>
        </div>

        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          className="google-btn"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google Logo" 
            className="google-icon"
          />
          Google로 계속하기
        </button>

        <button 
          onClick={handleGuestSignIn} 
          disabled={loading}
          className="guest-btn"
        >
          👀 가입 없이 테스트 모드로 둘러보기
        </button>
      </div>
    </div>
  );
}
