import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import ProductService from '../services/ProductService';
import { formatNaira } from '../utils/formatters';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useCart } from '../context/CartContext';
import { getCachedData, prefetchData } from '../utils/prefetch';
import SkeletonLoader from '../components/common/SkeletonLoader';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  
  // Track which products have been added to cart for button state
  const [addedProducts, setAddedProducts] = useState({});
  const [errorProducts, setErrorProducts] = useState({});
  const [errorMessages, setErrorMessages] = useState({});

  // Function to validate product data before displaying
  const validateProduct = (product) => {
    if (!product || typeof product !== 'object') return false;
    if (!product.id || !product.name) return false;
    
    // Ensure required properties exist
    const requiredProps = ['slug', 'base_price'];
    for (const prop of requiredProps) {
      if (product[prop] === undefined) return false;
    }
    
    // Validate prices are numeric
    if (isNaN(parseFloat(product.base_price))) return false;
    if (product.sale_price && isNaN(parseFloat(product.sale_price))) return false;
    
    // Ensure image_url is a string if it exists
    if (product.image_url && typeof product.image_url !== 'string') return false;
    
    return true;
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Direct API calls for debugging
        console.log('Directly calling APIs for debugging...');
        
        // Featured products
        const featuredResponse = await ProductService.getFeaturedProducts();
        console.log('Featured API direct response:', featuredResponse);
        
        // New arrivals
        const newArrivalsResponse = await ProductService.getNewArrivals();
        console.log('New Arrivals API direct response:', newArrivalsResponse);
        
        // Best sellers
        const bestSellersResponse = await ProductService.getBestSellers();
        console.log('Best Sellers API direct response:', bestSellersResponse);
        
        // Hot deals
        const hotDealsResponse = await ProductService.getHotDeals();
        console.log('Hot Deals API direct response:', hotDealsResponse);
        
        // Categories
        const categoriesResponse = await ProductService.getCategories();
        console.log('Categories API direct response:', categoriesResponse);
        
        // If we don't have cached data, fetch directly
        let featuredData = [];
        let newArrivalsData = [];
        let bestSellersData = [];
        let hotDealsData = [];
        let categoriesData = [];
        
        try {
          // Use cached data with fallback to API
          featuredData = await getCachedData('/products/by-type/featured');
          if (!Array.isArray(featuredData)) {
            featuredData = [];
          }
        } catch (error) {
          console.error('Error fetching featured products from cache:', error);
          
          // If cache fails, fetch directly
          try {
            const response = await ProductService.getFeaturedProducts();
            console.log('Featured API Response:', response);
            featuredData = response.data && response.data.products ? response.data.products : [];
          } catch (apiError) {
            console.error('API call for featured products failed:', apiError);
            featuredData = [];
          }
        }
        
        try {
          // Use cached data with fallback to API
          newArrivalsData = await getCachedData('/products/by-type/new_arrivals');
          if (!Array.isArray(newArrivalsData)) {
            newArrivalsData = [];
          }
        } catch (error) {
          console.error('Error fetching new arrivals from cache:', error);
          
          // If cache fails, fetch directly
          try {
            const response = await ProductService.getNewArrivals();
            console.log('New Arrivals API Response:', response);
            newArrivalsData = response.data && response.data.products ? response.data.products : [];
          } catch (apiError) {
            console.error('API call for new arrivals failed:', apiError);
            newArrivalsData = [];
          }
        }
        
        try {
          // Use cached data with fallback to API
          bestSellersData = await getCachedData('/products/by-type/best_sellers');
          if (!Array.isArray(bestSellersData)) {
            bestSellersData = [];
          }
        } catch (error) {
          console.error('Error fetching best sellers from cache:', error);
          
          // If cache fails, fetch directly
          try {
            const response = await ProductService.getBestSellers();
            console.log('Best Sellers API Response:', response);
            bestSellersData = response.data && response.data.products ? response.data.products : [];
          } catch (apiError) {
            console.error('API call for best sellers failed:', apiError);
            bestSellersData = [];
          }
        }
        
        try {
          // Use cached data with fallback to API
          hotDealsData = await getCachedData('/products/by-type/hot_deals');
          if (!Array.isArray(hotDealsData)) {
            hotDealsData = [];
          }
        } catch (error) {
          console.error('Error fetching hot deals from cache:', error);
          
          // If cache fails, fetch directly
          try {
            const response = await ProductService.getHotDeals();
            console.log('Hot Deals API Response:', response);
            hotDealsData = response.data && response.data.products ? response.data.products : [];
          } catch (apiError) {
            console.error('API call for hot deals failed:', apiError);
            hotDealsData = [];
          }
        }
        
        // Fetch categories from API
        try {
          // Use cached data with fallback to API
          categoriesData = await getCachedData('/categories');
          if (!Array.isArray(categoriesData)) {
            categoriesData = [];
          }
        } catch (error) {
          console.error('Error fetching categories from cache:', error);
          
          // If cache fails, fetch directly
          try {
            const response = await ProductService.getCategories();
            console.log('Categories API Response:', response);
            categoriesData = response.data && response.data.categories ? response.data.categories : [];
          } catch (apiError) {
            console.error('API call for categories failed:', apiError);
            categoriesData = [];
          }
        }
        
        // Filter out invalid products
        console.log('Before filtering - Featured:', featuredData);
        console.log('Before filtering - New Arrivals:', newArrivalsData);
        console.log('Before filtering - Best Sellers:', bestSellersData);
        console.log('Before filtering - Hot Deals:', hotDealsData);
        console.log('Before filtering - Categories:', categoriesData);
        
        setFeaturedProducts(featuredData.filter(validateProduct));
        setNewArrivals(newArrivalsData.filter(validateProduct));
        setBestSellers(bestSellersData.filter(validateProduct));
        setHotDeals(hotDealsData.filter(validateProduct));
        setCategories(categoriesData);
        
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);
  
  // Function to handle adding product to cart with visual feedback
  const handleAddToCart = async (product, quantity) => {
    try {
      // Client-side validation before making API call
      if (!product || !product.id) {
        throw new Error('Invalid product');
      }

      // Validate product is in stock
      if (product.stock_quantity <= 0 || product.is_in_stock === false) {
        throw new Error('Product is out of stock');
      }

      // Validate quantity
      if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
        quantity = 1; // Default to 1 if invalid quantity
      }

      // Validate maximum quantity (don't allow adding more than available stock)
      if (quantity > product.stock_quantity) {
        throw new Error(`Only ${product.stock_quantity} items available`);
      }

      // Clear any previous error state for this product
      if (errorProducts[product.id]) {
        setErrorProducts(prev => ({
          ...prev,
          [product.id]: false
        }));
        setErrorMessages(prev => ({
          ...prev,
          [product.id]: ''
        }));
      }
      
      await addToCart(product, quantity);
      
      // Set added state for visual feedback
      setAddedProducts(prev => ({
        ...prev,
        [product.id]: true
      }));
      
      // Reset after 1.5 seconds
      setTimeout(() => {
        setAddedProducts(prev => ({
          ...prev,
          [product.id]: false
        }));
      }, 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Extract error message
      const message = error.message || 'Error adding to cart';
      
      // Set error state for visual feedback
      setErrorProducts(prev => ({
        ...prev,
        [product.id]: true
      }));
      
      // Store the error message
      setErrorMessages(prev => ({
        ...prev,
        [product.id]: message
      }));
      
      // Reset after 2 seconds
      setTimeout(() => {
        setErrorProducts(prev => ({
          ...prev,
          [product.id]: false
        }));
      }, 2000);
    }
  };

  // If loading, show skeleton loaders instead of spinner
  if (loading) {
    return (
      <div className="bg-[#F5F5F5] min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Banner Skeleton */}
          <div className="mb-8">
            <SkeletonLoader type="banner" count={1} />
          </div>
          
          {/* Featured Products Skeleton */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
            <div className="relative">
              <div className="flex overflow-x-auto pb-4 space-x-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="min-w-[200px] w-[200px] flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
                      <div className="h-40 bg-gray-200 rounded-md mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-7 bg-gray-200 rounded-full w-7"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* New Arrivals Skeleton */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">New Arrivals</h2>
            <div className="relative">
              <div className="flex overflow-x-auto pb-4 space-x-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="min-w-[200px] w-[200px] flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
                      <div className="h-40 bg-gray-200 rounded-md mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-7 bg-gray-200 rounded-full w-7"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Categories Skeleton */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Shop by Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                  <div className="h-32 bg-gray-200 mb-2"></div>
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hot Deals Skeleton */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Hot Deals</h2>
            <div className="relative">
              <div className="flex overflow-x-auto pb-4 space-x-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="min-w-[200px] w-[200px] flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
                      <div className="h-40 bg-gray-200 rounded-md mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-7 bg-gray-200 rounded-full w-7"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Best Sellers Skeleton */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Best Sellers</h2>
            <div className="relative">
              <div className="flex overflow-x-auto pb-4 space-x-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="min-w-[200px] w-[200px] flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
                      <div className="h-40 bg-gray-200 rounded-md mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-7 bg-gray-200 rounded-full w-7"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading content. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Render the new design layout
  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      {/* Hero Banner Slider */}
      <div className="bg-gray-50 py-5">
        <div className="container mx-auto px-4">
          <div className="max-w-[85%] sm:max-w-[75%] mx-auto">
            <Slider
              dots={true}
              infinite={true}
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
              autoplay={true}
              autoplaySpeed={5000}
              className="hero-slider"
              dotsClass="slick-dots custom-dots"
            >
              {/* Slide 1 - Fresh Groceries */}
              <div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-[240px] sm:h-[320px] md:h-[360px] hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-row md:flex-row h-full">
                    {/* Left content */}
                    <div className="w-1/2 md:w-1/2 p-2.5 md:p-5 lg:p-7 overflow-y-auto">
                      <div className="inline-block bg-yellow-400 px-1.5 py-0.5 md:px-3 md:py-1 rounded-full mb-1.5 md:mb-3 text-[11px] md:text-sm">
                        <span className="font-medium">FRESH PICKS</span>
                      </div>
                      
                      <h1 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1.5 md:mb-3 line-clamp-2 md:line-clamp-none">
                        Fresh Groceries
                        <span className="hidden md:inline"><br />Delivered Daily</span>
                      </h1>
                      
                      <p className="text-[11px] md:text-sm lg:text-base text-gray-600 mb-1.5 md:mb-5 line-clamp-2 md:line-clamp-none">
                        Shop our wide selection of fresh produce and essentials.
                      </p>
                      
                      <button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium py-1.5 px-2.5 md:py-2.5 md:px-5 rounded-md transition duration-300 w-full md:w-auto text-[11px] md:text-base relative overflow-hidden group">
                        <span className="relative z-10">Shop Now</span>
                        <div className="absolute inset-0 h-full w-0 bg-[#2563EB] transition-all duration-300 group-hover:w-full"></div>
                      </button>
                    </div>
                    
                    {/* Right image */}
                    <div className="w-1/2 md:w-1/2 relative h-full">
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 z-10">
                        <div className="bg-yellow-400 text-gray-800 font-medium text-[11px] md:text-sm px-1 py-0.5 md:px-2.5 md:py-1 rounded-md">
                          Up to 30% Off
                        </div>
                      </div>
                      <img 
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                        alt="Fresh Groceries" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2 - Electronics */}
              <div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-[240px] sm:h-[320px] md:h-[360px] hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-row md:flex-row h-full">
                    {/* Left content */}
                    <div className="w-1/2 md:w-1/2 p-2.5 md:p-5 lg:p-7 overflow-y-auto">
                      <div className="inline-block bg-blue-500 px-1.5 py-0.5 md:px-3 md:py-1 rounded-full mb-1.5 md:mb-3 text-[11px] md:text-sm text-white">
                        <span className="font-medium">TECH DEALS</span>
                      </div>
                      
                      <h1 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1.5 md:mb-3 line-clamp-2 md:line-clamp-none">
                        Latest Electronics
                        <span className="hidden md:inline"><br />At Best Prices</span>
                      </h1>
                      
                      <p className="text-[11px] md:text-sm lg:text-base text-gray-600 mb-1.5 md:mb-5 line-clamp-2 md:line-clamp-none">
                        Discover cutting-edge smartphones and gadgets.
                      </p>
                      
                      <button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium py-1.5 px-2.5 md:py-2.5 md:px-5 rounded-md transition duration-300 w-full md:w-auto text-[11px] md:text-base relative overflow-hidden group">
                        <span className="relative z-10">Shop Now</span>
                        <div className="absolute inset-0 h-full w-0 bg-[#2563EB] transition-all duration-300 group-hover:w-full"></div>
                      </button>
                    </div>
                    
                    {/* Right image */}
                    <div className="w-1/2 md:w-1/2 relative h-full">
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 z-10">
                        <div className="bg-blue-500 text-white font-medium text-[11px] md:text-sm px-1 py-0.5 md:px-2.5 md:py-1 rounded-md">
                          Up to 40% Off
                        </div>
                      </div>
                      <img 
                        src="https://images.unsplash.com/photo-1593642632823-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80" 
                        alt="Latest Electronics" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3 - Fashion */}
              <div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden h-[240px] sm:h-[320px] md:h-[360px] hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-row md:flex-row h-full">
                    {/* Left content */}
                    <div className="w-1/2 md:w-1/2 p-2.5 md:p-5 lg:p-7 overflow-y-auto">
                      <div className="inline-block bg-purple-500 px-1.5 py-0.5 md:px-3 md:py-1 rounded-full mb-1.5 md:mb-3 text-[11px] md:text-sm text-white">
                        <span className="font-medium">STYLE SPOTLIGHT</span>
                      </div>
                      
                      <h1 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1.5 md:mb-3 line-clamp-2 md:line-clamp-none">
                        Trendy Fashion
                        <span className="hidden md:inline"><br />For Every Occasion</span>
                      </h1>
                      
                      <p className="text-[11px] md:text-sm lg:text-base text-gray-600 mb-1.5 md:mb-5 line-clamp-2 md:line-clamp-none">
                        Explore our collection of stylish clothing and accessories.
                      </p>
                      
                      <button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium py-1.5 px-2.5 md:py-2.5 md:px-5 rounded-md transition duration-300 w-full md:w-auto text-[11px] md:text-base relative overflow-hidden group">
                        <span className="relative z-10">Shop Now</span>
                        <div className="absolute inset-0 h-full w-0 bg-[#2563EB] transition-all duration-300 group-hover:w-full"></div>
                      </button>
                    </div>
                    
                    {/* Right image */}
                    <div className="w-1/2 md:w-1/2 relative h-full">
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 z-10">
                        <div className="bg-purple-500 text-white font-medium text-[11px] md:text-sm px-1 py-0.5 md:px-2.5 md:py-1 rounded-md">
                          New Arrivals
                        </div>
                      </div>
                      <img 
                        src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                        alt="Fashion Collection" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Slider>
          </div>
        </div>
      </div>

      {/* Shop by Category Section */}
      <div className="bg-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-[#3B82F6] mr-2"></div>
              <h2 className="text-xl font-bold text-[#2E2E2E] relative">
                Shop by Category
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#3B82F6] transition-all duration-300 group-hover:w-full"></span>
              </h2>
            </div>
            <Link to="/categories" className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium">
              View All Categories &rarr;
            </Link>
          </div>
          
          <div className="mx-auto max-w-[95%]">
            <Slider
              dots={false}
              infinite={false}
              speed={500}
              slidesToShow={7}
              slidesToScroll={2}
              swipeToSlide={true}
              draggable={true}
              responsive={[
                {
                  breakpoint: 1280,
                  settings: {
                    slidesToShow: 6,
                    slidesToScroll: 2,
                  }
                },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 5,
                    slidesToScroll: 2,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 2.25,
                    slidesToScroll: 1,
                    centerMode: false,
                    centerPadding: '10px',
                  }
                }
              ]}
              className="categories-slider"
            >
              {categories.slice(0, 10).map((category) => (
                <div key={category.id} className="px-1 py-4">
                  <Link 
                    to={`/categories/${category.slug}`}
                    className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col items-center p-4 md:max-w-[85%] md:mx-auto h-[190px] hover:border-[#3B82F6] hover:-translate-y-1 duration-300 relative"
                  >
                    <div className="h-[100px] w-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-2 overflow-hidden mt-2">
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover rounded-full"
                        style={{ objectPosition: 'center 40%' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/200x200?text=${encodeURIComponent(category.name)}`;
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center h-[50px] w-full">
                      <h3 className="text-sm font-medium text-center text-[#2E2E2E] line-clamp-2 w-full">{category.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 text-center absolute bottom-2">{category.product_count} Products</p>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      {/* Weekly Deals Banner */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-white p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0 md:mr-8">
                <div className="inline-block bg-[#3B82F6] text-white text-xs font-bold px-3 py-1 rounded-full mb-2">WEEKLY DEALS</div>
                <h2 className="text-xl font-bold text-[#2E2E2E] mb-2">Fresh Produce at Amazing Prices</h2>
                <p className="text-sm text-gray-600 mb-4">Save up to 25% on fresh fruits and vegetables this week. Stock up on healthy essentials for your family.</p>
                <Link to="/categories/fresh-produce" className="inline-block bg-[#3B82F6] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2563EB] transition">Shop Now</Link>
              </div>
              <div className="w-full md:w-1/3">
                <img 
                  src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop" 
                  alt="Fresh Produce" 
                  className="w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?font=roboto&text=Fresh+Produce";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hot Deals Section */}
      <div className="container mx-auto px-4 mb-2">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-[#3B82F6] mr-2"></div>
          <h2 className="text-xl font-bold text-[#2E2E2E] relative group">
            Hot Deals
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#3B82F6] transition-all duration-300 group-hover:w-full"></span>
          </h2>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-[#FFB200] to-[#F59E0B] py-4 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-end items-center mb-2">
            <Link to="/products?discount=true" className="text-white hover:text-[#F5F5F5] text-sm font-medium">
              View All Deals &rarr;
            </Link>
          </div>
          
          <div className="mx-auto max-w-[95%] mb-2">
            <Slider
              dots={false}
              infinite={false}
              speed={500}
              slidesToShow={6}
              slidesToScroll={3}
              swipeToSlide={true}
              draggable={true}
              responsive={[
                {
                  breakpoint: 1280,
                  settings: {
                    slidesToShow: 5,
                    slidesToScroll: 3,
                  }
                },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1.8,
                    slidesToScroll: 1,
                    centerMode: false,
                    centerPadding: '20px',
                  }
                }
              ]}
              className="hot-deals-slider"
            >
              {hotDeals
                .slice(0, 14)
                .map((product) => (
                  <div key={product.id} className="px-0.5 py-1">
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col group relative">
                      {/* Discount Badge - Updated to use ribbon style like in Featured Products */}
                      {((product.sale_price && parseFloat(product.sale_price) < parseFloat(product.base_price)) || 
                        (product.discount_percentage && parseFloat(product.discount_percentage) > 0)) && (
                        <div className="absolute top-0 right-0 w-0 h-0 border-solid border-t-0 border-r-[80px] border-b-[80px] border-l-0 border-transparent border-r-[#dc2626] border-b-transparent z-10">
                          <span className="absolute top-[18px] right-[-68px] text-white text-[11px] font-bold transform rotate-45 uppercase">
                            {product.discount_percentage || 
                             Math.round(((parseFloat(product.base_price) - parseFloat(product.sale_price)) / parseFloat(product.base_price)) * 100)}% OFF
                          </span>
                        </div>
                      )}
                      
                      {/* Product Image */}
                      <div className="relative pt-[100%] overflow-hidden">
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="absolute top-0 left-0 w-full h-full object-cover p-0 transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
                        <button 
                          className={`absolute bottom-0 left-0 right-0 py-2 transition-all duration-300 text-sm font-medium ${
                            addedProducts[product.id] 
                              ? 'bg-green-500 text-white translate-y-0' 
                              : errorProducts[product.id]
                                ? 'bg-red-500 text-white translate-y-0'
                                : 'bg-[#3B82F6] text-white translate-y-full group-hover:translate-y-0'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product, 1);
                          }}
                        >
                          {addedProducts[product.id] ? 'Added!' : errorProducts[product.id] ? (errorMessages[product.id] && errorMessages[product.id].toLowerCase().includes('stock') ? 'Out of Stock' : 'Error!') : 'Add to Cart'}
                        </button>
                      </div>
                      {/* Product Info */}
                      <div className="p-4 flex-grow flex flex-col">
                        <div className="flex items-center mb-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>
                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                                </svg>
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">{product.review_count}</span>
                        </div>
                        <Link to={`/products/${product.slug}`} className="block">
                          <h3 className="text-xs font-medium text-[#2E2E2E] mb-1 line-clamp-2 h-14">{product.name}</h3>
                        </Link>
                        <div className="flex justify-between items-center mt-1">
                          <div>
                            <div className="text-sm font-bold text-[#FFB200]">
                              {formatNaira(product.sale_price)}
                            </div>
                            {product.sale_price !== product.base_price && (
                              <div className="text-xs text-gray-500 line-through">
                                {formatNaira(product.base_price)}
                              </div>
                            )}
                          </div>
                          <button 
                            className="w-7 h-7 bg-[#3B82F6] text-white rounded-full flex items-center justify-center hover:bg-[#2563EB] transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(product, 1);
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </Slider>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="bg-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-[#3B82F6] mr-2"></div>
              <h2 className="text-xl font-bold text-[#2E2E2E]">Featured Products</h2>
            </div>
            <Link to="/products" className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium">
              View All Products &rarr;
            </Link>
          </div>
          
          <div className="mx-auto max-w-[95%] mb-8">
            <Slider
              dots={false}
              infinite={false}
              speed={500}
              slidesToShow={6}
              slidesToScroll={3}
              swipeToSlide={true}
              draggable={true}
              responsive={[
                {
                  breakpoint: 1280,
                  settings: {
                    slidesToShow: 5,
                    slidesToScroll: 3,
                  }
                },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1.8,
                    slidesToScroll: 1,
                    centerMode: false,
                    centerPadding: '20px',
                  }
                }
              ]}
              className="featured-products-slider"
            >
              {featuredProducts.slice(0, 14).map((product) => (
                <div key={product.id} className="px-1 py-2">
                  <div className="h-[350px] w-full">
                    <ProductCard product={product} viewType="grid" />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      {/* Popular Categories Section with Images */}
      <div className="bg-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-[#3B82F6] mr-2"></div>
              <h2 className="text-xl font-bold text-[#2E2E2E]">Popular Categories</h2>
            </div>
            <Link to="/categories" className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium">
              View All Categories &rarr;
            </Link>
          </div>
          
          <div className="mx-auto max-w-[95%]">
            <Slider
              dots={false}
              infinite={false}
              speed={500}
              slidesToShow={5}
              slidesToScroll={1}
              swipeToSlide={true}
              draggable={true}
              responsive={[
                {
                  breakpoint: 1280,
                  settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 3.5,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 1.5,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1.25,
                    slidesToScroll: 1,
                    centerMode: false,
                    centerPadding: '10px',
                  }
                }
              ]}
              className="popular-categories-slider"
            >
              {categories.slice(0, 8).map((category) => (
                <div key={category.id} className="px-1">
                  <Link to={`/categories/${category.slug}`} className="block">
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm md:max-w-[85%] md:mx-auto">
                      <div className="h-[176px] overflow-hidden">
                        <img 
                          src={category.image_url} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-[#2E2E2E]">{category.name}</h3>
                        <p className="text-sm text-[#3B82F6]">{category.product_count} Products</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      {/* New Arrivals Section */}
      <div className="bg-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-[#3B82F6] mr-2"></div>
              <h2 className="text-xl font-bold text-[#2E2E2E]">New Arrivals</h2>
            </div>
            <Link to="/products?new=true" className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium">
              View All New Arrivals &rarr;
            </Link>
          </div>
          
          <div className="mx-auto max-w-[95%] mb-8">
            <Slider
              dots={false}
              infinite={false}
              speed={500}
              slidesToShow={6}
              slidesToScroll={3}
              swipeToSlide={true}
              draggable={true}
              responsive={[
                {
                  breakpoint: 1280,
                  settings: {
                    slidesToShow: 5,
                    slidesToScroll: 3,
                  }
                },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1.8,
                    slidesToScroll: 1,
                    centerMode: false,
                    centerPadding: '20px',
                  }
                }
              ]}
              className="new-arrivals-slider"
            >
              {newArrivals.slice(0, 12).map((product) => (
                <div key={product.id} className="px-1 py-2">
                  <div className="h-[350px] w-full">
                    <ProductCard product={product} showNewBadge={true} />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>

      {/* Shop by Category Grid Section */}
      <div className="bg-white py-8 mb-12">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-[#2E2E2E] mb-6">Shop by Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((category) => (
              <Link key={category.id} to={`/categories/${category.slug}`} className="block">
                <div className="relative rounded-lg overflow-hidden h-40">
                  <img 
                    src={category.image_url} 
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-4">
                    <h3 className="text-white font-medium">{category.name}</h3>
                    <p className="text-white text-sm opacity-80">{category.product_count} Products</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Commented out Best Sellers Section - To be enabled later */}
      {/*
      <div className="bg-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-[#3B82F6] mr-2"></div>
              <h2 className="text-xl font-bold text-[#2E2E2E]">Best Sellers</h2>
            </div>
            <Link to="/products?bestseller=true" className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium">
              View All Best Sellers &rarr;
            </Link>
          </div>
          
          <div className="mx-auto max-w-[95%] mb-8">
            <Slider
              dots={false}
              infinite={false}
              speed={500}
              slidesToShow={6}
              slidesToScroll={3}
              swipeToSlide={true}
              draggable={true}
              responsive={[
                {
                  breakpoint: 1280,
                  settings: {
                    slidesToShow: 5,
                    slidesToScroll: 3,
                  }
                },
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1.8,
                    slidesToScroll: 1,
                    centerMode: false,
                    centerPadding: '20px',
                  }
                }
              ]}
              className="best-sellers-slider"
            >
              {bestSellers.slice(0, 12).map((product) => (
                <div key={product.id} className="px-1 py-2">
                  <div className="h-[350px] w-full">
                    <ProductCard product={product} viewType="grid" />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
      */}

    </div>
  );
};

export default Home;
