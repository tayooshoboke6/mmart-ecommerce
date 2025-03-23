import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import ProductService from '../services/product.service';
import { formatNaira } from '../utils/formatters';

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State for products and filters
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('grid'); // grid or list
  
  // Filter states
  const [filters, setFilters] = useState({
    category: queryParams.get('category') || '',
    minPrice: queryParams.get('min_price') || '',
    maxPrice: queryParams.get('max_price') || '',
    sort: queryParams.get('sort') || 'newest',
    search: queryParams.get('q') || '',
    page: parseInt(queryParams.get('page') || '1', 10)
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 12
  });
  
  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call with filters
        // For now, we'll use dummy data
        
        // Simulate API delay
        setTimeout(() => {
          // Generate dummy products
          const dummyProducts = Array(20).fill().map((_, index) => ({
            id: index + 1,
            name: `Product ${index + 1}`,
            slug: `product-${index + 1}`,
            description: `This is a description for product ${index + 1}. It's a great product with many features.`,
            base_price: Math.floor(Math.random() * 50000) + 1000,
            sale_price: Math.random() > 0.3 ? Math.floor(Math.random() * 40000) + 1000 : null,
            image: `https://via.placeholder.com/300x300?text=Product${index + 1}`,
            stock_quantity: Math.floor(Math.random() * 50),
            category_id: Math.floor(Math.random() * 5) + 1
          }));
          
          // Apply filters (in a real app, this would be done on the server)
          let filteredProducts = [...dummyProducts];
          
          // Filter by category
          if (filters.category) {
            filteredProducts = filteredProducts.filter(p => p.category_id === parseInt(filters.category, 10));
          }
          
          // Filter by price
          if (filters.minPrice) {
            filteredProducts = filteredProducts.filter(p => {
              const price = p.sale_price || p.base_price;
              return price >= parseInt(filters.minPrice, 10);
            });
          }
          
          if (filters.maxPrice) {
            filteredProducts = filteredProducts.filter(p => {
              const price = p.sale_price || p.base_price;
              return price <= parseInt(filters.maxPrice, 10);
            });
          }
          
          // Filter by search term
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
              p.name.toLowerCase().includes(searchTerm) || 
              p.description.toLowerCase().includes(searchTerm)
            );
          }
          
          // Sort products
          switch (filters.sort) {
            case 'price_asc':
              filteredProducts.sort((a, b) => {
                const priceA = a.sale_price || a.base_price;
                const priceB = b.sale_price || b.base_price;
                return priceA - priceB;
              });
              break;
            case 'price_desc':
              filteredProducts.sort((a, b) => {
                const priceA = a.sale_price || a.base_price;
                const priceB = b.sale_price || b.base_price;
                return priceB - priceA;
              });
              break;
            case 'name_asc':
              filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case 'name_desc':
              filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
              break;
            case 'newest':
            default:
              // In a real app, this would sort by creation date
              filteredProducts.sort((a, b) => b.id - a.id);
              break;
          }
          
          // Pagination
          const totalItems = filteredProducts.length;
          const totalPages = Math.ceil(totalItems / pagination.perPage);
          const start = (filters.page - 1) * pagination.perPage;
          const end = start + pagination.perPage;
          const paginatedProducts = filteredProducts.slice(start, end);
          
          setProducts(paginatedProducts);
          setPagination({
            ...pagination,
            currentPage: filters.page,
            totalPages,
            totalItems
          });
          
          setLoading(false);
        }, 1000);
        
        // Fetch categories
        setCategories([
          { id: 1, name: 'Groceries', slug: 'groceries' },
          { id: 2, name: 'Electronics', slug: 'electronics' },
          { id: 3, name: 'Fashion', slug: 'fashion' },
          { id: 4, name: 'Home & Kitchen', slug: 'home-kitchen' },
          { id: 5, name: 'Health & Beauty', slug: 'health-beauty' }
        ]);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filters]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('min_price', filters.minPrice);
    if (filters.maxPrice) params.set('max_price', filters.maxPrice);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.search) params.set('q', filters.search);
    if (filters.page > 1) params.set('page', filters.page.toString());
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
  }, [filters, navigate, location.pathname]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1 // Reset to first page when filter changes
    });
  };
  
  // Handle price filter
  const handlePriceFilter = () => {
    // Validate min and max price
    if (filters.minPrice && filters.maxPrice && 
        parseInt(filters.minPrice, 10) > parseInt(filters.maxPrice, 10)) {
      alert('Minimum price cannot be greater than maximum price');
      return;
    }
    
    // Apply price filter
    setFilters({
      ...filters,
      page: 1
    });
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    setFilters({
      ...filters,
      page: newPage
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle view type change
  const handleViewTypeChange = (type) => {
    setViewType(type);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      search: '',
      page: 1
    });
  };
  
  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        
        {/* Filters and products grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-gray-700 font-medium mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search products..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => setFilters({ ...filters, page: 1 })}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price range */}
              <div className="mb-6">
                <h3 className="text-gray-700 font-medium mb-2">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={handlePriceFilter}
                  className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-300"
                >
                  Apply
                </button>
              </div>
              
              {/* Clear filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-md transition duration-300"
              >
                Clear All Filters
              </button>
            </div>
          </div>
          
          {/* Products grid */}
          <div className="lg:w-3/4">
            {/* Sort and view options */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <span className="text-gray-700 mr-2">Sort by:</span>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">View:</span>
                <button
                  onClick={() => handleViewTypeChange('grid')}
                  className={`p-2 rounded-md mr-2 ${viewType === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleViewTypeChange('list')}
                  className={`p-2 rounded-md ${viewType === 'list' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Results count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {products.length} of {pagination.totalItems} products
              </p>
            </div>
            
            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
                    <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Error state */}
            {error && !loading && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
                <p>Error loading products. Please try again later.</p>
              </div>
            )}
            
            {/* Empty state */}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search term.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
            
            {/* Products grid */}
            {!loading && !error && products.length > 0 && (
              <div className={
                viewType === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} viewType={viewType} />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && !error && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show current page, first page, last page, and pages around current page
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNumber === pagination.currentPage
                              ? 'z-10 bg-primary border-primary text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    
                    // Show ellipsis
                    if (
                      (pageNumber === 2 && pagination.currentPage > 3) ||
                      (pageNumber === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.currentPage === pagination.totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
