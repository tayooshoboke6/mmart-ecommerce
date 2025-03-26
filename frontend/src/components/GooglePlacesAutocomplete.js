import React, { useEffect, useRef, useState } from 'react';
import useGoogleMapsApi from '../hooks/useGoogleMapsApi';

const GooglePlacesAutocomplete = ({ onPlaceSelected, placeholder, className, required, value, onChange }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const { isLoaded, loadError } = useGoogleMapsApi();
  const [inputValue, setInputValue] = useState(value || '');

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  // Initialize autocomplete when Google Maps API is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current) {
      return;
    }

    const options = {
      componentRestrictions: { country: 'ng' }, // Restrict to Nigeria, change as needed
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
    };

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, options);
    
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        console.error('No details available for input: ', place.name);
        return;
      }

      // Extract address components
      const addressComponents = {};
      place.address_components.forEach(component => {
        const type = component.types[0];
        if (type === 'street_number') {
          addressComponents.streetNumber = component.long_name;
        } else if (type === 'route') {
          addressComponents.street = component.long_name;
        } else if (type === 'locality') {
          addressComponents.city = component.long_name;
        } else if (type === 'administrative_area_level_1') {
          addressComponents.state = component.long_name;
        } else if (type === 'postal_code') {
          addressComponents.postalCode = component.long_name;
        } else if (type === 'country') {
          addressComponents.country = component.long_name;
        }
      });

      // Create formatted address components
      const addressData = {
        formattedAddress: place.formatted_address,
        streetNumber: addressComponents.streetNumber || '',
        street: addressComponents.street || '',
        city: addressComponents.city || '',
        state: addressComponents.state || '',
        postalCode: addressComponents.postalCode || '',
        country: addressComponents.country || '',
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      };

      // Update the input value
      setInputValue(place.formatted_address);
      
      // Call the callback with the selected place data
      if (onPlaceSelected) {
        onPlaceSelected(addressData);
      }
    });

    return () => {
      // Clean up the autocomplete when component unmounts
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onPlaceSelected]);

  if (loadError) {
    console.error('Error loading Google Maps API:', loadError);
    // Fallback to regular input if Google Maps fails to load
    return (
      <input
        type="text"
        placeholder={placeholder}
        className={className}
        required={required}
        value={inputValue}
        onChange={handleInputChange}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={isLoaded ? placeholder : 'Loading address suggestions...'}
      className={className}
      required={required}
      value={inputValue}
      onChange={handleInputChange}
      disabled={!isLoaded}
    />
  );
};

export default GooglePlacesAutocomplete;
