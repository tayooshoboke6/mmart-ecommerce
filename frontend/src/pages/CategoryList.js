import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductService from '../services/product.service';
import axios from 'axios';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock categories data
  const mockCategories = [
    {
      id: 1,
      name: 'Electronics',
      slug: 'electronics',
      description: 'Phones, Computers, TVs & Home Entertainment',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Electronics',
      icon: '📱',
      product_count: 248,
      subcategory_count: 6
    },
    {
      id: 2,
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing, Shoes, Watches & Accessories',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Fashion',
      icon: '👕',
      product_count: 215,
      subcategory_count: 6
    },
    {
      id: 3,
      name: 'Beauty & Personal Care',
      slug: 'beauty-personal-care',
      description: 'Skincare, Makeup, Hair Care & Fragrances',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Beauty',
      icon: '💄',
      product_count: 178,
      subcategory_count: 6
    },
    {
      id: 4,
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Furniture, Kitchen Appliances & Home Decor',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Home',
      icon: '🏠',
      product_count: 156,
      subcategory_count: 4
    },
    {
      id: 5,
      name: 'Phones & Tablets',
      slug: 'phones-tablets',
      description: 'Smartphones, Tablets & Accessories',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Phones',
      icon: '📱',
      product_count: 124,
      subcategory_count: 4
    },
    {
      id: 6,
      name: 'Computers',
      slug: 'computers',
      description: 'Laptops, Desktops & Computer Accessories',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Computers',
      icon: '💻',
      product_count: 112,
      subcategory_count: 3
    },
    {
      id: 7,
      name: 'Food & Groceries',
      slug: 'food-groceries',
      description: 'Fresh Food, Packaged Food & Beverages',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Food',
      icon: '🥦',
      product_count: 183,
      subcategory_count: 5
    },
    {
      id: 8,
      name: 'Baby Products',
      slug: 'baby-products',
      description: 'Baby Food, Diapers & Baby Care',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Baby',
      icon: '🍼',
      product_count: 97,
      subcategory_count: 3
    },
    {
      id: 9,
      name: 'Household Supplies',
      slug: 'household-supplies',
      description: 'Cleaning, Laundry & Home Organization',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Household',
      icon: '🧹',
      product_count: 145,
      subcategory_count: 5
    },
    {
      id: 10,
      name: 'Pet Supplies',
      slug: 'pet-supplies',
      description: 'Dog Food, Cat Food & Pet Accessories',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Pet',
      icon: '🐾',
      product_count: 94,
      subcategory_count: 3
    },
    {
      id: 11,
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Exercise Equipment, Sportswear & Outdoor Gear',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Sports',
      icon: '⚽',
      product_count: 132,
      subcategory_count: 4
    },
    {
      id: 12,
      name: 'Books & Stationery',
      slug: 'books-stationery',
      description: 'Books, Notebooks & Office Supplies',
      image_url: 'https://placehold.co/600x400?font=roboto&text=Books',
      icon: '📚',
      product_count: 118,
      subcategory_count: 5
    }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Try to fetch real categories from API
        let realCategories = [];
        try {
          const response = await ProductService.getCategories();
          realCategories = response.categories || [];
          console.log('Fetched real categories:', realCategories);
        } catch (apiError) {
          console.log('API call for categories failed:', apiError);
        }
        
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
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Use mock data on error
        setCategories(mockCategories);
        setLoading(false);
      }
    };
  
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Categories</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mx-auto">
        {categories && categories.length > 0 ? categories.map((category) => (
          <Link 
            key={category.id} 
            to={`/categories/${category.slug}`}
            className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100"
          >
            <div className="p-4 flex flex-col items-center">
              <div className="text-4xl mb-2">
                {category.icon || '📦'}
              </div>
              <h2 className="text-sm font-semibold text-center mb-1 line-clamp-2 min-h-[40px]">
                {category.name}
              </h2>
              <p className="text-xs text-gray-600 line-clamp-2 text-center mb-2 min-h-[32px]">
                {category.description || 'Browse products in this category'}
              </p>
              <div className="text-xs text-gray-600 mt-auto">
                {category.product_count || 0} items • {category.subcategory_count || 0} subcategories
              </div>
            </div>
          </Link>
        )) : (
          <div className="text-center py-12 col-span-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No Categories Found</h3>
            <p className="mt-1 text-gray-500">Check back later for new categories.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
