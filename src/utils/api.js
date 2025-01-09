// import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// // Axios 인스턴스 생성
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // 요청 인터셉터
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // 응답 인터셉터
// api.interceptors.response.use(
//   (response) => response.data,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// // API 엔드포인트
// export const endpoints = {
//   auth: {
//     login: (credentials) => api.post('/auth/login', credentials),
//     logout: () => api.post('/auth/logout'),
//     refreshToken: () => api.post('/auth/refresh'),
//   },
//   projects: {
//     getAll: (params) => api.get('/projects', { params }),
//     getById: (id) => api.get(`/projects/${id}`),
//     create: (data) => api.post('/projects', data),
//     update: (id, data) => api.put(`/projects/${id}`, data),
//     delete: (id) => api.delete(`/projects/${id}`),
//   },
//   symbols: {
//     getAll: (params) => api.get('/symbols', { params }),
//     getById: (id) => api.get(`/symbols/${id}`),
//     create: (data) => api.post('/symbols', data),
//     update: (id, data) => api.put(`/symbols/${id}`, data),
//     delete: (id) => api.delete(`/symbols/${id}`),
//   },
//   drawings: {
//     upload: (projectId, file, onProgress) => {
//       const formData = new FormData();
//       formData.append('file', file);
      
//       return api.post(`/projects/${projectId}/drawings`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         onUploadProgress: (progressEvent) => {
//           const percentCompleted = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           onProgress?.(percentCompleted);
//         },
//       });
//     },
//     process: (drawingId) => api.post(`/drawings/${drawingId}/process`),
//     getStatus: (drawingId) => api.get(`/drawings/${drawingId}/status`),
//   },
// };

// // src/utils/storage.js
// const storage = {
//   get: (key, defaultValue = null) => {
//     try {
//       const item = localStorage.getItem(key);
//       return item ? JSON.parse(item) : defaultValue;
//     } catch {
//       return defaultValue;
//     }
//   },
  
//   set: (key, value) => {
//     try {
//       localStorage.setItem(key, JSON.stringify(value));
//       return true;
//     } catch {
//       return false;
//     }
//   },
  
//   remove: (key) => {
//     try {
//       localStorage.removeItem(key);
//       return true;
//     } catch {
//       return false;
//     }
//   },
  
//   clear: () => {
//     try {
//       localStorage.clear();
//       return true;
//     } catch {
//       return false;
//     }
//   },
// };

