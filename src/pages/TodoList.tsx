import { useState, useRef, useEffect } from 'react';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import { useNavigate } from 'react-router-dom';
import TodoItem from '../components/TodoItem';
import './TodoList.css';

type FilterType = 'ALL' | 'ACTIVE' | 'COMPLETED';

export default function TodoList() {
  const { todos, addTodo, updateTodo, deleteTodo, reorderTodos } = useTodos();
  const { categories } = useCategories();
  const navigate = useNavigate();
  
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'ACTIVE') return !todo.completed;
    if (filter === 'COMPLETED') return todo.completed;
    return true;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedCategory) return;
    await addTodo(inputText.trim(), selectedCategory, dueDate);
    setInputText('');
  };

  const handleDragStart = (_e: React.DragEvent, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (_e: React.DragEvent, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = async () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newTodos = [...todos];
      const dragTodoItem = newTodos[dragItem.current];
      newTodos.splice(dragItem.current, 1);
      newTodos.splice(dragOverItem.current, 0, dragTodoItem);
      
      dragItem.current = null;
      dragOverItem.current = null;
      
      await reorderTodos(newTodos);
    }
  };

  const todayDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="welcome-text">TO DO LIST</h1>
        <div className="date-text">
          DATE. {todayDate}
        </div>
      </header>

      <main className="dashboard-main">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            전체
          </button>
          <button 
            className={`filter-tab ${filter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setFilter('ACTIVE')}
          >
            진행 중
          </button>
          <button 
            className={`filter-tab ${filter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setFilter('COMPLETED')}
          >
            완료
          </button>
        </div>

        <form className="add-todo-form" onSubmit={handleAddSubmit}>
          <div className="category-selector">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{ backgroundColor: cat.color }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
            <button 
              type="button" 
              className="edit-cat-btn"
              onClick={() => navigate('/settings')}
            >
              ⚙️ 카테고리 관리
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <input
              type="text"
              className="todo-input"
              placeholder="할 일을 입력하고 엔터를 누르세요"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              type="date"
              className="todo-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ width: '150px' }}
            />
            <button type="submit" style={{ display: 'none' }}>Add</button>
          </div>
        </form>

        <div className="todo-list">
          {filteredTodos.map((todo, index) => (
            <TodoItem
              key={todo.id}
              index={index}
              todo={todo}
              onToggle={(id, completed) => updateTodo(id, { completed })}
              onImportantToggle={(id, important) => updateTodo(id, { important })}
              onDateChange={(id, dueDate) => updateTodo(id, { dueDate })}
              onDelete={deleteTodo}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
            />
          ))}
          {filteredTodos.length === 0 && (
            <div className="empty-state">할 일이 없습니다.</div>
          )}
        </div>
        
        <div className="footer-quote">
          make my life awesome.
        </div>
      </main>

      <button 
        className="fab-button"
        onClick={() => document.querySelector<HTMLInputElement>('.todo-input')?.focus()}
      >
        +
      </button>
    </div>
  );
}
