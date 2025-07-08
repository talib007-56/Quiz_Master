import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const NotificationToast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  position = 'top-right',
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const getTypeStyles = () => {
    const baseStyles = {
      padding: '12px 16px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: '300px',
      maxWidth: '500px'
    };

    const typeStyles = {
      success: {
        backgroundColor: '#10b981',
        borderLeft: '4px solid #059669'
      },
      error: {
        backgroundColor: '#ef4444',
        borderLeft: '4px solid #dc2626'
      },
      warning: {
        backgroundColor: '#f59e0b',
        borderLeft: '4px solid #d97706'
      },
      info: {
        backgroundColor: '#3b82f6',
        borderLeft: '4px solid #2563eb'
      }
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  const getPositionStyles = () => {
    const positions = {
      'top-right': {
        top: '20px',
        right: '20px'
      },
      'top-left': {
        top: '20px',
        left: '20px'
      },
      'bottom-right': {
        bottom: '20px',
        right: '20px'
      },
      'bottom-left': {
        bottom: '20px',
        left: '20px'
      },
      'top-center': {
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)'
      },
      'bottom-center': {
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)'
      }
    };

    return positions[position] || positions['top-right'];
  };

  const getIcon = () => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  };

  if (!isVisible) return null;

  const toastElement = (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        ...getPositionStyles(),
        animation: isExiting 
          ? 'slideOut 0.3s ease-in-out forwards' 
          : 'slideIn 0.3s ease-in-out forwards'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(${position.includes('right') ? '100%' : position.includes('left') ? '-100%' : '0'}) translateY(${position.includes('top') ? '-20px' : '20px'});
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
        
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(${position.includes('right') ? '100%' : position.includes('left') ? '-100%' : '0'}) translateY(${position.includes('top') ? '-20px' : '20px'});
          }
        }
      `}</style>
      
      <div style={getTypeStyles()}>
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
          {getIcon()}
        </span>
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.8'}
        >
          ×
        </button>
      </div>
    </div>
  );

  return createPortal(toastElement, document.body);
};

// Toast container for managing multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000, position = 'top-right') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, position };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration + 300); // Add 300ms for exit animation
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, duration, position) => addToast(message, 'success', duration, position);
  const error = (message, duration, position) => addToast(message, 'error', duration, position);
  const warning = (message, duration, position) => addToast(message, 'warning', duration, position);
  const info = (message, duration, position) => addToast(message, 'info', duration, position);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

export default NotificationToast; 