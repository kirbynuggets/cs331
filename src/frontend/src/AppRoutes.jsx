import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/auth';
import { UserSignIn, UserSignUp, AdminSignIn } from './features/auth';
import AdminDashboard from './features/admin/pages/AdminDashboard.jsx';
import UserDashboard from './features/user/pages/UserDashboard.jsx';
import ProductCatalog from './features/user/pages/ProductCatalog.jsx';
import RecommendFromImage from './features/user/pages/RecommendFromImage.jsx';
import ProductPage from './features/user/pages/ProductPage.jsx';

// Protected route components
const UserProtectedRoute = ({ children }) => {
  const { isUser } = useAuth();
  return isUser ? children : <Navigate to="/signin" replace />;
};

const AdminProtectedRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin/signin" replace />;
};

export default function AppRoutes() {
  const { loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<UserSignIn />} />
      <Route path="/signin" element={<UserSignIn />} />
      <Route path="/signup" element={<UserSignUp />} />
      <Route path="/admin/signin" element={<AdminSignIn />} />
      
      {/* Protected Routes */}
      <Route path="/admin/dashboard/*" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
      
      {/* Add other routes similarly */}

      {/* Protected Routes */}
      <Route path="/user/dashboard/" element={
        <UserProtectedRoute>
          <UserDashboard />
        </UserProtectedRoute>
      } />

      <Route path="/all-products" element={<ProductCatalog />} />
      <Route path="/recommend/image" element={<RecommendFromImage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}