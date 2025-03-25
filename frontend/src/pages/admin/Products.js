import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatNaira } from '../../utils/formatters';

// Mock data for products
const mockProducts = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    sku: 'AUDIO-001',
    image_url: 'https://via.placeholder.com/100x100?text=Headphones',
    base_price: 25000,
    sale_price: 19999,
    stock_quantity: 45,
    is_active: true,
    is_featured: true,
    category: { id: 1, name: 'Electronics' }
  },
  {
    id: 2,
    name: 'Organic Cotton T-Shirt',
    sku: 'APRL-002',
    image_url: 'https://via.placeholder.com/100x100?text=T-Shirt',
    base_price: 5000,
    sale_price: null,
    stock_quantity: 120,
    is_active: true,
    is_featured: false,
    category: { id: 2, name: 'Apparel' }
  },
  {
    id: 3,
    name: 'Professional Chef Knife Set',
    sku: 'KTCH-003',
    image_url: 'https://via.placeholder.com/100x100?text=Knife+Set',
    base_price: 35000,
    sale_price: 29999,
    stock_quantity: 18,
    is_active: true,
    is_featured: true,
    category: { id: 3, name: 'Kitchen' }
  },
  {
    id: 4,
    name: 'Smartphone Power Bank 20000mAh',
    sku: 'ELEC-004',
    image_url: 'https://via.placeholder.com/100x100?text=Power+Bank',
    base_price: 12000,
    sale_price: 9999,
    stock_quantity: 65,
    is_active: true,
    is_featured: false,
    category: { id: 1, name: 'Electronics' }
  },
  {
    id: 5,
    name: 'Leather Wallet for Men',
    sku: 'ACCS-005',
    image_url: 'https://via.placeholder.com/100x100?text=Wallet',
    base_price: 8500,
    sale_price: null,
    stock_quantity: 32,
    is_active: true,
    is_featured: false,
    category: { id: 4, name: 'Accessories' }
  },
  {
    id: 6,
    name: 'Stainless Steel Water Bottle',
    sku: 'HLTH-006',
    image_url: 'https://via.placeholder.com/100x100?text=Water+Bottle',
    base_price: 4500,
    sale_price: 3999,
    stock_quantity: 88,
    is_active: true,
    is_featured: false,
    category: { id: 5, name: 'Health & Fitness' }
  },
  {
    id: 7,
    name: 'Wireless Gaming Mouse',
    sku: 'GAME-007',
    image_url: 'https://via.placeholder.com/100x100?text=Gaming+Mouse',
    base_price: 15000,
    sale_price: 12999,
    stock_quantity: 27,
    is_active: true,
    is_featured: true,
    category: { id: 6, name: 'Gaming' }
  },
  {
    id: 8,
    name: 'Scented Soy Candle Set',
    sku: 'HOME-008',
    image_url: 'https://via.placeholder.com/100x100?text=Candle+Set',
    base_price: 7500,
    sale_price: 6500,
    stock_quantity: 54,
    is_active: true,
    is_featured: false,
    category: { id: 7, name: 'Home Decor' }
  },
  {
    id: 9,
    name: 'Digital Drawing Tablet',
    sku: 'ART-009',
    image_url: 'https://via.placeholder.com/100x100?text=Drawing+Tablet',
    base_price: 45000,
    sale_price: null,
    stock_quantity: 12,
    is_active: true,
    is_featured: false,
    category: { id: 8, name: 'Art & Creativity' }
  },
  {
    id: 10,
    name: 'Bluetooth Smart Watch',
    sku: 'WEAR-010',
    image_url: 'https://via.placeholder.com/100x100?text=Smart+Watch',
    base_price: 22000,
    sale_price: 18999,
    stock_quantity: 0,
    is_active: false,
    is_featured: false,
    category: { id: 1, name: 'Electronics' }
  }
];

