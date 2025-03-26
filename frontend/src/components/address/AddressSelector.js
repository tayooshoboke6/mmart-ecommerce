import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddressService from '../../services/address.service';
import Button from '../ui/Button';
import AddressAutocomplete from './AddressAutocomplete';

const AddressSelector = ({ onAddressSelect, selectedAddressId }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    isDefault: false,
    phone: '',
    address_type: 'home',
    latitude: null,
    longitude: null
  });

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await AddressService.getUserAddresses(user.id);
        
        console.log('Fetched addresses from backend:', response.addresses);
        
        // Check if addresses have latitude and longitude
        if (response.addresses && response.addresses.length > 0) {
          response.addresses.forEach(address => {
            console.log(`Address ID ${address.id} coordinates:`, {
              latitude: address.latitude,
              longitude: address.longitude,
              hasCoordinates: !!(address.latitude && address.longitude)
            });
          });
        }
        
        setAddresses(response.addresses || []);
        
        // If there's a default address and no selected address yet, select it
        if (!selectedAddressId && response.addresses) {
          const defaultAddress = response.addresses.find(addr => addr.is_default);
          if (defaultAddress) {
            onAddressSelect(defaultAddress.id);
          } else if (response.addresses.length > 0) {
            onAddressSelect(response.addresses[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError('Failed to load your addresses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user, onAddressSelect, selectedAddressId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Preserve all existing form data while updating only the changed field
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission for new address
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await AddressService.addAddress(user.id, formData);
      
      if (!response.success) {
        if (response.maxReached) {
          setError(response.message || 'You can only have 2 addresses. Please edit an existing address.');
          setShowAddForm(false);
          setShowAddressOptions(true);
          return;
        }
      }
      
      // Add the new address to the list
      setAddresses([...addresses, response.address]);
      
      // Select the new address
      onAddressSelect(response.address.id);
      
      // Reset form and hide it
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria',
        isDefault: false,
        phone: '',
        address_type: 'home',
        latitude: null,
        longitude: null
      });
      setShowAddForm(false);
      setShowAddressOptions(false);
      setError(null);
      
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Failed to add your address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for editing address
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !editingAddressId) return;
    
    try {
      setLoading(true);
      const response = await AddressService.updateAddress(user.id, editingAddressId, formData);
      
      // Update the address in the list
      setAddresses(addresses.map(addr => 
        addr.id === editingAddressId ? response.data : addr
      ));
      
      // If the edited address was selected, make sure it stays selected
      if (selectedAddressId === editingAddressId) {
        onAddressSelect(editingAddressId);
      }
      
      // Reset form and hide it
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria',
        isDefault: false,
        phone: '',
        address_type: 'home',
        latitude: null,
        longitude: null
      });
      setShowEditForm(false);
      setEditingAddressId(null);
      setShowAddressOptions(false);
      setError(null);
      
    } catch (err) {
      console.error('Error updating address:', err);
      setError('Failed to update your address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle address autocomplete selection
  const handleAddressSelect = (addressData) => {
    // Preserve existing form data while updating address fields
    setFormData(prevData => ({
      ...prevData,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      country: addressData.country,
      latitude: addressData.latitude || null,
      longitude: addressData.longitude || null
    }));
  };

  // Handle setting an address as default
  const handleSetDefault = async (addressId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await AddressService.setDefaultAddress(user.id, addressId);
      
      // Update the addresses list to reflect the new default
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      })));
      
    } catch (err) {
      console.error('Error setting default address:', err);
      setError('Failed to set default address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an address
  const handleDelete = async (addressId) => {
    if (!user || !window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      setLoading(true);
      await AddressService.deleteAddress(user.id, addressId);
      
      // Remove the address from the list
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      setAddresses(updatedAddresses);
      
      // If the deleted address was selected, select another one
      if (selectedAddressId === addressId) {
        const defaultAddress = updatedAddresses.find(addr => addr.is_default);
        if (defaultAddress) {
          onAddressSelect(defaultAddress.id);
        } else if (updatedAddresses.length > 0) {
          onAddressSelect(updatedAddresses[0].id);
        } else {
          onAddressSelect(null);
        }
      }
      
    } catch (err) {
      console.error('Error deleting address:', err);
      setError('Failed to delete address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle showing address options
  const handleAddAddressClick = () => {
    setShowAddressOptions(true);
  };

  // Handle selecting an existing address
  const handleSelectExistingAddress = (addressId) => {
    onAddressSelect(addressId);
    setShowAddressOptions(false);
  };

  // Handle editing an address
  const handleEditAddress = (address) => {
    setFormData({
      name: address.name || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postal_code || '',
      country: address.country || 'Nigeria',
      isDefault: address.is_default || false,
      phone: address.phone || '',
      address_type: address.address_type || 'home',
      latitude: address.latitude || null,
      longitude: address.longitude || null
    });
    setEditingAddressId(address.id);
    setShowEditForm(true);
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 AddressSelector">
      <h3 className="text-lg font-semibold">Delivery Address</h3>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {addresses.length > 0 && !showAddressOptions && !showEditForm ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`border rounded-md p-4 cursor-pointer transition-all ${
                selectedAddressId === address.id 
                  ? 'border-primary bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onAddressSelect(address.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">{address.name}</span>
                    {address.is_default && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mt-1">{address.street}</p>
                  <p className="text-gray-700">{address.city}, {address.state} {address.postal_code}</p>
                  <p className="text-gray-700">{address.country}</p>
                  {address.phone && <p className="text-gray-700 mt-1">Phone: {address.phone}</p>}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAddress(address);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  {!address.is_default && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.id);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Set as Default
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(address.id);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showAddressOptions && !showEditForm && (
          <div className="text-gray-500">
            {addresses.length === 0 ? "You don't have any saved addresses yet." : ""}
          </div>
        )
      )}
      
      {showAddressOptions ? (
        <div className="border border-gray-200 rounded-md p-4">
          <h4 className="font-medium mb-4">Select Delivery Address</h4>
          
          {addresses.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2">Your Saved Addresses</h5>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {addresses.map((address) => (
                  <div 
                    key={address.id} 
                    className="border rounded-md p-3 cursor-pointer hover:border-primary hover:bg-blue-50"
                  >
                    <div className="flex justify-between">
                      <div onClick={() => handleSelectExistingAddress(address.id)}>
                        <div className="flex items-center mb-1">
                          <span className="font-medium">{address.name}</span>
                          {address.is_default && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">{address.street}</p>
                        <p className="text-gray-700 text-sm">{address.city}, {address.state} {address.postal_code}</p>
                        {address.phone && <p className="text-gray-700 text-sm">Phone: {address.phone}</p>}
                      </div>
                      <div>
                        <button 
                          onClick={() => handleEditAddress(address)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {addresses.length < 2 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h5 className="font-medium mb-2">Or Add a New Address</h5>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAddForm(true)}
                    className="w-full"
                  >
                    Enter New Address
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {showAddForm ? (
            <div className="mt-4">
              <h5 className="font-medium mb-3">New Address Details</h5>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="street" className="block text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <AddressAutocomplete
                      value={formData.street}
                      onChange={handleInputChange}
                      onSelect={handleAddressSelect}
                      placeholder="Enter your street address"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="postalCode" className="block text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address_type" className="block text-gray-700 mb-1">
                      Address Type
                    </label>
                    <select
                      id="address_type"
                      name="address_type"
                      value={formData.address_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Set as default address</span>
                  </label>
                </div>
                
                <div className="mt-4 flex space-x-3">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                  >
                    Save Address
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          ) : addresses.length === 0 && (
            <div>
              <p className="text-gray-500 mb-4">You don't have any saved addresses yet. Please add a new address.</p>
              <Button
                variant="primary"
                onClick={() => setShowAddForm(true)}
                className="w-full"
              >
                Add New Address
              </Button>
            </div>
          )}
          
          {addresses.length > 0 && !showAddForm && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowAddressOptions(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      ) : showEditForm ? (
        <div className="border border-gray-200 rounded-md p-4">
          <h4 className="font-medium mb-3">Edit Address</h4>
          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="street" className="block text-gray-700 mb-1">
                  Street Address *
                </label>
                <AddressAutocomplete
                  value={formData.street}
                  onChange={handleInputChange}
                  onSelect={handleAddressSelect}
                  placeholder="Enter your street address"
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="postalCode" className="block text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="address_type" className="block text-gray-700 mb-1">
                  Address Type
                </label>
                <select
                  id="address_type"
                  name="address_type"
                  value={formData.address_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Set as default address</span>
              </label>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                Update Address
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingAddressId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={handleAddAddressClick}
          className="mt-3"
        >
          {selectedAddressId ? "Change Address" : "Add Address"}
        </Button>
      )}
    </div>
  );
};

export default AddressSelector;
