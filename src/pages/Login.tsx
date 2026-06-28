import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
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
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;
      
      // Initialize dummy data for the guest user
      const batch = writeBatch(db);
      
      const cat1Ref = doc(collection(db, 'categories'));
      batch.set(cat1Ref, { userId: uid, label: '학교 업무', color: '#ffb3ba', order: 0 });
      const cat2Ref = doc(collection(db, 'categories'));
      batch.set(cat2Ref, { userId: uid, label: '수업 준비', color: '#baffc9', order: 1 });
      const cat3Ref = doc(collection(db, 'categories'));
      batch.set(cat3Ref, { userId: uid, label: '개인', color: '#bae1ff', order: 2 });
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const todo1Ref = doc(collection(db, 'todos'));
      batch.set(todo1Ref, { 
        userId: uid, text: '학부모 상담 준비하기', completed: false, important: true, 
        category: cat1Ref.id, order: 0, createdAt: Date.now(), dueDate: today 
      });
      
      const todo2Ref = doc(collection(db, 'todos'));
      batch.set(todo2Ref, { 
        userId: uid, text: '주간 학습 안내서 작성', completed: true, important: false, 
        category: cat1Ref.id, order: 1, createdAt: Date.now() - 1000, dueDate: yesterday 
      });

      const todo3Ref = doc(collection(db, 'todos'));
      batch.set(todo3Ref, { 
        userId: uid, text: '과학 실험 교구 신청', completed: false, important: false, 
        category: cat2Ref.id, order: 2, createdAt: Date.now() - 2000, dueDate: tomorrow 
      });

      const todo4Ref = doc(collection(db, 'todos'));
      batch.set(todo4Ref, { 
        userId: uid, text: '아침 운동 가기', completed: true, important: true, 
        category: cat3Ref.id, order: 3, createdAt: Date.now() - 3000, dueDate: today 
      });

      await batch.commit();

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
        <h2 className="login-title">To-Do List</h2>
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
