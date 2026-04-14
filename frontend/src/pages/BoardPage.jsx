// src/pages/BoardPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getBoard, getBoardTasks, createTask, deleteTask, moveTask } from '../services/api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const COLUMNS = [
  { id: 'todo',        title: 'To Do',       color: '#64748b' },
  { id: 'in-progress', title: 'In Progress',  color: '#f59e0b' },
  { id: 'review',      title: 'In Review',    color: '#8b5cf6' },
  { id: 'done',        title: 'Done',         color: '#22c55e' },
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const S = {
  page: { minHeight: '100vh', background: '#0f0f13', paddingTop: 64 },
  header: {
    padding: '20px 24px', background: '#16161d',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center', gap: 16,
  },
  boardTitle: { fontSize: 20, fontWeight: 800, color: '#e8e8f0' },
  boardDesc:  { fontSize: 13, color: '#6b6b90', marginTop: 2 },
  colDot: (color) => ({ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }),
  board: { display: 'flex', gap: 16, padding: '24px', overflowX: 'auto', minHeight: 'calc(100vh - 128px)', alignItems: 'flex-start' },
  col: {
    background: '#16161d', borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.07)',
    width: 292, minWidth: 292, flexShrink: 0, display: 'flex', flexDirection: 'column',
  },
  colHeader: { padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 },
  colTitle: { fontSize: 14, fontWeight: 700, color: '#e8e8f0', flex: 1 },
  colCount: {
    background: 'rgba(255,255,255,0.08)', color: '#9898b0',
    padding: '2px 8px', borderRadius: 100, fontSize: 12, fontWeight: 700,
  },
  taskList: (isDraggingOver) => ({
    padding: '0 10px 10px', flex: 1, minHeight: 100,
    background: isDraggingOver ? 'rgba(124,106,247,0.04)' : 'transparent',
    borderRadius: '0 0 14px 14px', transition: 'background 0.15s',
  }),
  addTaskBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '10px 16px', background: 'none',
    border: 'none', cursor: 'pointer', color: '#4a4a62', fontSize: 14, fontWeight: 600,
    transition: 'color 0.15s', fontFamily: 'inherit',
  },
  addForm: { padding: '0 10px 12px' },
  addInput: {
    width: '100%', background: '#22222e', border: '1.5px solid rgba(124,106,247,0.4)',
    borderRadius: 8, color: '#e8e8f0', padding: '10px 12px', fontSize: 14,
    outline: 'none', fontFamily: 'inherit', marginBottom: 8,
  },
  addSelect: {
    background: '#22222e', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 6, color: '#9898b0', padding: '7px 10px', fontSize: 13,
    outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
  },
};

