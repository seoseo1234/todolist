import type { Todo } from '../hooks/useTodos';
import { useCategories } from '../hooks/useCategories';
import './TodoItem.css';

interface TodoItemProps {
  todo: Todo;
  index: number;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onImportantToggle: (id: string, important: boolean) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnter: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

export default function TodoItem({
  todo,
  index,
  onToggle,
  onDelete,
  onImportantToggle,
  onDragStart,
  onDragEnter,
  onDragEnd
}: TodoItemProps) {
  const { categories } = useCategories();
  const category = categories.find(c => c.id === todo.category);
  const catColor = category?.color || '#a8dadc';

  return (
    <div
      className={`todo-item ${todo.completed ? 'completed' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="todo-drag-handle">⠿</div>
      
      <div className="todo-content">
        <span className="cat-badge" style={{ backgroundColor: catColor }}>
          {category?.label || '기본'}
        </span>
        <span className="todo-text">{todo.text}</span>
      </div>

      <div className="todo-actions">
        <button 
          className={`action-btn important-btn ${todo.important ? 'active' : ''}`}
          onClick={() => onImportantToggle(todo.id, !todo.important)}
        >
          {todo.important ? '★' : '☆'}
        </button>
        <button 
          className="action-btn delete-btn"
          onClick={() => onDelete(todo.id)}
        >
          ✕
        </button>
      </div>

      <div className="todo-checkbox-wrapper" onClick={() => onToggle(todo.id, !todo.completed)}>
        <div className="custom-checkbox"></div>
      </div>
    </div>
  );
}
