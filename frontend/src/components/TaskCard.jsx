// src/components/TaskCard.jsx
import { useState } from 'react';

const PRIORITY_COLOR = { low:'#4ade80', medium:'#f59e0b', high:'#fb923c', urgent:'#ef4444' };
const PRIORITY_BG    = { low:'rgba(74,222,128,0.08)', medium:'rgba(245,158,11,0.08)', high:'rgba(251,146,60,0.08)', urgent:'rgba(239,68,68,0.08)' };

export default function TaskCard({ task, onOpen, onDelete, provided, snapshot }) {
  const [hover, setHover] = useState(false);
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.columnId !== 'done';
  const checkedCount = task.checklist?.filter(c => c.completed).length || 0;
  const totalCheck   = task.checklist?.length || 0;

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={() => onOpen(task)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: snapshot.isDragging ? '#2a2a38' : (hover ? '#22222e' : '#1d1d27'),
        border: `1px solid ${snapshot.isDragging ? 'rgba(124,106,247,0.4)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 12, padding: '14px', marginBottom: 10,
        cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: snapshot.isDragging ? '0 12px 40px rgba(0,0,0,0.5)' : hover ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
        transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
        userSelect: 'none',
        ...provided.draggableProps.style,
      }}
    >
      {/* Priority + Tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700,
          color: PRIORITY_COLOR[task.priority], background: PRIORITY_BG[task.priority],
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: PRIORITY_COLOR[task.priority], display: 'inline-block' }} />
          {task.priority}
        </span>
        {task.tags?.slice(0, 2).map(tag => (
          <span key={tag} style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: 'rgba(124,106,247,0.1)', color: '#a78bfa' }}>{tag}</span>
        ))}
      </div>

      {/* Title */}
      <p style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', lineHeight: 1.5, marginBottom: 10, wordBreak: 'break-word' }}>
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p style={{ fontSize: 12, color: '#6b6b90', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      {/* Checklist progress */}
      {totalCheck > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b6b90', marginBottom: 4 }}>
            <span>Checklist</span><span>{checkedCount}/{totalCheck}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${totalCheck ? (checkedCount/totalCheck)*100 : 0}%`, background: '#22c55e', borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        {/* Assignees */}
        <div style={{ display: 'flex' }}>
          {task.assignees?.slice(0, 3).map((a, i) => (
            <div key={a._id || i} title={a.name} style={{
              width: 24, height: 24, borderRadius: '50%', marginLeft: i > 0 ? -6 : 0,
              background: 'linear-gradient(135deg,#7c6af7,#a78bfa)',
              border: '1.5px solid #1d1d27', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff', zIndex: i,
            }}>
              {a.name?.[0]?.toUpperCase() || '?'}
            </div>
          ))}
        </div>

        {/* Due date */}
        {dueDate && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: isOverdue ? '#ef4444' : '#6b6b90',
            background: isOverdue ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
            padding: '2px 8px', borderRadius: 6,
          }}>
            {isOverdue ? '⚠ ' : '📅 '}
            {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}

        {/* Delete */}
        {hover && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(task._id); }}
            style={{ background: 'none', border: 'none', color: '#4a4a62', cursor: 'pointer', fontSize: 14, padding: '2px 4px', borderRadius: 4, marginLeft: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#4a4a62'}
            title="Delete task"
          >✕</button>
        )}
      </div>
    </div>
  );
}
