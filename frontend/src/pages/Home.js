import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import ProductService from '../services/product.service';
import { formatNaira } from '../utils/formatters';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

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
            image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
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
            image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1527&q=80',
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
            image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80',
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
            image_url: 'https://images.unsplash.com/photo-1619067562766-8e6fa33886e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            is_on_sale: true,
            is_in_stock: true,
            discount_percentage: 20
          },
          {
            id: 5,
            name: "Premium Washing Soap",
            slug: "premium-washing-soap",
            image_url: "https://images.unsplash.com/photo-1626396805646-4e9b8ba48fcf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
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
            image_url: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
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
            image_url: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
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
            image_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
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
            image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
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
            image_url: "https://images.unsplash.com/photo-1559304822-9eb2813c9844?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
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
            image_url: "https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
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
            image_url: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
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
            image_url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
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
            image_url: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
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

        // Fetch hot deals
        let realHotDeals = [];
        try {
          const response = await ProductService.getProductsByType('hot_deals');
          // Map API response fields to match component expectations
          realHotDeals = (response.products || []).map(product => {
            // Calculate discount percentage if not provided
            const discountPercentage = product.discount_percentage || 
              (product.base_price && product.sale_price ? 
                Math.round(((parseFloat(product.base_price) - parseFloat(product.sale_price)) / parseFloat(product.base_price)) * 100) : 0);
            
            // Log product discount information for debugging
            console.log(`Product: ${product.name}, Base: ${product.base_price}, Sale: ${product.sale_price}, Discount: ${discountPercentage}%`);
            
            return {
              ...product,
              is_featured: product.is_featured || false,
              is_new_arrival: product.is_new_arrival || false,
              is_hot_deal: product.is_hot_deal || true,
              is_in_stock: product.is_in_stock || (product.stock_quantity > 0),
              is_on_sale: product.is_on_sale || (product.sale_price && product.base_price && parseFloat(product.sale_price) < parseFloat(product.base_price)),
              discount_percentage: discountPercentage
            };
          });
          console.log('Fetched real hot deals:', realHotDeals);
        } catch (apiError) {
          console.log('API call for hot deals failed:', apiError);
        }
        
        // Use the mock data for hot deals if the API call fails or returns empty
        const mockHotDeals = mockBestSellers.filter(product => product.discount_percentage > 0);
        setHotDeals(realHotDeals.length > 0 ? realHotDeals : mockHotDeals);

        // Mock categories
        const mockCategories = [
          {
            id: 1,
            name: 'Groceries',
            slug: 'groceries',
            image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop',
            product_count: 120
          },
          {
            id: 7,
            name: 'Electronics',
            slug: 'electronics',
            image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            product_count: 85
          },
          {
            id: 3,
            name: 'Fashion',
            slug: 'fashion',
            image_url: 'https://images.unsplash.com/photo-1445205170230-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
            product_count: 150
          },
          {
            id: 4,
            name: 'Home & Kitchen',
            slug: 'home-kitchen',
            image_url: 'https://images.unsplash.com/photo-1556911220-bda9f7f3fe9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            product_count: 95
          },
          {
            id: 5,
            name: 'Health & Beauty',
            slug: 'health-beauty',
            image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
            product_count: 70
          },
          {
            id: 6,
            name: 'Baby Products',
            slug: 'baby-products',
            image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1475&q=80',
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
        const uniqueCategories = [...realCategories];
        
        // Only add mock categories that don't have ID conflicts with real categories
        mockCategories.forEach(mockCategory => {
          if (!uniqueCategories.some(cat => cat.id === mockCategory.id)) {
            uniqueCategories.push(mockCategory);
          }
        });
        
        setCategories(uniqueCategories);

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
                        src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80" 
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
            <Link to="/categories" className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium transition-all duration-300 hover:translate-x-1">
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
                          className="absolute bottom-0 left-0 right-0 bg-[#3B82F6] text-white py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-sm font-medium"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product, 1);
                          }}
                        >
                          Add to Cart
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
                              addToCart(product, 1);
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
      <div className="bg-[#F5F5F5] py-8 mb-8">
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

    </div>
  );
};

export default Home;
