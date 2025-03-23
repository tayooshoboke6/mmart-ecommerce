import React from 'react';
import { Link } from 'react-router-dom';
import { formatNaira } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

/**
 * Product card component for displaying product in grid or list view
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {string} props.viewType - View type (grid or list)
 */
const ProductCard = ({ product, viewType = 'grid' }) => {
  const { addToCart, loading } = useCart();
  
  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  // Check if product has a discount
  const hasDiscount = product.sale_price && product.sale_price < product.base_price;
  
  // Calculate discount percentage
  const discountPercentage = hasDiscount
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;
  
  if (viewType === 'grid') {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md">
        <Link to={`/products/${product.slug}`} className="block">
          {/* Product image */}
          <div className="relative h-36 overflow-hidden">
            <img 
              src={product.image_url || product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {product.is_featured && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                Featured
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                <div 
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '-18px',
                    transform: 'rotate(45deg)',
                    width: '80px',
                    textAlign: 'center',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    padding: '1px 0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  DEALS
                </div>
              </div>
            )}
            {product.stock_quantity <= 0 && (
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 text-red-600 font-bold px-4 py-1 rounded-sm rotate-[-15deg] text-sm">
                  Out of Stock
                </div>
              </div>
            )}
          </div>
          
          {/* Product info */}
          <div className="p-2">
            {/* Vendor/Brand */}
            {product.brand && (
              <p className="text-orange-500 text-xs mb-1">{product.brand}</p>
            )}
            
            {/* Product name */}
            <h3 className="text-gray-800 font-medium mb-1 line-clamp-1 text-sm min-h-[20px]">
              {product.name}
            </h3>
            
            {/* Ratings - simplified */}
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292z" />
                </svg>
                <span className="text-xs ml-1 text-gray-600">(0 reviews)</span>
              </div>
            </div>
            
            {/* Price */}
            <div className="mb-2">
              {hasDiscount ? (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">
                    {formatNaira(product.sale_price)}
                  </span>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 line-through mr-1">
                      {formatNaira(product.base_price)}
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      -{discountPercentage}%
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-sm font-bold text-gray-800">
                  {formatNaira(product.base_price)}
                </span>
              )}
            </div>
          </div>
        </Link>
        
        {/* Add to cart button */}
        <div className="px-2 pb-2">
          {product.stock_quantity > 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className={`w-full py-1 text-xs rounded-md transition-colors ${
                loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Adding...' : 'Add to Cart'}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-1 text-xs bg-gray-200 text-gray-500 rounded-md cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // List view
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md">
      <div className="flex flex-col md:flex-row">
        {/* Product image */}
        <div className="relative w-full md:w-1/3 h-48 md:h-40 overflow-hidden">
          <Link to={`/products/${product.slug}`} className="block h-full">
            <img 
              src={product.image_url || product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </Link>
          {product.is_featured && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
              <div 
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '-18px',
                  transform: 'rotate(45deg)',
                  width: '80px',
                  textAlign: 'center',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  padding: '1px 0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                DEALS
              </div>
            </div>
          )}
          {product.stock_quantity <= 0 && (
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 text-red-600 font-bold px-4 py-1 rounded-sm rotate-[-15deg] text-sm">
                Out of Stock
              </div>
            </div>
          )}
        </div>
        
        {/* Product details */}
        <div className="w-full md:w-2/3 p-4 flex flex-col justify-between">
          <div>
            {/* Vendor/Brand */}
            {product.brand && (
              <p className="text-orange-500 text-xs mb-1">{product.brand}</p>
            )}
            
            <Link to={`/products/${product.slug}`} className="block">
              <h3 className="text-gray-800 font-medium text-lg mb-2 line-clamp-2">{product.name}</h3>
            </Link>
            
            {/* Description */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
            
            {/* Ratings */}
            <div className="flex items-center mb-3">
              <div className="flex text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 ml-1">(0 reviews)</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            {/* Price */}
            <div className="flex items-center">
              <span className="text-blue-600 font-bold text-lg">
                {formatNaira(product.sale_price || product.base_price)}
              </span>
              {hasDiscount && (
                <span className="text-gray-400 line-through text-sm ml-2">
                  {formatNaira(product.base_price)}
                </span>
              )}
            </div>
            
            {/* Add to cart button */}
            {product.stock_quantity > 0 ? (
              <button
                onClick={handleAddToCart}
                disabled={loading}
                className={`px-4 py-2 rounded-md transition-colors ${
                  loading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Adding...' : 'Add to Cart'}
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
