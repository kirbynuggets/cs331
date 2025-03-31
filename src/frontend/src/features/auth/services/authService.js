// src/features/auth/services/authService.js
import apiClient from '../../../services/apiClient.js';

const authService = {
  loginUser: async (credentials) => {
    const response = await apiClient.post('/login/user', credentials);
    return response.data;
  },
  
  loginAdmin: async (credentials) => {
    const response = await apiClient.post('/login/admin', credentials);
    return response.data;
  },
  
  signupUser: async (userData) => {
    const response = await apiClient.post('/signup', userData);
    return response.data;
  },
  
  changePassword: async (data) => {
    const response = await apiClient.post('/users/changepassword', data);
    return response.data;
  },
  
  changeAdminPassword: async (data) => {
    const response = await apiClient.post('/admin/changepassword', data);
    return response.data;
  }
};

export default authService;