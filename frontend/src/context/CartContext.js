import React, { createContext, useState, useEffect, useContext } from 'react';
import CartService from '../services/cart.service';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

// Create the context
const CartContext = createContext();

// Create a provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();

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
      console.log('Cart items from API:', response);
      
      // Set cart items directly from the API response
      if (response && response.cart_items) {
        console.log('Setting cart items:', response.cart_items);
        setCartItems(response.cart_items || []);
      } else {
        setCartItems([]);
      }
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
      console.log('CartContext addToCart - Product received:', product);
      console.log('CartContext addToCart - Quantity:', quantity);
      
      const cartItem = {
        product_id: product.id,
        quantity,
        product_measurement_id: measurementId
      };
      
      console.log('CartContext addToCart - Cart item to be sent:', cartItem);
      
      const response = await CartService.addToCart(cartItem);
      console.log('CartContext addToCart - Response:', response);
      await fetchCartItems(); // Refresh cart after adding item
      
      // Show success notification
      showSuccess(`${product.name} added to cart successfully!`);
      
      return response;
    } catch (err) {
      console.error('CartContext addToCart - Error:', err);
      setError(err);
      
      // Show error notification
      showError('Failed to add item to cart. Please try again.');
      
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
      
      // Update cart items locally instead of fetching the entire cart again
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      
      // Show success notification for update
      showSuccess('Cart updated successfully!');
      
      return response;
    } catch (err) {
      console.error('Failed to update cart item:', err);
      setError(err);
      
      // Show error notification
      showError('Failed to update cart. Please try again.');
      
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
      await fetchCartItems(); // Refresh cart after removal
      
      // Show success notification for removal
      showSuccess('Item removed from cart!');
      
      return response;
    } catch (err) {
      console.error('Failed to remove cart item:', err);
      setError(err);
      
      // Show error notification
      showError('Failed to remove item. Please try again.');
      
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
      
      // Clear coupon-related localStorage items
      localStorage.removeItem('appliedCoupon');
      localStorage.removeItem('discountAmount');
      localStorage.removeItem('shippingFee');
      localStorage.removeItem('deliveryInfo');
      
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
