import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../services/api';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    title: '',
    description: '',
    image: '',
    bgColor: '#FFFFFF',
    imgBgColor: '#FFFFFF',
    link: '',
    active: true
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/banners');
      if (response.data.status === 'success') {
        setBanners(response.data.banners);
      } else {
        toast.error('Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('An error occurred while fetching banners');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // For now, we're just storing the base64 string
        // In a production app, you'd upload this to a server
        setFormData({
          ...formData,
          image: reader.result
        });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.label.trim()) newErrors.label = 'Label is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.bgColor.trim()) newErrors.bgColor = 'Background color is required';
    if (!formData.imgBgColor.trim()) newErrors.imgBgColor = 'Image background color is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      label: '',
      title: '',
      description: '',
      image: '',
      bgColor: '#FFFFFF',
      imgBgColor: '#FFFFFF',
      link: '',
      active: true
    });
    setImagePreview(null);
    setErrors({});
    setCurrentBanner(null);
  };

  const openModal = (banner = null) => {
    if (banner) {
      // Edit mode
      setCurrentBanner(banner);
      setFormData({
        label: banner.label,
        title: banner.title,
        description: banner.description,
        image: banner.image || '',
        bgColor: banner.bg_color || banner.bgColor || '#FFFFFF',
        imgBgColor: banner.img_bg_color || banner.imgBgColor || '#FFFFFF',
        link: banner.link || '',
        active: banner.active
      });
      setImagePreview(banner.image);
    } else {
      // Create mode
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let response;
      
      if (currentBanner) {
        // Update existing banner
        response = await api.put(`/admin/banners/${currentBanner.id}`, formData);
        if (response.data.status === 'success') {
          toast.success('Banner updated successfully');
          fetchBanners();
          closeModal();
        }
      } else {
        // Create new banner
        response = await api.post('/admin/banners', formData);
        if (response.data.status === 'success') {
          toast.success('Banner created successfully');
          fetchBanners();
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('An error occurred while saving the banner');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      // Create the payload and log it for debugging
      const payload = {
        ...banner,
        active: !banner.active
      };
      console.log('Toggle payload being sent:', payload);
      
      const response = await api.put(`/admin/banners/${banner.id}`, payload);
      
      console.log('Toggle response received:', response.data);
      
      if (response.data.status === 'success') {
        toast.success(`Banner ${banner.active ? 'deactivated' : 'activated'} successfully`);
        fetchBanners();
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      // Log more detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      toast.error('An error occurred while updating the banner');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        const response = await api.delete(`/admin/banners/${id}`);
        if (response.data.status === 'success') {
          toast.success('Banner deleted successfully');
          fetchBanners();
        }
      } catch (error) {
        console.error('Error deleting banner:', error);
        toast.error('An error occurred while deleting the banner');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Banners</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Banner
        </button>
      </div>

      {loading && <p className="text-center py-4">Loading banners...</p>}

      {!loading && banners.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No banners found. Create your first banner to get started.</p>
        </div>
      )}

      {!loading && banners.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {banner.image ? (
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={banner.image}
                            alt={banner.title}
                          />
                        </div>
                      ) : (
                        <div
                          className="flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center text-white"
                          style={{ backgroundColor: banner.bg_color || banner.bgColor }}
                        >
                          No Img
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{banner.label}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{banner.title}</div>
                    <div className="text-sm text-gray-500">
                      {banner.description.length > 50
                        ? `${banner.description.substring(0, 50)}...`
                        : banner.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {banner.link.length > 30
                          ? `${banner.link.substring(0, 30)}...`
                          : banner.link}
                      </a>
                    ) : (
                      <span className="text-gray-500">No link</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        banner.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title={banner.active ? 'Deactivate' : 'Activate'}
                    >
                      {banner.active ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      onClick={() => openModal(banner)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h2 className="text-xl font-bold text-gray-800">
                {currentBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="label"
                      value={formData.label}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        errors.label ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g. Monthly Promotion"
                    />
                    {errors.label && (
                      <p className="text-red-500 text-xs mt-1">{errors.label}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g. SHOP & SAVE BIG"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full p-2 border rounded-md ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter banner description"
                    ></textarea>
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link
                    </label>
                    <input
                      type="text"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g. /promotions"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Enter a relative URL (e.g. /promotions) or full URL
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        id="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                        Active (visible on the website)
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Recommended size: 1200x400 pixels
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="bgColor"
                        value={formData.bgColor}
                        onChange={handleInputChange}
                        className="h-10 w-10 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        name="bgColor"
                        value={formData.bgColor}
                        onChange={handleInputChange}
                        className={`ml-2 w-full p-2 border rounded-md ${
                          errors.bgColor ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="#FFFFFF"
                      />
                    </div>
                    {errors.bgColor && (
                      <p className="text-red-500 text-xs mt-1">{errors.bgColor}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Background Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="imgBgColor"
                        value={formData.imgBgColor}
                        onChange={handleInputChange}
                        className="h-10 w-10 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        name="imgBgColor"
                        value={formData.imgBgColor}
                        onChange={handleInputChange}
                        className={`ml-2 w-full p-2 border rounded-md ${
                          errors.imgBgColor ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="#FFFFFF"
                      />
                    </div>
                    {errors.imgBgColor && (
                      <p className="text-red-500 text-xs mt-1">{errors.imgBgColor}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Preview
                    </label>
                    <div
                      className="w-full h-40 rounded-md flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: formData.bgColor }}
                    >
                      {imagePreview ? (
                        <div
                          className="h-full w-1/2 flex items-center justify-center"
                          style={{ backgroundColor: formData.imgBgColor }}
                        >
                          <img
                            src={imagePreview}
                            alt="Banner Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="h-full w-1/2 flex items-center justify-center"
                          style={{ backgroundColor: formData.imgBgColor }}
                        >
                          <p className="text-gray-500">No image selected</p>
                        </div>
                      )}
                      <div className="h-full w-1/2 p-4 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-white">{formData.title || 'Banner Title'}</h3>
                        <p className="text-white text-sm mt-2">
                          {formData.description
                            ? formData.description.length > 100
                              ? `${formData.description.substring(0, 100)}...`
                              : formData.description
                            : 'Banner description will appear here'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : currentBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
