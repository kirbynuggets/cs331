// src/features/admin/index.js
export { default as AdminDashboard } from './pages/AdminDashboard';
export { CategoryProvider, useCategories } from './context/CategoryContext';

// Components
export { default as Dashboard } from './components/dashboard';
export { default as Sidebar } from './components/sidebar';
export { default as ProductInventory } from './components/products';
export { default as AnalyticsOverview } from './components/analytics';
export { default as Categories } from './components/categories';
export { default as Layout } from './components/layout';
export { default as Orders } from './components/orders';
export { default as Settings } from './components/settings';
export { default as StockReport } from './components/stock';
export { default as ProductDelivery } from './components/delivery';
export { default as FullOrdersPage } from './components/fullOrders';
export { default as FullDeliveriesPage } from './components/fullDeliveries';

// Services
export { default as adminService } from './services/adminService';