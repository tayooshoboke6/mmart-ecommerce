import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to home page
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset server error
    setServerError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      await login({
        email: formData.email,
        password: formData.password,
        remember: formData.remember
      });
      
      // Redirect to previous page or home
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setServerError(err.message || 'Failed to login. Please check your credentials and try again.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="py-4 px-6 bg-primary text-white text-center">
            <h2 className="text-2xl font-bold">Login to M-Mart<span className="text-secondary">+</span></h2>
          </div>
          
          <div className="p-6">
            {/* Server error message */}
            {serverError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {serverError}
              </div>
            )}
            
            {/* Login form */}
            <form onSubmit={handleSubmit}>
              {/* Email field */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {formErrors.email && (
                  <p className="mt-1 text-red-500 text-sm">{formErrors.email}</p>
                )}
              </div>
              
              {/* Password field */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-gray-700 font-medium">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                {formErrors.password && (
                  <p className="mt-1 text-red-500 text-sm">{formErrors.password}</p>
                )}
              </div>
              
              {/* Remember me checkbox */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">Remember me</span>
                </label>
              </div>
              
              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Login
              </Button>
            </form>
            
            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
