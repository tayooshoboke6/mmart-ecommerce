import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Simple loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Lazy load pages to reduce initial bundle size
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const CategoryList = lazy(() => import('./pages/CategoryList'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));
const CheckoutDebug = lazy(() => import('./pages/CheckoutDebug'));

// Admin pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Products = lazy(() => import('./pages/admin/Products'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Users = lazy(() => import('./pages/admin/Users'));
const StoreAddresses = lazy(() => import('./pages/admin/StoreAddresses'));
const Banners = lazy(() => import('./pages/admin/Banners'));
const Settings = lazy(() => import('./pages/admin/Settings'));

// Import pages (to be created)
const NotFound = () => <div className="container mx-auto px-4 py-8">Page Not Found</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/admin/store-addresses" element={
                  <AdminLayout>
                    <StoreAddresses />
                  </AdminLayout>
                } />
                <Route path="/admin/banners" element={
                  <AdminLayout>
                    <Banners />
                  </AdminLayout>
                } />
                <Route path="/admin/settings" element={
                  <AdminLayout>
                    <Settings />
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
                <Route path="/checkout-debug" element={
                  <MainLayout>
                    <CheckoutDebug />
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
            </Suspense>
          </CartProvider>
        </NotificationProvider>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
