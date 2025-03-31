// // src/AppRoutes.jsx
// import { useRoutes } from 'react-router-dom';
// import { useAuth } from './features/auth';
// import { UserSignIn, UserSignUp, AdminSignIn } from './features/auth';

// // Temporarily import from original locations until migrated
// import ErrorPage from './components/common/ErrorPage.jsx';
// import UserDashboard from './features/user/pages/UserDashboard.jsx';
// import AdminDashboard from './features/admin/pages/AdminDashboard.jsx';
// // import ProductCatalog from './components/ProductCatalog.jsx';
// // import ProductPage from './components/ProductPage.jsx';
// // import RecommendFromImage from './components/RecommendFromImage.jsx';
// // import Temp from './components/Temp.jsx';
// // import products from './components/admin-components/products.jsx';
// // import analytics from './components/admin-components/analytics.jsx';
// // import settings from './components/admin-components/settings.jsx';

// export default function AppRoutes() {
//   const { user, admin, loading } = useAuth();
  
//   // Show nothing while checking authentication
//   if (loading) return null;
  
//   // Define routes
//   const routes = [
//     {
//       path: '/',
//       element: user ? <UserDashboard /> : <UserSignIn />,
//       errorElement: <ErrorPage />
//     },
//     {
//       path: '/signin',
//       element: <UserSignIn />,
//       errorElement: <ErrorPage />
//     },
//     {
//       path: '/signup',
//       element: <UserSignUp />,
//       errorElement: <ErrorPage />
//     },
//     {
//       path: '/admin/signin',
//       element: <AdminSignIn />,
//       errorElement: <ErrorPage />
//     },
//     {
//       path: '/admin/dashboard/*',
//       element: admin ? <AdminDashboard /> : <AdminSignIn />,
//       errorElement: <ErrorPage />
//     },
//     {
//         path: "/user/dashboard",
//         element: <UserDashboard />,
//         errorElement: <ErrorPage />,
//       },
//       // {
//       //   path: "/all-products",
//       //   element: <ProductCatalog />,
//       //   errorElement: <ErrorPage />,
//       // },
//       // {
//       //   path: "/product/:id",
//       //   element: <ProductPage />,
//       //   errorElement: <ErrorPage />,
//       // },
//       // {
//       //   path: "/recommend/image",
//       //   element: <RecommendFromImage />,
//       //   errorElement: <ErrorPage />,
//       // },
//       // {
//       //   path: "/user/temp",
//       //   element: <Temp />,
//       //   errorElement: <ErrorPage />,
//       // },
//       {
//         path: "/admin/products",
//         element: <products />,
//         errorElement: <ErrorPage />,
//       },
//       {
//         path: "/admin/analytics",
//         element: <analytics />,
//         errorElement: <ErrorPage />,
//       },
//       {
//         path: "/admin/settings",
//         element: <settings />,
//         errorElement: <ErrorPage />,
//       },
//   ];
  
//   return useRoutes(routes);
// }

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