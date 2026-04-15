import axios from 'axios';

const API_BASE_URL = 'https://dobby-drive-n2h0.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (name, email, password) =>
    api.post('/auth/signup', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Folder APIs
export const folderAPI = {
  getRootFolders: () => api.get('/folders'),
  getFolderContents: (folderId) => api.get(`/folders/${folderId}`),
  createFolder: (name, parentId) =>
    api.post('/folders', { name, parentId }),
  deleteFolder: (folderId) => api.delete(`/folders/${folderId}`),
  getFolderSize: (folderId) => api.get(`/folders/${folderId}/size`),
  getBreadcrumb: (folderId) => api.get(`/folders/${folderId}/breadcrumb`),
};

// Image APIs
export const imageAPI = {
  uploadImage: (formData) =>
    api.post('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getImagesByFolder: (folderId) =>
    api.get(`/images/folder/${folderId}`),
  deleteImage: (imageId) => api.delete(`/images/${imageId}`),
  getImage: (imageId) => api.get(`/images/${imageId}`),
};

export default api;
