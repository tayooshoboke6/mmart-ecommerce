import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const Register = () => {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    terms: false
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
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^(\+?234|0)[789]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Nigerian phone number';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }
    
    if (!formData.terms) {
      errors.terms = 'You must agree to the Terms and Conditions';
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
      await register(formData);
      
      // Redirect to login page with success message
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please login with your credentials.' 
        } 
      });
    } catch (err) {
      console.error('Registration error:', err);
      setServerError(err.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="py-4 px-6 bg-primary text-white text-center">
            <h2 className="text-2xl font-bold">Create an Account</h2>
          </div>
          
          <div className="p-6">
            {/* Server error message */}
            {serverError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {serverError}
              </div>
            )}
            
            {/* Registration form */}
            <form onSubmit={handleSubmit}>
              {/* Full name field */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-red-500 text-sm">{formErrors.name}</p>
                )}
              </div>
              
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
              
              {/* Phone field */}
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g. 08012345678"
                />
                {formErrors.phone && (
                  <p className="mt-1 text-red-500 text-sm">{formErrors.phone}</p>
                )}
                <p className="mt-1 text-gray-500 text-xs">Format: 08012345678 or +2348012345678</p>
              </div>
              
              {/* Password field */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                {formErrors.password && (
                  <p className="mt-1 text-red-500 text-sm">{formErrors.password}</p>
                )}
                <p className="mt-1 text-gray-500 text-xs">Must be at least 8 characters long</p>
              </div>
              
              {/* Confirm password field */}
              <div className="mb-4">
                <label htmlFor="password_confirmation" className="block text-gray-700 font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {formErrors.password_confirmation && (
                  <p className="mt-1 text-red-500 text-sm">{formErrors.password_confirmation}</p>
                )}
              </div>
              
              {/* Terms and conditions checkbox */}
              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    className={`h-4 w-4 mt-1 text-primary focus:ring-primary border-gray-300 rounded ${
                      formErrors.terms ? 'border-red-500' : ''
                    }`}
                  />
                  <span className="ml-2 text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms-of-service" className="text-primary hover:text-primary-dark">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="text-primary hover:text-primary-dark">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {formErrors.terms && (
                  <p className="mt-1 text-red-500 text-sm">{formErrors.terms}</p>
                )}
              </div>
              
              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </form>
            
            {/* Login link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary-dark font-medium">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
