import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import ProductService from '../services/product.service';
import { formatNaira } from '../utils/formatters';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        
        const mockFeaturedProducts = [
          {
            id: 1,
            name: 'Premium Rice (5kg)',
            slug: 'premium-rice-5kg',
            description: 'High-quality Nigerian rice, perfect for all your meals.',
            base_price: "5000.00",
            sale_price: "4500.00",
            is_featured: true,
            is_active: true,
            stock_quantity: 50,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Rice',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 10
          },
          {
            id: 2,
            name: 'Smartphone X Pro',
            slug: 'smartphone-x-pro',
            description: 'Latest smartphone with advanced features and long battery life.',
            base_price: "150000.00",
            sale_price: "150000.00",
            is_featured: true,
            is_active: true,
            stock_quantity: 10,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Smartphone',
            is_on_sale: false,
            is_in_stock: true,
            discount_percentage: 0
          },
          {
            id: 3,
            name: 'Men\'s Casual Shirt',
            slug: 'mens-casual-shirt',
            description: 'Comfortable and stylish shirt for everyday wear.',
            base_price: "7500.00",
            sale_price: "6000.00",
            is_featured: true,
            is_active: true,
            stock_quantity: 25,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Shirt',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 20
          },
          {
            id: 4,
            name: 'Kitchen Blender',
            slug: 'kitchen-blender',
            description: 'Powerful blender for all your kitchen needs.',
            base_price: "15000.00",
            sale_price: "12000.00",
            is_featured: true,
            is_active: true,
            stock_quantity: 15,
            image_url: 'https://placehold.co/600x400?font=roboto&text=Blender',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 20
          },
          {
            id: 5,
            name: "Premium Washing Soap",
    slug: "premium-washing-soap",
    image_url: "https://placehold.co/600x400?font=roboto&text=Washing+Soap",
    base_price: 3999,
    sale_price: 2999,
    discount_percentage: 25,
    rating: 4.5,
    review_count: 120,
    is_featured: true
  },
  {
    id: 6,
    name: "Luxury Hand Cream",
    slug: "luxury-hand-cream",
    image_url: "https://placehold.co/600x400?font=roboto&text=Hand+Cream",
    base_price: 4500,
    sale_price: 4500,
    discount_percentage: 0,
    rating: 4.8,
    review_count: 85,
    is_featured: true
  }
];
        
        let realFeaturedProducts = [];
        try {
          const response = await ProductService.getProductsByType('featured');
          // Map API response fields to match component expectations
          realFeaturedProducts = (response.products || []).map(product => ({
            ...product,
            is_featured: product.is_featured || false,
            is_new_arrival: product.is_new_arrival || false,
            is_hot_deal: product.is_hot_deal || false,
            is_in_stock: product.is_in_stock || (product.stock_quantity > 0),
            is_on_sale: product.is_on_sale || (product.sale_price && product.base_price && parseFloat(product.sale_price) < parseFloat(product.base_price)),
            discount_percentage: product.discount_percentage || (product.base_price && product.sale_price ? 
              Math.round(((parseFloat(product.base_price) - parseFloat(product.sale_price)) / parseFloat(product.base_price)) * 100) : 0)
          }));
          console.log('Fetched real featured products:', realFeaturedProducts);
        } catch (apiError) {
          console.log('API call for featured products failed:', apiError);
        }
        // Combine real and mock products - real products first
        setFeaturedProducts([...realFeaturedProducts, ...mockFeaturedProducts]);

        // Mock new arrivals
        const mockNewArrivals = [
          {
            id: 7,
            name: "Organic Body Wash",
            slug: "organic-body-wash",
            image_url: "https://placehold.co/600x400?font=roboto&text=Body+Wash",
            base_price: 5999,
            sale_price: 4799,
            discount_percentage: 20,
            rating: 4.2,
            review_count: 64,
            is_new: true
          },
          {
            id: 8,
            name: "Natural Hair Conditioner",
            slug: "natural-hair-conditioner",
            image_url: "https://placehold.co/600x400?font=roboto&text=Hair+Conditioner",
            base_price: 6500,
            sale_price: 6500,
            discount_percentage: 0,
            rating: 4.7,
            review_count: 92,
            is_new: true
          },
          {
            id: 9,
            name: "Anti-Aging Face Serum",
            slug: "anti-aging-face-serum",
            image_url: "https://placehold.co/600x400?font=roboto&text=Face+Serum",
            base_price: 12999,
            sale_price: 9999,
            discount_percentage: 23,
            rating: 4.9,
            review_count: 156,
            is_new: true
          },
          {
            id: 10,
            name: "Whitening Toothpaste",
            slug: "whitening-toothpaste",
            image_url: "https://placehold.co/600x400?font=roboto&text=Toothpaste",
            base_price: 1999,
            sale_price: 1599,
            discount_percentage: 20,
            rating: 4.3,
            review_count: 78,
            is_new: true
          }
        ];
        
        let realNewArrivals = [];
        try {
          const response = await ProductService.getProductsByType('new_arrivals');
          // Map API response fields to match component expectations
          realNewArrivals = (response.products || []).map(product => ({
            ...product,
            is_featured: product.is_featured || false,
            is_new_arrival: product.is_new_arrival || true, // Force true for new arrivals
            is_hot_deal: product.is_hot_deal || false,
            is_active: product.is_active || true,
            is_in_stock: product.is_in_stock || (product.stock_quantity > 0),
            is_on_sale: product.is_on_sale || (product.sale_price && product.base_price && parseFloat(product.sale_price) < parseFloat(product.base_price)),
            discount_percentage: product.discount_percentage || (product.base_price && product.sale_price ? 
              Math.round(((parseFloat(product.base_price) - parseFloat(product.sale_price)) / parseFloat(product.base_price)) * 100) : 0)
          }));
          console.log('Fetched real new arrivals:', realNewArrivals);
        } catch (apiError) {
          console.log('API call for new arrivals failed:', apiError);
        }
        // Combine real and mock products - real products first
        setNewArrivals([...realNewArrivals, ...mockNewArrivals]);

        // Mock best sellers
        const mockBestSellers = [
          {
            id: 11,
            name: "Moisturizing Shower Gel",
            slug: "moisturizing-shower-gel",
            image_url: "https://placehold.co/600x400?font=roboto&text=Shower+Gel",
            base_price: 3500,
            sale_price: 2450,
            discount_percentage: 30,
            rating: 4.6,
            review_count: 103
          },
          {
            id: 12,
            name: "Exfoliating Face Scrub",
            slug: "exfoliating-face-scrub",
            image_url: "https://placehold.co/600x400?font=roboto&text=Face+Scrub",
            base_price: 4299,
            sale_price: 2999,
            discount_percentage: 30,
            rating: 4.4,
            review_count: 67
          },
          {
            id: 13,
            name: "Hydrating Face Mask",
            slug: "hydrating-face-mask",
            image_url: "https://placehold.co/600x400?font=roboto&text=Face+Mask",
            base_price: 2999,
            sale_price: 1799,
            discount_percentage: 40,
            rating: 4.7,
            review_count: 89
          },
          {
            id: 14,
            name: "Vitamin C Serum",
            slug: "vitamin-c-serum",
            image_url: "https://placehold.co/600x400?font=roboto&text=Vitamin+C",
            base_price: 8999,
            sale_price: 5399,
            discount_percentage: 40,
            rating: 4.8,
            review_count: 132
          }
        ];
        
        let realBestSellers = [];
        try {
          const response = await ProductService.getProductsByType('best_sellers');
          // Map API response fields to match component expectations
          realBestSellers = (response.products || []).map(product => ({
            ...product,
            is_featured: product.is_featured || false,
            is_new_arrival: product.is_new_arrival || false,
            is_hot_deal: product.is_hot_deal || false,
            is_in_stock: product.is_in_stock || (product.stock_quantity > 0),
            is_on_sale: product.is_on_sale || (product.sale_price && product.base_price && parseFloat(product.sale_price) < parseFloat(product.base_price)),
            discount_percentage: product.discount_percentage || (product.base_price && product.sale_price ? 
              Math.round(((parseFloat(product.base_price) - parseFloat(product.sale_price)) / parseFloat(product.base_price)) * 100) : 0)
          }));
          console.log('Fetched real best sellers:', realBestSellers);
        } catch (apiError) {
          console.log('API call for best sellers failed:', apiError);
        }
        // Combine real and mock products - real products first
        setBestSellers([...realBestSellers, ...mockBestSellers]);

        // Mock categories
        const mockCategories = [
          {
            id: 1,
            name: 'Groceries',
            slug: 'groceries',
            image_url: 'https://placehold.co/600x400?font=roboto&text=Groceries',
            product_count: 120
          },
          {
            id: 7,
            name: 'Electronics',
            slug: 'electronics',
            image_url: 'https://placehold.co/600x400?font=roboto&text=Electronics',
            product_count: 85
          },
          {
            id: 3,
            name: 'Fashion',
            slug: 'fashion',
            image_url: 'https://placehold.co/600x400?font=roboto&text=Fashion',
            product_count: 150
          },
          {
            id: 4,
            name: 'Home & Kitchen',
            slug: 'home-kitchen',
            image_url: 'https://placehold.co/600x400?font=roboto&text=Home',
            product_count: 95
          },
          {
            id: 5,
            name: 'Health & Beauty',
            slug: 'health-beauty',
            image_url: 'https://placehold.co/600x400?font=roboto&text=Beauty',
            product_count: 70
          },
          {
            id: 6,
            name: 'Baby Products',
            slug: 'baby-products',
            image_url: 'https://placehold.co/600x400?font=roboto&text=Baby',
            product_count: 45
          }
        ];
        
        let realCategories = [];
        try {
          const response = await ProductService.getCategories();
          realCategories = response.categories || [];
          console.log('Fetched real categories:', realCategories);
        } catch (apiError) {
          console.log('API call for categories failed:', apiError);
        }
        // Combine real and mock categories - real categories first
        setCategories([...realCategories, ...mockCategories]);

        setLoading(false);
} catch (error) {
  console.error("Error fetching home data:", error);
  setError(error);
  setLoading(false);
}
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3B82F6]"></div>
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
      {/* Hero Banner */}
      <div className="bg-[#F5F5F5] py-6">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-8 bg-[#FFB200] flex flex-col justify-center">
                <div className="inline-block bg-white text-[#FFB200] text-xs font-bold px-3 py-1 rounded-full mb-3">Monthly Promotion</div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#2E2E2E] mb-4">SHOP & SAVE BIG</h1>
                <p className="text-[#2E2E2E] mb-6">Get up to 30% off on all groceries and household essentials</p>
                <div className="w-full bg-white rounded-full h-2 mb-6">
                  <div className="bg-[#3B82F6] h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="flex space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                  <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-6 flex items-center justify-center">
                <img 
                  src="/images/shop-save-big.png" 
                  alt="Shop & Save Big" 
                  className="max-h-64 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?font=roboto&text=Shop+%26+Save+Big";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop by Category Section */}
      <div className="bg-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-[#3B82F6] mr-2"></div>
              <h2 className="text-xl font-bold text-[#2E2E2E]">Shop by Category</h2>
            </div>
            <Link to="/categories" className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium bg-blue-50 px-4 py-2 rounded-md">
              Show All Categories
            </Link>
          </div>
          <p className="text-gray-600 mb-6">Find everything you need organized by department</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link key={category.id} to={`/categories/${category.slug}`} className="block">
                <div className="bg-white rounded-lg border border-blue-100 hover:border-[#3B82F6] transition-all p-4 text-center h-full">
                  <div className="flex justify-center mb-3">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-[#2E2E2E]">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{category.product_count} items</p>
                </div>
              </Link>
            ))}
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
                  src="/images/fresh-produce.jpg" 
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
      <div className="bg-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-[#FFB200] mr-2"></div>
              <h2 className="text-xl font-bold text-[#2E2E2E]">Hot Deals</h2>
            </div>
            <Link to="/products?discount=true" className="text-[#FFB200] hover:text-[#F59E0B] text-sm font-medium">
              View All Deals &rarr;
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
                }
              ]}
              className="hot-deals-slider"
            >
              {bestSellers
                .filter(product => product.discount_percentage > 0)
                .slice(0, 14)
                .map((product) => (
                  <div key={product.id} className="px-1">
                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all relative h-full">
                      <div className="absolute top-0 right-0 w-0 h-0" style={{ 
                        borderStyle: 'solid',
                        borderWidth: '0 80px 80px 0',
                        borderColor: 'transparent #dc2626 transparent transparent',
                        zIndex: 2
                      }}>
                        <span style={{
                          position: 'absolute',
                          top: '18px',
                          right: '-68px',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          transform: 'rotate(45deg)',
                          textTransform: 'uppercase'
                        }}>
                          {product.discount_percentage}% OFF
                        </span>
                      </div>
                      <div className="relative">
                        <Link to={`/products/${product.slug}`}>
                          <div className="h-44 bg-gray-50 flex items-center justify-center p-3 overflow-hidden">
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/300x300?text=Product+Image";
                              }}
                            />
                          </div>
                        </Link>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-12 z-10"></div>
                      </div>
                      <div className="p-3 pt-0 relative z-20">
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
                            className="w-7 h-7 bg-[#FFB200] text-white rounded-full flex items-center justify-center hover:bg-[#F59E0B] transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Add to cart functionality
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
          <div className="flex justify-between items-center mb-4">
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
                }
              ]}
              className="featured-products-slider"
            >
              {featuredProducts.slice(0, 14).map((product) => (
                <div key={product.id} className="px-1">
                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all relative h-full">
                    {product.discount_percentage > 0 && (
                      <div className="absolute top-0 right-0 w-0 h-0" style={{ 
                        borderStyle: 'solid',
                        borderWidth: '0 80px 80px 0',
                        borderColor: 'transparent #dc2626 transparent transparent',
                        zIndex: 2
                      }}>
                        <span style={{
                          position: 'absolute',
                          top: '18px',
                          right: '-68px',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          transform: 'rotate(45deg)',
                          textTransform: 'uppercase'
                        }}>
                          {product.discount_percentage}% OFF
                        </span>
                      </div>
                    )}
                    {product.is_featured && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md z-10">
                        Featured
                      </div>
                    )}
                    <div className="relative">
                      <Link to={`/products/${product.slug}`}>
                        <div className="h-44 bg-gray-50 flex items-center justify-center p-3 overflow-hidden">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/300x300?text=Product+Image";
                            }}
                          />
                        </div>
                      </Link>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-12 z-10"></div>
                    </div>
                    <div className="p-3 pt-0 relative z-20">
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
                            // Add to cart functionality
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

      {/* Popular Categories Section with Images */}
      <div className="bg-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-[#3B82F6] mr-2"></div>
              <h2 className="text-xl font-bold text-[#2E2E2E]">Popular Categories</h2>
            </div>
          </div>
          
          <div className="relative">
            <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 text-[#3B82F6]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex space-x-4 overflow-x-auto py-4 scrollbar-hide">
              {categories.slice(0, 5).map((category) => (
                <Link key={category.id} to={`/categories/${category.slug}`} className="block flex-shrink-0 w-56">
                  <div className="bg-white rounded-lg overflow-hidden">
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/300x200?text=${category.name}`;
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-[#2E2E2E]">{category.name}</h3>
                      <p className="text-sm text-[#3B82F6]">{category.product_count} Products</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 text-[#3B82F6]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* New Arrivals Section */}
     <div className="bg-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-[#3B82F6] mr-2"></div>
              <h2 className="text-xl font-bold text-[#2E2E2E]">New Arrivals</h2>
            </div>
            <Link to="/products?sort=newest" className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium">
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
                }
              ]}
              className="new-arrivals-slider"
            >
              {newArrivals.slice(0, 14).map((product) => (
                <div key={product.id} className="px-1">
                  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all relative h-full">
                    {product.discount_percentage > 0 && (
                      <div className="absolute top-0 right-0 w-0 h-0" style={{ 
                        borderStyle: 'solid',
                        borderWidth: '0 80px 80px 0',
                        borderColor: 'transparent #dc2626 transparent transparent',
                        zIndex: 2
                      }}>
                        <span style={{
                          position: 'absolute',
                          top: '18px',
                          right: '-68px',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          transform: 'rotate(45deg)',
                          textTransform: 'uppercase'
                        }}>
                          {product.discount_percentage}% OFF
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md z-10">
                      NEW
                    </div>
                    <div className="relative">
                      <Link to={`/products/${product.slug}`}>
                        <div className="h-44 bg-gray-50 flex items-center justify-center p-3 overflow-hidden">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/300x300?text=Product+Image";
                            }}
                          />
                        </div>
                      </Link>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-12 z-10"></div>
                    </div>
                    <div className="p-3 pt-0 relative z-20">
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
                            // Add to cart functionality
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

      {/* Shop by Category Grid Section */}
      <div className="container mx-auto px-4 mb-12">
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

      {/* Free Shipping Banner */}
      <div className="bg-[#3B82F6] py-8 mb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2563EB] bg-opacity-20 p-6 rounded-lg text-center">
              <div className="flex justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Free Shipping</h3>
              <p className="text-white text-sm opacity-80">On orders over {formatNaira(10000)}</p>
            </div>
            
            <div className="bg-[#2563EB] bg-opacity-20 p-6 rounded-lg text-center">
              <div className="flex justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Easy Returns</h3>
              <p className="text-white text-sm opacity-80">30-day return policy</p>
            </div>
            
            <div className="bg-[#2563EB] bg-opacity-20 p-6 rounded-lg text-center">
              <div className="flex justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Secure Payment</h3>
              <p className="text-white text-sm opacity-80">100% secure payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
