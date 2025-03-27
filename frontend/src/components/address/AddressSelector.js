import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddressService from '../../services/address.service';
import AddressAutocomplete from './AddressAutocomplete';

const AddressSelector = ({ onAddressSelect, selectedAddressId }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    phone: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    country: 'Nigeria'
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchAddresses = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await AddressService.getUserAddresses(user.id);
      if (response.success) {
        setAddresses(response.addresses);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user?.id]);

  useEffect(() => {
    if (selectedAddressId) {
      const address = addresses.find(a => a.id === selectedAddressId);
      if (address) {
        setFormData({
          name: address.name || '',
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          phone: address.phone || '',
          postalCode: address.postalCode || '',
          latitude: address.latitude || '',
          longitude: address.longitude || '',
          country: address.country || 'Nigeria'
        });
      }
    }
  }, [selectedAddressId, addresses]);

  const handleAddressSelect = (address) => {
    if (address && address.id) {
      onAddressSelect(address);
    }
  };

  const handleEditClick = (address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      phone: address.phone || '',
      postalCode: address.postalCode || '',
      latitude: address.latitude || '',
      longitude: address.longitude || '',
      country: address.country || 'Nigeria'
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (addresses.length >= 2 && !editingAddress) {
      setFormError('You can only have 2 addresses. Please edit an existing address.');
      return;
    }

    setFormError('');
    setFormLoading(true);

    try {
      if (!formData.latitude || !formData.longitude) {
        setFormError('Please select an address from the suggestions to get proper coordinates');
        setFormLoading(false);
        return;
      }

      console.log('=== Form Submission ===');
      console.log('Form Data:', JSON.stringify(formData, null, 2));
      
      let response;
      if (editingAddress) {
        response = await AddressService.updateAddress(user.id, editingAddress.id, formData);
      } else {
        response = await AddressService.addAddress(user.id, formData);
      }

      console.log('=== Form Response ===');
      console.log('Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        await fetchAddresses();
        if (response.address) {
          onAddressSelect(response.address);
        }
        setFormData({
          name: '',
          street: '',
          city: '',
          state: '',
          phone: '',
          postalCode: '',
          latitude: '',
          longitude: '',
          country: 'Nigeria'
        });
        setEditingAddress(null);
        setShowAddModal(false);
        setShowEditModal(false);
      } else {
        setFormError(response.message || 'Failed to save address');
      }
    } catch (err) {
      console.error('=== Form Error ===');
      console.error('Error:', err.message);
      if (err.response) {
        console.error('Response Status:', err.response.status);
        console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
      }
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to save address';
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await AddressService.deleteAddress(user.id, addressId);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      if (selectedAddressId === addressId) {
        const remainingAddress = addresses.find(addr => addr.id !== addressId);
        if (remainingAddress) {
          onAddressSelect(remainingAddress);
        }
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      phone: '',
      postalCode: '',
      latitude: '',
      longitude: '',
      country: 'Nigeria'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="h-20 bg-gray-200 rounded mb-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  const AddressModal = ({ isEdit }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button
            onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Home, Office"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <AddressAutocomplete
              value={formData.street}
              onChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  street: value
                }));
              }}
              onSelect={(addressData) => {
                console.log('Selected address data:', addressData);
                setFormData(prev => ({
                  ...prev,
                  street: addressData.street || '',
                  city: addressData.city || prev.city,
                  state: addressData.state || prev.state,
                  country: addressData.country || prev.country,
                  postalCode: addressData.postalCode || prev.postalCode,
                  latitude: addressData.latitude,
                  longitude: addressData.longitude
                }));
              }}
              placeholder="Enter your street address"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="State"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Country"
              required
              defaultValue="Nigeria"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="Postal code"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone number"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={formLoading}
              className={`flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors
                ${formLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {formLoading ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Address')}
            </button>
            <button
              type="button"
              onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
              className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Delivery Address</h3>
      
      {/* Address Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${selectedAddressId === address.id 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 hover:border-gray-300 bg-white'}
            `}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                checked={selectedAddressId === address.id}
                onChange={() => handleAddressSelect(address)}
                className="mt-1 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-900">{address.name || 'Delivery Address'}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(address)}
                      className="text-gray-400 hover:text-primary"
                      title="Edit address"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Delete address"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{address.street}</p>
                <p className="text-sm text-gray-600">{address.city}, {address.state}</p>
                {address.phone && (
                  <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Address Card */}
        {addresses.length < 2 && (
          <div 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
          >
            <div className="text-center">
              <div className="h-8 w-8 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xl">+</span>
              </div>
              <p className="text-sm font-medium text-gray-900">Add New Address</p>
              <p className="text-xs text-gray-500 mt-1">Click to add a new delivery address</p>
            </div>
          </div>
        )}
      </div>

      {addresses.length === 0 && (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No addresses found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-primary hover:text-primary-dark mt-2 inline-block"
          >
            Add your first address
          </button>
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {(showAddModal || showEditModal) && (
        <AddressModal isEdit={showEditModal} />
      )}
    </div>
  );
};

export default AddressSelector;
