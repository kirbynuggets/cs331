// src/features/admin/services/adminService.js
import apiClient from '../../../services/apiClient';

const adminService = {
  // Product Management
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/admin/products', { params });
    return response.data;
  },
  
  getProductById: async (id) => {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data;
  },
  
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/admin/products/${id}`, productData);
    return response.data;
  },
  
  createProduct: async (productData) => {
    const response = await apiClient.post('/admin/products', productData);
    return response.data;
  },
  
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  },
  
  // Category Management
  getCategories: async () => {
    const response = await apiClient.get('/admin/categories');
    return response.data;
  },
  
  createCategory: async (categoryData) => {
    const response = await apiClient.post('/admin/categories', categoryData);
    return response.data;
  },
  
  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(`/admin/categories/${id}`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
  },
  
  // Order Management
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },
  
  getOrderById: async (id) => {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  },
  
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
  
  // Delivery Management
  getDeliveries: async (params = {}) => {
    const response = await apiClient.get('/admin/deliveries', { params });
    return response.data;
  },
  
  updateDeliveryStatus: async (id, status) => {
    const response = await apiClient.patch(`/admin/deliveries/${id}/status`, { status });
    return response.data;
  },
  
  // Analytics
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/analytics/dashboard');
    return response.data;
  },
  
  getSalesReport: async (params = {}) => {
    const response = await apiClient.get('/admin/analytics/sales', { params });
    return response.data;
  },
  
  getInventoryReport: async () => {
    const response = await apiClient.get('/admin/analytics/inventory');
    return response.data;
  }
};

export default adminService;