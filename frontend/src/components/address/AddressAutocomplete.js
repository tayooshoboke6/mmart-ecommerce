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

  const initAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      setApiStatus('error');
      return;
    }
    
    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['address_components', 'formatted_address', 'geometry'],
        componentRestrictions: { country: 'NG' }
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        handlePlaceSelect(place);
      });
      setApiStatus('loaded');
    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
      setApiStatus('error');
    }
  };

  const handlePlaceSelect = (place) => {
    console.log('Selected place:', place);

    if (!place.geometry) {
      console.log('No geometry for selected place');
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    console.log('Location coordinates:', { lat, lng });

    let addressData = {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      latitude: lat,
      longitude: lng
    };

    // Extract address components
    place.address_components.forEach(component => {
      const type = component.types[0];
      console.log('Address component:', { type, value: component.long_name });
      
      if (type === 'street_number') {
        addressData.street = component.long_name;
      } else if (type === 'route') {
        addressData.street = addressData.street 
          ? `${addressData.street} ${component.long_name}`
          : component.long_name;
      } else if (type === 'sublocality_level_1' || type === 'locality') {
        addressData.city = component.long_name;
      } else if (type === 'administrative_area_level_1') {
        addressData.state = component.long_name;
      } else if (type === 'country') {
        addressData.country = component.long_name;
        console.log('Found country:', component.long_name);
      } else if (type === 'postal_code') {
        addressData.postalCode = component.long_name;
        console.log('Found postal code:', component.long_name);
      }
    });

    // Use formatted_address as fallback for street if not found in components
    if (!addressData.street && place.formatted_address) {
      addressData.street = place.formatted_address.split(',')[0];
    }

    console.log('Processed address data:', addressData);
    onSelect(addressData);
    
    // Update the input value with the street address
    if (onChange) {
      onChange(addressData.street);
    }
  };

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {apiStatus === 'error' && (
        <div className="text-red-500 text-sm mt-1">
          Failed to load address suggestions
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
