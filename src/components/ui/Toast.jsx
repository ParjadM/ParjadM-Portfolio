import React, { useEffect } from 'react';

export const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-500/20 border-green-500/30 text-green-300',
    error: 'bg-red-500/20 border-red-500/30 text-red-300',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  };

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={`fixed top-20 right-4 z-50 p-4 rounded-lg border backdrop-blur-lg ${typeStyles[type]} transform transition-all duration-500 translate-x-0 opacity-100`}>
      <div className="flex items-center space-x-3">
        <span>{message}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close notification">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
