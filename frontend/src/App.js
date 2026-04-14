// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import AuthPage    from './pages/AuthPage';
import Dashboard   from './pages/Dashboard';
import BoardsPage  from './pages/BoardsPage';
import BoardPage   from './pages/BoardPage';
import ProfilePage from './pages/ProfilePage';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Protected */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/boards"    element={<ProtectedRoute><BoardsPage /></ProtectedRoute>} />
            <Route path="/boards/:id"element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Global Toasts */}
          <Toast />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
