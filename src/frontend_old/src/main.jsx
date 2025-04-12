import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import userLoader from './loaders/userLoader';
import userLoginLoader from './loaders/userLoginLoader';
import adminLoader from './loaders/adminLoader';
import adminLoginLoader from './loaders/adminLoginLoader';
// import adminUserLoader from './loaders/adminUserLoader.js';
import ErrorPage from './components/ErrorPage.jsx';
import AdminSignIn from './components/AdminSignIn.jsx';
import SignInSide from './components/SignInSide.jsx';
import SignUpSide from './components/SignUpSide.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import UserDashboard from './components/UserDashboard.jsx';
import ProductCatalog from './components/ProductCatalog.jsx';
import ProductPage from './components/ProductPage.jsx';
import RecommendFromImage from './components/RecommendFromImage.jsx';
import Temp from './components/Temp.jsx';
import products from './components/admin-components/products.jsx';
import analytics from './components/admin-components/analytics.jsx';
import settings from './components/admin-components/settings.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    loader: userLoader,
  },
  {
    path: "/signin",
    element: <SignInSide />,
    errorElement: <ErrorPage />,
    loader: userLoginLoader,
  },
  {
    path: "/signup",
    element: <SignUpSide />,
    errorElement: <ErrorPage />,
    loader: userLoginLoader,
  },
  {
    path: "/admin/signin",
    element: <AdminSignIn />,
    errorElement: <ErrorPage />,
    loader: adminLoginLoader,
  },
  {
    path: "/admin/dashboard/*",
    element: <AdminDashboard />,
    errorElement: <ErrorPage />,
    loader: adminLoader,
  },
  {
    path: "/user/dashboard",
    element: <UserDashboard />,
    errorElement: <ErrorPage />,
    loader: userLoader,
  },
  {
    path: "/all-products",
    element: <ProductCatalog />,
    errorElement: <ErrorPage />,
    loader: userLoader,
  },
  {
    path: "/product/:id",
    element: <ProductPage />,
    errorElement: <ErrorPage />,
    loader: userLoader,
  },
  {
    path: "/recommend/image",
    element: <RecommendFromImage />,
    errorElement: <ErrorPage />,
    loader: userLoader,
  },
  {
    path: "/user/temp",
    element: <Temp />,
    errorElement: <ErrorPage />,
    loader: userLoader,
  },
  {
    path: "/admin/products",
    element: <products />,
    errorElement: <ErrorPage />,
    loader: userLoader,
  },
  {
    path: "/admin/analytics",
    element: <analytics />,
    errorElement: <ErrorPage />,
    loader: userLoader,
  },
  {
    path: "/admin/settings",
    element: <settings />,
    errorElement: <ErrorPage />,
    loader: userLoader,
  },
  
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

