import { useState, useEffect } from 'react';
import {
  FiX,
  FiSun,
  FiMoon,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi';

// Icon, background and text colour per toast type
const STYLES = {
  success: {
    icon: (
      <FiCheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />
    ),
    variant: 'alert-success',
  },
  error: {
    icon: (
      <FiAlertCircle className="h-4 w-4 text-danger-600 dark:text-danger-400" />
    ),
    variant: 'alert-danger',
  },
  'theme-light': {
    icon: <FiSun className="h-4 w-4 text-warning-600 dark:text-warning-400" />,
    variant: 'alert-warning',
  },
  'theme-dark': {
    icon: <FiMoon className="h-4 w-4 text-primary-600 dark:text-primary-400" />,
    variant: 'alert-info',
  },
  info: {
    icon: <FiInfo className="h-4 w-4 text-primary-600 dark:text-primary-400" />,
    variant: 'alert-info',
  },
};

// Toast component for notifications
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Wait for fade-out animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const { icon, variant } = STYLES[type] || STYLES.info;

  return (
    <div
      className={`alert ${variant} fixed bottom-4 right-4 z-50 w-72 items-center transition-all duration-200 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
      role="alert"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 font-medium">{message}</span>
      <button
        type="button"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-current opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        aria-label="Close"
      >
        <FiX className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default Toast;
