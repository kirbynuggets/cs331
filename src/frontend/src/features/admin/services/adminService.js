// src/features/admin/services/adminService.js
import { apiClient } from '../../../services/apiClient';

const adminService = {
  getProducts: async () => {
    const response = await apiClient.get('/admin/products');
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
};
export default adminService;