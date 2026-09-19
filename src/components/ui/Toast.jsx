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
    icon: <FiCheckCircle className="h-5 w-5 text-green-500" />,
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-200',
  },
  error: {
    icon: <FiAlertCircle className="h-5 w-5 text-red-500" />,
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-200',
  },
  'theme-light': {
    icon: <FiSun className="h-5 w-5 text-orange-500" />,
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-800 dark:text-orange-200',
  },
  'theme-dark': {
    icon: <FiMoon className="h-5 w-5 text-purple-500" />,
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-800 dark:text-purple-200',
  },
  info: {
    icon: <FiInfo className="h-5 w-5 text-blue-500" />,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-200',
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

  const { icon, bg, text } = STYLES[type] || STYLES.info;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex w-72 transform items-center rounded-lg p-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      } ${bg} ${text}`}
      role="alert"
    >
      <div className="mr-3 flex-shrink-0">{icon}</div>
      <div className="mr-2 flex-1 text-sm font-medium">{message}</div>
      <button
        type="button"
        className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-transparent text-sm text-current hover:bg-gray-200 hover:text-gray-900"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        aria-label="Close"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
