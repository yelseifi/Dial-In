'use client';
import { useState, useEffect } from 'react';
import { useStytch } from '@stytch/nextjs';
import Link from 'next/link';

interface PhoneLoginFormProps {
  onSuccess: (phoneNumber: string, methodId: string) => void;
  onBack?: () => void;
}

export function PhoneLoginForm({ onSuccess, onBack }: PhoneLoginFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const stytch = useStytch();

  // Format the phone number whenever it changes
  useEffect(() => {
    const processedNumber = formatPhoneNumber(phoneNumber);
    setFormattedPhoneNumber(processedNumber);
  }, [phoneNumber]);

  // Format phone number with proper country code
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    let cleaned = input.replace(/[^\d]/g, '');
    
    // Add the US/CA country code if not present
    if (cleaned.length > 0 && !cleaned.startsWith('1')) {
      return `+1${cleaned}`;
    }
    
    return `+${cleaned}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation for US/CA phone numbers
    const phoneRegex = /^\+1\d{10}$/;
    
    if (!phoneRegex.test(formattedPhoneNumber)) {
      setError('Please enter a valid 10-digit US/CA phone number');
      return;
    }

    setLoading(true);
    try {
      // Use the formatted number with country code for Stytch
      const response = await stytch.otps.sms.loginOrCreate(formattedPhoneNumber, {
        expiration_minutes: 10
      });
      
      const methodId = response.method_id;
      
      // Pass both formatted phone number and method_id to the parent component
      onSuccess(formattedPhoneNumber, methodId);
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError('Failed to send verification code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden">
      
      
      {error && (
        <div className="px-6 py-4 bg-gray-800 text-red-300 border-t border-b border-gray-700">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
            Phone Number
          </label>
          
          <div className="mt-1 relative flex">
            {/* Country code button */}
            <div className="relative">
              <div className="h-full flex items-center justify-center bg-gray-800 border border-gray-700 rounded-l-md px-3 py-3 text-white">
                <span className="mr-1">🇺🇸</span>
                <span>+1</span>
              </div>
            </div>
            
            {/* Phone number input */}
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 rounded-r-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-gray-600 focus:ring-gray-600 text-base py-3 px-4"
              required
              placeholder="Enter your phone number"
            />
          </div>
          
          
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
      
      
    </div>
  );
}