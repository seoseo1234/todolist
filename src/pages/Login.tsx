import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/todos');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      // navigation to /todos is handled by useEffect and ProtectedRoute
    } catch (err: any) {
      console.error(err);
      setError('로그인에 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">환영합니다!</h2>
        <p className="login-subtitle">할 일 목록 서비스에 오신 것을 환영합니다. 구글 계정으로 로그인해주세요.</p>
        
        {error && <div className="login-error">{error}</div>}
        
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
          {loading ? '로그인 중...' : 'Google로 계속하기'}
        </button>
      </div>
    </div>
  );
}
