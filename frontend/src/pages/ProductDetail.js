import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import ProductService from '../services/product.service';
import Button from '../components/ui/Button';
import { formatNaira } from '../utils/formatters';
import ProductCard from '../components/product/ProductCard';
import styled from 'styled-components';

// Styled component for related products section
const RelatedProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.25rem;
  }
  
  /* Custom styling for product cards in related products section */
  > div {
    transform: scale(0.85);
    transform-origin: top center;
    margin-bottom: -1.5rem;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
  }
  
  /* Adjust image height in related products */
  div[class*="ImageContainer"] {
    height: 120px !important;
    
    @media (max-width: 640px) {
      height: 100px !important;
    }
  }
  
  /* Make product name smaller */
  h3[class*="ProductName"] {
    font-size: 13px !important;
    height: 34px !important;
    
    @media (max-width: 768px) {
      font-size: 12px !important;
      height: 32px !important;
    }
  }
  
  /* Make price text smaller */
  div[class*="PriceContainer"] span {
    font-size: 0.9em !important;
  }
  
  /* Make add to cart button smaller */
  button[class*="AddToCartButton"] {
    transform: scale(0.9);
    right: 8px !important;
    bottom: 8px !important;
  }
`;

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart, loading: cartLoading } = useCart();
  const { showSuccess, showError } = useNotification();
  const location = useLocation();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const timeoutRef = useRef(null);
  
  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be an API call
        let realProduct = null;
        
        try {
          console.log('Attempting to fetch product with slug:', slug);
          const response = await ProductService.getProduct(slug);
          if (response && response.product) {
            realProduct = {
              ...response.product,
              // Map any fields that might have different names
              images: response.product.images || 
                     (response.product.image_url ? [response.product.image_url] : []),
              // Add default ratings if not provided by API
              ratings: response.product.ratings || {
                average: 0,
                count: 0,
                distribution: []
              },
              // Add default empty array for features
              features: response.product.features || []
            };
            console.log('Successfully fetched real product:', realProduct);
            setProduct(realProduct);
            
            // Try to fetch related products if available
            if (realProduct.category_id) {
              try {
                const relatedResponse = await ProductService.getCategoryProducts(
                  realProduct.category_id, 
                  { limit: 4, exclude: realProduct.id }
                );
                if (relatedResponse && relatedResponse.products && relatedResponse.products.length > 0) {
                  setRelatedProducts(relatedResponse.products);
                  setLoading(false);
                  return; // Exit early if we have all the data we need
                }
              } catch (relatedError) {
                console.log('Failed to fetch related products:', relatedError);
              }
            }
          }
        } catch (apiError) {
          console.log('API call for product failed:', apiError);
        }
        
        // If we reach here, either the API call failed or we couldn't get related products
        // Fall back to mock data
        console.log('Falling back to mock data');
        
        // Generate dummy product (only if we don't have a real one)
        if (!realProduct) {
          // Generate dummy product
          const dummyProduct = {
            id: 1,
            name: 'Premium Wireless Headphones',
            slug: 'premium-wireless-headphones',
            description: 'Experience crystal-clear sound with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and comfortable over-ear design.',
            features: [
              'Active Noise Cancellation',
              'Bluetooth 5.0 connectivity',
              '30-hour battery life',
              'Comfortable memory foam ear cushions',
              'Built-in microphone for calls',
              'Quick charge (10 min charge = 5 hours playback)'
            ],
            specifications: {
              'Brand': 'M-Audio',
              'Model': 'WH-2000',
              'Color': 'Matte Black',
              'Connectivity': 'Bluetooth 5.0, 3.5mm audio jack',
              'Battery Life': '30 hours',
              'Charging Time': '2 hours',
              'Weight': '280g',
              'Warranty': '1 year'
            },
            base_price: 45000,
            sale_price: 39999,
            discount_percentage: 11,
            stock_quantity: 15,
            images: [
              'https://via.placeholder.com/600x600?text=Headphones+Main',
              'https://via.placeholder.com/600x600?text=Headphones+Side',
              'https://via.placeholder.com/600x600?text=Headphones+Back',
              'https://via.placeholder.com/600x600?text=Headphones+Case'
            ],
            category_id: 2,
            category_slug: 'electronics',
            category_name: 'Electronics',
            ratings: {
              average: 4.5,
              count: 128,
              distribution: [
                { rating: 5, percentage: 70 },
                { rating: 4, percentage: 20 },
                { rating: 3, percentage: 5 },
                { rating: 2, percentage: 3 },
                { rating: 1, percentage: 2 }
              ]
            },
            reviews: [
              {
                id: 1,
                user_name: 'John D.',
                rating: 5,
                date: '2023-10-15',
                title: 'Best headphones I\'ve ever owned',
                comment: 'The sound quality is amazing and the battery life is impressive. Highly recommend!'
              },
              {
                id: 2,
                user_name: 'Sarah M.',
                rating: 4,
                date: '2023-09-28',
                title: 'Great value for money',
                comment: 'Very comfortable and the noise cancellation works well. Only giving 4 stars because the app is a bit buggy.'
              },
              {
                id: 3,
                user_name: 'Michael T.',
                rating: 5,
                date: '2023-09-10',
                title: 'Perfect for work calls',
                comment: 'I use these for work calls all day and they\'re comfortable for long periods. The microphone quality is excellent.'
              }
            ]
          };
          
          setProduct(dummyProduct);
        }
        
        // Generate dummy related products
        const dummyRelatedProducts = Array(4).fill().map((_, index) => ({
          id: index + 2,
          name: `Related Product ${index + 1}`,
          slug: `related-product-${index + 1}`,
          description: `This is a description for related product ${index + 1}.`,
            base_price: Math.floor(Math.random() * 50000) + 10000,
            sale_price: Math.random() > 0.5 ? Math.floor(Math.random() * 40000) + 10000 : null,
            image: `https://via.placeholder.com/300x300?text=Related${index + 1}`,
            stock_quantity: Math.floor(Math.random() * 50),
            category_id: 2
          }));
          
          setRelatedProducts(dummyRelatedProducts);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching product details:', err);
          setError(err);
          setLoading(false);
        }
      };
    
    fetchProductDetails();
  }, [slug]);
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= (product?.stock_quantity || 10)) {
      setQuantity(value);
    }
  };
  
  // Increment quantity
  const incrementQuantity = () => {
    if (quantity < (product?.stock_quantity || 10)) {
      setQuantity(quantity + 1);
    }
  };
  
  // Decrement quantity
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Handle add to cart with background syncing
  const handleAddToCart = () => {
    if (!product) {
      return;
    }
    
    // Client-side validation
    if (product.stock_quantity <= 0 || product.is_in_stock === false) {
      showError('Sorry, this product is out of stock');
      return;
    }
    
    // Prevent multiple clicks
    if (addingToCart) {
      return;
    }
    
    // Set adding to cart state
    setAddingToCart(true);
    
    // Show success notification immediately
    showSuccess(`${product.name} added to cart!`);
    
    // The addToCart function now handles the delay internally
    // We just need to handle success/failure here
    addToCart(product, quantity)
      .then(() => {
        console.log('Product successfully added to cart');
      })
      .catch((error) => {
        console.error('Error adding to cart:', error);
        showError(error.response?.data?.message || error.message || 'Failed to add to cart');
      })
      .finally(() => {
        // Reset state after a delay for better UX
        // This is independent of the API call timing
        timeoutRef.current = setTimeout(() => {
          setAddingToCart(false);
        }, 1000);
      });
  };
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="bg-gray-300 rounded-lg h-96 w-full"></div>
              <div className="flex mt-4 gap-2">
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="bg-gray-300 rounded-lg h-20 w-20"></div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-6"></div>
              <div className="h-10 bg-gray-300 rounded w-1/3 mb-6"></div>
              <div className="h-12 bg-gray-300 rounded w-full mb-4"></div>
              <div className="h-12 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          <p>Error loading product details. Please try again later.</p>
        </div>
        <Link to="/products" className="text-primary hover:text-primary-dark">
          ← Back to Products
        </Link>
      </div>
    );
  }
  
  // Render product not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link 
            to="/products"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-md transition duration-300"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary">Home</Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link to="/categories" className="text-gray-500 hover:text-primary">Categories</Link>
          {product.category_slug && (
            <>
              <span className="mx-2 text-gray-500">/</span>
              <Link to={`/categories/${product.category_slug}`} className="text-gray-500 hover:text-primary">
                {product.category_name}
              </Link>
            </>
          )}
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
        
        {/* Product details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Product images */}
            <div className="md:w-1/2 p-6">
              <div className="mb-4">
                <img 
                  src={product.images[activeImage]} 
                  alt={product.name} 
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`border-2 rounded-md overflow-hidden flex-shrink-0 ${
                      activeImage === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} thumbnail ${index + 1}`} 
                      className="w-16 h-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Product info */}
            <div className="md:w-1/2 p-6 border-t md:border-t-0 md:border-l border-gray-200">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              {/* Ratings */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(product.ratings?.average || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600 ml-2">
                  {product.ratings?.average} ({product.ratings?.count})
                </span>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                {product.sale_price ? (
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-primary">
                      {formatNaira(product.sale_price)}
                    </span>
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      {formatNaira(product.base_price)}
                    </span>
                    <span className="ml-2 bg-red-100 text-red-700 px-2 py-1 rounded-md text-sm font-medium">
                      {product.discount_percentage}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {formatNaira(product.base_price)}
                  </span>
                )}
              </div>
              
              {/* Stock status */}
              <div className="mb-6">
              {product.stock_quantity > 0 ? (
                  <span className={`font-medium ${product.stock_quantity <= 10 ? "text-orange-600" : "text-green-600"}`}>
                    {product.stock_quantity <= 10 
                      ? `Low Stock (Only ${product.stock_quantity} left)` 
                      : "In Stock"}
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
              
              {/* Short description */}
              <p className="text-gray-700 mb-6">{product.description}</p>
              
              {/* Quantity selector */}
              {product.stock_quantity > 0 && (
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-gray-700 font-medium mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={decrementQuantity}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-l-md"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={product.stock_quantity}
                      className="w-16 text-center py-2 border-t border-b border-gray-300 focus:outline-none focus:ring-0"
                    />
                    <button
                      onClick={incrementQuantity}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-r-md"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              {/* Add to cart button */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button
                  variant="primary"
                  fullWidth
                  disabled={product.stock_quantity === 0 || addingToCart}
                  onClick={handleAddToCart}
                  className={addingToCart ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  {product.stock_quantity === 0 
                    ? 'Out of Stock' 
                    : addingToCart 
                      ? 'Added to Cart!' 
                      : 'Add to Cart'}
                </Button>
                
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={product.stock_quantity === 0}
                  onClick={() => {
                    handleAddToCart();
                    // In a real app, this would navigate to the checkout page
                  }}
                >
                  Buy Now
                </Button>
              </div>
              
              {/* Delivery info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-start mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <div>
                    <p className="font-medium">Express delivery within Lekki, Lagos</p>
                    <p className="text-gray-500 text-sm">Under 30 minutes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Return policy</p>
                    <p className="text-gray-500 text-sm">Returns only for damaged goods upon delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product tabs */}
          <div className="border-t border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'description'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Description
              </button>
              {/*
              <button
                onClick={() => setActiveTab('specifications')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'specifications'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Specifications
              </button>
              
               Reviews tab 
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews ({product.ratings?.count})
              </button>
              */}
            </div>
            
            <div className="p-6">
              {/* Description tab */}
              {activeTab === 'description' && (
                <div>
                  <p className="text-gray-700 mb-4">{product.description}</p>
                  <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                  <ul className="list-disc pl-5 mb-4">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-gray-700 mb-1">{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Specifications tab */}
              {activeTab === 'specifications' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 bg-gray-50 w-1/3">{key}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Reviews tab */}
              {activeTab === 'reviews' && (
                <div>
                  {/* Rating summary */}
                  <div className="flex flex-col md:flex-row gap-8 mb-8">
                    <div className="md:w-1/3 flex flex-col items-center justify-center">
                      <div className="text-5xl font-bold text-gray-900 mb-2">{product.ratings?.average}</div>
                      <div className="flex mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(product.ratings?.average || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="text-gray-500 text-sm">Based on {product.ratings?.count} reviews</div>
                    </div>
                    
                    <div className="md:w-2/3">
                      {product.ratings?.distribution.map((item) => (
                        <div key={item.rating} className="flex items-center mb-2">
                          <div className="w-12 text-sm text-gray-600">{item.rating} star</div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                            <div
                              className="bg-yellow-400 h-2.5 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <div className="w-12 text-sm text-gray-600 text-right">{item.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Review list */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                    
                    {product.reviews.length === 0 ? (
                      <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    ) : (
                      <div className="space-y-6">
                        {product.reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-6">
                            <div className="flex items-center mb-2">
                              <div className="flex mr-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <h4 className="font-medium text-gray-900">{review.title}</h4>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <span>{review.user_name}</span>
                              <span className="mx-1">•</span>
                              <span>{review.date}</span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Write a review button */}
                    <div className="mt-6">
                      <Button variant="outline">Write a Review</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <RelatedProductsGrid>
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </RelatedProductsGrid>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
