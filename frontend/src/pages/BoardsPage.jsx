// src/pages/BoardsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoards, createBoard, deleteBoard } from '../services/api';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';

const COLORS = ['#7c6af7','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6'];

export default function BoardsPage() {
  const [boards,  setBoards]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ title: '', description: '', color: COLORS[0] });
  const [creating,setCreating]= useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getBoards()
      .then(r => setBoards(r.data.boards))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const r = await createBoard(form);
      setBoards(p => [r.data.board, ...p]);
      setModal(false); setForm({ title: '', description: '', color: COLORS[0] });
      success('Board created! 🎉');
    } catch (e) { error(e.response?.data?.message || 'Failed to create'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this board and all tasks?')) return;
    try {
      await deleteBoard(id);
      setBoards(p => p.filter(b => b._id !== id));
      success('Board deleted');
    } catch { error('Delete failed'); }
  };

  const filtered = boards.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', paddingTop: 64 }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e8e8f0', marginBottom: 4 }}>All Boards</h1>
            <p style={{ fontSize: 14, color: '#6b6b90' }}>{boards.length} board{boards.length !== 1 ? 's' : ''} total</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              style={{ background: '#1d1d27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, outline: 'none', width: 200, fontFamily: 'inherit' }}
              placeholder="🔍 Search boards..." value={search} onChange={e => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Board</button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner spinner-lg" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>◫</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#e8e8f0', marginBottom: 8 }}>{search ? 'No boards match your search' : 'No boards yet'}</p>
            <p style={{ fontSize: 14, color: '#6b6b90', marginBottom: 24 }}>{search ? 'Try a different keyword' : 'Create your first board to get started'}</p>
            {!search && <button className="btn btn-primary" onClick={() => setModal(true)}>Create Your First Board</button>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
            {filtered.map(b => (
              <div key={b._id} className="fade-in"
                style={{ background: '#16161d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate(`/boards/${b._id}`)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ height: 6, background: b.color }} />
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#e8e8f0', marginBottom: 6 }}>{b.title}</div>
                  <div style={{ fontSize: 13, color: '#6b6b90', marginBottom: 18, minHeight: 18 }}>{b.description || 'No description'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#4a4a62' }}>
                    <span>Updated {new Date(b.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <button onClick={e => handleDelete(e, b._id)}
                      style={{ background: 'none', border: 'none', color: '#4a4a62', cursor: 'pointer', fontSize: 15, padding: 2, borderRadius: 4 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#4a4a62'}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box" style={{ maxWidth: 440, padding: '32px 28px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e8e8f0', marginBottom: 24 }}>New Board</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b0', display: 'block', marginBottom: 6 }}>Title *</label>
                <input required style={{ width: '100%', background: '#22222e', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#e8e8f0', padding: '12px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Sprint 12" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b0', display: 'block', marginBottom: 6 }}>Description</label>
                <input style={{ width: '100%', background: '#22222e', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#e8e8f0', padding: '12px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#9898b0', display: 'block', marginBottom: 8 }}>Accent Color</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid white' : '3px solid transparent', boxSizing: 'border-box', transition: 'all 0.15s' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setModal(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: '#22222e', color: '#9898b0', border: '1px solid rgba(255,255,255,0.07)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button type="submit" disabled={creating || !form.title.trim()}
                  style={{ flex: 1, padding: 12, borderRadius: 10, background: form.color, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: creating ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {creating ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
