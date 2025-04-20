// // import React from 'react';
// // import { Routes, Route, Navigate } from 'react-router-dom';
// // import { useAuth } from './features/auth';
// // import { UserSignIn, UserSignUp, AdminSignIn } from './features/auth';
// // import AdminDashboard from './features/admin/pages/AdminDashboard.jsx';
// // import UserDashboard from './features/user/pages/UserDashboard.jsx';
// // import ProductCatalog from './features/user/pages/ProductCatalog.jsx';
// // import RecommendFromImage from './features/user/pages/RecommendFromImage.jsx';
// // import ProductPage from './features/user/pages/ProductPage.jsx';

// // // Protected route components
// // const UserProtectedRoute = ({ children }) => {
// //   const { isUser } = useAuth();
// //   return isUser ? children : <Navigate to="/signin" replace />;
// // };

// // const AdminProtectedRoute = ({ children }) => {
// //   const { isAdmin } = useAuth();
// //   return isAdmin ? children : <Navigate to="/admin/signin" replace />;
// // };

// // export default function AppRoutes() {
// //   const { loading } = useAuth();
  
// //   if (loading) {
// //     return <div>Loading...</div>;
// //   }
  
// //   return (
// //     <Routes>
// //       <Route path="/" element={<UserSignIn />} />
// //       <Route path="/signin" element={<UserSignIn />} />
// //       <Route path="/signup" element={<UserSignUp />} />
// //       <Route path="/admin/signin" element={<AdminSignIn />} />

// //       {/* Protected Routes */}
// //       <Route path="/user/dashboard/" element={
// //         <UserProtectedRoute>
// //           <UserDashboard />
// //         </UserProtectedRoute>
// //       } />
      
// //       {/* Protected Routes */}
// //       <Route path="/admin/dashboard/*" element={
// //         <AdminProtectedRoute>
// //           <AdminDashboard />
// //         </AdminProtectedRoute>
// //       } />

// //       <Route path="/all-products" element={<ProductCatalog />} />
// //       <Route path="/recommend/image" element={<RecommendFromImage />} />
// //       <Route path="/product/:id" element={<ProductPage />} />
      
// //       {/* Catch-all redirect */}
// //       <Route path="*" element={<Navigate to="/" replace />} />
// //     </Routes>
// //   );
// // }

// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './features/auth';
// import { UserSignIn, UserSignUp, AdminSignIn } from './features/auth';
// import AdminDashboard from './features/admin/pages/AdminDashboard.jsx';
// import UserDashboard from './features/user/pages/UserDashboard.jsx';
// import ProductCatalog from './features/user/pages/ProductCatalog.jsx';
// import RecommendFromImage from './features/user/pages/RecommendFromImage.jsx';
// import ProductPage from './features/user/pages/ProductPage.jsx';
// import CartPage from './features/cart/components/CartPage.jsx';
// import WishlistPage from './features/wishlist/pages/WishlistPage.jsx';
// import OrdersPage from './features/orders/pages/OrdersPage.jsx';
// import OrderDetailsPage from './features/orders/pages/OrderDetailsPage.jsx';
// import UserProfilePage from './features/user/pages/UserProfilePage.jsx';
// import NavBar from './components/layout/NavBar';

// // Protected route components
// const UserProtectedRoute = ({ children }) => {
//   const { isUser } = useAuth();
//   return isUser ? children : <Navigate to="/signin" replace />;
// };

// const AdminProtectedRoute = ({ children }) => {
//   const { isAdmin } = useAuth();
//   return isAdmin ? children : <Navigate to="/admin/signin" replace />;
// };

// export default function AppRoutes() {
//   const { loading } = useAuth();
  
//   if (loading) {
//     return <div>Loading...</div>;
//   }
  
//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route path="/" element={<UserSignIn />} />
//       <Route path="/signin" element={<UserSignIn />} />
//       <Route path="/signup" element={<UserSignUp />} />
//       <Route path="/admin/signin" element={<AdminSignIn />} />

    
//       <Route path="/all-products" element={<ProductCatalog />} />
//       <Route path="/product/:id" element={<ProductPage />} />
//       <Route path="/recommend/image" element={<RecommendFromImage />} />

