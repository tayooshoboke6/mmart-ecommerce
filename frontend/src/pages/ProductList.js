import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
    minPrice: queryParams.get('min_price') || '0',
    maxPrice: queryParams.get('max_price') || '1000000',
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
        // Get category slug from URL if present
        const pathParts = location.pathname.split('/');
        const categorySlug = pathParts.length > 2 && pathParts[1] === 'categories' ? pathParts[2] : null;
        
        // Log the category slug for debugging
        console.log('Category slug from URL:', categorySlug);
        
        // Create params object for API call
        const params = {
          category: categorySlug || filters.category,
          min_price: filters.minPrice || '0',
          max_price: filters.maxPrice || '1000000',
          sort: filters.sort,
          search: filters.search,
          page: filters.page
        };
        
        // Create realistic Nigerian products with Naira prices
        const nigerianProducts = [
          {
            id: 1,
            name: 'Premium Rice (5kg)',
            slug: 'premium-rice-5kg',
            description: 'High-quality Nigerian rice, perfect for everyday meals.',
            base_price: 8500,
            sale_price: 7650,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Rice+5kg',
            stock_quantity: 50,
            category_id: 1,
            category_slug: 'groceries',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 10
          },
          {
            id: 2,
            name: 'Palm Oil (2L)',
            slug: 'palm-oil-2l',
            description: 'Pure Nigerian palm oil for traditional cooking.',
            base_price: 4500,
            sale_price: 4500,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Palm+Oil',
            stock_quantity: 35,
            category_id: 1,
            category_slug: 'groceries',
            is_on_sale: false,
            is_in_stock: true,
            discount_percentage: 0
          },
          {
            id: 3,
            name: 'Garri (10kg)',
            slug: 'garri-10kg',
            description: 'Fine white garri, a Nigerian staple food.',
            base_price: 6000,
            sale_price: 5400,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Garri',
            stock_quantity: 40,
            category_id: 1,
            category_slug: 'groceries',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 10
          },
          {
            id: 4,
            name: 'Smartphone X12',
            slug: 'smartphone-x12',
            description: '6.5" display, 128GB storage, 8GB RAM, 48MP camera.',
            base_price: 185000,
            sale_price: 165000,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Smartphone',
            stock_quantity: 15,
            category_id: 2,
            category_slug: 'electronics',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 11
          },
          {
            id: 5,
            name: 'Wireless Earbuds',
            slug: 'wireless-earbuds',
            description: 'Bluetooth 5.0, noise cancellation, 20-hour battery life.',
            base_price: 25000,
            sale_price: 25000,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Earbuds',
            stock_quantity: 20,
            category_id: 2,
            category_slug: 'electronics',
            is_on_sale: false,
            is_in_stock: true,
            discount_percentage: 0
          },
          {
            id: 6,
            name: 'Traditional Ankara Fabric',
            slug: 'ankara-fabric',
            description: 'Vibrant Nigerian Ankara fabric, 6 yards.',
            base_price: 12000,
            sale_price: 9600,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Ankara',
            stock_quantity: 25,
            category_id: 3,
            category_slug: 'fashion',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 20
          },
          {
            id: 7,
            name: 'Men\'s Traditional Agbada',
            slug: 'mens-agbada',
            description: 'Elegant 3-piece Nigerian traditional attire.',
            base_price: 35000,
            sale_price: 35000,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Agbada',
            stock_quantity: 10,
            category_id: 3,
            category_slug: 'fashion',
            is_on_sale: false,
            is_in_stock: true,
            discount_percentage: 0
          },
          {
            id: 8,
            name: 'Non-stick Cooking Pot Set',
            slug: 'cooking-pot-set',
            description: 'Set of 4 durable non-stick cooking pots.',
            base_price: 28000,
            sale_price: 22400,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Pot+Set',
            stock_quantity: 15,
            category_id: 4,
            category_slug: 'home-kitchen',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 20
          },
          {
            id: 9,
            name: 'Electric Blender',
            slug: 'electric-blender',
            description: 'Powerful 1000W blender with multiple speed settings.',
            base_price: 18500,
            sale_price: 16650,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Blender',
            stock_quantity: 18,
            category_id: 4,
            category_slug: 'home-kitchen',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 10
          },
          {
            id: 10,
            name: 'Shea Butter Moisturizer',
            slug: 'shea-butter',
            description: 'Natural Nigerian shea butter for skin care.',
            base_price: 3500,
            sale_price: 3500,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Shea+Butter',
            stock_quantity: 30,
            category_id: 5,
            category_slug: 'health-beauty',
            is_on_sale: false,
            is_in_stock: true,
            discount_percentage: 0
          },
          {
            id: 11,
            name: 'Baby Diaper Pack',
            slug: 'baby-diapers',
            description: 'Pack of 50 premium baby diapers.',
            base_price: 9000,
            sale_price: 7200,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Diapers',
            stock_quantity: 25,
            category_id: 6,
            category_slug: 'baby-products',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 20
          },
          {
            id: 12,
            name: 'Baby Feeding Bottles (Set of 3)',
            slug: 'baby-bottles',
            description: 'BPA-free baby feeding bottles with anti-colic system.',
            base_price: 6500,
            sale_price: 5850,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Baby+Bottles',
            stock_quantity: 20,
            category_id: 6,
            category_slug: 'baby-products',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 10
          }
        ];
        
        // Filter products based on category if needed
        let filteredProducts = [...nigerianProducts];
        
        if (categorySlug) {
          filteredProducts = filteredProducts.filter(p => p.category_slug === categorySlug);
        } else if (filters.category) {
          filteredProducts = filteredProducts.filter(p => p.category_id === parseInt(filters.category, 10));
        }
        
        // Apply other filters
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
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm)
          );
        }
        
        // Sort products
        switch (filters.sort) {
          case 'price-asc':
            filteredProducts.sort((a, b) => (a.sale_price || a.base_price) - (b.sale_price || b.base_price));
            break;
          case 'price-desc':
            filteredProducts.sort((a, b) => (b.sale_price || b.base_price) - (a.sale_price || a.base_price));
            break;
          case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
          default: // newest
            // No sorting needed as we're assuming the array is already sorted by newest
            break;
        }
        
        // Pagination
        const startIndex = (filters.page - 1) * pagination.perPage;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pagination.perPage);
        
        let realProducts = [];
        try {
          let response;
          if (categorySlug && categorySlug !== 'undefined') {
            // For category products, don't include search parameter
            const categoryParams = {
              sort: filters.sort,
              min_price: filters.minPrice,
              max_price: filters.maxPrice,
              page: filters.page
            };
            console.log('Making category API call with slug:', categorySlug);
            response = await ProductService.getCategoryProducts(categorySlug, categoryParams);
          } else {
            console.log('Making general products API call');
            response = await ProductService.getProducts(params);
          }
          realProducts = response.products || [];
          console.log('Fetched real products:', realProducts);
          
          // Set pagination if available in response
          if (response.meta) {
            setPagination({
              currentPage: response.meta.current_page || 1,
              totalPages: response.meta.last_page || 1,
              totalItems: response.meta.total || 0,
              perPage: response.meta.per_page || 12
            });
          }
        } catch (apiError) {
          console.log('API call for products failed:', apiError);
        }

        // If we have real products, use them first, then add mock products
        // that don't exist in the real data (to avoid duplicates)
        if (realProducts.length > 0) {
          // Get the IDs of real products to avoid duplicates
          const realProductIds = realProducts.map(prod => prod.id);
          // Filter mock products to only include those not in real data
          const uniqueMockProducts = paginatedProducts.filter(
            mockProd => !realProductIds.includes(mockProd.id)
          );
          // Combine real and unique mock products
          setProducts([...realProducts, ...uniqueMockProducts]);
          // Update pagination based on actual products
          setPagination({
            ...pagination,
            currentPage: filters.page,
            totalPages: Math.ceil([...realProducts, ...uniqueMockProducts].length / pagination.perPage),
            totalItems: [...realProducts, ...uniqueMockProducts].length
          });
        } else {
          // If no real products, use filtered mock products
          setProducts(paginatedProducts);
          // Update pagination based on mock products
          setPagination({
            ...pagination,
            currentPage: filters.page,
            totalPages: Math.ceil(filteredProducts.length / pagination.perPage),
            totalItems: filteredProducts.length
          });
        }

        // Simulate API delay
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filters, location.pathname]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Try to fetch real categories from API
        let realCategories = [];
        try {
          const response = await ProductService.getCategories();
          realCategories = response.categories || [];
          console.log('Fetched real categories:', realCategories);
        } catch (apiError) {
          console.log('API call for categories failed:', apiError);
        }
        
        // Get mock categories
        const mockCategories = getMockCategories();
        
        // If we have real categories, use them first, then add mock categories
        // that don't exist in the real data (to avoid duplicates)
        if (realCategories.length > 0) {
          // Get the IDs of real categories to avoid duplicates
          const realCategoryIds = realCategories.map(cat => cat.id);
          // Filter mock categories to only include those not in real data
          const uniqueMockCategories = mockCategories.filter(
            mockCat => !realCategoryIds.includes(mockCat.id)
          );
          // Combine real and unique mock categories
          setCategories([...realCategories, ...uniqueMockCategories]);
        } else {
          // If no real categories, use all mock categories
          setCategories(mockCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to mock categories if API request fails
        setCategories(getMockCategories());
      }
    };
    
    // Mock categories function as fallback
    const getMockCategories = () => {
      return [
        { id: 1, name: 'Groceries', slug: 'groceries', product_count: 3 },
        { id: 2, name: 'Electronics', slug: 'electronics', product_count: 2 },
        { id: 3, name: 'Fashion', slug: 'fashion', product_count: 2 },
        { id: 4, name: 'Home & Kitchen', slug: 'home-kitchen', product_count: 2 },
        { id: 5, name: 'Health & Beauty', slug: 'health-beauty', product_count: 1 },
        { id: 6, name: 'Baby Products', slug: 'baby-products', product_count: 2 }
      ];
    };
    
    fetchCategories();
  }, []);
  
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
  
  // Get category name from slug
  const getCategoryNameFromSlug = () => {
    const pathParts = location.pathname.split('/');
    const categorySlug = pathParts.length > 2 && pathParts[1] === 'categories' ? pathParts[2] : null;
    
    // Handle 'undefined' case specifically
    if (!categorySlug || categorySlug === 'undefined') {
      return 'All Products';
    }
    
    console.log('Looking for category with slug:', categorySlug);
    console.log('Available categories:', categories);
    
    const category = categories.find(c => c.slug === categorySlug);
    
    // If category not found but we have a slug, try to format the slug as a name
    if (!category && categorySlug) {
      // Convert slug to a readable name (e.g., "home-kitchen" to "Home Kitchen")
      const formattedName = categorySlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      console.log('Category not found in categories array, using formatted name:', formattedName);
      return formattedName;
    }
    
    return category ? category.name : 'All Products';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex text-sm">
            <Link to="/" className="text-blue-500 hover:text-blue-600">Home</Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link to="/categories" className="text-blue-500 hover:text-blue-600">Categories</Link>
            {location.pathname.includes('/categories/') && (
              <>
                <span className="mx-2 text-gray-500">/</span>
                <span className="text-gray-700 font-medium">{getCategoryNameFromSlug()}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
              {getCategoryNameFromSlug().charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{getCategoryNameFromSlug()}</h1>
              <p className="text-gray-600">{pagination.totalItems} products available</p>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col">
          {/* Products section */}
          <div>
            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Error state */}
            {error && !loading && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-100">
                <p>Error loading products. Please try again later.</p>
              </div>
            )}
            
            {/* Empty state */}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search term.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            )}
            
            {/* Products grid */}
            {!loading && !error && products.length > 0 && (
              <div className={
                viewType === 'grid'
                  ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mx-auto max-w-[90%]"
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
                              ? 'z-10 bg-blue-500 border-blue-500 text-white'
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