function AddTaskForm({ columnId, boardId, onAdd, onCancel }) {
  const [title,    setTitle]    = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading,  setLoading]  = useState(false);
  const { error } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await createTask({ title, priority, boardId, columnId });
      onAdd(res.data.task);
      setTitle(''); setPriority('medium');
    } catch (err) { error(err.response?.data?.message || 'Failed to create task'); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.addForm}>
      <form onSubmit={submit}>
        <input
          autoFocus style={S.addInput}
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Task title..." required
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select style={S.addSelect} value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
          </select>
          <button type="submit" disabled={loading || !title.trim()}
            style={{ padding: '7px 14px', background: '#7c6af7', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : 'Add'}
          </button>
          <button type="button" onClick={onCancel}
            style={{ padding: '7px 12px', background: '#22222e', color: '#9898b0', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [board,    setBoard]    = useState(null);
  const [tasks,    setTasks]    = useState({});   // { colId: [task,...] }
  const [loading,  setLoading]  = useState(true);
  const [addingTo, setAddingTo] = useState(null); // colId where form is open
  const [selected, setSelected] = useState(null); // task open in modal
  const [search,   setSearch]   = useState('');

  const organise = useCallback((rawTasks) => {
    const map = {};
    COLUMNS.forEach(c => { map[c.id] = []; });
    rawTasks.forEach(t => {
      if (map[t.columnId]) map[t.columnId].push(t);
    });
    // Sort by order
    Object.values(map).forEach(arr => arr.sort((a, b) => a.order - b.order));
    return map;
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, tRes] = await Promise.all([getBoard(id), getBoardTasks(id)]);
        setBoard(bRes.data.board);
        setTasks(organise(tRes.data.tasks));
      } catch (e) {
        if (e.response?.status === 404 || e.response?.status === 403) navigate('/boards');
        else { error('Failed to load board'); setTasks(organise([])); }
      } finally { setLoading(false); }
    };
    load();
  }, [id]); // eslint-disable-line

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol  = source.droppableId;
    const dstCol  = destination.droppableId;
    const newTasks = { ...tasks };

    // Remove from source
    const [moved] = newTasks[srcCol].splice(source.index, 1);

    // Insert into destination
    if (!newTasks[dstCol]) newTasks[dstCol] = [];
    newTasks[dstCol].splice(destination.index, 0, { ...moved, columnId: dstCol });

    setTasks({ ...newTasks });

    try {
      await moveTask(draggableId, { columnId: dstCol, order: destination.index });
    } catch { error('Failed to move task'); }
  };

  const handleAddTask = (colId, newTask) => {
    setTasks(prev => ({ ...prev, [colId]: [...(prev[colId] || []), newTask] }));
    setAddingTo(null);
    success('Task created ✓');
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(col => { next[col] = next[col].filter(t => t._id !== taskId); });
        return next;
      });
      success('Task deleted');
    } catch { error('Failed to delete task'); }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(col => {
        next[col] = next[col].filter(t => t._id !== updatedTask._id);
      });
      if (!next[updatedTask.columnId]) next[updatedTask.columnId] = [];
      next[updatedTask.columnId] = [...next[updatedTask.columnId], updatedTask].sort((a,b) => a.order - b.order);
      return next;
    });
    setSelected(updatedTask);
  };

  const filteredTasks = (colId) => {
    const list = tasks[colId] || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(t => t.title.toLowerCase().includes(q) || t.tags?.some(tag => tag.includes(q)));
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Navbar />
      <div style={{ textAlign: 'center' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#6b6b90', fontSize: 14 }}>Loading board...</p>
      </div>
    </div>
  );

  const totalTasks = Object.values(tasks).flat().length;
  const doneTasks  = (tasks['done'] || []).length;

  return (
    <div style={S.page}>
      <Navbar />

      {/* Board Header */}
      <div style={S.header}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#6b6b90', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>←</button>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: board?.color || '#7c6af7', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={S.boardTitle}>{board?.title || 'Board'}</div>
          {board?.description && <div style={S.boardDesc}>{board.description}</div>}
        </div>
        {/* Search */}
        <input
          style={{ background: '#22222e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 14px', color: '#e8e8f0', fontSize: 14, outline: 'none', width: 220, fontFamily: 'inherit' }}
          placeholder="🔍  Search tasks..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {/* Progress */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8f0' }}>{doneTasks}/{totalTasks} Done</div>
          <div style={{ width: 120, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#22c55e', borderRadius: 2, width: `${totalTasks ? (doneTasks/totalTasks)*100 : 0}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* Kanban */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={S.board}>
          {COLUMNS.map(col => {
            const colTasks = filteredTasks(col.id);
            return (
              <div key={col.id} style={S.col}>
                {/* Column Header */}
                <div style={S.colHeader}>
                  <div style={S.colDot(col.color)} />
                  <span style={S.colTitle}>{col.title}</span>
                  <span style={S.colCount}>{colTasks.length}</span>
                </div>

                {/* Droppable */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={S.taskList(snapshot.isDraggingOver)}
                    >
                      {colTasks.map((task, idx) => (
                        <Draggable key={task._id} draggableId={task._id} index={idx}>
                          {(prov, snap) => (
                            <TaskCard
                              task={task}
                              provided={prov}
                              snapshot={snap}
                              onOpen={setSelected}
                              onDelete={handleDeleteTask}
                            />
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Task */}
                {addingTo === col.id ? (
                  <AddTaskForm
                    columnId={col.id}
                    boardId={id}
                    onAdd={(t) => handleAddTask(col.id, t)}
                    onCancel={() => setAddingTo(null)}
                  />
                ) : (
                  <button
                    style={S.addTaskBtn}
                    onClick={() => setAddingTo(col.id)}
                    onMouseEnter={e => e.currentTarget.style.color = '#7c6af7'}
                    onMouseLeave={e => e.currentTarget.style.color = '#4a4a62'}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add task
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      {selected && (
        <TaskModal
          task={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
}
