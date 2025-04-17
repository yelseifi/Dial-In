'use client';
import { useState, useEffect } from 'react';
import UnifiedAuthFlow from './UnifiedAuthFlow';

type AuthDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  extraText?: string;
}



export default function AuthDrawer({ isOpen, onClose, onAuthSuccess, extraText  }: AuthDrawerProps) {
  // Add state for animation
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Control animation timing
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      // Add delay for exit animation
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // If drawer is closed and not animating, don't render anything
  if (!isOpen && !isAnimating) return null;
  
  return (
    <div className="fixed inset-0 overflow-hidden z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className={`fixed inset-0 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)'
        }}
      />
      
      {/* Centered modal panel */}
      <div 
        className={`relative bg-black border border-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto transform transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
          {/*extra text or signin/signup*/} 
          {extraText ? <h2 className="text-lg font-semibold text-white">{extraText}</h2> : <h2 className="text-lg font-semibold text-white">Sign In / Sign Up</h2>}
          
          
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <UnifiedAuthFlow 
            isInDrawer={true} 
            onAuthSuccess={() => {
              if (onAuthSuccess) {
                onAuthSuccess();
              } else {
                onClose();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}