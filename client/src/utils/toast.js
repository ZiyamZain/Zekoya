import { toast } from 'react-toastify';

// Default toast configuration
const defaultOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Custom toast with icon and styling
const customToast = {
  
  success: (message, options = {}) => {
    return toast.success(message, {
      ...defaultOptions,
      icon: '✓',
      ...options,
    });
  },

  /**
   * Error toast notification
   * @param {string} message - The message to display
   * @param {object} options - Optional toast configuration options
   */
  error: (message, options = {}) => {
    return toast.error(message || 'An error occurred', {
      ...defaultOptions,
      icon: '✕',
      ...options,
    });
  },

  /**
   * Info toast notification
   * @param {string} message - The message to display
   * @param {object} options - Optional toast configuration options
   */
  info: (message, options = {}) => {
    return toast.info(message, {
      ...defaultOptions,
      icon: 'ℹ',
      ...options,
    });
  },

  /**
   * Warning toast notification
   * @param {string} message - The message to display
   * @param {object} options - Optional toast configuration options
   */
  warning: (message, options = {}) => {
    return toast.warning(message, {
      ...defaultOptions,
      icon: '⚠',
      ...options,
    });
  },


  default: (message, options = {}) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
    });
  },
};

export default customToast;
