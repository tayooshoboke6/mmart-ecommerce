import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../services/api';
import { initializeFlutterwavePayment, initializePaystackPayment, generatePaymentReference } from '../utils/payment';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/format';

const CheckoutDebug = () => {
  // Debug state
  const [logs, setLogs] = useState([]);
  const [envVariables, setEnvVariables] = useState({});
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [orderResponse, setOrderResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auth context
  const { user } = useAuth();
  const { cartItems } = useCart();
  
  // Hardcoded order data
  const [orderData, setOrderData] = useState({
    payment_method: 'card',
    delivery_method: 'shipping',
    shipping_address: 'Test Address',
    shipping_city: 'Lagos',
    shipping_state: 'Lagos',
    shipping_zip: '100001',
    shipping_phone: '08012345678',
    shipping_fee: 2000,
    items: [
      {
        product_id: 1,
        quantity: 2,
        price: 1500,
        name: 'Test Product'
      }
    ],
    subtotal: 3000,
    total: 5000
  });

  // Payment data
  const [paymentData, setPaymentData] = useState({
    email: 'test@example.com',
    amount: 5000,
    name: 'Test User',
    phone: '08012345678',
    redirect_url: `${window.location.origin}/payment/callback`,
    meta: {
      order_reference: generatePaymentReference(),
      customer_name: 'Test User',
      shipping_address: 'Test Address, Lagos, Lagos, 100001'
    }
  });

  // Add log entry
  const addLog = (type, message, data = null) => {
    const timestamp = new Date().toISOString();
    setLogs(prevLogs => [
      { timestamp, type, message, data },
      ...prevLogs
    ]);
    
    // Also log to console for easier debugging
    if (type === 'error') {
      console.error(`[${timestamp}] ${message}`, data);
    } else {
      console.log(`[${timestamp}] ${message}`, data);
    }
  };

  // Fetch environment variables from backend
  const fetchEnvVariables = async () => {
    try {
      addLog('info', 'Fetching environment variables');
      const response = await api.get('/debug/env-variables');
      setEnvVariables(response.data);
      addLog('success', 'Environment variables fetched', response.data);
    } catch (error) {
      addLog('error', 'Failed to fetch environment variables', error);
    }
  };

  // Create order
  const createOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('info', 'Creating order with data', orderData);
      
      const response = await api.post('/orders', orderData);
      setOrderResponse(response.data);
      addLog('success', 'Order created successfully', response.data);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create order');
      addLog('error', 'Order creation failed', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Initialize Flutterwave payment
  const initializeFlutterwave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('info', 'Initializing Flutterwave payment with data', paymentData);
      
      const response = await initializeFlutterwavePayment(paymentData);
      setPaymentResponse(response);
      addLog('success', 'Flutterwave payment initialized', response);
      
      // Redirect to payment page if link is available
      if (response.data?.link) {
        window.location.href = response.data.link;
      }
      
      return response;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to initialize payment');
      addLog('error', 'Flutterwave payment initialization failed', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Test direct API call to Flutterwave
  const testDirectFlutterwaveAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('info', 'Testing direct API call to Flutterwave');
      
      const response = await api.post('/debug/test-flutterwave', paymentData);
      addLog('success', 'Direct Flutterwave API test successful', response.data);
      setPaymentResponse(response.data);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Direct Flutterwave API test failed');
      addLog('error', 'Direct Flutterwave API test failed', {
        error: error.message,
        response: error.response?.data
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check authentication
  useEffect(() => {
    if (user) {
      addLog('info', 'User is authenticated', { userId: user.id });
      
      // Update payment data with user email if available
      if (user.email) {
        setPaymentData(prev => ({
          ...prev,
          email: user.email,
          name: user.name || 'Test User',
          meta: {
            ...prev.meta,
            customer_email: user.email,
            customer_name: user.name || 'Test User'
          }
        }));
        addLog('info', 'Updated payment data with user info', { email: user.email });
      }
    } else {
      addLog('warning', 'User is not authenticated');
    }
  }, [user]);

  return (
    <Container className="py-5">
      <h1 className="mb-4">Checkout Debug Page</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Error:</strong> {error}
        </Alert>
      )}
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Environment Variables</h4>
            </Card.Header>
            <Card.Body>
              <Button 
                variant="primary" 
                onClick={fetchEnvVariables}
                disabled={loading}
                className="mb-3"
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Fetch Environment Variables'}
              </Button>
              
              {Object.keys(envVariables).length > 0 && (
                <div className="mt-3">
                  <h5>Environment Variables:</h5>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(envVariables, null, 2)}
                  </pre>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Header>
              <h4>Order Data</h4>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select 
                  value={orderData.payment_method}
                  onChange={e => setOrderData({...orderData, payment_method: e.target.value})}
                >
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Delivery Method</Form.Label>
                <Form.Select 
                  value={orderData.delivery_method}
                  onChange={e => setOrderData({...orderData, delivery_method: e.target.value})}
                >
                  <option value="shipping">Delivery</option>
                  <option value="pickup">Pickup</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Shipping Fee</Form.Label>
                <Form.Control 
                  type="number"
                  value={orderData.shipping_fee}
                  onChange={e => setOrderData({...orderData, shipping_fee: Number(e.target.value)})}
                />
              </Form.Group>
              
              <Button 
                variant="primary" 
                onClick={createOrder}
                disabled={loading}
                className="mb-3"
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Create Order Only'}
              </Button>
              
              {orderResponse && (
                <div className="mt-3">
                  <h5>Order Response:</h5>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(orderResponse, null, 2)}
                  </pre>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Payment Data</h4>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email"
                  value={paymentData.email}
                  onChange={e => setPaymentData({...paymentData, email: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control 
                  type="number"
                  value={paymentData.amount}
                  onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text"
                  value={paymentData.name}
                  onChange={e => setPaymentData({...paymentData, name: e.target.value})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control 
                  type="text"
                  value={paymentData.phone}
                  onChange={e => setPaymentData({
                    ...paymentData, 
                    phone: e.target.value,
                  })}
                />
              </Form.Group>
              
              <div className="d-flex gap-2 mb-3">
                <Button 
                  variant="primary" 
                  onClick={initializeFlutterwave}
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Test Flutterwave Only'}
                </Button>
              </div>
              
              <Button 
                variant="warning" 
                onClick={testDirectFlutterwaveAPI}
                disabled={loading}
                className="mb-3"
              >
                {loading ? <Spinner animation="border" size="sm" /> : 'Test Direct Flutterwave API'}
              </Button>
              
              {paymentResponse && (
                <div className="mt-3">
                  <h5>Payment Response:</h5>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(paymentResponse, null, 2)}
                  </pre>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Card.Header>
          <h4>Debug Logs</h4>
        </Card.Header>
        <Card.Body>
          <div style={{ maxHeight: '400px', overflow: 'auto' }}>
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`p-2 mb-2 rounded ${
                  log.type === 'error' ? 'bg-danger text-white' : 
                  log.type === 'success' ? 'bg-success text-white' : 
                  log.type === 'warning' ? 'bg-warning' : 
                  'bg-info text-white'
                }`}
              >
                <div><strong>{new Date(log.timestamp).toLocaleTimeString()}</strong> - {log.message}</div>
                {log.data && (
                  <pre className="bg-light text-dark p-2 rounded mt-2" style={{ maxHeight: '100px', overflow: 'auto' }}>
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CheckoutDebug;
