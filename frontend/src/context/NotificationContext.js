import React, { createContext, useState, useContext, useCallback } from 'react';

// Create the context
const NotificationContext = createContext();

// Create a provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Function to add a notification
  const addNotification = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    
    // Add new notification
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    
    // Remove notification after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, duration);
    
    return id;
  }, []);

  // Function to remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Shorthand functions for different notification types
  const showSuccess = useCallback((message, duration) => 
    addNotification(message, 'success', duration), [addNotification]);
    
  const showError = useCallback((message, duration) => 
    addNotification(message, 'error', duration), [addNotification]);
    
  const showInfo = useCallback((message, duration) => 
    addNotification(message, 'info', duration), [addNotification]);
    
  const showWarning = useCallback((message, duration) => 
    addNotification(message, 'warning', duration), [addNotification]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification,
      showSuccess,
      showError,
      showInfo,
      showWarning
    }}>
      {children}
      
      {/* Notification container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center justify-between max-w-md transform transition-all duration-300 ease-in-out ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            <span>{notification.message}</span>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
