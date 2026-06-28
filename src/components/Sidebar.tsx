import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="avatar">
            {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
          </div>
          <span className="username">{currentUser?.displayName || '사용자'}님</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/todos" className={({ isActive }) => isActive ? "side-nav-item active" : "side-nav-item"}>
          <span className="side-nav-icon">🏠</span>
          <span className="side-nav-label">홈</span>
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => isActive ? "side-nav-item active" : "side-nav-item"}>
          <span className="side-nav-icon">📅</span>
          <span className="side-nav-label">캘린더</span>
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => isActive ? "side-nav-item active" : "side-nav-item"}>
          <span className="side-nav-icon">📊</span>
          <span className="side-nav-label">통계</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "side-nav-item active" : "side-nav-item"}>
          <span className="side-nav-icon">⚙️</span>
          <span className="side-nav-label">설정</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="side-nav-icon">🚪</span>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
