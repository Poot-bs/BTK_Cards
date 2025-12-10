import React from 'react';

// Reusable Button component with variants
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon = null,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500 disabled:bg-gray-400',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 disabled:bg-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 disabled:bg-gray-400',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500 border border-gray-300',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 disabled:bg-gray-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const styles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`;

  return (
    <button className={styles} disabled={disabled} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

// Input component
export const Input = ({
  label,
  error,
  icon = null,
  fullWidth = true,
  ...props
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-3 text-gray-400">{icon}</span>}
        <input
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : 'border-gray-300'}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

// Card component
export const Card = ({ children, className = '', hover = true, ...props }) => (
  <div
    className={`bg-white rounded-xl shadow-md p-6 ${hover ? 'transition-all duration-300 hover:shadow-lg hover:scale-105' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Modal component
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
      <div className={`relative bg-white rounded-xl shadow-2xl p-8 z-10 w-full ${sizes[size]} mx-4`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// Toast notification system
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  return { toasts, addToast };
};

export const Toast = ({ message, type = 'success', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-green-500',
      icon: '✅',
      text: 'text-gray-800 dark:text-white'
    },
    error: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-red-500',
      icon: '❌',
      text: 'text-gray-800 dark:text-white'
    },
    warning: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-yellow-500',
      icon: '⚠️',
      text: 'text-gray-800 dark:text-white'
    },
    info: {
      bg: 'bg-white dark:bg-gray-800',
      border: 'border-l-4 border-blue-500',
      icon: 'ℹ️',
      text: 'text-gray-800 dark:text-white'
    }
  };

  const style = styles[type];

  return (
    <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl ${style.bg} ${style.border} transform transition-all duration-500 hover:scale-105 z-50 min-w-[300px]`}>
      <span className="text-xl">{style.icon}</span>
      <p className={`font-medium ${style.text}`}>{message}</p>
      <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        ×
      </button>
    </div>
  );
};

// Badge component
export const Badge = ({ children, variant = 'primary', size = 'md' }) => {
  const variants = {
    primary: 'bg-amber-100 text-amber-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-block rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
