/**
 * Payment utility functions for M-Mart+ e-commerce platform
 * Handles Paystack and Flutterwave integrations for Nigerian Naira (₦) payments
 */

import axios from 'axios';
import api from '../services/api';

/**
 * Initialize a Paystack transaction
 * @param {Object} paymentData - Payment information
 * @param {string} paymentData.email - Customer email
 * @param {number} paymentData.amount - Amount in kobo (Naira * 100)
 * @param {string} paymentData.reference - Unique transaction reference
 * @param {Object} paymentData.metadata - Additional data to pass to Paystack
 * @returns {Promise} - Resolves to Paystack initialization response
 */
export const initializePaystackPayment = async (paymentData) => {
  try {
    console.log('Calling Paystack API with data:', paymentData);
    // Use our backend as a proxy to make the Paystack API call
    // This keeps our Paystack secret key secure on the server
    const response = await api.post('/payments/paystack/initialize', paymentData);
    console.log('Paystack API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error initializing Paystack payment:', error);
    throw error;
  }
};

/**
 * Verify a Paystack transaction
 * @param {string} reference - Transaction reference to verify
 * @returns {Promise} - Resolves to verification response
 */
export const verifyPaystackPayment = async (reference) => {
  try {
    const response = await api.get(`/payments/paystack/verify/${reference}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying Paystack payment:', error);
    throw error;
  }
};

/**
 * Initialize a Flutterwave transaction
 * @param {Object} paymentData - Payment information
 * @param {string} paymentData.tx_ref - Transaction reference
 * @param {number} paymentData.amount - Amount in Naira
 * @param {string} paymentData.currency - Currency code (NGN)
 * @param {string} paymentData.redirect_url - URL to redirect after payment
 * @param {Object} paymentData.customer - Customer information
 * @param {Object} paymentData.meta - Additional data
 * @returns {Promise} - Resolves to Flutterwave initialization response
 */
export const initializeFlutterwavePayment = async (paymentData) => {
  try {
    // Use our backend as a proxy to make the Flutterwave API call
    const response = await api.post('/payments/flutterwave/initialize', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error initializing Flutterwave payment:', error);
    throw error;
  }
};

/**
 * Verify a Flutterwave transaction
 * @param {string} transactionId - Transaction ID to verify
 * @returns {Promise} - Resolves to verification response
 */
export const verifyFlutterwavePayment = async (transactionId) => {
  try {
    const response = await api.get(`/payments/flutterwave/verify/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying Flutterwave payment:', error);
    throw error;
  }
};

/**
 * Generate a unique reference for payment transactions
 * @returns {string} - Unique reference string
 */
export const generatePaymentReference = () => {
  const timestamp = new Date().getTime();
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `MMART-${timestamp}-${randomStr}`;
};

/**
 * Convert Naira amount to kobo (Paystack requires amount in kobo)
 * @param {number} amount - Amount in Naira
 * @returns {number} - Amount in kobo
 */
export const nairaToKobo = (amount) => {
  return Math.round(amount * 100);
};
