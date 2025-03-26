import React, { useEffect, useRef, useState } from 'react';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Enter your street address", 
  className = "" 
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [apiStatus, setApiStatus] = useState('loading');
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    // Function to check if the Google Maps API is loaded
    const checkGoogleMapsAPI = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setApiStatus('loaded');
        return true;
      }
      return false;
    };
    
    // Try to initialize immediately if API is already loaded
    if (checkGoogleMapsAPI()) {
      initAutocomplete();
    } else {
      setApiStatus('loading');
      // Listen for the google-maps-loaded event
      const handleGoogleMapsLoaded = () => {
        if (checkGoogleMapsAPI()) {
          initAutocomplete();
        }
      };
      
      window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      
      // Also set up a polling interval as a fallback
      const checkGoogleMapsInterval = setInterval(() => {
        if (checkGoogleMapsAPI()) {
          clearInterval(checkGoogleMapsInterval);
          initAutocomplete();
        }
      }, 500);
      
      return () => {
        window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
        clearInterval(checkGoogleMapsInterval);
      };
    }
  }, []);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      setApiStatus('error');
      return;
    }
    
    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['address_components', 'formatted_address', 'geometry']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        console.log('Google Place API response:', place);
        handlePlaceSelect(place);
      });
      setApiStatus('loaded');
    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
      setApiStatus('error');
    }
  };

  const handlePlaceSelect = (place) => {
    console.log('AddressAutocomplete: Place selected:', place);
    
    if (!place || !place.address_components) {
      console.error('AddressAutocomplete: Invalid place data received');
      return;
    }

    // Extract address components
    let street = '';
    let city = '';
    let state = '';
    let postalCode = '';
    let country = '';
    let latitude = null;
    let longitude = null;

    // Get coordinates if available
    if (place.geometry && place.geometry.location) {
      latitude = place.geometry.location.lat();
      longitude = place.geometry.location.lng();
      console.log('AddressAutocomplete: Extracted coordinates:', { latitude, longitude });
    } else {
      console.warn('AddressAutocomplete: No geometry data in place object');
    }

    // Extract address components
    for (const component of place.address_components) {
      const componentType = component.types[0];

      switch (componentType) {
        case 'street_number': {
          street = `${component.long_name} ${street}`;
          break;
        }
        case 'route': {
          street += component.long_name;
          break;
        }
        case 'locality':
        case 'administrative_area_level_3': {
          city = component.long_name;
          break;
        }
        case 'administrative_area_level_1': {
          state = component.long_name;
          break;
        }
        case 'postal_code': {
          postalCode = component.long_name;
          break;
        }
        case 'country': {
          country = component.long_name;
          break;
        }
      }
    }

    // If street is empty, use the formatted address
    if (!street && place.formatted_address) {
      const formattedAddress = place.formatted_address;
      const commaIndex = formattedAddress.indexOf(',');
      if (commaIndex > 0) {
        street = formattedAddress.substring(0, commaIndex);
      } else {
        street = formattedAddress;
      }
    }

    // Create address data object
    const addressData = {
      street,
      city,
      state,
      postalCode,
      country: country || 'Nigeria',
      latitude,
      longitude
    };

    console.log('AddressAutocomplete: Constructed address data:', addressData);

    // Update input value
    setInputValue(street);
    
    // Call onChange to update the parent form
    if (onChange) {
      const event = {
        target: {
          name: 'street',
          value: street
        }
      };
      onChange(event);
    }
    
    // Call onSelect to pass the full address data to parent
    if (onSelect) {
      onSelect(addressData);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange({
        target: {
          name: 'street',
          value: newValue
        }
      });
    }
  };

  // Function to manually check Google Maps API status
  const checkGoogleMapsStatus = () => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setApiStatus('loaded');
      initAutocomplete();
      return true;
    } else {
      setApiStatus('error');
      return false;
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => {
          // Check API status when input is clicked
          if (apiStatus !== 'loaded') {
            checkGoogleMapsStatus();
          }
        }}
      />
      {apiStatus === 'loading' && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      {apiStatus === 'error' && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2" title="Google Maps API not loaded">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
        </div>
      )}
      {apiStatus === 'loaded' && (
        <div className="text-xs text-gray-500 mt-1">
          Type to search and select an address from the dropdown suggestions
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
