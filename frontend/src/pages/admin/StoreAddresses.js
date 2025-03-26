import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import GooglePlacesAutocomplete from '../../components/GooglePlacesAutocomplete';
import GeofenceMap from '../../components/GeofenceMap';
import api from '../../services/api';

const StoreAddresses = () => {
  const [storeAddresses, setStoreAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('address');
  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nigeria',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    is_pickup_location: false,
    is_delivery_location: false,
    is_active: true,
    opening_hours: '',
    notes: '',
    delivery_base_fee: '0',
    delivery_price_per_km: '0',
    delivery_radius_km: '10',
    free_delivery_threshold: '0',
    minimum_order_value: '0',
    offers_free_delivery: false,
    geofence_coordinates: '',
    drawing_mode: false,
    formatted_address: ''
  });

  // Fetch store addresses
  const fetchStoreAddresses = async () => {
    setLoading(true);
    try {
      console.log('Fetching store addresses from:', '/admin/store-addresses');
      const response = await api.get('/admin/store-addresses');
      console.log('Store addresses response:', response);
      if (response.data.status === 'success') {
        setStoreAddresses(response.data.data);
      } else {
        console.error('Failed response:', response.data);
        toast.error('Failed to fetch store addresses');
      }
    } catch (error) {
      console.error('Error fetching store addresses:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      toast.error(`Error fetching store addresses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Authentication check:', { 
      hasToken: !!token, 
      tokenPreview: token ? `${token.substring(0, 15)}...` : null,
      hasUser: !!user
    });
    
    fetchStoreAddresses();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Open modal for creating a new address
  const handleAddNew = () => {
    setCurrentAddress(null);
    setActiveTab('address');
    setFormData({
      name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Nigeria',
      phone: '',
      email: '',
      latitude: '',
      longitude: '',
      is_pickup_location: false,
      is_delivery_location: false,
      is_active: true,
      opening_hours: '',
      notes: '',
      delivery_base_fee: '0',
      delivery_price_per_km: '0',
      delivery_radius_km: '10',
      free_delivery_threshold: '0',
      minimum_order_value: '0',
      offers_free_delivery: false,
      geofence_coordinates: '',
      drawing_mode: false,
      formatted_address: ''
    });
    setShowModal(true);
  };

  // Open modal for editing an existing address
  const handleEdit = (address) => {
    setCurrentAddress(address);
    setActiveTab('address');
    setFormData({
      name: address.name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code || '',
      country: address.country || 'Nigeria',
      phone: address.phone || '',
      email: address.email || '',
      latitude: address.latitude || '',
      longitude: address.longitude || '',
      is_pickup_location: address.is_pickup_location,
      is_delivery_location: address.is_delivery_location,
      is_active: address.is_active,
      opening_hours: address.opening_hours || '',
      notes: address.notes || '',
      delivery_base_fee: address.delivery_base_fee || '0',
      delivery_price_per_km: address.delivery_price_per_km || '0',
      delivery_radius_km: address.delivery_radius_km || '10',
      free_delivery_threshold: address.free_delivery_threshold || '0',
      minimum_order_value: address.minimum_order_value || '0',
      offers_free_delivery: address.offers_free_delivery || false,
      geofence_coordinates: address.geofence_coordinates || '',
      drawing_mode: address.drawing_mode || false,
      formatted_address: address.formatted_address || ''
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (currentAddress) {
        // Update existing address
        response = await api.put(`/admin/store-addresses/${currentAddress.id}`, formData);
        if (response.data.status === 'success') {
          toast.success('Store address updated successfully');
        }
      } else {
        // Create new address
        response = await api.post('/admin/store-addresses', formData);
        if (response.data.status === 'success') {
          toast.success('Store address created successfully');
        }
      }
      
      setShowModal(false);
      fetchStoreAddresses();
    } catch (error) {
      console.error('Error saving store address:', error);
      toast.error('Error saving store address');
    }
  };

  // Handle address deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this store address?')) {
      try {
        const response = await api.delete(`/admin/store-addresses/${id}`);
        if (response.data.status === 'success') {
          toast.success('Store address deleted successfully');
          fetchStoreAddresses();
        } else {
          toast.error(response.data.message || 'Failed to delete store address');
        }
      } catch (error) {
        console.error('Error deleting store address:', error);
        toast.error('Error deleting store address');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <style>
        {`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #ffffff;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #3b82f6;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          border-color: #e5e7eb;
          transition: all 0.3s;
        }
        .toggle-label {
          display: block;
          overflow: hidden;
          cursor: pointer;
          border-radius: 9999px;
          transition: background-color 0.3s;
        }
        `}
      </style>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Store Locations</h1>
        <button
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
          onClick={handleAddNew}
        >
          <FaPlus className="mr-2" /> Add New Location
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City/State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {storeAddresses.length > 0 ? (
                storeAddresses.map((address) => (
                  <tr key={address.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-primary mr-2" />
                        <div className="text-sm font-medium text-gray-900">{address.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {address.formatted_address ? (
                        <div>
                          <div>{address.formatted_address}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}
                            {address.city && `, ${address.city}`}
                            {address.state && `, ${address.state}`}
                            {address.postal_code && ` ${address.postal_code}`}
                          </div>
                        </div>
                      ) : (
                        <div>
                          {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}
                          <br />
                          {address.city}{address.state ? `, ${address.state}` : ''}
                          {address.postal_code && ` ${address.postal_code}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{address.city}, {address.state}</div>
                      {address.postal_code && (
                        <div className="text-sm text-gray-500">{address.postal_code}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {address.phone && (
                        <div className="text-sm text-gray-900">{address.phone}</div>
                      )}
                      {address.email && (
                        <div className="text-sm text-gray-500">{address.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${address.is_pickup_location ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {address.is_pickup_location ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${address.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {address.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(address)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No store addresses found. Click "Add New Location" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding/editing store addresses */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-3xl mx-4">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">
                {currentAddress ? 'Edit Store Location' : 'Add New Store Location'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4">
                {/* Tabs */}
                <div className="flex border-b mb-4">
                  <button
                    type="button"
                    className={`py-2 px-4 font-medium ${activeTab === 'address' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('address')}
                  >
                    Address Information
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-4 font-medium ${activeTab === 'delivery' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('delivery')}
                  >
                    Delivery Settings
                  </button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto">
                  {activeTab === 'address' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Debug output */}
                      <div className="col-span-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                        <strong>Debug - Form Data:</strong>
                        <pre>{JSON.stringify(formData, null, 2)}</pre>
                      </div>
                      
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location Name*
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Address Line 1 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 1*
                        </label>
                        <GooglePlacesAutocomplete
                          value={formData.address_line1}
                          onChange={(value) => {
                            // Only update address_line1 when typing, not when selecting from dropdown
                            if (!value.includes(',')) {
                              setFormData({...formData, address_line1: value});
                            }
                          }}
                          onSelect={(addressData) => {
                            console.log('Address selected in StoreAddresses:', addressData);
                            // Ensure all fields are updated with the selected address data
                            setFormData(prevData => {
                              const newData = {
                                ...prevData,
                                address_line1: addressData.address_line1 || prevData.address_line1,
                                address_line2: addressData.address_line2 || prevData.address_line2,
                                formatted_address: addressData.formatted_address || prevData.formatted_address,
                                city: addressData.city || prevData.city,
                                state: addressData.state || prevData.state,
                                postal_code: addressData.postal_code || prevData.postal_code,
                                country: addressData.country || prevData.country,
                                latitude: addressData.latitude?.toString() || prevData.latitude,
                                longitude: addressData.longitude?.toString() || prevData.longitude
                              };
                              console.log('Previous form data:', prevData);
                              console.log('New form data after update:', newData);
                              return newData;
                            });
                          }}
                          placeholder="Enter address"
                          className="w-full"
                        />
                      </div>
                      
                      {/* Address Line 2 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 2
                        </label>
                        <input
                          type="text"
                          name="address_line2"
                          value={formData.address_line2}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Full Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Address (from Google)
                        </label>
                        <input
                          type="text"
                          name="formatted_address"
                          value={formData.formatted_address}
                          onChange={handleChange}
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                        <small className="text-muted">This field is automatically populated from Google Places</small>
                      </div>
                      
                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* State */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Postal Code */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Country */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Latitude */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="0.0000001"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Longitude */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="0.0000001"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Opening Hours */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Hours
                        </label>
                        <textarea
                          name="opening_hours"
                          value={formData.opening_hours}
                          onChange={handleChange}
                          rows="2"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="e.g. Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed"
                        ></textarea>
                      </div>
                      
                      {/* Notes */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows="2"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        ></textarea>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'delivery' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="mb-2">
                        <h3 className="text-lg font-medium text-gray-800">Delivery Settings</h3>
                        <p className="text-sm text-gray-600">Configure delivery options for this store location</p>
                      </div>
                      
                      {/* Store Active, Pickup Available, Delivery Available */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="flex items-center">
                            <label className="block text-sm font-medium text-gray-700 mr-2">
                              Store Active
                            </label>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center">
                            <label className="block text-sm font-medium text-gray-700 mr-2">
                              Pickup Available
                            </label>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                name="is_pickup_location"
                                checked={formData.is_pickup_location}
                                onChange={handleChange}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center">
                            <label className="block text-sm font-medium text-gray-700 mr-2">
                              Delivery Available
                            </label>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                name="is_delivery_location"
                                checked={formData.is_delivery_location}
                                onChange={handleChange}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Delivery Radius */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Radius (km)
                        </label>
                        <input
                          type="number"
                          step="1"
                          name="delivery_radius_km"
                          value={formData.delivery_radius_km}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        />
                      </div>
                      
                      {/* Drawing Mode */}
                      <div>
                        <div className="flex items-center">
                          <label className="block text-sm font-medium text-gray-700 mr-2">
                            Drawing Mode
                          </label>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              name="drawing_mode"
                              checked={formData.drawing_mode}
                              onChange={handleChange}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                      
                      {/* Delivery Zone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Zone
                        </label>
                        <div className="border border-gray-300 rounded-md p-4">
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Manual Geofence Coordinates Entry
                            </label>
                            <textarea
                              name="geofence_coordinates"
                              value={formData.geofence_coordinates}
                              onChange={handleChange}
                              rows="4"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                              placeholder="(longitude, latitude)... and form a closed polygon."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">
                              Make sure coordinates are in the format (longitude, latitude)... and form a closed polygon.
                            </p>
                          </div>
                          
                          {/* Map for drawing geofence */}
                          <GeofenceMap
                            initialCoordinates={[]}
                            onCoordinatesChange={(coords) => 
                              setFormData({...formData, geofence_coordinates: coords})
                            }
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Delivery Base Fee */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base Delivery Fee (₦)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₦</span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              name="delivery_base_fee"
                              value={formData.delivery_base_fee}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>
                        
                        {/* Delivery Price Per KM */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fee Per Kilometer (₦)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₦</span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              name="delivery_price_per_km"
                              value={formData.delivery_price_per_km}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>
                        
                        {/* Free Delivery Threshold */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Free Delivery Threshold (₦)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₦</span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              name="free_delivery_threshold"
                              value={formData.free_delivery_threshold}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>
                        
                        {/* Minimum Order Value */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Order Value (₦)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₦</span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              name="minimum_order_value"
                              value={formData.minimum_order_value}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md"
                >
                  {currentAddress ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreAddresses;
