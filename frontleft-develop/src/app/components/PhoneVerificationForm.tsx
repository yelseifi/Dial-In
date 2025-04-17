'use client';
import { useState, useEffect } from 'react';
import { useStytch } from '@stytch/nextjs';
import Link from 'next/link';

interface VerificationFormProps {
  phoneNumber: string;
  methodId: string;
  onSuccess?: (stytchUserId: string) => void;
  onResendCode?: () => void;
  onChangePhone?: () => void;
}

export function VerificationForm({ 
  phoneNumber,
  methodId,
  onSuccess, 
  onResendCode,
  onChangePhone
}: VerificationFormProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 second countdown for resend
  const stytch = useStytch();

  // Countdown timer for resend option
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (verificationCode.length < 6) {
      setError('Please enter the complete verification code');
      return;
    }
    
    setLoading(true);
    try {
      // Use the methodId instead of the phone number
      const response = await stytch.otps.authenticate(verificationCode, methodId, {
        session_duration_minutes: 10000,
      });
      
      // Get the user ID directly from the response
      const userId = response.user.user_id;
      
      // Call the success handler with the user ID from the response
      if (onSuccess) {
        onSuccess(userId);
      } else {
        // Default redirect to home/dashboard
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    if (timeLeft > 0) return;
    
    if (onResendCode) {
      onResendCode();
    }
    
    // Reset timer and send new code
    stytch.otps.sms.loginOrCreate(phoneNumber, {
      expiration_minutes: 10
    })
    .then((response) => {
      // Update the methodId if needed through a callback
      setTimeLeft(60);
      setError('');
    })
    .catch((err) => {
      console.error('Error resending code:', err);
      setError('Failed to resend verification code. Please try again.');
    });
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
          <p className="text-gray-300 mb-4">
            We've sent a verification code to <span className="font-medium text-gray-100">{phoneNumber}</span>
          </p>
          
          <label htmlFor="code" className="block text-sm font-medium text-gray-300">
            Verification Code
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={6}
              className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-gray-600 focus:ring-gray-600 text-base py-3 px-4 tracking-widest text-center"
              required
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onChangePhone}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Change phone number
            </button>
            
            <button
              type="button"
              onClick={handleResendCode}
              disabled={timeLeft > 0}
              className={`text-sm text-gray-400 hover:text-gray-300 ${
                timeLeft > 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend code'}
            </button>
          </div>
        </div>
      </form>
      
    </div>
  );
}