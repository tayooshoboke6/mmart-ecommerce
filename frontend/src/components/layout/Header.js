import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // In a real implementation, this would fetch from the API
        // For now, we'll use dummy data
        setCategories([
          { id: 1, name: 'Groceries', slug: 'groceries' },
          { id: 2, name: 'Electronics', slug: 'electronics' },
          { id: 3, name: 'Fashion', slug: 'fashion' },
          { id: 4, name: 'Home & Kitchen', slug: 'home-kitchen' },
        ]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  // Toggle profile menu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header>
      {/* Main header with blue background */}
      <div className="bg-[#3B82F6] py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FFB200]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                <span className="text-2xl font-bold text-white ml-2">M-Mart<span className="text-[#FFB200]">+</span></span>
              </div>
            </Link>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search Products, Brands and Categories"
                    className="w-full py-2 pl-4 pr-10 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#FFB200] text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 h-full px-3 flex items-center justify-center text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-r-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Navigation icons */}
            <div className="flex items-center space-x-4 text-white">
              {/* Account Dropdown */}
              <div className="relative">
                <button 
                  onClick={toggleProfileMenu} 
                  className="flex items-center hover:text-[#FFB200] focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">Account</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    {isAuthenticated ? (
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-[#2E2E2E]">Hello, {user?.name || 'User'}</p>
                          
                        </div>
                        <Link 
                          to="/account/profile" 
                          className="block px-4 py-2 text-sm text-[#2E2E2E] hover:bg-blue-50 hover:text-[#3B82F6]"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link 
                          to="/account/orders" 
                          className="block px-4 py-2 text-sm text-[#2E2E2E] hover:bg-blue-50 hover:text-[#3B82F6]"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <button 
                          onClick={() => {
                            handleLogout();
                            setIsProfileMenuOpen(false);
                          }} 
                          className="block w-full text-left px-4 py-2 text-sm text-[#2E2E2E] hover:bg-blue-50 hover:text-[#3B82F6]"
                        >
                          Log Out
                        </button>
                      </div>
                    ) : (
                      <div className="py-1">
                        <Link 
                          to="/login" 
                          className="block px-4 py-2 text-sm text-[#2E2E2E] hover:bg-blue-50 hover:text-[#3B82F6]"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link 
                          to="/register" 
                          className="block px-4 py-2 text-sm text-[#2E2E2E] hover:bg-blue-50 hover:text-[#3B82F6]"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Categories */}
              <Link to="/categories" className="flex items-center hover:text-[#FFB200]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className="text-sm font-medium">Categories</span>
              </Link>

              {/* Our Stores */}
              <Link to="/stores" className="flex items-center hover:text-[#FFB200]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm font-medium">Our Stores</span>
              </Link>

              {/* Help */}
              <Link to="/help" className="flex items-center hover:text-[#FFB200]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Help</span>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="flex items-center hover:text-[#FFB200]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">Cart</span>
                {itemCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-[#3B82F6] bg-white rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-1 rounded-md text-white hover:text-[#FFB200] focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile search - visible only on mobile */}
          <div className="mt-4 md:hidden">
            <form onSubmit={handleSearch}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search Products, Brands and Categories"
                  className="w-full py-2 pl-4 pr-10 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#FFB200] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-0 h-full px-3 flex items-center justify-center text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-r-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 py-3 space-y-3">
            <Link
              to="/account"
              className="block text-[#2E2E2E] hover:text-[#3B82F6]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Account
            </Link>
            <Link
              to="/categories"
              className="block text-[#2E2E2E] hover:text-[#3B82F6]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              to="/stores"
              className="block text-[#2E2E2E] hover:text-[#3B82F6]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Our Stores
            </Link>
            <Link
              to="/help"
              className="block text-[#2E2E2E] hover:text-[#3B82F6]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Help
            </Link>
            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-[#2E2E2E] hover:text-[#3B82F6]"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories navigation - optional, can be shown based on design requirements */}
      {!isLoading && categories.length > 0 && (
        <div className="hidden md:block bg-[#F5F5F5] border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8 overflow-x-auto py-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="text-sm font-medium text-[#2E2E2E] whitespace-nowrap hover:text-[#3B82F6]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
