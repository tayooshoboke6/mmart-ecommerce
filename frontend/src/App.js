import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderConfirmation from './pages/OrderConfirmation';
import CategoryList from './pages/CategoryList';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import PaymentCallback from './pages/PaymentCallback';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';

// Import pages (to be created)
const NotFound = () => <div className="container mx-auto px-4 py-8">Page Not Found</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              } />
              <Route path="/admin/products" element={
                <AdminLayout>
                  <Products />
                </AdminLayout>
              } />
              <Route path="/admin/categories" element={
                <AdminLayout>
                  <Categories />
                </AdminLayout>
              } />
              <Route path="/admin/orders" element={
                <AdminLayout>
                  <Orders />
                </AdminLayout>
              } />
              <Route path="/admin/users" element={
                <AdminLayout>
                  <Users />
                </AdminLayout>
              } />
              
              {/* Customer Routes - wrapped in MainLayout */}
              <Route path="/" element={
                <MainLayout>
                  <Home />
                </MainLayout>
              } />
              <Route path="/products" element={
                <MainLayout>
                  <ProductList />
                </MainLayout>
              } />
              <Route path="/products/:slug" element={
                <MainLayout>
                  <ProductDetail />
                </MainLayout>
              } />
              <Route path="/categories" element={
                <MainLayout>
                  <CategoryList />
                </MainLayout>
              } />
              <Route path="/categories/:slug" element={
                <MainLayout>
                  <ProductList />
                </MainLayout>
              } />
              <Route path="/cart" element={
                <MainLayout>
                  <Cart />
                </MainLayout>
              } />
              <Route path="/checkout" element={
                <MainLayout>
                  <Checkout />
                </MainLayout>
              } />
              <Route path="/order-success" element={
                <MainLayout>
                  <OrderSuccess />
                </MainLayout>
              } />
              <Route path="/order-confirmation/:orderNumber" element={
                <MainLayout>
                  <OrderConfirmation />
                </MainLayout>
              } />
              <Route path="/login" element={
                <MainLayout>
                  <Login />
                </MainLayout>
              } />
              <Route path="/register" element={
                <MainLayout>
                  <Register />
                </MainLayout>
              } />
              <Route path="/account" element={
                <MainLayout>
                  <Profile />
                </MainLayout>
              } />
              <Route path="/orders" element={
                <MainLayout>
                  <MyOrders />
                </MainLayout>
              } />
              <Route path="/orders/:orderId" element={
                <MainLayout>
                  <OrderDetail />
                </MainLayout>
              } />
              <Route path="/payment/callback" element={
                <MainLayout>
                  <PaymentCallback />
                </MainLayout>
              } />
              <Route path="*" element={
                <MainLayout>
                  <NotFound />
                </MainLayout>
              } />
            </Routes>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
