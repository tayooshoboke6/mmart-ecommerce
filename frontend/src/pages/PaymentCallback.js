import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { verifyFlutterwavePayment, verifyPaystackPayment } from '../utils/payment';
import api from '../services/api';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get query parameters from URL
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const txRef = params.get('tx_ref');
        const transactionId = params.get('transaction_id');
        
        console.log('Payment callback received:', { status, txRef, transactionId });
        
        // Get pending order from localStorage
        const pendingOrderString = localStorage.getItem('pendingOrder');
        if (!pendingOrderString) {
          setStatus('error');
          setMessage('No pending order found. Please try again.');
          return;
        }
        
        const pendingOrder = JSON.parse(pendingOrderString);
        console.log('Pending order:', pendingOrder);
        
        // Check payment status from URL parameters
        if (status === 'successful' || status === 'completed' || status === 'success') {
          // Verify payment with backend
          let verificationResponse;
          
          // Check if this is a Flutterwave callback (has transaction_id)
          if (transactionId) {
            console.log('Verifying Flutterwave payment with transaction ID:', transactionId);
            verificationResponse = await verifyFlutterwavePayment(transactionId);
          } 
          // Check if this is a Paystack callback (has reference)
          else if (params.get('reference')) {
            console.log('Verifying Paystack payment with reference:', params.get('reference'));
            verificationResponse = await verifyPaystackPayment(params.get('reference'));
          } else {
            console.error('No transaction ID or reference found in callback URL');
            setStatus('error');
            setMessage('Payment verification failed: Missing transaction details');
            return;
          }
          
          console.log('Payment verification response:', verificationResponse);
          
          if (verificationResponse && (verificationResponse.success || verificationResponse.status === 'success')) {
            // Check if order confirmation email was sent
            if (verificationResponse.data && verificationResponse.data.email_sent !== undefined) {
              if (verificationResponse.data.email_sent) {
                console.log('✅ Order confirmation email sent successfully to customer');
              } else {
                console.warn('⚠️ Order confirmation email failed to send. Order was processed but email delivery failed.');
              }
            }
            
            // Payment verified successfully
            setStatus('success');
            setMessage('Payment successful! Redirecting to order confirmation...');
            
            // Clear cart
            clearCart();
            
            // Remove pending order from localStorage
            localStorage.removeItem('pendingOrder');
            
            // Store the order number in localStorage for the confirmation page
            if (pendingOrder.orderNumber) {
              localStorage.setItem('last_order_number', pendingOrder.orderNumber);
            }
            
            // Redirect to order confirmation page
            setTimeout(() => {
              navigate(`/order-confirmation/${pendingOrder.orderNumber || pendingOrder.orderId}`);
            }, 2000);
          } else {
            // Payment verification failed
            setStatus('error');
            setMessage(`Payment verification failed: ${verificationResponse?.message || 'Unknown error'}`);
            console.error('Payment verification failed:', verificationResponse);
          }
        } else {
          // Payment was not successful
          setStatus('error');
          setMessage(`Payment was not successful. Status: ${status || 'unknown'}`);
          console.error('Payment failed with status:', status);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment: ' + (error.message || 'Unknown error'));
      }
    };

    verifyPayment();
  }, [location, navigate, clearCart]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-green-600 mb-2">Payment Successful</h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-red-500 text-5xl mb-4">✗</div>
              <h2 className="text-xl font-semibold text-red-600 mb-2">Payment Failed</h2>
            </>
          )}
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status === 'error' && (
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
