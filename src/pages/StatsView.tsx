import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import './StatsView.css';

export default function StatsView() {
  const { todos } = useTodos();
  const { categories } = useCategories();

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const completionRate = totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);

  // Stats by category
  const categoryStats = categories.map(cat => {
    const catTodos = todos.filter(t => t.category === cat.id);
    const catTotal = catTodos.length;
    const catCompleted = catTodos.filter(t => t.completed).length;
    const catRate = catTotal === 0 ? 0 : Math.round((catCompleted / catTotal) * 100);
    return { ...cat, total: catTotal, completed: catCompleted, rate: catRate };
  }).filter(cat => cat.total > 0); // Only show categories that have todos

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="welcome-text">STATISTICS</h1>
      </header>

      <main className="dashboard-main stats-main">
        <div className="stats-card summary-card">
          <div className="stat-item">
            <span className="stat-label">총 할 일</span>
            <span className="stat-value">{totalTodos}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">완료됨</span>
            <span className="stat-value" style={{ color: 'var(--primary)' }}>{completedTodos}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">진행 중</span>
            <span className="stat-value" style={{ color: 'var(--border)' }}>{pendingTodos}</span>
          </div>
        </div>

        <div className="stats-card progress-card">
          <h2>전체 달성률</h2>
          <div className="big-rate">{completionRate}%</div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        <div className="stats-card category-stats-card">
          <h2>카테고리별 달성률</h2>
          {categoryStats.length === 0 ? (
            <p className="no-stats">데이터가 없습니다.</p>
          ) : (
            <div className="cat-bars">
              {categoryStats.map(stat => (
                <div key={stat.id} className="cat-bar-item">
                  <div className="cat-bar-info">
                    <span className="cat-bar-label">{stat.label}</span>
                    <span className="cat-bar-numbers">{stat.completed}/{stat.total} ({stat.rate}%)</span>
                  </div>
                  <div className="progress-bar-container small">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${stat.rate}%`, backgroundColor: stat.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
