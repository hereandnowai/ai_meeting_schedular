
import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Short timeout to allow the modal to be added to the DOM with initial styles (opacity-0, scale-95)
      // before transitioning to final styles (opacity-100, scale-100)
      const timer = setTimeout(() => {
        setIsAnimatingIn(true);
      }, 10); // A small delay helps ensure the transition triggers
      return () => {
        clearTimeout(timer);
        // Reset animation state when modal is about to be closed/hidden
        // This is important if the modal isn't fully unmounted and re-mounted by parent
        setIsAnimatingIn(false); 
      };
    } else {
        // Ensure reset if isOpen becomes false (e.g. if parent controls visibility differently)
        setIsAnimatingIn(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" 
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} overflow-hidden transform transition-all duration-300 ease-in-out ${isAnimatingIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
