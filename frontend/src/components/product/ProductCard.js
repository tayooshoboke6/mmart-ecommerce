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
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
        <Link to={`/products/${product.slug}`} className="block">
          {/* Product image */}
          <div className="relative h-48 overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{discountPercentage}%
              </div>
            )}
            {product.stock_quantity <= 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Out of Stock</span>
              </div>
            )}
          </div>
          
          {/* Product details */}
          <div className="p-4">
            <h3 className="text-gray-700 font-medium text-lg mb-2 line-clamp-2">{product.name}</h3>
            
            <div className="flex items-center justify-between">
              <div>
                {hasDiscount ? (
                  <div className="flex items-center">
                    <span className="text-primary font-bold">{formatNaira(product.sale_price)}</span>
                    <span className="text-gray-500 text-sm line-through ml-2">{formatNaira(product.base_price)}</span>
                  </div>
                ) : (
                  <span className="text-primary font-bold">{formatNaira(product.base_price)}</span>
                )}
              </div>
              
              {product.stock_quantity > 0 && (
                <button
                  onClick={handleAddToCart}
                  disabled={loading}
                  className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }
  
  // List view
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="flex">
          {/* Product image */}
          <div className="relative w-1/3 h-32 overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{discountPercentage}%
              </div>
            )}
          </div>
          
          {/* Product details */}
          <div className="w-2/3 p-4">
            <h3 className="text-gray-700 font-medium text-lg mb-2">{product.name}</h3>
            
            <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <div>
                {hasDiscount ? (
                  <div className="flex items-center">
                    <span className="text-primary font-bold">{formatNaira(product.sale_price)}</span>
                    <span className="text-gray-500 text-sm line-through ml-2">{formatNaira(product.base_price)}</span>
                  </div>
                ) : (
                  <span className="text-primary font-bold">{formatNaira(product.base_price)}</span>
                )}
              </div>
              
              {product.stock_quantity > 0 ? (
                <button
                  onClick={handleAddToCart}
                  disabled={loading}
                  className="px-3 py-1 rounded bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Add to Cart
                </button>
              ) : (
                <span className="text-red-500 text-sm font-medium">Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
