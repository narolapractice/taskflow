// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getBoards, createBoard, deleteBoard, getStats } from '../services/api';
import Navbar from '../components/Navbar';

const COLORS = ['#7c6af7','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6'];

const S = {
  page: { minHeight: '100vh', background: '#0f0f13', paddingTop: 64 },
  main: { maxWidth: 1280, margin: '0 auto', padding: '40px 24px' },
  header: { marginBottom: 40 },
  greeting: { fontSize: 28, fontWeight: 800, color: '#e8e8f0', marginBottom: 6 },
  sub: { fontSize: 15, color: '#6b6b90' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 48 },
  statCard: (color) => ({
    background: '#16161d', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: '24px 20px',
    borderLeft: `3px solid ${color}`,
  }),
  statNum: { fontSize: 36, fontWeight: 800, color: '#e8e8f0', lineHeight: 1 },
  statLabel: { fontSize: 13, color: '#6b6b90', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#e8e8f0', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  boardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 },
  boardCard: (color) => ({
    background: '#16161d', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
    transition: 'all 0.2s', position: 'relative',
  }),
  boardTop: (color) => ({ height: 6, background: color }),
  boardBody: { padding: '20px' },
  boardTitle: { fontSize: 16, fontWeight: 700, color: '#e8e8f0', marginBottom: 6 },
  boardDesc: { fontSize: 13, color: '#6b6b90', marginBottom: 16, minHeight: 18 },
  boardMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#4a4a62' },
  addCard: {
    background: 'transparent', border: '2px dashed rgba(255,255,255,0.1)',
    borderRadius: 16, padding: '20px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 10, minHeight: 140, transition: 'all 0.2s',
  },
  modal: { maxWidth: 460 },
  input: {
    width: '100%', background: '#22222e', border: '1.5px solid rgba(255,255,255,0.07)',
    borderRadius: 10, color: '#e8e8f0', padding: '12px 14px', fontSize: 15,
    outline: 'none', marginTop: 6, fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  colorDots: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 },
};

function CreateBoardModal({ onClose, onCreate }) {
  const [title, setTitle]   = useState('');
  const [desc,  setDesc]    = useState('');
  const [color, setColor]   = useState(COLORS[0]);
  const [loading, setLoad]  = useState(false);
  const { error } = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoad(true);
    try { await onCreate({ title, description: desc, color }); onClose(); }
    catch (e) { error(e.response?.data?.message || 'Failed to create board'); }
    finally { setLoad(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ ...S.modal, padding: '32px 28px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e8e8f0', marginBottom: 24 }}>Create New Board</h2>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b0', display: 'block', marginBottom: 4 }}>Board Title *</label>
            <input style={S.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Product Roadmap" required
              onFocus={e => e.target.style.borderColor = '#7c6af7'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b0', display: 'block', marginBottom: 4 }}>Description</label>
            <input style={S.input} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this board for?"
              onFocus={e => e.target.style.borderColor = '#7c6af7'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b0', display: 'block', marginBottom: 8 }}>Color</label>
            <div style={S.colorDots}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setColor(c)} style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: color === c ? `3px solid white` : '3px solid transparent',
                  boxSizing: 'border-box', transition: 'all 0.15s',
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#22222e', color: '#9898b0', border: '1px solid rgba(255,255,255,0.07)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim()}
              style={{ flex: 1, padding: '12px', borderRadius: 10, background: color, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [boards,  setBoards]  = useState([]);
  const [stats,   setStats]   = useState({ boards: 0, totalTasks: 0, doneTasks: 0, highPriority: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setModal] = useState(false);

  const load = async () => {
    try {
      const [bRes, sRes] = await Promise.all([getBoards(), getStats()]);
      setBoards(bRes.data.boards);
      setStats(sRes.data.stats);
    } catch (e) {
      // demo mode — use empty state
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    const res = await createBoard(data);
    setBoards(prev => [res.data.board, ...prev]);
    setStats(s => ({ ...s, boards: s.boards + 1 }));
    success('Board created! 🎉');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this board and all its tasks?')) return;
    try {
      await deleteBoard(id);
      setBoards(prev => prev.filter(b => b._id !== id));
      success('Board deleted');
    } catch { error('Failed to delete board'); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const STAT_CARDS = [
    { label: 'Total Boards',   value: stats.boards,      color: '#7c6af7', icon: '◫' },
    { label: 'Total Tasks',    value: stats.totalTasks,  color: '#3b82f6', icon: '✓' },
    { label: 'Completed',      value: stats.doneTasks,   color: '#22c55e', icon: '★' },
    { label: 'High Priority',  value: stats.highPriority,color: '#ef4444', icon: '⚡' },
  ];

  return (
    <div style={S.page}>
      <Navbar />
      <main style={S.main}>
        {/* Header */}
        <div style={S.header}>
          <h1 style={S.greeting}>{greeting}, {firstName} 👋</h1>
          <p style={S.sub}>Here's what's happening with your projects today.</p>
        </div>

        {/* Stats */}
        <div style={S.statsRow}>
          {STAT_CARDS.map(s => (
            <div key={s.label} style={S.statCard(s.color)} className="fade-in">
              <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
              <div style={S.statNum}>{loading ? '—' : s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Boards */}
        <div>
          <div style={S.sectionTitle}>
            <span>Your Boards</span>
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ New Board</button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : (
            <div style={S.boardsGrid}>
              {boards.map(b => (
                <div key={b._id}
                  style={S.boardCard(b.color)}
                  className="fade-in"
                  onClick={() => navigate(`/boards/${b._id}`)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  <div style={S.boardTop(b.color)} />
                  <div style={S.boardBody}>
                    <div style={S.boardTitle}>{b.title}</div>
                    <div style={S.boardDesc}>{b.description || 'No description'}</div>
                    <div style={S.boardMeta}>
                      <span>{new Date(b.updatedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                      <button
                        onClick={e => handleDelete(e, b._id)}
                        style={{ background: 'none', border: 'none', color: '#4a4a62', cursor: 'pointer', fontSize: 16, padding: '2px 4px', borderRadius: 4, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#4a4a62'}
                        title="Delete board"
                      >🗑</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New */}
              <div
                style={S.addCard}
                onClick={() => setModal(true)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6af7'; e.currentTarget.style.background = 'rgba(124,106,247,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(124,106,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#7c6af7' }}>+</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#6b6b90' }}>Create New Board</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && <CreateBoardModal onClose={() => setModal(false)} onCreate={handleCreate} />}
    </div>
  );
}
