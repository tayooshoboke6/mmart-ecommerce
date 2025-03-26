import { useState, useEffect } from 'react';

const useGoogleMapsApi = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setLoadError(new Error('Google Maps API key is missing. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file.'));
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Set handlers
    script.onload = () => {
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      setLoadError(new Error('Failed to load Google Maps API'));
      document.body.removeChild(script);
    };
    
    // Append script to body
    document.body.appendChild(script);
    
    return () => {
      // Clean up
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return { isLoaded, loadError };
};

export default useGoogleMapsApi;
