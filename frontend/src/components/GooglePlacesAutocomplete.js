import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.$status === 'loaded' ? 'green' : props.$status === 'loading' ? 'orange' : 'red'};
`;

const GooglePlacesAutocomplete = ({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Enter an address", 
  className = "" 
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [apiStatus, setApiStatus] = useState('loading');

  useEffect(() => {
    console.log('GooglePlacesAutocomplete mounted');
    console.log('Google object available:', !!window.google);
    console.log('Google Maps available:', !!(window.google && window.google.maps));
    console.log('Google Places available:', !!(window.google && window.google.maps && window.google.maps.places));
    
    // Function to check if the Google Maps API is loaded
    const checkGoogleMapsAPI = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps Places API is available');
        setApiStatus('loaded');
        return true;
      }
      console.warn('Google Maps Places API not available yet');
      return false;
    };
    
    // Try to initialize immediately if API is already loaded
    if (checkGoogleMapsAPI()) {
      initAutocomplete();
    } else {
      setApiStatus('loading');
      // Listen for the google-maps-loaded event
      const handleGoogleMapsLoaded = () => {
        console.log('Received google-maps-loaded event');
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
      console.error('Cannot initialize autocomplete - missing required objects');
      console.log('inputRef.current:', !!inputRef.current);
      console.log('window.google:', !!window.google);
      console.log('window.google.maps:', !!(window.google && window.google.maps));
      console.log('window.google.maps.places:', !!(window.google && window.google.maps && window.google.maps.places));
      setApiStatus('error');
      return;
    }
    
    try {
      console.log('Creating new Autocomplete instance');
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['address_components', 'formatted_address', 'geometry']
      });

      console.log('Adding place_changed listener');
      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
      console.log('Places Autocomplete initialized successfully');
      setApiStatus('loaded');
    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
      setApiStatus('error');
    }
  };

  const handlePlaceSelect = () => {
    try {
      console.log('Place changed event triggered');
      const place = autocompleteRef.current.getPlace();
      console.log('Selected place:', place);
      
      if (!place.geometry) {
        console.warn('No details available for this place');
        return;
      }

      console.log('Raw place data:', {
        formatted_address: place.formatted_address,
        address_components: place.address_components,
        geometry: place.geometry
      });

      const addressComponents = {};
      if (place.address_components && place.address_components.length > 0) {
        console.log('Processing address components...');
        place.address_components.forEach(component => {
          const types = component.types;
          console.log(`Component: ${component.long_name}, Types: ${types.join(', ')}`);
          
          // Check all types for each component
          if (types.includes('street_number')) {
            addressComponents.street_number = component.long_name;
            console.log(`Found street_number: ${component.long_name}`);
          }
          if (types.includes('route')) {
            addressComponents.route = component.long_name;
            console.log(`Found route: ${component.long_name}`);
          }
          if (types.includes('locality')) {
            addressComponents.city = component.long_name;
            console.log(`Found city (locality): ${component.long_name}`);
          } else if (types.includes('administrative_area_level_2') && !addressComponents.city) {
            // Fallback for city if locality is not available
            addressComponents.city = component.long_name;
            console.log(`Found city (administrative_area_level_2): ${component.long_name}`);
          } else if (types.includes('sublocality_level_1') && !addressComponents.city) {
            // Additional fallback for Nigerian addresses
            addressComponents.city = component.long_name;
            console.log(`Found city (sublocality_level_1): ${component.long_name}`);
          }
          if (types.includes('administrative_area_level_1')) {
            addressComponents.state = component.long_name;
            addressComponents.state_short = component.short_name;
            console.log(`Found state: ${component.long_name} (${component.short_name})`);
          }
          if (types.includes('postal_code')) {
            addressComponents.postal_code = component.long_name;
            console.log(`Found postal_code: ${component.long_name}`);
          }
          if (types.includes('country')) {
            addressComponents.country = component.long_name;
            addressComponents.country_code = component.short_name;
            console.log(`Found country: ${component.long_name} (${component.short_name})`);
          }
          if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
            addressComponents.sublocality = component.long_name;
            console.log(`Found sublocality: ${component.long_name}`);
          }
        });
      }

      // For Nigerian addresses, try to extract city from formatted_address if not found
      if (!addressComponents.city && place.formatted_address && place.formatted_address.includes('Nigeria')) {
        console.log('City not found in components, attempting to extract from formatted address...');
        const addressParts = place.formatted_address.split(',').map(part => part.trim());
        console.log('Address parts:', addressParts);
        
        // Usually the city is the second-to-last part before the country
        if (addressParts.length > 2) {
          // Try to find Lagos, Abuja, or other major cities
          const potentialCities = ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City', 'Lekki'];
          console.log('Searching for known Nigerian cities:', potentialCities);
          
          for (const part of addressParts) {
            for (const city of potentialCities) {
              if (part.includes(city)) {
                addressComponents.city = city;
                console.log(`Found city in address parts: ${city}`);
                break;
              }
            }
            if (addressComponents.city) break;
          }
          
          // If still no city found, use the second-to-last part
          if (!addressComponents.city && addressParts.length > 2) {
            addressComponents.city = addressParts[addressParts.length - 2];
            console.log(`Using second-to-last part as city: ${addressComponents.city}`);
          }
        }
      }

      // Log all extracted components for debugging
      console.log('Final extracted address components:', addressComponents);

      // Create address object with fallbacks for missing components
      const addressLine1 = addressComponents.street_number 
        ? `${addressComponents.street_number} ${addressComponents.route || ''}`
        : addressComponents.route || place.formatted_address.split(',')[0] || '';
      
      console.log(`Building address_line1: ${addressLine1}`);
      
      const addressData = {
        formatted_address: place.formatted_address || '',
        address_line1: addressLine1,
        address_line2: addressComponents.sublocality || '',
        city: addressComponents.city || '',
        state: addressComponents.state || '',
        postal_code: addressComponents.postal_code || '',
        country: addressComponents.country || 'Nigeria',
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      };

      console.log('Final processed address data:', addressData);
      
      if (onSelect) {
        console.log('Calling onSelect callback with data:', addressData);
        onSelect(addressData);
      }
      
      // Don't call onChange when a place is selected to avoid overriding the form state
      // The onSelect handler will take care of updating all form fields
      // if (onChange) {
      //   console.log('Calling onChange callback');
      //   onChange(place.formatted_address || '');
      // }
    } catch (error) {
      console.error('Error handling place selection:', error);
    }
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // Function to manually check Google Maps API status
  const checkGoogleMapsStatus = () => {
    console.log('Manual check of Google Maps API status:');
    console.log('window.google exists:', !!window.google);
    console.log('window.google.maps exists:', !!(window.google && window.google.maps));
    console.log('window.google.maps.places exists:', !!(window.google && window.google.maps && window.google.maps.places));
    
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps Places API is fully loaded');
      setApiStatus('loaded');
      initAutocomplete();
      return true;
    } else {
      console.error('Google Maps Places API is not fully loaded');
      setApiStatus('error');
      return false;
    }
  };

  return (
    <InputWrapper className={className}>
      <StyledInput
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        onClick={() => {
          // Check API status when input is clicked
          if (apiStatus !== 'loaded') {
            checkGoogleMapsStatus();
          }
        }}
      />
      <StatusIndicator $status={apiStatus} title={`API Status: ${apiStatus}`} />
    </InputWrapper>
  );
};

export default GooglePlacesAutocomplete;