import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  
  // Calculate total items in cart
  const totalItems = cartItems && Array.isArray(cartItems) 
    ? cartItems.reduce((total, item) => total + item.quantity, 0) 
    : 0;

  // Check if user has admin role
  const isAdmin = user && user.role === 'admin';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close search when opening mobile menu
    if (!isMobileMenuOpen) {
      setIsSearchOpen(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    // Close mobile menu when opening search
    if (!isSearchOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownRef]);

  return (
    <header className="sticky top-0 z-50">
      {/* Main header with blue gradient background */}
      <div className="bg-gradient-to-r from-[#0071ce] to-[#004c91] text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src="/images/logo.png" alt="M-Mart+" className="h-8" />
            </Link>
          </div>

          {/* Search bar - centered */}
          <div className="flex-grow max-w-xl mx-4">
            <form onSubmit={handleSearch} className="flex w-full">
              <input
                type="text"
                placeholder="Search Products, Brands and Categories"
                className="flex-grow p-2 rounded-l-full border-0 text-sm focus:outline-none focus:ring-1 focus:ring-[#0071ce]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#0071ce] text-white p-2 rounded-r-full hover:bg-[#004c91] focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4 text-white">
            <Link to="/categories" className="flex items-center hover:text-blue-100">
              <span className="hidden md:inline mr-1">Categories</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </Link>
            <Link to="/stores" className="hidden md:flex items-center hover:text-blue-100">
              <span className="mr-1">Our Stores</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m-9 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </Link>
            <Link to="/help" className="hidden md:flex items-center hover:text-blue-100">
              <span className="mr-1">Help</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
            <Link to="/cart" className="flex items-center hover:text-blue-100 relative">
              <span className="hidden md:inline mr-1">Cart</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FFB200] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse shadow-sm">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative group" ref={profileDropdownRef}>
                <button className="flex items-center hover:text-blue-100" onClick={toggleProfileDropdown}>
                  <span className="hidden md:inline mr-1">Hello {user.name || user.email?.split('@')[0]}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <div className={`absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 ${isProfileOpen ? 'block' : 'hidden'}`}>
                  <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                  <Link to="/account/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wishlist</Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-blue-600 font-medium hover:bg-gray-100">Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center hover:text-blue-100">
                <span className="hidden md:inline mr-1">Login</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex justify-center md:justify-start py-2">
            <Link to="/" className="px-3 py-1 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Home</Link>
            <Link to="/products" className="px-3 py-1 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Products</Link>
            <Link to="/categories" className="px-3 py-1 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Categories</Link>
            <Link to="/deals" className="px-3 py-1 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Deals</Link>
            <Link to="/contact" className="px-3 py-1 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Contact</Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-200 shadow-lg`}>
        <div className="container mx-auto px-4 py-2">
          <nav className="flex flex-col space-y-2">
            <Link to="/" className="py-2 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Home</Link>
            <Link to="/products" className="py-2 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Products</Link>
            <Link to="/categories" className="py-2 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Categories</Link>
            <Link to="/deals" className="py-2 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Deals</Link>
            <Link to="/contact" className="py-2 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Contact</Link>
            <Link to="/stores" className="py-2 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Our Stores</Link>
            <Link to="/help" className="py-2 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Help</Link>
            {user ? (
              <>
                <Link to="/account" className="py-2 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Hello {user.name || user.email?.split('@')[0]}</Link>
                {isAdmin && (
                  <Link to="/admin" className="py-2 text-blue-600 font-medium">Admin Dashboard</Link>
                )}
                <button onClick={handleLogout} className="py-2 text-left text-[#2E2E2E] hover:text-[#0071ce] font-medium">Logout</button>
              </>
            ) : (
              <Link to="/login" className="py-2 text-[#2E2E2E] hover:text-[#0071ce] font-medium">Login</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
