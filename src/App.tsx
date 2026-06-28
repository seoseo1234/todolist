import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TodoList from './pages/TodoList';
import CalendarView from './pages/CalendarView';
import StatsView from './pages/StatsView';
import SettingsView from './pages/SettingsView';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

function AppLayout() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="App">
      {!isAuthPage && currentUser && <Sidebar />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/todos" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/todos" 
            element={<ProtectedRoute><TodoList /></ProtectedRoute>} 
          />
          <Route 
            path="/calendar" 
            element={<ProtectedRoute><CalendarView /></ProtectedRoute>} 
          />
          <Route 
            path="/stats" 
            element={<ProtectedRoute><StatsView /></ProtectedRoute>} 
          />
          <Route 
            path="/settings" 
            element={<ProtectedRoute><SettingsView /></ProtectedRoute>} 
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
