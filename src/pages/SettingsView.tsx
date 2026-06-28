import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import './SettingsView.css';

const PRESET_COLORS = ['#dceeb1', '#c5b0f4', '#f4ecd6', '#efd4d4', '#c8e6cd', '#f3c9b6', '#a8dadc', '#ffb4a2'];

export default function SettingsView() {
  const { currentUser } = useAuth();
  const { categories, addCategory, deleteCategory, reorderCategories } = useCategories();
  
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  // Drag and drop state for categories
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabel.trim()) {
      await addCategory(newLabel.trim(), newColor);
      setNewLabel('');
    }
  };

  const handleDragStart = (_e: React.DragEvent, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (_e: React.DragEvent, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = async () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newCategories = [...categories];
      const dragCatItem = newCategories[dragItem.current];
      newCategories.splice(dragItem.current, 1);
      newCategories.splice(dragOverItem.current, 0, dragCatItem);
      
      dragItem.current = null;
      dragOverItem.current = null;
      
      await reorderCategories(newCategories);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="welcome-text">SETTINGS</h1>
      </header>

      <main className="dashboard-main settings-main">
        <section className="settings-section">
          <h2>내 프로필</h2>
          <div className="profile-card">
            <div className="profile-avatar">
              {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
            </div>
            <div className="profile-info">
              <div className="profile-name">{currentUser?.displayName || '사용자'}</div>
              <div className="profile-email">{currentUser?.email}</div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>카테고리 관리</h2>
          <div className="category-manager">
            <ul className="settings-cat-list">
              {categories.map((cat, index) => (
                <li 
                  key={cat.id} 
                  className="settings-cat-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="cat-drag-handle">⠿</div>
                  <span className="cat-color-badge" style={{ backgroundColor: cat.color }}></span>
                  <span className="cat-label">{cat.label}</span>
                  <button className="del-cat-btn" onClick={() => deleteCategory(cat.id)}>✕ 삭제</button>
                </li>
              ))}
            </ul>

            <form className="add-cat-form-inline" onSubmit={handleAddCategory}>
              <input 
                type="text" 
                placeholder="새 카테고리 이름" 
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                required
                className="cat-input"
              />
              <div className="color-picker-inline">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-btn ${newColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewColor(color)}
                    title={color}
                  />
                ))}
              </div>
              <button type="submit" className="add-cat-submit-btn">추가하기</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
