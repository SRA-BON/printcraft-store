import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginSignup from './pages/LoginSignup';
import UserDashboard from './pages/UserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Store from './App'; // The existing store component (renamed for clarity)
import SellerSellingDashboard from './pages/SellerSellingDashboard';
import SellerStock from './pages/SellerStock';
import SellerOrders from './pages/SellerOrders';
import SellerReports from './pages/SellerReports';
import AdminHistory from './pages/AdminHistory';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import ProductDetail from './pages/ProductDetail';
import AdminCreations from './pages/AdminCreations';
import SellerStatistics from './pages/SellerStatistics';
import Customizations from './pages/Customizations';

// Protected Route Component
const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(user.userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginSignup />} />
      <Route path="/" element={<Store />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      {/* Protected User Routes */}
      <Route
        path="/dashboard/user"
        element={
          <ProtectedRoute allowedTypes={['customer']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customizations"
        element={
          <ProtectedRoute allowedTypes={['customer', 'seller', 'admin']}>
            <Customizations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedTypes={['customer']}>
            <Cart />
          </ProtectedRoute>
        }
      />

      {/* Protected Seller Routes */}
      <Route
        path="/dashboard/seller"
        element={
          <ProtectedRoute allowedTypes={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/selling"
        element={
          <ProtectedRoute allowedTypes={['seller']}>
            <SellerSellingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/stock"
        element={
          <ProtectedRoute allowedTypes={['seller']}>
            <SellerStock />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <ProtectedRoute allowedTypes={['seller']}>
            <SellerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/statistics"
        element={
          <ProtectedRoute allowedTypes={['seller']}>
            <SellerStatistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/reports"
        element={
          <ProtectedRoute allowedTypes={['seller']}>
            <SellerReports />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedTypes={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/history"
        element={
          <ProtectedRoute allowedTypes={['admin']}>
            <AdminHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/creations"
        element={
          <ProtectedRoute allowedTypes={['admin']}>
            <AdminCreations />
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component with Router
function AppRouter() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default AppRouter;

