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

  // Normalize date to midnight
  const getMidnightTime = (d: Date | number | string) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

  const calculateLayout = () => {
    const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
    
    // Convert to a format with normalized start/end
    const events = sortedTodos.map(todo => {
      const createdTime = getMidnightTime(todo.createdAt);
      let dueTime = createdTime;
      if (todo.dueDate) {
        dueTime = getMidnightTime(todo.dueDate);
      }
      return {
        todo,
        start: Math.min(createdTime, dueTime),
        end: Math.max(createdTime, dueTime)
      };
    });

    const levels: { [level: number]: Set<number> } = {};
    const todoLevelMap = new Map<string, number>();
    const msPerDay = 86400000;

    for (const event of events) {
      let l = 0;
      while (true) {
        if (!levels[l]) levels[l] = new Set();
        let conflict = false;
        // Check every day of this event
        for (let t = event.start; t <= event.end; t += msPerDay) {
          if (levels[l].has(t)) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          // Claim this level
          for (let t = event.start; t <= event.end; t += msPerDay) {
            levels[l].add(t);
          }
          todoLevelMap.set(event.todo.id, l);
          break;
        }
        l++;
      }
    }

    return { events, todoLevelMap };
  };

  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : '#ccc';
  };

  const renderCells = () => {
    const { events, todoLevelMap } = calculateLayout();
    const cells = [];
    
    // Calculate total days to render (full weeks)
    const totalDays = firstDayOfMonth + daysInMonth;
    const totalWeeks = Math.ceil(totalDays / 7);

    let cellIndex = 0;
    
    for (let week = 0; week < totalWeeks; week++) {
      // Collect days for this week
      const weekDays: { time: number; dayNum: number | null }[] = [];
      for (let i = 0; i < 7; i++) {
        const dayOffset = cellIndex - firstDayOfMonth + 1;
        if (dayOffset > 0 && dayOffset <= daysInMonth) {
          weekDays.push({ time: getMidnightTime(new Date(year, month, dayOffset)), dayNum: dayOffset });
        } else {
          // Out of month days
          const outDate = new Date(year, month, dayOffset);
          weekDays.push({ time: getMidnightTime(outDate), dayNum: null });
        }
        cellIndex++;
      }

      // Find max level for this week
      let maxLevel = -1;
      const weekEventsByDay: { [time: number]: { event: any, level: number, position: string }[] } = {};
      
      for (const wd of weekDays) {
        weekEventsByDay[wd.time] = [];
        for (const ev of events) {
          if (wd.time >= ev.start && wd.time <= ev.end) {
            const level = todoLevelMap.get(ev.todo.id) ?? 0;
            maxLevel = Math.max(maxLevel, level);
            
            let position = 'middle';
            if (ev.start === ev.end) position = 'single';
            else if (wd.time === ev.start) position = 'start';
            else if (wd.time === ev.end) position = 'end';
            
            weekEventsByDay[wd.time].push({ event: ev, level, position });
          }
        }
      }

      // Render cells for this week
      for (let i = 0; i < 7; i++) {
        const wd = weekDays[i];
        if (wd.dayNum === null) {
          cells.push(<div key={`empty-${week}-${i}`} className="calendar-cell empty"></div>);
          continue;
        }

        const dayEvents = weekEventsByDay[wd.time];
        const slots = [];
        
        for (let l = 0; l <= maxLevel; l++) {
          const evData = dayEvents.find(e => e.level === l);
          if (evData) {
            const { event, position } = evData;
            const todo = event.todo;
            // Only show text on start, single, or the first day of the week (Sunday, i=0)
            const showText = position === 'start' || position === 'single' || i === 0 || wd.dayNum === 1;
            
            slots.push(
              <div 
                key={todo.id} 
                className={`todo-bar ${position} ${todo.completed ? 'completed' : ''}`}
                style={{ backgroundColor: getCategoryColor(todo.category) }}
                title={todo.text}
              >
                <span className="todo-bar-text">{showText ? todo.text : ''}</span>
              </div>
            );
          } else {
            slots.push(
              <div key={`spacer-${l}`} className="todo-bar spacer" style={{ visibility: 'hidden' }}></div>
            );
          }
        }

        cells.push(
          <div key={wd.dayNum} className="calendar-cell">
            <div className="day-number">{wd.dayNum}</div>
            <div className="day-todos">
              {slots}
            </div>
          </div>
        );
      }
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
