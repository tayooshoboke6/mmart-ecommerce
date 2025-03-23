import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import ProductService from '../services/product.service';
import { formatNaira } from '../utils/formatters';

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
        // In a real implementation, these would be API calls
        // For now, we'll use dummy data
        
        // Simulate API calls
        setTimeout(() => {
          // Featured products
          setFeaturedProducts([
            {
              id: 1,
              name: 'Premium Rice (5kg)',
              slug: 'premium-rice-5kg',
              description: 'High-quality Nigerian rice, perfect for all your meals.',
              base_price: 5000,
              sale_price: 4500,
              image: 'https://via.placeholder.com/300x300?text=Rice',
              stock_quantity: 50
            },
            {
              id: 2,
              name: 'Smartphone X Pro',
              slug: 'smartphone-x-pro',
              description: 'Latest smartphone with advanced features and long battery life.',
              base_price: 150000,
              sale_price: null,
              image: 'https://via.placeholder.com/300x300?text=Smartphone',
              stock_quantity: 10
            },
            {
              id: 3,
              name: 'Men\'s Casual Shirt',
              slug: 'mens-casual-shirt',
              description: 'Comfortable cotton shirt for everyday wear.',
              base_price: 7500,
              sale_price: 6000,
              image: 'https://via.placeholder.com/300x300?text=Shirt',
              stock_quantity: 25
            },
            {
              id: 4,
              name: 'Kitchen Blender',
              slug: 'kitchen-blender',
              description: 'Powerful blender for all your kitchen needs.',
              base_price: 15000,
              sale_price: 12000,
              image: 'https://via.placeholder.com/300x300?text=Blender',
              stock_quantity: 15
            }
          ]);

          // New arrivals
          setNewArrivals([
            {
              id: 5,
              name: 'Wireless Earbuds',
              slug: 'wireless-earbuds',
              description: 'High-quality sound with noise cancellation.',
              base_price: 25000,
              sale_price: null,
              image: 'https://via.placeholder.com/300x300?text=Earbuds',
              stock_quantity: 20
            },
            {
              id: 6,
              name: 'Women\'s Handbag',
              slug: 'womens-handbag',
              description: 'Stylish and spacious handbag for everyday use.',
              base_price: 12000,
              sale_price: 9500,
              image: 'https://via.placeholder.com/300x300?text=Handbag',
              stock_quantity: 8
            },
            {
              id: 7,
              name: 'Smart Watch',
              slug: 'smart-watch',
              description: 'Track your fitness and stay connected.',
              base_price: 35000,
              sale_price: 30000,
              image: 'https://via.placeholder.com/300x300?text=SmartWatch',
              stock_quantity: 12
            },
            {
              id: 8,
              name: 'Cooking Oil (5L)',
              slug: 'cooking-oil-5l',
              description: 'Pure vegetable oil for healthy cooking.',
              base_price: 8500,
              sale_price: null,
              image: 'https://via.placeholder.com/300x300?text=CookingOil',
              stock_quantity: 30
            }
          ]);

          // Best sellers
          setBestSellers([
            {
              id: 9,
              name: 'Instant Noodles (Pack of 20)',
              slug: 'instant-noodles-pack',
              description: 'Quick and delicious meal option.',
              base_price: 4000,
              sale_price: 3500,
              image: 'https://via.placeholder.com/300x300?text=Noodles',
              stock_quantity: 100
            },
            {
              id: 10,
              name: 'Power Bank 20000mAh',
              slug: 'power-bank-20000mah',
              description: 'Keep your devices charged on the go.',
              base_price: 15000,
              sale_price: null,
              image: 'https://via.placeholder.com/300x300?text=PowerBank',
              stock_quantity: 25
            },
            {
              id: 11,
              name: 'Bathroom Towel Set',
              slug: 'bathroom-towel-set',
              description: 'Soft and absorbent cotton towels.',
              base_price: 12000,
              sale_price: 9000,
              image: 'https://via.placeholder.com/300x300?text=Towels',
              stock_quantity: 15
            },
            {
              id: 12,
              name: 'Children\'s School Bag',
              slug: 'childrens-school-bag',
              description: 'Durable and spacious school bag for kids.',
              base_price: 7500,
              sale_price: 6000,
              image: 'https://via.placeholder.com/300x300?text=SchoolBag',
              stock_quantity: 20
            }
          ]);

          // Categories
          setCategories([
            {
              id: 1,
              name: 'Groceries',
              slug: 'groceries',
              image: 'https://via.placeholder.com/300x300?text=Groceries',
              product_count: 120
            },
            {
              id: 2,
              name: 'Electronics',
              slug: 'electronics',
              image: 'https://via.placeholder.com/300x300?text=Electronics',
              product_count: 85
            },
            {
              id: 3,
              name: 'Fashion',
              slug: 'fashion',
              image: 'https://via.placeholder.com/300x300?text=Fashion',
              product_count: 150
            },
            {
              id: 4,
              name: 'Home & Kitchen',
              slug: 'home-kitchen',
              image: 'https://via.placeholder.com/300x300?text=Home',
              product_count: 95
            },
            {
              id: 5,
              name: 'Health & Beauty',
              slug: 'health-beauty',
              image: 'https://via.placeholder.com/300x300?text=Beauty',
              product_count: 70
            },
            {
              id: 6,
              name: 'Baby Products',
              slug: 'baby-products',
              image: 'https://via.placeholder.com/300x300?text=Baby',
              product_count: 45
            }
          ]);

          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Hero banner section
  const HeroBanner = () => (
    <div className="relative bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to M-Mart<span className="text-secondary">+</span></h1>
            <p className="text-lg md:text-xl mb-6">Your one-stop shop for all your needs. Quality products at the best prices delivered to your doorstep.</p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/products" 
                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-md transition duration-300"
              >
                Shop Now
              </Link>
              <Link 
                to="/categories" 
                className="bg-white hover:bg-gray-100 text-primary font-bold py-3 px-6 rounded-md transition duration-300"
              >
                Browse Categories
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://via.placeholder.com/600x400?text=M-Mart+" 
              alt="M-Mart+ Shopping" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Categories section
  const CategoriesSection = () => (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
          <Link to="/categories" className="text-primary hover:text-primary-dark font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-32 bg-gray-300 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            categories.map(category => (
              <Link 
                key={category.id} 
                to={`/categories/${category.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="h-32 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-medium text-gray-800">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.product_count} Products</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );

  // Featured products section
  const FeaturedProductsSection = () => (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
          <Link to="/products?featured=1" className="text-primary hover:text-primary-dark font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              </div>
            ))
          ) : (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );

  // New arrivals section
  const NewArrivalsSection = () => (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">New Arrivals</h2>
          <Link to="/products?new=1" className="text-primary hover:text-primary-dark font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              </div>
            ))
          ) : (
            newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );

  // Best sellers section
  const BestSellersSection = () => (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Best Sellers</h2>
          <Link to="/products?bestseller=1" className="text-primary hover:text-primary-dark font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-md mb-4"></div>
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              </div>
            ))
          ) : (
            bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );

  // Promotions section
  const PromotionsSection = () => (
    <section className="py-12 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
            <p>On orders over {formatNaira(10000)}</p>
          </div>
          
          <div className="bg-white bg-opacity-10 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2">Easy Returns</h3>
            <p>30-day return policy</p>
          </div>
          
          <div className="bg-white bg-opacity-10 p-6 rounded-lg text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
            <p>100% secure payment</p>
          </div>
        </div>
      </div>
    </section>
  );

  // Newsletter section
  const NewsletterSection = () => (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-6">Stay updated with our latest products and offers.</p>
          
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-md transition duration-300"
            >
              Subscribe
            </button>
          </form>
          
          <p className="text-gray-500 text-sm mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </p>
        </div>
      </div>
    </section>
  );

  return (
    <div>
      <HeroBanner />
      <CategoriesSection />
      <FeaturedProductsSection />
      <PromotionsSection />
      <NewArrivalsSection />
      <BestSellersSection />
      <NewsletterSection />
    </div>
  );
};

export default Home;
