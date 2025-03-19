import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '../components/toast/ToastContainer';

// Create context
const ToastContext = createContext();

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    
    // Automatically remove toast after duration
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, duration);
    
    return id;
  }, []);

  // Remove a specific toast
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};