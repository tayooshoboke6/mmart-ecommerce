import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './components/layout/MainLayout';
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

// Import pages (to be created)
const NotFound = () => <div className="container mx-auto px-4 py-8">Page Not Found</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/categories/:slug" element={<ProductList />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Profile />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/orders/:orderId" element={<OrderDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
