import React, { createContext, useState, useEffect, useContext } from 'react';
import CartService from '../services/cart.service';
import { useAuth } from './AuthContext';

// Create the context
const CartContext = createContext();

// Create a provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Format price in Naira
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Calculate cart totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const itemPrice = item.measurement ? 
        (item.measurement.sale_price || item.measurement.price) : 
        (item.product.sale_price || item.product.base_price);
      return total + (itemPrice * item.quantity);
    }, 0);

    return {
      subtotal,
      formattedSubtotal: formatPrice(subtotal),
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    };
  };

  // Load cart items from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    }
  }, [isAuthenticated]);

  // Fetch cart items from API
  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CartService.getCartItems();
      setCartItems(response.cart_items || []);
    } catch (err) {
      console.error('Failed to fetch cart items:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1, measurementId = null) => {
    setLoading(true);
    setError(null);
    try {
      const cartItem = {
        product_id: product.id,
        quantity,
        product_measurement_id: measurementId
      };
      
      const response = await CartService.addToCart(cartItem);
      await fetchCartItems(); // Refresh cart after adding item
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CartService.updateCartItem(itemId, quantity);
      await fetchCartItems(); // Refresh cart after update
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeCartItem = async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await CartService.removeCartItem(itemId);
      await fetchCartItems(); // Refresh cart after removing item
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CartService.clearCart();
      setCartItems([]);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    cartItems,
    loading,
    error,
    ...calculateTotals(),
    formatPrice,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    refreshCart: fetchCartItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
