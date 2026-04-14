// src/pages/ProfilePage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateMe } from '../services/api';
import Navbar from '../components/Navbar';

const S = {
  page: { minHeight: '100vh', background: '#0f0f13', paddingTop: 64 },
  main: { maxWidth: 680, margin: '0 auto', padding: '48px 24px' },
  card: { background: '#16161d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '32px', marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#e8e8f0', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)' },
  label: { fontSize: 13, fontWeight: 600, color: '#9898b0', display: 'block', marginBottom: 6 },
  input: { width: '100%', background: '#22222e', border: '1.5px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#e8e8f0', padding: '12px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' },
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await updateMe({ name });
      updateUser(res.data.user);
      success('Profile updated ✓');
    } catch { error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.main}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#e8e8f0', marginBottom: 32 }}>Profile Settings</h1>

        {/* Avatar */}
        <div style={S.card}>
          <div style={S.cardTitle}>Your Account</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', border: '3px solid rgba(124,106,247,0.3)' }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#e8e8f0', marginBottom: 4 }}>{user?.name}</p>
              <p style={{ fontSize: 14, color: '#6b6b90' }}>{user?.email}</p>
              <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(124,106,247,0.1)', color: '#a78bfa', padding: '3px 10px', borderRadius: 100, display: 'inline-block', marginTop: 6 }}>{user?.role?.toUpperCase()}</span>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Full Name</label>
              <input style={S.input} value={name} onChange={e => setName(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#7c6af7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>Email Address</label>
              <input style={{ ...S.input, opacity: 0.5 }} value={user?.email} disabled />
              <p style={{ fontSize: 12, color: '#4a4a62', marginTop: 6 }}>Email cannot be changed at this time.</p>
            </div>
            <button type="submit" disabled={saving || !name.trim()} className="btn btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Member since */}
        <div style={S.card}>
          <div style={S.cardTitle}>Account Info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A' },
              { label: 'User ID',      value: user?._id || 'N/A' },
              { label: 'Plan',         value: 'Free' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 14, color: '#9898b0' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', fontFamily: label === 'User ID' ? 'JetBrains Mono, monospace' : 'inherit', fontSize: label === 'User ID' ? 12 : 14 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
