import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaTrash } from 'react-icons/fa';

const GeofenceMap = ({ 
  initialCoordinates = [], 
  onCoordinatesChange, 
  latitude, 
  longitude 
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [coordinates, setCoordinates] = useState(initialCoordinates);
  const [polygons, setPolygons] = useState([]);
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const storeMarkerRef = useRef(null);

  // Update map center and marker when latitude/longitude change
  useEffect(() => {
    if (mapInstanceRef.current && latitude && longitude) {
      const center = { 
        lat: parseFloat(latitude), 
        lng: parseFloat(longitude) 
      };
      
      console.log('Updating map center to:', center);
      
      // Update map center
      mapInstanceRef.current.setCenter(center);
      
      // Update or create store marker
      if (storeMarkerRef.current) {
        storeMarkerRef.current.setPosition(center);
      } else if (window.google && window.google.maps) {
        const storeMarker = new window.google.maps.Marker({
          position: center,
          map: mapInstanceRef.current,
          title: 'Store Location',
          animation: window.google.maps.Animation.DROP,
          zIndex: 2
        });
        storeMarkerRef.current = storeMarker;
      }
    }
  }, [latitude, longitude]);

  // Initialize map when component mounts
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !window.google.maps) {
        console.log('Google Maps not loaded yet, waiting...');
        setTimeout(initMap, 500);
        return;
      }

      try {
        console.log('Initializing map with coordinates:', latitude, longitude);
        const center = { 
          lat: parseFloat(latitude) || 6.5244, 
          lng: parseFloat(longitude) || 3.3792 
        };

        // Create map instance
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 14,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: window.google.maps.ControlPosition.TOP_LEFT,
          },
          fullscreenControl: false,
        });
        mapInstanceRef.current = mapInstance;

        // Add a marker for the store location
        if (latitude && longitude) {
          const storeMarker = new window.google.maps.Marker({
            position: center,
            map: mapInstance,
            title: 'Store Location',
            animation: window.google.maps.Animation.DROP,
            zIndex: 2
          });
          storeMarkerRef.current = storeMarker;
        }

        // Check if drawing library is available
        if (window.google.maps.drawing) {
          // Create drawing manager
          const drawingManager = new window.google.maps.drawing.DrawingManager({
            drawingMode: null,
            drawingControl: false,
            polygonOptions: {
              fillColor: '#4285F4',
              fillOpacity: 0.3,
              strokeWeight: 2,
              strokeColor: '#4285F4',
              clickable: true,
              editable: true,
              zIndex: 1
            }
          });
          drawingManagerRef.current = drawingManager;
          drawingManager.setMap(mapInstance);

          // Add event listener for polygon complete
          window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon) => {
            setDrawingMode(false);
            drawingManager.setDrawingMode(null);
            
            // Add event listeners to track polygon changes
            const path = polygon.getPath();
            const updatePolygonCoordinates = () => {
              const polygonCoords = [];
              for (let i = 0; i < path.getLength(); i++) {
                const point = path.getAt(i);
                polygonCoords.push({
                  lat: point.lat(),
                  lng: point.lng()
                });
              }
              
              // Update coordinates state and call the callback
              const newCoordinates = [...coordinates, polygonCoords];
              setCoordinates(newCoordinates);
              setPolygons([...polygons, polygon]);
              
              if (onCoordinatesChange) {
                const formattedCoords = formatCoordinatesForOutput(newCoordinates);
                onCoordinatesChange(formattedCoords);
              }
            };
            
            // Listen for changes to the polygon
            window.google.maps.event.addListener(path, 'insert_at', updatePolygonCoordinates);
            window.google.maps.event.addListener(path, 'remove_at', updatePolygonCoordinates);
            window.google.maps.event.addListener(path, 'set_at', updatePolygonCoordinates);
            
            // Initial update
            updatePolygonCoordinates();
          });
        } else {
          console.error('Google Maps Drawing library not loaded. Make sure to include it in the API URL.');
          // Still set map as loaded even if drawing isn't available
          setMapLoaded(true);
        }

        // Load existing polygons if any
        if (initialCoordinates && initialCoordinates.length > 0) {
          loadExistingPolygons(initialCoordinates, mapInstance);
        }

        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Check if Google Maps is loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Add event listener for Google Maps loaded event
      const handleGoogleMapsLoaded = () => {
        console.log('Google Maps loaded event detected');
        initMap();
      };
      
      window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      
      // Cleanup
      return () => {
        window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      };
    }
  }, [latitude, longitude]);

  // Load existing polygons from coordinates
  const loadExistingPolygons = (coords, mapInstance) => {
    try {
      const newPolygons = [];
      
      coords.forEach(polygonCoords => {
        if (!Array.isArray(polygonCoords) || polygonCoords.length < 3) {
          console.warn('Invalid polygon coordinates:', polygonCoords);
          return;
        }
        
        // Convert coordinates to LatLng objects
        const path = polygonCoords.map(coord => 
          new window.google.maps.LatLng(coord.lat, coord.lng)
        );
        
        // Create polygon
        const polygon = new window.google.maps.Polygon({
          paths: path,
          fillColor: '#4285F4',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#4285F4',
          clickable: true,
          editable: true,
          map: mapInstance
        });
        
        // Add event listeners to track polygon changes
        const updatePolygonCoordinates = () => {
          const updatedCoords = [];
          const allPolygons = [...newPolygons, ...polygons];
          
          allPolygons.forEach(poly => {
            const path = poly.getPath();
            const polygonCoords = [];
            
            for (let i = 0; i < path.getLength(); i++) {
              const point = path.getAt(i);
              polygonCoords.push({
                lat: point.lat(),
                lng: point.lng()
              });
            }
            
            if (polygonCoords.length >= 3) {
              updatedCoords.push(polygonCoords);
            }
          });
          
          setCoordinates(updatedCoords);
          
          if (onCoordinatesChange) {
            const formattedCoords = formatCoordinatesForOutput(updatedCoords);
            onCoordinatesChange(formattedCoords);
          }
        };
        
        const path2 = polygon.getPath();
        window.google.maps.event.addListener(path2, 'insert_at', updatePolygonCoordinates);
        window.google.maps.event.addListener(path2, 'remove_at', updatePolygonCoordinates);
        window.google.maps.event.addListener(path2, 'set_at', updatePolygonCoordinates);
        
        newPolygons.push(polygon);
      });
      
      setPolygons([...polygons, ...newPolygons]);
    } catch (error) {
      console.error('Error loading existing polygons:', error);
    }
  };

  // Format coordinates for output
  const formatCoordinatesForOutput = (coords) => {
    let output = '';
    
    coords.forEach((polygon, polyIndex) => {
      polygon.forEach((point, pointIndex) => {
        output += `(${point.lat}, ${point.lng})`;
        if (pointIndex < polygon.length - 1) {
          output += ', ';
        }
      });
      
      if (polyIndex < coords.length - 1) {
        output += '\n';
      }
    });
    
    return output;
  };

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    if (!drawingManagerRef.current) return;
    
    const newMode = !drawingMode;
    setDrawingMode(newMode);
    
    if (newMode) {
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    } else {
      drawingManagerRef.current.setDrawingMode(null);
    }
  };

  // Clear all shapes
  const clearAllShapes = () => {
    // Remove all polygons from the map
    polygons.forEach(polygon => {
      polygon.setMap(null);
    });
    
    // Reset state
    setPolygons([]);
    setCoordinates([]);
    
    // Notify parent component
    if (onCoordinatesChange) {
      onCoordinatesChange('');
    }
  };

  // Copy current coordinates to clipboard
  const copyCoordinates = () => {
    const formattedCoords = formatCoordinatesForOutput(coordinates);
    navigator.clipboard.writeText(formattedCoords)
      .then(() => {
        alert('Coordinates copied to clipboard');
      })
      .catch(err => {
        console.error('Could not copy coordinates: ', err);
      });
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={toggleDrawingMode}
            className={`px-3 py-1 text-sm rounded-md ${drawingMode 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {drawingMode ? 'Cancel Drawing' : 'Draw Polygon'}
          </button>
          <button
            type="button"
            onClick={clearAllShapes}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Clear All Shapes
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={copyCoordinates}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Copy Current Coordinates
          </button>
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-lg border border-gray-300"
      ></div>
      
      <div className="mt-2 text-sm text-gray-600">
        Use the drawing tools in the top center of the map to draw a polygon or circle. Click on the map to add points, then click the first point to complete the polygon.
      </div>
      
      {coordinates.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700">Geofence Coordinates:</h3>
          <div className="mt-1">
            {coordinates.map((polygon, polyIndex) => (
              <div key={polyIndex} className="text-xs text-gray-600 mb-1">
                Polygon {polyIndex + 1}: {polygon.length} points
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeofenceMap;
