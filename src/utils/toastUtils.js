import { toast } from 'react-toastify';

// Success toast
export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

// Error toast
export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

// Info toast
export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

// Warning toast
export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

// Simplified function to extract error message from API response
export const extractErrorMessage = (error) => {
  console.log('Error:', error);
  
  if (!error) return 'An unknown error occurred';
  
  // Check if we have a response with data
  if (error.response?.data) {
    const data = error.response.data;
    
    // If there's a message field (your new structure)
    if (data.message) {
      return data.message;
    }
    
    // If there's a date field error (legacy format)
    if (data.date) {
      return data.date;
    }
    
    // If there's an employee_id field error
    if (data.employee_id) {
      return data.employee_id;
    }
    
    // If it's a string
    if (typeof data === 'string') {
      return data;
    }
  }
  
  // Network errors
  if (error.request) {
    return 'Network error - please check your connection';
  }
  
  // Default
  return error.message || 'An unexpected error occurred';
};

// Helper function to handle legacy error formats
const handleLegacyErrorFormat = (data) => {
  if (typeof data === 'string') return data;
  
  if (data.date) return data.date;
  if (data.employee_id) return data.employee_id;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  
  if (typeof data === 'object') {
    const messages = Object.values(data).flat();
    if (messages.length > 0) {
      return messages.join('. ');
    }
  }
  
  return JSON.stringify(data);
};

// Get status code from error
export const getStatusCode = (error) => {
  if (error.response?.data?.status_code) {
    return error.response.data.status_code;
  }
  return error.response?.status || 500;
};

// Check if error is a 400 error
export const isBadRequest = (error) => {
  const statusCode = getStatusCode(error);
  return statusCode === 400;
};

// Check if error is a 404 error
export const isNotFound = (error) => {
  const statusCode = getStatusCode(error);
  return statusCode === 404;
};

// Check if error is a 500 error
export const isServerError = (error) => {
  const statusCode = getStatusCode(error);
  return statusCode >= 500;
};