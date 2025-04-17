'use client';
import { useState } from 'react';
import { useStytch } from '@stytch/nextjs';
import Link from 'next/link';

interface EmailVerificationFormProps {
  email: string;
  methodId: string;
  onSuccess: (stytchUserId: string) => void;
  onResendCode: () => void;
  onChangeEmail: () => void;
}

export function EmailVerificationForm({
  email,
  methodId,
  onSuccess,
  onResendCode,
  onChangeEmail
}: EmailVerificationFormProps) {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const stytch = useStytch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length < 6) {
      setError('Please enter a valid verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await stytch.otps.authenticate(otpCode, methodId, {
        session_duration_minutes: 10000 
      });
      
      
      // Pass the Stytch user ID back to the parent
      if (response.user_id) {
        onSuccess(response.user_id);
        console.log('User ID:', response.user_id);
      } else {
        throw new Error('No user ID returned from authentication');
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      await stytch.otps.email.loginOrCreate(email, {
        expiration_minutes: 10
      });
      
      setResendLoading(false);
      setResendSuccess(true);
      
      // Call the parent's resend handler
      onResendCode();
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error resending code:', err);
      setError('Failed to resend verification code. Please try again.');
      setResendLoading(false);
    }
  };

  return (
    <div className="shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
      </div>
      
      {error && (
        <div className="px-6 py-4 bg-red-900/50 text-red-300 border-t border-b border-red-800">
          <p>{error}</p>
        </div>
      )}
      
      {resendSuccess && (
        <div className="px-6 py-4 bg-green-900/50 text-green-300 border-t border-b border-green-800">
          <p>A new verification code has been sent to your email</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="code" className="block text-sm font-medium text-gray-300">
              Verification Code
            </label>
            
            <button
              type="button"
              onClick={onChangeEmail}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Change email
            </button>
          </div>
          
          <div className="text-sm text-gray-400 mb-3">
            We sent a code to <span className="font-medium text-gray-300">{email}</span>
          </div>
          
          <div className="mt-1">
            <input
              type="text"
              id="code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xl py-3 px-4 tracking-widest text-center"
              required
              maxLength={6}
              placeholder="000000"
              autoComplete="one-time-code"
            />
          </div>
          
          <p className="mt-2 text-sm text-gray-400">
            Enter the 6-digit code from your email
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
        
        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {resendLoading ? 'Sending...' : 'Resend code'}
          </button>
        </div>
      </form>
      

    </div>
  );
}