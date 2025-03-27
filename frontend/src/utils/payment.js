import api from "../services/api"

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
    console.log("Calling Paystack API with data:", paymentData)
    // Use our backend as a proxy to make the Paystack API call
    // This keeps our Paystack secret key secure on the server
    const response = await api.post("/payments/paystack/initialize", paymentData)
    console.log("Paystack API response:", response.data)
    return response.data
  } catch (error) {
    console.error("Error initializing Paystack payment:", error)
    throw error
  }
}

/**
 * Verify a Paystack transaction with retry mechanism
 * @param {string} reference - Transaction reference to verify
 * @returns {Promise} - Resolves to verification response
 */
export const verifyPaystackPayment = async (reference) => {
  try {
    console.log("Verifying Paystack payment with reference:", reference)

    // Try the verification with the standard endpoint
    try {
      const response = await api.post("/payments/paystack/verify", { reference })
      console.log("Paystack verification successful:", response.data)

      // Log email status if available
      if (response.data?.data?.email_sent !== undefined) {
        if (response.data.data.email_sent) {
          console.log("📧 Order confirmation email sent successfully (Paystack)")
        } else {
          console.warn("⚠️ Order confirmation email failed to send (Paystack)")
        }
      }

      return response.data
    } catch (error) {
      console.error("Error with standard verification endpoint:", error)

      // If we get a 404, try an alternative endpoint format
      if (error.response && error.response.status === 404) {
        console.log("Trying alternative endpoint format...")

        // Try with a different endpoint format
        try {
          const altResponse = await api.post("/payments/verify", {
            payment_method: "paystack",
            reference,
          })
          console.log("Alternative verification successful:", altResponse.data)
          return altResponse.data
        } catch (altError) {
          console.error("Alternative endpoint also failed:", altError)
          throw altError
        }
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error("All verification attempts failed:", error)
    throw error
  }
}

/**
 * Initialize a Flutterwave transaction
 * @param {Object} paymentData - Payment information
 * @param {string} paymentData.email - Customer email
 * @param {number} paymentData.amount - Amount in Naira
 * @param {string} paymentData.name - Customer name
 * @param {string} paymentData.phone - Customer phone number
 * @param {string} paymentData.redirect_url - URL to redirect after payment
 * @returns {Promise} - Resolves to Flutterwave initialization response
 */
export const initializeFlutterwavePayment = async (paymentData) => {
  try {
    console.log("Initializing Flutterwave payment with data:", paymentData)

    // For test mode, ensure amount is not too large (Flutterwave test mode has limits)
    const testAmount = paymentData.amount > 1000 ? 1000 : paymentData.amount

    // Format the payment data for the backend
    const formattedData = {
      payment_method: "card", // Backend expects: card, bank_transfer, mobile_money
      currency: "NGN", // Nigerian Naira
      country: "NG",
      email: paymentData.email,
      phone_number: paymentData.phone,
      name: paymentData.name,
      amount: testAmount, // Use test amount for test mode
      redirect_url: paymentData.redirect_url || `${window.location.origin}/payment/callback`,
      tx_ref: paymentData.meta?.order_reference || generatePaymentReference(),
      order_id: paymentData.meta?.order_id, // Include the order ID for the backend
      customer: {
        email: paymentData.email,
        phone_number: paymentData.phone,
        name: paymentData.name,
      },
      customizations: {
        title: "M-Mart+ Payment",
        description: "Payment for your order",
        logo: `${window.location.origin}/logo.png`,
      },
      meta: paymentData.meta || {},
    }

    console.log("Sending formatted payment data to backend:", formattedData)

    // Send the request to the backend
    const response = await api.post("/payments/process", formattedData)

    console.log("Flutterwave payment response from backend:", response.data)

    return response.data
  } catch (error) {
    console.error("Error initializing Flutterwave payment:", error)
    console.error("Error details:", error.response?.data || error.message)
    throw error
  }
}

/**
 * Verify a Flutterwave transaction
 * @param {string} transactionId - Transaction ID to verify
 * @param {string} reference - Transaction reference (tx_ref) as fallback
 * @returns {Promise} - Resolves to verification response
 */
export const verifyFlutterwavePayment = async (transactionId, reference) => {
  try {
    let response;
    
    if (transactionId) {
      console.log('Verifying Flutterwave payment with transaction ID:', transactionId);
      // Use the GET endpoint that exists in the backend
      response = await api.get(`/payments/verify/${transactionId}`);
    } else if (reference) {
      console.log('Verifying Flutterwave payment with reference:', reference);
      // Try to verify using the reference through the generic payment verification endpoint
      response = await api.get(`/payments/callback?tx_ref=${reference}`);
    } else {
      throw new Error('No transaction ID or reference provided for verification');
    }
    
    // Log email status if available
    if (response.data?.data?.email_sent !== undefined) {
      if (response.data.data.email_sent) {
        console.log('Order confirmation email sent successfully (Flutterwave)');
      } else {
        console.warn('Order confirmation email failed to send (Flutterwave)');
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error verifying Flutterwave payment:', error);
    
    // If the error is a 404, try an alternative endpoint format
    if (error.response && (error.response.status === 404 || error.response.status === 405)) {
      try {
        console.log('Trying alternative verification endpoint for Flutterwave...');
        // Try the callback URL as a fallback
        const altResponse = await api.get(`/payment/callback?transaction_id=${transactionId || ''}&tx_ref=${reference || ''}`);
        return altResponse.data;
      } catch (altError) {
        console.error('Alternative verification endpoint also failed:', altError);
        throw altError;
      }
    }
    
    throw error;
  }
};

/**
 * Generate a unique reference for payment transactions
 * @returns {string} - Unique reference string
 */
export const generatePaymentReference = () => {
  const timestamp = new Date().getTime()
  const randomStr = Math.random().toString(36).substring(2, 15)
  return `MMART-${timestamp}-${randomStr}`
}

/**
 * Convert Naira amount to kobo (Paystack requires amount in kobo)
 * @param {number} amount - Amount in Naira
 * @returns {number} - Amount in kobo
 */
export const nairaToKobo = (amount) => {
  return Math.round(amount * 100)
}
