// src/pages/AuthPage.jsx
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const S = {
  page: {
    minHeight: '100vh', background: '#0f0f13',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, position: 'relative', overflow: 'hidden',
  },
  glow: {
    position: 'absolute', width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(124,106,247,0.12) 0%,transparent 70%)',
    top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    pointerEvents: 'none',
  },
  card: {
    background: '#16161d', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 440,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32,
  },
  logoIcon: {
    width: 40, height: 40, borderRadius: 11,
    background: 'linear-gradient(135deg,#7c6af7,#a78bfa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 800, color: '#fff',
  },
  logoText: {
    fontSize: 22, fontWeight: 800,
    background: 'linear-gradient(135deg,#7c6af7,#a78bfa)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  title: { fontSize: 26, fontWeight: 800, color: '#e8e8f0', marginBottom: 6 },
  sub:   { fontSize: 14, color: '#6b6b90', marginBottom: 28 },
  tabs: {
    display: 'flex', gap: 0, marginBottom: 28,
    background: '#1d1d27', borderRadius: 10, padding: 4,
  },
  tab: (active) => ({
    flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 14, fontWeight: 600,
    background: active ? '#7c6af7' : 'transparent',
    color: active ? '#fff' : '#6b6b90',
    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: 'inherit',
  }),
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#9898b0', marginBottom: 6 },
  input: {
    width: '100%', background: '#22222e', border: '1.5px solid rgba(255,255,255,0.07)',
    borderRadius: 10, color: '#e8e8f0', padding: '12px 14px', fontSize: 15,
    outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit',
  },
  submitBtn: {
    width: '100%', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700,
    background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', color: '#fff', border: 'none',
    cursor: 'pointer', transition: 'opacity 0.2s, transform 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 8, fontFamily: 'inherit',
  },
  divider: { textAlign: 'center', margin: '20px 0', color: '#3a3a4a', fontSize: 13 },
  demoBox: {
    background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.2)',
    borderRadius: 10, padding: '12px 14px', marginTop: 16,
  },
};

export default function AuthPage() {
  const [mode, setMode]       = useState('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('demo@taskflow.com');
  const [password, setPass]   = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');

  const { login, register, user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        success('Welcome back! 👋');
      } else {
        if (!name.trim()) { setErr('Name is required'); setLoading(false); return; }
        await register(name, email, password);
        success('Account created! Welcome to TaskFlow 🎉');
      }
      navigate('/dashboard');
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.errors?.[0]?.msg || 'Something went wrong';
      setErr(msg); error(msg);
    } finally { setLoading(false); }
  };

  const fillDemo = () => { setEmail('demo@taskflow.com'); setPass('demo123'); };

  return (
    <div style={S.page}>
      <div style={S.glow} />
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoIcon}>T</div>
          <span style={S.logoText}>TaskFlow</span>
        </div>
        <h1 style={S.title}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p style={S.sub}>{mode === 'login' ? 'Log in to your workspace' : 'Start managing tasks for free'}</p>

        <div style={S.tabs}>
          <button style={S.tab(mode === 'login')}   onClick={() => { setMode('login');    setErr(''); }}>Log In</button>
          <button style={S.tab(mode === 'register')} onClick={() => { setMode('register'); setErr(''); }}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={S.formGroup}>
              <label style={S.label}>Full Name</label>
              <input
                style={S.input} type="text" placeholder="Aryan Shah"
                value={name} onChange={e => setName(e.target.value)} required
                onFocus={e => e.target.style.borderColor = '#7c6af7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
              />
            </div>
          )}
          <div style={S.formGroup}>
            <label style={S.label}>Email Address</label>
            <input
              style={S.input} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required
              onFocus={e => e.target.style.borderColor = '#7c6af7'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Password</label>
            <input
              style={S.input} type="password" placeholder="••••••••"
              value={password} onChange={e => setPass(e.target.value)} required minLength={6}
              onFocus={e => e.target.style.borderColor = '#7c6af7'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
          </div>

          {err && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#ef4444' }}>
              {err}
            </div>
          )}

          <button
            type="submit" style={S.submitBtn}
            disabled={loading}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</> : (mode === 'login' ? 'Log In →' : 'Create Account →')}
          </button>
        </form>

        {mode === 'login' && (
          <div style={S.demoBox}>
            <p style={{ fontSize: 12, color: '#7c6af7', fontWeight: 700, marginBottom: 6 }}>🔑 Demo Credentials</p>
            <p style={{ fontSize: 12, color: '#9898b0', marginBottom: 8 }}>Email: demo@taskflow.com · Password: demo123</p>
            <button
              onClick={fillDemo}
              style={{ background: 'none', border: 'none', color: '#7c6af7', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            >
              Auto-fill → 
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
