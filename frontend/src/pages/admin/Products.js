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
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [expiryStatusFilter, setExpiryStatusFilter] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, selectedCategory, stockStatusFilter, expiryStatusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        include_inactive: true, // Include inactive products in admin view
        per_page: 15
      };

      // Add category filter if selected
      if (selectedCategory) {
        params.category_id = selectedCategory;
      }

      // Add stock status filter if selected
      if (stockStatusFilter) {
        params.stock_status = stockStatusFilter;
      }

      // Add expiry status filter if selected
      if (expiryStatusFilter) {
        params.expiry_status = expiryStatusFilter;
      }

      const response = await api.get('/admin/products', { params });

      // Check if the response has data
      if (response.data) {
        // Handle paginated response format
        if (response.data.data) {
          setProducts(response.data.data);
          setTotalPages(response.data.last_page || 1);
          setCurrentPage(response.data.current_page || 1);
        } 
        // Handle non-paginated response format
        else if (Array.isArray(response.data)) {
          setProducts(response.data);
          setTotalPages(1);
          setCurrentPage(1);
        }
        // Handle response with products directly in the root
        else if (response.data.products) {
          setProducts(response.data.products.data || response.data.products);
          setTotalPages(response.data.products.last_page || 1);
          setCurrentPage(response.data.products.current_page || 1);
        }
        // If no recognizable format, throw an error
        else {
          console.error('Unexpected API response format:', response.data);
          throw new Error('Unexpected API response format');
        }
        
        setError(null);
      } else {
        throw new Error('Failed to fetch products: Empty response');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');

      // Use mock data when API call fails
      let filteredProducts = [...mockProducts];

      setProducts(filteredProducts);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');

      if (response.data) {
        // Handle different response formats
        if (response.data.categories && response.data.categories.data) {
          // Format: { categories: { data: [...] } }
          setCategories(response.data.categories.data);
        } 
        else if (response.data.categories) {
          // Format: { categories: [...] }
          setCategories(Array.isArray(response.data.categories) ? response.data.categories : []);
        }
        else if (response.data.data) {
          // Format: { data: [...] }
          setCategories(response.data.data);
        }
        else if (Array.isArray(response.data)) {
          // Format: [...]
          setCategories(response.data);
        }
        else {
          console.error('Unexpected categories API response format:', response.data);
          throw new Error('Unexpected categories API response format');
        }
      } else {
        throw new Error('Failed to fetch categories: Empty response');
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

      // Check for different response formats
      if (response.data) {
        let success = false;
        let updatedProduct = null;
        
        // Check for product in response
        if (response.data.product) {
          updatedProduct = response.data.product;
          success = true;
        } 
        // Check for success message
        else if (response.data.success || response.data.message) {
          success = true;
          // In this case, we'll update the product in the local state based on our knowledge
        }
        
        if (success) {
          // Update the product in the local state
          setProducts(products.map(product => 
            product.id === productId ? { 
              ...product, 
              is_featured: !currentStatus,
              // If we have an updated product from the API, use its values
              ...(updatedProduct ? { 
                // Map any fields that might have different names
                is_featured: updatedProduct.is_featured !== undefined ? updatedProduct.is_featured : !currentStatus,
                featured: updatedProduct.featured !== undefined ? updatedProduct.featured : !currentStatus
              } : {})
            } : product
          ));
          
          // Show success message
          alert(`Product ${!currentStatus ? 'featured' : 'unfeatured'} successfully`);
          
          // Log success
          console.log('Product featured status updated successfully');
        } else {
          throw new Error('Failed to update product: Unexpected response format');
        }
      } else {
        throw new Error('Failed to update product: Empty response');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert(`Failed to update product: ${err.message}`);
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      console.log(`Toggling active status for product ${productId} from ${currentStatus} to ${!currentStatus}`);
      
      // Make API call to update the product status
      const response = await api.put(
        `/admin/products/${productId}/status`,
        { is_active: !currentStatus },
      );

      // Log the response for debugging
      console.log('Toggle active response:', response.data);

      // Check for different response formats
      if (response.data) {
        let success = false;
        let updatedProduct = null;
        
        // Check for product in response
        if (response.data.product) {
          updatedProduct = response.data.product;
          success = true;
        } 
        // Check for success message
        else if (response.data.success || response.data.message) {
          success = true;
          // In this case, we'll update the product in the local state based on our knowledge
        }
        
        if (success) {
          // Update the product in the local state
          setProducts(products.map(product => 
            product.id === productId ? { 
              ...product, 
              is_active: !currentStatus,
              // If we have an updated product from the API, use its values
              ...(updatedProduct ? { 
                // Map any fields that might have different names
                is_active: updatedProduct.is_active !== undefined ? updatedProduct.is_active : !currentStatus
              } : {})
            } : product
          ));
          
          // Show success message
          alert(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
          
          // Log success
          console.log('Product active status updated successfully');
        } else {
          throw new Error('Failed to update product: Unexpected response format');
        }
      } else {
        throw new Error('Failed to update product: Empty response');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert(`Failed to update product: ${err.message}`);
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

      // Check for different response formats
      if (response.data) {
        let success = false;
        
        // Check for success message
        if (response.data.message || response.data.success) {
          success = true;
        }
        
        if (success) {
          // Remove the product from the local state
          setProducts(products.filter(product => product.id !== productId));
          
          // Show success message
          alert('Product deleted successfully');
          
          // Log success
          console.log('Product deleted successfully');
        } else {
          throw new Error('Failed to delete product: Unexpected response format');
        }
      } else {
        throw new Error('Failed to delete product: Empty response');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(`Failed to delete product: ${err.message}`);
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

      // Check for different response formats
      if (response.data) {
        let success = false;
        
        // Check for success message
        if (response.data.message || response.data.success) {
          success = true;
        }
        
        if (success) {
          // Refresh the product list to get the updated data
          fetchProducts();
          
          // Clear selections and bulk action
          setSelectedProducts([]);
          setBulkAction('');
          
          // Show success message
          let actionText = '';
          switch (bulkAction) {
            case 'delete':
              actionText = 'deleted';
              break;
            case 'feature':
              actionText = 'marked as featured';
              break;
            case 'unfeature':
              actionText = 'removed from featured';
              break;
            case 'activate':
              actionText = 'activated';
              break;
            case 'deactivate':
              actionText = 'deactivated';
              break;
          }
          
          alert(`Selected products have been ${actionText} successfully`);
          console.log(`Bulk action '${bulkAction}' completed successfully`);
        } else {
          throw new Error('Failed to perform bulk action: Unexpected response format');
        }
      } else {
        throw new Error('Failed to perform bulk action: Empty response');
      }
    } catch (err) {
      console.error('Error performing bulk action:', err);
      alert(`Failed to perform bulk action: ${err.message}`);
    }
  };

  const handleEditClick = (product) => {
    // Format the expiry_date to YYYY-MM-DD format if it exists
    if (product.expiry_date) {
      // Parse the ISO date and format it as YYYY-MM-DD
      const date = new Date(product.expiry_date);
      product = {
        ...product,
        expiry_date: date.toISOString().split('T')[0]
      };
    }
    
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (formData) => {
    try {
      // Create a copy of the form data to ensure we don't modify the original
      const dataToSend = { ...formData };
      
      // Convert string values to numbers for numeric fields
      if (typeof dataToSend.base_price === 'string') {
        dataToSend.base_price = parseFloat(dataToSend.base_price);
      }
      
      if (typeof dataToSend.stock_quantity === 'string') {
        dataToSend.stock_quantity = parseInt(dataToSend.stock_quantity, 10);
      }
      
      if (typeof dataToSend.sale_price === 'string' && dataToSend.sale_price) {
        dataToSend.sale_price = parseFloat(dataToSend.sale_price);
      }
      
      // Check if we're creating a new product or updating an existing one
      const isNewProduct = !editingProduct || !editingProduct.id;
      
      // If creating a new product, map field names to match backend expectations
      if (isNewProduct) {
        console.log('Creating new product with data:', dataToSend);
        
        // Validate required fields before sending
        const requiredFields = ['name', 'base_price', 'stock_quantity', 'sku', 'category_id'];
        const missingFields = requiredFields.filter(field => !dataToSend[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        // Map field names for new product creation to match backend expectations
        const createProductData = {
          name: dataToSend.name,
          description: dataToSend.description || '',
          short_description: dataToSend.short_description || null,
          price: parseFloat(dataToSend.base_price), // Backend expects 'price' instead of 'base_price'
          sale_price: dataToSend.sale_price ? parseFloat(dataToSend.sale_price) : null,
          stock: parseInt(dataToSend.stock_quantity, 10), // Backend expects 'stock' instead of 'stock_quantity'
          sku: dataToSend.sku,
          category_id: parseInt(dataToSend.category_id, 10),
          is_active: dataToSend.is_active === undefined ? true : dataToSend.is_active,
          is_featured: dataToSend.is_featured || false,
          is_new_arrival: dataToSend.is_new_arrival || false,
          is_hot_deal: dataToSend.is_hot_deal || false,
          image_url: dataToSend.image_url || null,
          brand: dataToSend.brand || null,
          barcode: dataToSend.barcode || null,
          short_description: dataToSend.short_description || '',
          is_best_seller: dataToSend.is_best_seller || false,
          is_expiring_soon: dataToSend.is_expiring_soon || false,
          is_clearance: dataToSend.is_clearance || false,
          is_recommended: dataToSend.is_recommended || false,
          expiry_date: dataToSend.expiry_date || null,
          meta_data: dataToSend.meta_data || null,
          weight: dataToSend.weight || null,
        };
        
        // Add debugging for image URL
        console.log('Image URL in form data:', dataToSend.image_url);
        console.log('Image URL in mapped data:', createProductData.image_url);
        
        console.log('Sending mapped product data to backend:', createProductData);
        
        // Create new product
        try {
          const response = await api.post('/admin/products', createProductData);
          
          if (response.data) {
            console.log('Product created successfully:', response.data);
            alert('Product created successfully');
            handleCloseModal();
            fetchProducts();
            return;
          }
        } catch (createError) {
          console.log('Product creation error:', createError);
          if (createError.response && createError.response.data) {
            console.log('Error response from server:', createError.response.data);
            
            // Check for validation errors
            if (createError.response.data.errors) {
              const validationErrors = createError.response.data.errors;
              console.log('Validation errors:', validationErrors);
              
              const errorMessages = Object.entries(validationErrors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n');
                
              throw new Error(`Validation failed:\n${errorMessages}`);
            }
          }
          throw createError;
        }
      } else {
        // For existing product updates, continue with the current logic
        console.log('Sending product data to backend:', {
          url: `/admin/products/${editingProduct.id}`,
          method: 'PUT',
          data: dataToSend,
          productId: editingProduct.id
        });
      
        // Try with simplified data first to diagnose the issue
        console.log('Attempting simplified update with minimal fields');
        const simplifiedData = {
          name: dataToSend.name,
          description: dataToSend.description,
          base_price: dataToSend.base_price,
          stock_quantity: dataToSend.stock_quantity,
          sku: dataToSend.sku,
          category_id: dataToSend.category_id,
          is_active: dataToSend.is_active,
          is_featured: dataToSend.is_featured || false,
          sale_price: dataToSend.sale_price || null,
          weight: dataToSend.weight || null,
          brand: dataToSend.brand || '',
          barcode: dataToSend.barcode || '',
          short_description: dataToSend.short_description || '',
          is_new_arrival: dataToSend.is_new_arrival || false,
          is_hot_deal: dataToSend.is_hot_deal || false,
          image_url: dataToSend.image_url || '',
          is_best_seller: dataToSend.is_best_seller || false,
          is_expiring_soon: dataToSend.is_expiring_soon || false,
          is_clearance: dataToSend.is_clearance || false,
          is_recommended: dataToSend.is_recommended || false,
          expiry_date: dataToSend.expiry_date || null,
          meta_data: dataToSend.meta_data || null
        };
        
        console.log('Simplified data:', simplifiedData);
        
        // Try the simplified update
        try {
          const response = await api.put(
            `/admin/products/${editingProduct.id}`,
            simplifiedData
          );
          
          if (response.data) {
            console.log('Simplified update successful:', response.data);
            alert('Product updated successfully with simplified data');
            handleCloseModal();
            fetchProducts();
            return;
          }
        } catch (simplifiedError) {
          console.log('Simplified update failed:', simplifiedError);
          console.log('Trying full update...');
        }
        
        // If simplified update failed, try the full update
        const response = await api.put(
          `/admin/products/${editingProduct.id}`,
          dataToSend
        );

        if (response.data) {
          let success = false;
          let updatedProduct = null;
          
          // Check for product in response
          if (response.data.product) {
            updatedProduct = response.data.product;
            success = true;
          } 
          // Check for success message
          else if (response.data.success || response.data.message) {
            success = true;
            // In this case, we'll update the product in the local state based on our knowledge
            updatedProduct = { ...editingProduct, ...formData };
          }
          
          if (success) {
            // Update the product in the local state
            setProducts(products.map(product => 
              product.id === editingProduct.id ? { 
                ...product, 
                ...updatedProduct
              } : product
            ));
            
            // Show success message
            alert('Product updated successfully');
            
            // Close the modal
            handleCloseModal();
            
            // Log success
            console.log('Product updated successfully');
          } else {
            throw new Error('Failed to update product: Unexpected response format');
          }
        } else {
          throw new Error('Failed to update product: Empty response');
        }
      }
    } catch (error) {
      console.log('Error saving product:', {
        message: error.message,
        error: error,
        response: error.response,
      });
      
      // Show detailed error message for validation errors
      if (error.response && error.response.data && error.response.data.errors) {
        console.log('Validation errors:', error.response.data.errors);
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        alert(`Failed to save product due to validation errors:\n${errorMessages}`);
      } else {
        // Show general error message
        alert(`Failed to save product: ${error.message}`);
      }
      
      // If there's a response with error details, log them
      if (error.response && error.response.data) {
        console.log('Error response data:', error.response.data);
      }
    }
  };

  const handleImportProducts = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await api.post('/admin/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        setImportResults(response.data.data);
        // Refresh the product list after successful import
        fetchProducts();
      } else {
        throw new Error(response.data.message || 'Failed to import products');
      }
    } catch (err) {
      console.error('Error importing products:', err);
      
      setImportResults({
        error: err.message || 'Failed to import products'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/admin/products/import/template', {
        responseType: 'blob'
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading template:', err);
      alert('Failed to download template: ' + (err.message || 'Unknown error'));
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
          <button
            onClick={() => {
              setEditingProduct({}); // Empty object for new product
              setIsEditModalOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark"
          >
            Add New Product
          </button>

          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Import Products
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Category filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            {/* Stock status filter */}
            <div>
              <label htmlFor="stock_status" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Status
              </label>
              <select
                id="stock_status"
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Stock Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            
            {/* Expiry status filter */}
            <div>
              <label htmlFor="expiry_status" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Status
              </label>
              <select
                id="expiry_status"
                value={expiryStatusFilter}
                onChange={(e) => setExpiryStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option value="">All Expiry Status</option>
                <option value="about_to_expire">About to Expire</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="w-full md:w-64">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value=""
                onChange={(e) => console.log(e.target.value)}
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
                            <button 
                              onClick={() => handleEditClick(product)}
                              className="hover:text-primary"
                            >
                              {product.name}
                            </button>
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
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="text-primary hover:text-primary-dark"
                        >
                          Edit
                        </button>
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
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                  currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
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
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
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
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Product</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <ProductEditForm 
              product={editingProduct} 
              categories={categories}
              onSave={handleSaveProduct}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Import Products</h3>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setImportResults(null);
                  setImportFile(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {!importResults ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Upload a CSV file with product data. You can download a template to see the required format.
                  </p>
                  <label htmlFor="importFile" className="block text-sm font-medium text-gray-700">Select a CSV file to import</label>
                  <input
                    type="file"
                    name="importFile"
                    id="importFile"
                    accept=".csv,.txt"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                
                <div className="flex justify-between space-x-3">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Download Template
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                      }}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleImportProducts}
                      disabled={isImporting || !importFile}
                      className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                        isImporting || !importFile 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-primary hover:bg-primary-dark'
                      }`}
                    >
                      {isImporting ? 'Importing...' : 'Import'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {importResults.error ? (
                  <div className="mb-4 p-4 bg-red-50 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Import failed</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{importResults.error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="p-4 bg-green-50 rounded-md mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Import successful</h3>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Import Summary:</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-md">
                          <span className="text-xs text-gray-500">New Products</span>
                          <p className="text-lg font-semibold">{importResults.stats?.imported || 0}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <span className="text-xs text-gray-500">Updated Products</span>
                          <p className="text-lg font-semibold">{importResults.stats?.updated || 0}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <span className="text-xs text-gray-500">Skipped Rows</span>
                          <p className="text-lg font-semibold">{importResults.stats?.skipped || 0}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <span className="text-xs text-gray-500">Errors</span>
                          <p className="text-lg font-semibold">{importResults.stats?.failures || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    {importResults.failures && importResults.failures.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Errors:</h4>
                        <div className="max-h-60 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {importResults.failures.map((failure, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{failure.row}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{failure.attribute}</td>
                                  <td className="px-3 py-2 text-xs text-gray-500">{failure.errors.join(', ')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportResults(null);
                      setImportFile(null);
                    }}
                    className="bg-primary py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Product Edit Form Component
const ProductEditForm = ({ product, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    short_description: product.short_description || '',
    base_price: product.base_price || '',
    sale_price: product.sale_price || '',
    sku: product.sku || '',
    barcode: product.barcode || '',
    brand: product.brand || '',
    stock_quantity: product.stock_quantity || 0,
    category_id: product.category_id || '',
    is_featured: product.is_featured || false,
    is_active: product.is_active || true,
    is_new_arrival: product.is_new_arrival || false,
    is_hot_deal: product.is_hot_deal || false,
    is_best_seller: product.is_best_seller || false,
    is_expiring_soon: product.is_expiring_soon || false,
    is_clearance: product.is_clearance || false,
    is_recommended: product.is_recommended || false,
    image_url: product.image_url || '',
    weight: product.weight || '',
    expiry_date: product.expiry_date || '',
    meta_data: product.meta_data || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
          <select
            name="category_id"
            id="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="base_price" className="block text-sm font-medium text-gray-700">Base Price <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="base_price"
            id="base_price"
            value={formData.base_price}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700">Sale Price</label>
          <input
            type="number"
            name="sale_price"
            id="sale_price"
            value={formData.sale_price}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="sku"
            id="sku"
            value={formData.sku}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">Barcode</label>
          <input
            type="text"
            name="barcode"
            id="barcode"
            value={formData.barcode}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            name="brand"
            id="brand"
            value={formData.brand}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">Stock Quantity <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="stock_quantity"
            id="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="text"
            name="image_url"
            id="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight</label>
          <input
            type="text"
            name="weight"
            id="weight"
            value={formData.weight}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">Expiry Date</label>
          <input
            type="date"
            name="expiry_date"
            id="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="meta_data" className="block text-sm font-medium text-gray-700">Meta Data</label>
          <textarea
            name="meta_data"
            id="meta_data"
            rows="2"
            value={formData.meta_data}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          ></textarea>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          id="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">Short Description</label>
        <textarea
          name="short_description"
          id="short_description"
          rows="2"
          value={formData.short_description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        ></textarea>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_featured"
            id="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">Featured</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_active"
            id="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">Active</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_new_arrival"
            id="is_new_arrival"
            checked={formData.is_new_arrival}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="is_new_arrival" className="ml-2 block text-sm text-gray-700">New Arrival</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_hot_deal"
            id="is_hot_deal"
            checked={formData.is_hot_deal}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="is_hot_deal" className="ml-2 block text-sm text-gray-700">Hot Deal</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_best_seller"
            id="is_best_seller"
            checked={formData.is_best_seller}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="is_best_seller" className="ml-2 block text-sm text-gray-700">Best Seller</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_expiring_soon"
            id="is_expiring_soon"
            checked={formData.is_expiring_soon}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="is_expiring_soon" className="ml-2 block text-sm text-gray-700">Expiring Soon</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_clearance"
            id="is_clearance"
            checked={formData.is_clearance}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="is_clearance" className="ml-2 block text-sm text-gray-700">Clearance</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_recommended"
            id="is_recommended"
            checked={formData.is_recommended}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="is_recommended" className="ml-2 block text-sm text-gray-700">Recommended</label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-primary py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default Products;