// Mock categories
const mockCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Apparel' },
  { id: 3, name: 'Kitchen' },
  { id: 4, name: 'Accessories' },
  { id: 5, name: 'Health & Fitness' },
  { id: 6, name: 'Gaming' },
  { id: 7, name: 'Home Decor' },
  { id: 8, name: 'Art & Creativity' }
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, categoryFilter, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/products', {
        params: {
          page: currentPage,
          category: categoryFilter !== 'all' ? categoryFilter : null,
          search: searchQuery || null,
        }
      });

      // Log the complete response to see the image_url for each product
      console.log('API Response:', response.data);
      if (response.data && response.data.data) {
        console.log('Products data:', response.data.data);
        // Log each product's image_url
        response.data.data.forEach(product => {
          console.log(`Product ${product.id} - ${product.name} - Image URL:`, product.image_url);
        });
      }

      if (response.data) {
        setProducts(response.data.data || []);
        setTotalPages(response.data.current_page || 1);
        setUsingMockData(false);
        setError(null);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');

      // Use mock data when API call fails
      let filteredProducts = [...mockProducts];

      // Apply category filter to mock data
      if (categoryFilter !== 'all') {
        filteredProducts = filteredProducts.filter(
          product => product.category && product.category.id.toString() === categoryFilter
        );
      }

      // Apply search filter to mock data
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(
          product => 
            product.name.toLowerCase().includes(query) || 
            (product.sku && product.sku.toLowerCase().includes(query))
        );
      }

      setProducts(filteredProducts);
      setTotalPages(1);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');

      if (response.data && response.data.categories) {
        setCategories(response.data.categories.data || []);
      } else if (response.data) {
        setCategories(response.data.data || []);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Use mock categories from the mockProducts data
      const uniqueCategories = Array.from(
        new Set(mockProducts.map(product => JSON.stringify(product.category)))
      ).map(category => JSON.parse(category));
      
      setCategories(uniqueCategories);
    }
  };

  const handleToggleFeatured = async (productId, currentStatus) => {
    try {
      const response = await api.put(
        `/admin/products/${productId}/featured`,
        { is_featured: !currentStatus },
      );

      if (response.data && response.data.product) {
        // Update the product in the local state
        setProducts(products.map(product => 
          product.id === productId ? { ...product, is_featured: !currentStatus } : product
        ));
      } else {
        throw new Error('Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product: ' + (err.message || 'Unknown error'));
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      const response = await api.put(
        `/admin/products/${productId}/status`,
        { is_active: !currentStatus },
      );

      if (response.data && response.data.product) {
        // Update the product in the local state
        setProducts(products.map(product => 
          product.id === productId ? { ...product, is_active: !currentStatus } : product
        ));
      } else {
        throw new Error('Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(
        `/admin/products/${productId}`,
      );

      if (response.data && response.data.message) {
        // Remove the product from the local state
        setProducts(products.filter(product => product.id !== productId));
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) {
      return;
    }

    if (!window.confirm(`Are you sure you want to ${bulkAction} the selected products?`)) {
      return;
    }

    try {
      let endpoint = '';
      let payload = {};

      switch (bulkAction) {
        case 'delete':
          endpoint = '/admin/products/bulk-delete';
          payload = { product_ids: selectedProducts };
          break;
        case 'feature':
          endpoint = '/admin/products/bulk-feature';
          payload = { product_ids: selectedProducts, is_featured: true };
          break;
        case 'unfeature':
          endpoint = '/admin/products/bulk-feature';
          payload = { product_ids: selectedProducts, is_featured: false };
          break;
        case 'activate':
          endpoint = '/admin/products/bulk-status';
          payload = { product_ids: selectedProducts, is_active: true };
          break;
        case 'deactivate':
          endpoint = '/admin/products/bulk-status';
          payload = { product_ids: selectedProducts, is_active: false };
          break;
        default:
          return;
      }

      const response = await api.post(endpoint, payload);

      if (response.data && response.data.message) {
        // Refresh the product list
        fetchProducts();
        setSelectedProducts([]);
        setBulkAction('');
      } else {
        throw new Error('Failed to perform bulk action');
      }
    } catch (err) {
      console.error('Error performing bulk action:', err);
      alert('Failed to perform bulk action: ' + (err.message || 'Unknown error'));
    }
  };

  // Render loading state
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>

        <div className="flex items-center space-x-4">
          <Link
            to="/admin/products/create"
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark"
          >
            Add New Product
          </Link>

          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Import Products
          </button>
        </div>
      </div>

      {/* Mock data indicator */}
      {usingMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Using mock data.</span> The actual API is currently unavailable. Changes made will not persist.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && !usingMockData && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <span className="font-medium">Error:</span> {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Category filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="w-full md:w-64">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Product name, SKU..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="text-sm text-blue-700">
            <span className="font-medium">{selectedProducts.length}</span> products selected
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="block pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
            >
              <option value="">Bulk Actions</option>
              <option value="feature">Mark as Featured</option>
              <option value="unfeature">Remove Featured</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={product.image_url || `https://via.placeholder.com/100x100?text=${encodeURIComponent(product.name)}`}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/admin/products/${product.id}/edit`} className="hover:text-primary">
                              {product.name}
                            </Link>
                            {product.is_featured && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category ? product.category.name : 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.sale_price ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatNaira(product.sale_price)}</div>
                          <div className="text-sm text-gray-500 line-through">{formatNaira(product.base_price)}</div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{formatNaira(product.base_price)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${product.stock_quantity > 10 ? 'text-green-600' : product.stock_quantity > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {product.stock_quantity || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <Link to={`/admin/products/${product.id}/edit`} className="text-primary hover:text-primary-dark">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                          className={`text-sm ${product.is_featured ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-600 hover:text-gray-800'}`}
                        >
                          {product.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleToggleActive(product.id, product.is_active)}
                          className={`text-sm ${product.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                        >
                          {product.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{products.length > 0 ? (currentPage - 1) * 10 + 1 : 0}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, (currentPage - 1) * 10 + products.length)}</span> of{' '}
                  <span className="font-medium">{totalPages * 10}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {[...Array(totalPages).keys()].map((page) => (
                    <button
                      key={page + 1}
                      onClick={() => setCurrentPage(page + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page + 1
                          ? 'z-10 bg-primary border-primary text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
