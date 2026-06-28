import { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import './CalendarView.css';

export default function CalendarView() {
  const { todos } = useTodos();
  const { categories } = useCategories();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getTodosForDay = (day: number) => {
    return todos.filter(todo => {
      const todoDate = new Date(todo.createdAt);
      return todoDate.getFullYear() === year &&
             todoDate.getMonth() === month &&
             todoDate.getDate() === day;
    });
  };

  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : '#ccc';
  };

  const renderCells = () => {
    const cells = [];
    // Empty cells before 1st of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTodos = getTodosForDay(day);
      cells.push(
        <div key={day} className="calendar-cell">
          <div className="day-number">{day}</div>
          <div className="day-todos">
            {dayTodos.map(todo => (
              <div 
                key={todo.id} 
                className={`todo-dot ${todo.completed ? 'completed' : ''}`}
                style={{ backgroundColor: getCategoryColor(todo.category) }}
                title={todo.text}
              />
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="welcome-text">CALENDAR</h1>
      </header>

      <main className="dashboard-main calendar-main">
        <div className="calendar-controls">
          <button onClick={prevMonth}>◀</button>
          <h2>{year}년 {month + 1}월</h2>
          <button onClick={nextMonth}>▶</button>
        </div>

        <div className="calendar-grid">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="calendar-header-cell">{day}</div>
          ))}
          {renderCells()}
        </div>
      </main>
    </div>
  );
}
