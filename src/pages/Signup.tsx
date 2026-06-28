import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/todos');
    }
  }, [currentUser, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return setError('비밀번호가 일치하지 않습니다.');
    }
    
    try {
      setError('');
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName.trim()) {
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        });
      }
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호는 6자리 이상이어야 합니다.');
      } else {
        setError('회원가입에 실패했습니다: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">회원가입</h2>
        <p className="login-subtitle">할 일 목록 서비스의 새 계정을 만들어주세요.</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form className="email-login-form" onSubmit={handleSignup}>
          <input 
            type="text" 
            placeholder="이름 (닉네임)" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="auth-input"
          />
          <input 
            type="email" 
            placeholder="이메일" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input 
            type="password" 
            placeholder="비밀번호 (6자리 이상)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
            minLength={6}
          />
          <input 
            type="password" 
            placeholder="비밀번호 확인" 
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            className="auth-input"
            minLength={6}
          />
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? '가입 중...' : '계정 생성'}
          </button>
        </form>

        <div className="auth-links">
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login" className="signup-link">로그인</Link>
        </div>
      </div>
    </div>
  );
}