//       {/* User Protected Routes */}
//       <Route path="/user/dashboard/" element={
//         <UserProtectedRoute>
//           <UserDashboard />
//         </UserProtectedRoute>
//       } />
      
//       <Route path="/user/profile" element={
//         <UserProtectedRoute>
//           <UserProfilePage />
//         </UserProtectedRoute>
//       } />
      
//       <Route path="/user/orders" element={
//         <UserProtectedRoute>
//           <OrdersPage />
//         </UserProtectedRoute>
//       } />
      
//       <Route path="/user/orders/:orderId" element={
//         <UserProtectedRoute>
//           <OrderDetailsPage />
//         </UserProtectedRoute>
//       } />
      
//       <Route path="/user/wishlist" element={
//         <UserProtectedRoute>
//           <WishlistPage />
//         </UserProtectedRoute>
//       } />
      
//       <Route path="/cart" element={<CartPage />} />
      
//       {/* Admin Protected Routes */}
//       <Route path="/admin/dashboard/*" element={
//         <AdminProtectedRoute>
//           <AdminDashboard />
//         </AdminProtectedRoute>
//       } />
      
//       {/* Catch-all redirect */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
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
import CartPage from './features/cart/components/CartPage.jsx';
import WishlistPage from './features/wishlist/pages/WishlistPage.jsx';
import OrdersPage from './features/orders/pages/OrdersPage.jsx';
import OrderDetailsPage from './features/orders/pages/OrderDetailsPage.jsx';
import UserProfilePage from './features/user/pages/UserProfilePage.jsx';
import NavBar from './components/layout/NavBar';

// Create a Layout component that includes NavBar
const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const username = user?.username || 'Guest';
  
  return (
    <>
      <NavBar username={username} />
      {children}
    </>
  );
};

// Protected route components with NavBar integration
const UserProtectedRoute = ({ children }) => {
  const { isUser } = useAuth();
  return isUser ? (
    <MainLayout>
      {children}
    </MainLayout>
  ) : <Navigate to="/signin" replace />;
};

// Admin routes don't use the standard NavBar
const AdminProtectedRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin/signin" replace />;
};

// For public routes that should have the NavBar (like product pages)
const PublicRouteWithNav = ({ children }) => {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
};

export default function AppRoutes() {
  const { loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Routes>
      {/* Auth Routes (No NavBar) */}
      <Route path="/" element={<UserSignIn />} />
      <Route path="/signin" element={<UserSignIn />} />
      <Route path="/signup" element={<UserSignUp />} />
      <Route path="/admin/signin" element={<AdminSignIn />} />

      {/* Public Routes with NavBar */}
      <Route path="/all-products" element={
        <PublicRouteWithNav>
          <ProductCatalog />
        </PublicRouteWithNav>
      } />
      
      <Route path="/product/:id" element={
        <PublicRouteWithNav>
          <ProductPage />
        </PublicRouteWithNav>
      } />
      
      <Route path="/recommend/image" element={
        <PublicRouteWithNav>
          <RecommendFromImage />
        </PublicRouteWithNav>
      } />

      {/* User Protected Routes (with NavBar) */}
      <Route path="/user/dashboard/" element={
        <UserProtectedRoute>
          <UserDashboard />
        </UserProtectedRoute>
      } />
      
      <Route path="/user/profile" element={
        <UserProtectedRoute>
          <UserProfilePage />
        </UserProtectedRoute>
      } />
      
      <Route path="/user/orders" element={
        <UserProtectedRoute>
          <OrdersPage />
        </UserProtectedRoute>
      } />
      
      <Route path="/user/orders/:orderId" element={
        <UserProtectedRoute>
          <OrderDetailsPage />
        </UserProtectedRoute>
      } />
      
      <Route path="/user/wishlist" element={
        <UserProtectedRoute>
          <WishlistPage />
        </UserProtectedRoute>
      } />
      
      {/* Cart page with NavBar - typically accessible to both logged in and guest users */}
      <Route path="/cart" element={
        <PublicRouteWithNav>
          <CartPage />
        </PublicRouteWithNav>
      } />
      
      {/* Admin Protected Routes (no user NavBar) */}
      <Route path="/admin/dashboard/*" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}