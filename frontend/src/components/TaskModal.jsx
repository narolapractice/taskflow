// src/components/TaskModal.jsx
import { useState, useEffect } from 'react';
import { updateTask, addComment } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const COLUMNS    = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'In Review' },
  { id: 'done',        label: 'Done' },
];
const P_COLOR = { low:'#4ade80', medium:'#f59e0b', high:'#fb923c', urgent:'#ef4444' };

const S = {
  box: { maxWidth: 660, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  header: { padding: '24px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 20 },
  body: { padding: '20px 24px', overflowY: 'auto', flex: 1 },
  footer: { padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' },
  label: { fontSize: 11, fontWeight: 700, color: '#6b6b90', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  input: {
    width: '100%', background: '#22222e', border: '1.5px solid rgba(255,255,255,0.07)',
    borderRadius: 8, color: '#e8e8f0', padding: '10px 12px', fontSize: 14,
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
  },
  textarea: {
    width: '100%', background: '#22222e', border: '1.5px solid rgba(255,255,255,0.07)',
    borderRadius: 8, color: '#e8e8f0', padding: '10px 12px', fontSize: 14,
    outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 80,
    transition: 'border-color 0.2s',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  select: {
    width: '100%', background: '#22222e', border: '1.5px solid rgba(255,255,255,0.07)',
    borderRadius: 8, color: '#e8e8f0', padding: '10px 12px', fontSize: 14,
    outline: 'none', cursor: 'pointer', fontFamily: 'inherit', appearance: 'none',
  },
  saveBtn: {
    padding: '10px 22px', borderRadius: 8, background: '#7c6af7', color: '#fff',
    border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
  checkItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14, color: '#e8e8f0',
  },
  commentItem: {
    display: 'flex', gap: 10, marginBottom: 14,
  },
};

export default function TaskModal({ task: initialTask, onClose, onUpdate }) {
  const [task,    setTask]    = useState(initialTask);
  const [comment, setComment] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [newTag,  setNewTag]  = useState('');
  const [newCheck,setNewCheck]= useState('');
  const { success, error } = useToast();
  const { user } = useAuth();

  // Sync local edits
  const patch = (field, val) => setTask(t => ({ ...t, [field]: val }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateTask(task._id, {
        title: task.title, description: task.description,
        priority: task.priority, columnId: task.columnId,
        dueDate: task.dueDate, tags: task.tags, checklist: task.checklist,
      });
      onUpdate(res.data.task);
      success('Task updated ✓');
    } catch { error('Failed to save task'); }
    finally { setSaving(false); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await addComment(task._id, { text: comment });
      setTask(t => ({ ...t, comments: res.data.comments }));
      setComment('');
      success('Comment added');
    } catch { error('Failed to add comment'); }
  };

  const toggleCheck = (idx) => {
    const list = task.checklist.map((c, i) => i === idx ? { ...c, completed: !c.completed } : c);
    patch('checklist', list);
  };

  const addCheckItem = () => {
    if (!newCheck.trim()) return;
    patch('checklist', [...(task.checklist || []), { text: newCheck, completed: false }]);
    setNewCheck('');
  };

  const removeTag = (t) => patch('tags', task.tags.filter(x => x !== t));
  const addTag = () => {
    const t = newTag.trim().toLowerCase();
    if (!t || task.tags?.includes(t)) return;
    patch('tags', [...(task.tags || []), t]);
    setNewTag('');
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box scale-in" style={S.box}>

        {/* Header */}
        <div style={S.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <input
              style={{ ...S.input, fontSize: 18, fontWeight: 700, background: 'transparent', border: 'none', padding: '0', flex: 1 }}
              value={task.title}
              onChange={e => patch('title', e.target.value)}
            />
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b6b90', fontSize: 22, cursor: 'pointer', flexShrink: 0 }}>✕</button>
          </div>
          <p style={{ fontSize: 12, color: '#4a4a62', marginTop: 6 }}>
            Created by {task.createdBy?.name || 'Unknown'} · {new Date(task.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Body */}
        <div style={S.body}>

          {/* Grid: status + priority */}
          <div style={S.grid}>
            <div>
              <label style={S.label}>Status</label>
              <select style={S.select} value={task.columnId} onChange={e => patch('columnId', e.target.value)}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Priority</label>
              <select style={{ ...S.select, color: P_COLOR[task.priority] }} value={task.priority} onChange={e => patch('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p} style={{ color: P_COLOR[p] }}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Due Date</label>
            <input type="date" style={S.input}
              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
              onChange={e => patch('dueDate', e.target.value || null)}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Description</label>
            <textarea style={S.textarea} value={task.description || ''} onChange={e => patch('description', e.target.value)} placeholder="Add a description..." />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {task.tags?.map(t => (
                <span key={t} style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(124,106,247,0.1)', color: '#a78bfa', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t}
                  <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0, fontSize: 12 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...S.input, flex: 1 }} value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
              <button onClick={addTag} style={{ padding: '10px 16px', background: '#22222e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#9898b0', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Add</button>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Checklist ({task.checklist?.filter(c=>c.completed).length||0}/{task.checklist?.length||0})</label>
            {/* Progress */}
            {(task.checklist?.length || 0) > 0 && (
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#22c55e', borderRadius: 2, width: `${((task.checklist.filter(c=>c.completed).length)/(task.checklist.length))*100}%`, transition: 'width 0.3s' }} />
              </div>
            )}
            {task.checklist?.map((item, i) => (
              <div key={i} style={S.checkItem}>
                <input type="checkbox" checked={item.completed} onChange={() => toggleCheck(i)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#7c6af7' }} />
                <span style={{ flex: 1, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#4a4a62' : '#e8e8f0' }}>{item.text}</span>
                <button onClick={() => patch('checklist', task.checklist.filter((_,j)=>j!==i))}
                  style={{ background: 'none', border: 'none', color: '#4a4a62', cursor: 'pointer', fontSize: 13 }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input style={{ ...S.input, flex: 1 }} value={newCheck} onChange={e => setNewCheck(e.target.value)}
                placeholder="Add checklist item..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCheckItem())} />
              <button onClick={addCheckItem} style={{ padding: '10px 16px', background: '#22222e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#9898b0', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>Add</button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label style={S.label}>Comments ({task.comments?.length || 0})</label>
            {task.comments?.map((c, i) => (
              <div key={i} style={S.commentItem}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {c.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#9898b0', marginBottom: 4 }}>{c.user?.name || 'Unknown'} · {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  <div style={{ fontSize: 14, color: '#e8e8f0', background: '#22222e', padding: '10px 12px', borderRadius: 8, lineHeight: 1.5 }}>{c.text}</div>
                </div>
              </div>
            ))}
            <form onSubmit={submitComment} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input style={{ ...S.input, flex: 1 }} value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." />
              <button type="submit" style={{ padding: '10px 16px', background: '#7c6af7', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>Send</button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div style={S.footer}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', background: '#22222e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#9898b0', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>Discard</button>
            <button onClick={save} disabled={saving} style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
