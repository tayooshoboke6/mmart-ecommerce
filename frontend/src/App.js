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
import CategoryList from './pages/CategoryList';

// Import pages (to be created)
const CategoryProducts = () => <div className="container mx-auto px-4 py-8">Category Products Coming Soon</div>;
const Account = () => <div className="container mx-auto px-4 py-8">Account Coming Soon</div>;
const Orders = () => <div className="container mx-auto px-4 py-8">Orders Coming Soon</div>;
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
              <Route path="/categories/:slug" element={<CategoryProducts />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
