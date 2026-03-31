import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'https://flowai-nighthouds.onrender.com/api';

const api = axios.create({
  baseURL,
  timeout: 120000, // 120s for AI generation
  headers: { 'Content-Type': 'application/json' },
});

console.log('🔌 API Base URL:', baseURL);

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('flowai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('flowai_token');
      localStorage.removeItem('flowai_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
