import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// Mock data for categories
const mockCategories = [
  { id: 1, name: 'Electronics', description: 'Electronic devices and accessories', parent_id: null, product_count: 28, is_active: true, is_featured: false, color: '#000000', image_url: '' },
  { id: 2, name: 'Apparel', description: 'Clothing and fashion items', parent_id: null, product_count: 45, is_active: true, is_featured: false, color: '#000000', image_url: '' },
  { id: 3, name: 'Kitchen', description: 'Kitchen appliances and utensils', parent_id: null, product_count: 32, is_active: true, is_featured: false, color: '#000000', image_url: '' },
  { id: 4, name: 'Accessories', description: 'Personal accessories and jewelry', parent_id: null, product_count: 19, is_active: true, is_featured: false, color: '#000000', image_url: '' },
  { id: 5, name: 'Health & Fitness', description: 'Health and fitness products', parent_id: null, product_count: 24, is_active: true, is_featured: false, color: '#000000', image_url: '' },
  { id: 6, name: 'Gaming', description: 'Gaming equipment and accessories', parent_id: null, product_count: 15, is_active: true, is_featured: false, color: '#000000', image_url: '' },
  { id: 7, name: 'Home Decor', description: 'Home decoration items', parent_id: null, product_count: 38, is_active: true, is_featured: false, color: '#000000', image_url: '' },
  { id: 8, name: 'Art & Creativity', description: 'Art supplies and creative tools', parent_id: null, product_count: 12, is_active: true, is_featured: false, color: '#000000', image_url: '' },
  { id: 9, name: 'Smartphones', description: 'Mobile phones and accessories', parent_id: 1, product_count: 10, is_active: true, is_featured: false, color: '#000000', image_url: '' },
  { id: 10, name: 'Laptops', description: 'Notebook computers and accessories', parent_id: 1, product_count: 8, is_active: true, is_featured: false, color: '#000000', image_url: '' }
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    description: '', 
    parent_id: '', 
    is_active: true, 
    is_featured: false,
    color: '#000000',
    image_url: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/categories');

      if (response.data && response.data.categories) {
        setCategories(response.data.categories.data || []);
        setUsingMockData(false);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');

      // Use mock data when API call fails
      setCategories(mockCategories);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    console.log('Adding new category:', newCategory);

    try {
      console.log('Sending create request to API...');
      const response = await api.post('/admin/categories', newCategory);
      
      console.log('API response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);

      // Check if the response contains a success message
      if (response.data.status === 'success' || (response.data.message && response.data.message.includes('success'))) {
        console.log('Category created successfully:', response.data.category);
        // Add the new category to the local state
        setCategories([...categories, response.data.category]);
        setNewCategory({ 
          name: '', 
          description: '', 
          parent_id: '', 
          is_active: true, 
          is_featured: false,
          color: '#000000',
          image_url: ''
        });
        setShowAddForm(false);
      } else {
        console.error('API returned non-success status:', response.data);
        throw new Error(response.data.message || 'Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      }

      // Check if the error message contains "success" which indicates a potential issue
      if (err.message && err.message.includes('success')) {
        console.log('Detected success in error message - this might be a false error');
        
        // The creation might have actually succeeded despite the error
        try {
          // Refresh the categories list
          fetchCategories();
          setNewCategory({ 
            name: '', 
            description: '', 
            parent_id: '', 
            is_active: true, 
            is_featured: false,
            color: '#000000',
            image_url: ''
          });
          setShowAddForm(false);
          return; // Exit early since we're handling this special case
        } catch (refreshErr) {
          console.error('Error refreshing categories after potential successful creation:', refreshErr);
        }
      }

      if (usingMockData) {
        // Simulate adding a category with mock data
        const newId = Math.max(...categories.map(c => c.id)) + 1;
        const createdCategory = {
          id: newId,
          name: newCategory.name,
          description: newCategory.description,
          parent_id: newCategory.parent_id || null,
          product_count: 0,
          is_active: newCategory.is_active,
          is_featured: newCategory.is_featured,
          color: newCategory.color,
          image_url: newCategory.image_url
        };

        setCategories([...categories, createdCategory]);
        setNewCategory({ 
          name: '', 
          description: '', 
          parent_id: '', 
          is_active: true, 
          is_featured: false,
          color: '#000000',
          image_url: ''
        });
        setShowAddForm(false);
      } else {
        alert('Failed to add category: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    console.log('Updating category:', editingCategory);

    try {
      console.log('Sending update request to API...');
      const response = await api.put(`/admin/categories/${editingCategory.id}`, editingCategory);
      
      console.log('API response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);

      // Check if the response contains a success message
      if (response.data.status === 'success' || (response.data.message && response.data.message.includes('success'))) {
        console.log('Category updated successfully:', response.data.category);
        // Update the category in the local state
        setCategories(categories.map(category =>
          category.id === editingCategory.id ? response.data.category : category
        ));
        setEditingCategory(null);
      } else {
        console.error('API returned non-success status:', response.data);
        throw new Error(response.data.message || 'Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      }

      // Check if the error message contains "success" which indicates a potential issue
      if (err.message && err.message.includes('success')) {
        console.log('Detected success in error message - this might be a false error');
        
        // The update might have actually succeeded despite the error
        try {
          // Refresh the categories list
          fetchCategories();
          setEditingCategory(null);
          return; // Exit early since we're handling this special case
        } catch (refreshErr) {
          console.error('Error refreshing categories after potential successful update:', refreshErr);
        }
      }

      if (usingMockData) {
        // Simulate updating a category with mock data
        setCategories(categories.map(category =>
          category.id === editingCategory.id ? { ...editingCategory } : category
        ));
        setEditingCategory(null);
      } else {
        alert('Failed to update category: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Sending delete request to API...');
      const response = await api.delete(`/admin/categories/${categoryId}`);
      
      console.log('API response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);

      // Check if the response contains a success message
      if (response.data.status === 'success' || (response.data.message && response.data.message.includes('success'))) {
        console.log('Category deleted successfully');
        // Remove the category from the local state
        setCategories(categories.filter(category => category.id !== categoryId));
      } else {
        console.error('API returned non-success status:', response.data);
        throw new Error(response.data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
      }

      // Check if the error message contains "success" which indicates a potential issue
      if (err.message && err.message.includes('success')) {
        console.log('Detected success in error message - this might be a false error');
        
        // The deletion might have actually succeeded despite the error
        try {
          // Refresh the categories list
          fetchCategories();
          return; // Exit early since we're handling this special case
        } catch (refreshErr) {
          console.error('Error refreshing categories after potential successful deletion:', refreshErr);
        }
      }

      if (usingMockData) {
        // Simulate deleting a category with mock data
        setCategories(categories.filter(category => category.id !== categoryId));
      } else {
        alert('Failed to delete category: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const startEditing = (category) => {
    setEditingCategory({ ...category });
  };

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  // Render loading state
  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Categories</h1>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark"
        >
          {showAddForm ? 'Cancel' : 'Add New Category'}
        </button>
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
                Using mock data. The actual API is currently unavailable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700">
                  Parent Category (Optional)
                </label>
                <select
                  id="parent_id"
                  value={newCategory.parent_id}
                  onChange={(e) => setNewCategory({ ...newCategory, parent_id: e.target.value || null })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">None</option>
                  {categories
                    .filter(category => category.parent_id === null)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
                  Is Active
                </label>
                <select
                  id="is_active"
                  value={newCategory.is_active}
                  onChange={(e) => setNewCategory({ ...newCategory, is_active: e.target.value === 'true' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="is_featured" className="block text-sm font-medium text-gray-700">
                  Is Featured
                </label>
                <select
                  id="is_featured"
                  value={newCategory.is_featured}
                  onChange={(e) => setNewCategory({ ...newCategory, is_featured: e.target.value === 'true' })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="color"
                  id="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="text"
                  id="image_url"
                  value={newCategory.image_url}
                  onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark"
                >
                  Add Category
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Edit Category
                </h3>
                
                <form onSubmit={handleUpdateCategory}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        id="edit-name"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="edit-description"
                        value={editingCategory.description}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-parent_id" className="block text-sm font-medium text-gray-700">
                        Parent Category
                      </label>
                      <select
                        id="edit-parent_id"
                        value={editingCategory.parent_id || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, parent_id: e.target.value || null })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">None</option>
                        {categories
                          .filter(category => category.id !== editingCategory.id && category.parent_id === null)
                          .map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-is_active" className="block text-sm font-medium text-gray-700">
                        Is Active
                      </label>
                      <select
                        id="edit-is_active"
                        value={editingCategory.is_active}
                        onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.value === 'true' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-is_featured" className="block text-sm font-medium text-gray-700">
                        Is Featured
                      </label>
                      <select
                        id="edit-is_featured"
                        value={editingCategory.is_featured}
                        onChange={(e) => setEditingCategory({ ...editingCategory, is_featured: e.target.value === 'true' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-color" className="block text-sm font-medium text-gray-700">
                        Color
                      </label>
                      <input
                        type="color"
                        id="edit-color"
                        value={editingCategory.color}
                        onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="edit-image_url" className="block text-sm font-medium text-gray-700">
                        Image URL
                      </label>
                      <input
                        type="text"
                        id="edit-image_url"
                        value={editingCategory.image_url}
                        onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">{category.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {category.parent_id ? (
                          categories.find(c => c.id === category.parent_id)?.name || 'Unknown'
                        ) : (
                          'None'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.product_count || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => startEditing(category)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
