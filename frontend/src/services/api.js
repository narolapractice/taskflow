// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tf_token');
      localStorage.removeItem('tf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/* ── Auth ── */
export const register   = (data)   => API.post('/auth/register', data);
export const login      = (data)   => API.post('/auth/login', data);
export const getMe      = ()       => API.get('/auth/me');
export const updateMe   = (data)   => API.put('/auth/me', data);

/* ── Boards ── */
export const getBoards      = ()       => API.get('/boards');
export const createBoard    = (data)   => API.post('/boards', data);
export const getBoard       = (id)     => API.get(`/boards/${id}`);
export const updateBoard    = (id, d)  => API.put(`/boards/${id}`, d);
export const deleteBoard    = (id)     => API.delete(`/boards/${id}`);
export const getBoardTasks  = (id)     => API.get(`/boards/${id}/tasks`);

/* ── Tasks ── */
export const createTask     = (data)   => API.post('/tasks', data);
export const getTask        = (id)     => API.get(`/tasks/${id}`);
export const updateTask     = (id, d)  => API.put(`/tasks/${id}`, d);
export const deleteTask     = (id)     => API.delete(`/tasks/${id}`);
export const moveTask       = (id, d)  => API.put(`/tasks/${id}/move`, d);
export const addComment     = (id, d)  => API.post(`/tasks/${id}/comments`, d);

/* ── Users ── */
export const getStats       = ()       => API.get('/users/stats');
export const searchUsers    = (q)      => API.get(`/users?q=${q}`);

export default API;
