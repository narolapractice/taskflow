// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
    height: 64,
    background: 'rgba(15,15,19,0.92)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center',
    padding: '0 24px', gap: 16,
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontWeight: 800, fontSize: 20,
    background: 'linear-gradient(135deg,#7c6af7,#a78bfa)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  logoIcon: {
    width: 32, height: 32, borderRadius: 9,
    background: 'linear-gradient(135deg,#7c6af7,#a78bfa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 800, color: '#fff',
  },
  navLinks: { display: 'flex', gap: 4, alignItems: 'center' },
  navLink: (active) => ({
    padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: active ? '#e8e8f0' : '#6b6b90',
    background: active ? 'rgba(124,106,247,0.12)' : 'transparent',
    transition: 'all 0.2s', cursor: 'pointer', border: 'none',
    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
  }),
  right: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg,#7c6af7,#a78bfa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 13, color: '#fff', cursor: 'pointer',
    border: '2px solid rgba(124,106,247,0.4)',
  },
  dropdown: {
    position: 'absolute', top: 52, right: 24,
    background: '#1d1d27', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, minWidth: 200,
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    overflow: 'hidden', zIndex: 300,
  },
  ddHeader: {
    padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  ddItem: {
    padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 14, color: '#9898b0', cursor: 'pointer',
    transition: 'all 0.15s', border: 'none', background: 'none',
    width: '100%', textAlign: 'left', fontFamily: 'inherit',
  },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [ddOpen, setDdOpen] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={styles.logoIcon}>T</div>
        <span style={styles.logo}>TaskFlow</span>
      </Link>

      {/* Nav Links */}
      <div style={styles.navLinks}>
        <Link to="/dashboard" style={styles.navLink(isActive('/dashboard'))}>
          <span>⊞</span> Dashboard
        </Link>
        <Link to="/boards" style={styles.navLink(isActive('/boards'))}>
          <span>◫</span> Boards
        </Link>
      </div>

      {/* Right */}
      <div style={styles.right}>
        <div style={{ position: 'relative' }}>
          <div style={styles.avatar} onClick={() => setDdOpen(o => !o)} title={user?.name}>
            {initials}
          </div>
          {ddOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 299 }}
                onClick={() => setDdOpen(false)}
              />
              <div style={styles.dropdown}>
                <div style={styles.ddHeader}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#e8e8f0' }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: '#6b6b90', marginTop: 2 }}>{user?.email}</div>
                </div>
                <Link
                  to="/profile"
                  style={{ ...styles.ddItem, display: 'flex' }}
                  onClick={() => setDdOpen(false)}
                >
                  <span>👤</span> Profile Settings
                </Link>
                <button
                  style={{ ...styles.ddItem, color: '#ef4444' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  onClick={handleLogout}
                >
                  <span>↩</span> Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
