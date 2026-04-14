// src/components/Toast.jsx
import { useToast } from '../context/ToastContext';

const ICONS = { success: '✓', error: '✕', info: 'ℹ' };
const COLORS = {
  success: 'rgba(34,197,94,0.15)',
  error:   'rgba(239,68,68,0.15)',
  info:    'rgba(124,106,247,0.15)',
};

export default function Toast() {
  const { toasts, remove } = useToast();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          style={{ background: COLORS[t.type] }}
          onClick={() => remove(t.id)}
        >
          <span style={{ fontSize: 16, fontWeight: 700 }}>{ICONS[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
