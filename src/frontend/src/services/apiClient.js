// src/services/apiClient.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3158/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('loggedAdmin');
    const userToken = localStorage.getItem('loggedUser');
    
    if (adminToken) {
      const admin = JSON.parse(adminToken);
      config.headers.Authorization = `Bearer ${admin.token}`;
    } else if (userToken) {
      const user = JSON.parse(userToken);
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle token expiration
      localStorage.removeItem('loggedAdmin');
      localStorage.removeItem('loggedUser');
      window.location.href = '/signin';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;