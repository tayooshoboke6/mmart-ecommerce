import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
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
  
  // Refs for delayed API calls
  const apiCallTimeoutRef = useRef(null);
  const pendingOperationsRef = useRef({});
  
  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (apiCallTimeoutRef.current) {
        clearTimeout(apiCallTimeoutRef.current);
      }
    };
  }, []);
  
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
      
      // Show specific error message from backend or fallback to generic message
      const errorMessage = err.message || 'Failed to fetch cart items. Please try again.';
      showError(errorMessage);
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart with delay
  const addToCart = async (product, quantity = 1, measurementId = null) => {
    setError(null);
    
    // Cancel any pending API calls
    if (apiCallTimeoutRef.current) {
      clearTimeout(apiCallTimeoutRef.current);
    }
    
    try {
      console.log('CartContext addToCart - Product received:', product);
      console.log('CartContext addToCart - Quantity:', quantity);
      
      const cartItem = {
        product_id: product.id,
        quantity,
        product_measurement_id: measurementId
      };
      
      console.log('CartContext addToCart - Cart item to be sent:', cartItem);
      
      // Set loading state
      setLoading(true);
      
      // Store the operation details
      const operationId = `add_${product.id}_${Date.now()}`;
      pendingOperationsRef.current[operationId] = {
        type: 'add',
        data: cartItem
      };
      
      // Return a promise that will be resolved after the delay
      return new Promise((resolve, reject) => {
        // Set a timeout to execute the API call after a delay
        apiCallTimeoutRef.current = setTimeout(async () => {
          try {
            // Check if this operation is still pending
            if (pendingOperationsRef.current[operationId]) {
              const response = await CartService.addToCart(cartItem);
              
              // On success, refresh the cart to get the real item with proper ID
              await fetchCartItems();
              
              // Remove this operation from pending
              delete pendingOperationsRef.current[operationId];
              
              // Resolve the promise with the response
              resolve(response);
            }
          } catch (err) {
            console.error('CartContext addToCart - Error:', err);
            setError(err);
            
            // Remove this operation from pending
            delete pendingOperationsRef.current[operationId];
            
            // Reject the promise with the error
            reject(err);
          } finally {
            // Only reset loading if there are no more pending operations
            if (Object.keys(pendingOperationsRef.current).length === 0) {
              setLoading(false);
            }
          }
        }, 300); // 300ms delay
      });
    } catch (err) {
      console.error('CartContext addToCart - Error setting up delayed call:', err);
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  // Update cart item quantity with delay
  const updateCartItem = async (itemId, quantity) => {
    setError(null);
    
    // Cancel any pending API calls for this item
    if (apiCallTimeoutRef.current) {
      clearTimeout(apiCallTimeoutRef.current);
    }
    
    try {
      // Store original cart items for rollback if needed
      const originalItems = [...cartItems];
      
      // Update cart items locally without showing loading state
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      
      // Store the operation details
      const operationId = `update_${itemId}_${Date.now()}`;
      pendingOperationsRef.current[operationId] = {
        type: 'update',
        itemId,
        quantity
      };
      
      // Return a promise that will be resolved after the delay
      return new Promise((resolve, reject) => {
        // Set a timeout to execute the API call after a delay
        apiCallTimeoutRef.current = setTimeout(async () => {
          try {
            // Check if this operation is still pending
            if (pendingOperationsRef.current[operationId]) {
              const response = await CartService.updateCartItem(itemId, quantity);
              
              // Remove this operation from pending
              delete pendingOperationsRef.current[operationId];
              
              // Resolve the promise with the response
              resolve(response);
            }
          } catch (err) {
            console.error('Failed to update cart item:', err);
            setError(err);
            
            // Fetch fresh cart items on error
            fetchCartItems();
            
            // Remove this operation from pending
            delete pendingOperationsRef.current[operationId];
            
            // Reject the promise with the error
            reject(err);
          }
        }, 300); // 300ms delay
      });
    } catch (err) {
      console.error('Error setting up delayed update:', err);
      setError(err);
      throw err;
    }
  };

  // Remove item from cart with delay
  const removeCartItem = async (itemId) => {
    setError(null);
    
    // Cancel any pending API calls
    if (apiCallTimeoutRef.current) {
      clearTimeout(apiCallTimeoutRef.current);
    }
    
    try {
      setLoading(true);
      
      // Store the operation details
      const operationId = `remove_${itemId}_${Date.now()}`;
      pendingOperationsRef.current[operationId] = {
        type: 'remove',
        itemId
      };
      
      // Return a promise that will be resolved after the delay
      return new Promise((resolve, reject) => {
        // Set a timeout to execute the API call after a delay
        apiCallTimeoutRef.current = setTimeout(async () => {
          try {
            // Check if this operation is still pending
            if (pendingOperationsRef.current[operationId]) {
              const response = await CartService.removeCartItem(itemId);
              await fetchCartItems(); // Refresh cart after removal
              
              // Remove this operation from pending
              delete pendingOperationsRef.current[operationId];
              
              // Resolve the promise with the response
              resolve(response);
            }
          } catch (err) {
            console.error('Failed to remove cart item:', err);
            setError(err);
            
            // Remove this operation from pending
            delete pendingOperationsRef.current[operationId];
            
            // Reject the promise with the error
            reject(err);
          } finally {
            // Only reset loading if there are no more pending operations
            if (Object.keys(pendingOperationsRef.current).length === 0) {
              setLoading(false);
            }
          }
        }, 300); // 300ms delay
      });
    } catch (err) {
      console.error('Error setting up delayed remove:', err);
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  // Clear cart with optimistic updates
  const clearCart = async () => {
    // Cancel any pending API calls
    if (apiCallTimeoutRef.current) {
      clearTimeout(apiCallTimeoutRef.current);
    }
    
    // Clear all pending operations
    pendingOperationsRef.current = {};
    
    // Store original cart items for potential rollback
    const originalCartItems = [...cartItems];
    
    // Immediately clear the cart in the UI for better user experience
    setCartItems([]);
    
    // Clear coupon-related localStorage items immediately
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('discountAmount');
    localStorage.removeItem('shippingFee');
    localStorage.removeItem('deliveryInfo');
    
    try {
      // Return a promise that will be resolved after the API call
      return new Promise((resolve, reject) => {
        // Set a timeout to execute the API call after a delay
        apiCallTimeoutRef.current = setTimeout(async () => {
          try {
            setLoading(true);
            const response = await CartService.clearCart();
            setLoading(false);
            resolve(response);
          } catch (err) {
            console.error('Failed to clear cart:', err);
            setError(err);
            setLoading(false);
            
            // Restore original cart items on error
            setCartItems(originalCartItems);
            
            // Show specific error message from backend or fallback to generic message
            const errorMessage = err.response?.data?.message || err.message || 'Failed to clear cart. Please try again.';
            showError(errorMessage);
            
            reject(err);
          }
        }, 300); // 300ms delay
      });
    } catch (err) {
      console.error('Error setting up delayed clear cart:', err);
      setError(err);
      throw err;
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
