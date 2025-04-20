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

const apiService = {
  // Auth services - these would connect to your existing auth system
  loginUser: (credentials) => apiClient.post('/login/user', credentials),
  loginAdmin: (credentials) => apiClient.post('/login/admin', credentials),
  signupUser: (userData) => apiClient.post('/signup', userData),
  
  // Product services
  getProducts: (params) => apiClient.get('/products', { params }),
  getProduct: (id) => apiClient.get(`/product/${id}`),
  getFeaturedProducts: () => apiClient.get('/featured-products'),
  getRandomProducts: (limit = 8, gender = null) => apiClient.get('/random-products', { 
    params: { limit, gender } 
  }),
  searchProducts: (searchTerm) => apiClient.get('/search', { 
    params: { query: searchTerm } 
  }),
  getCategories: () => apiClient.get('/categories'),
  getPriceRange: () => apiClient.get('/price-range'),

    // Cart services
  getCart: () => apiClient.get('/cart'),
  addToCart: (productId, quantity, size) => apiClient.post('/cart/add', { productId, quantity, size }),
  updateCartItem: (itemId, quantity) => apiClient.put(`/cart/item/${itemId}`, { quantity }),
  removeCartItem: (itemId) => apiClient.delete(`/cart/item/${itemId}`),
  clearCart: () => apiClient.delete('/cart'),
  saveShippingInfo: (shippingInfo) => apiClient.post('/cart/shipping', shippingInfo),
  
  // Order services
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  getUserOrders: () => apiClient.get('/orders'),
  getOrderDetails: (orderId) => apiClient.get(`/orders/${orderId}`),
  getOrderPaymentStatus: (orderId) => apiClient.get(`/orders/${orderId}/payment`),
  
  // Payment services
  initiatePayment: (amount) => apiClient.post('/payment/create', { amount }),
  verifyPayment: (paymentData) => apiClient.post('/payment/verify', paymentData),
  
  // Wishlist services
  getWishlist: () => apiClient.get('/wishlist'),
  addToWishlist: (productId) => apiClient.post('/wishlist/add', { productId }),
  removeFromWishlist: (productId) => apiClient.delete(`/wishlist/${productId}`),
  
  // User address services
  getUserAddresses: () => apiClient.get('/user/addresses'),
  addUserAddress: (addressData) => apiClient.post('/user/addresses', addressData),
  updateUserAddress: (id, addressData) => apiClient.put(`/user/addresses/${id}`, addressData),
  deleteUserAddress: (id) => apiClient.delete(`/user/addresses/${id}`),
  setDefaultAddress: (id) => apiClient.put(`/user/addresses/${id}/default`),
};

export default apiClient;