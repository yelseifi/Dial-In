'use client';
import { useState } from 'react';
import { useStytch } from '@stytch/nextjs';
import Link from 'next/link';

interface EmailLoginFormProps {
  onSuccess: (email: string, methodId: string) => void;
  onBack?: () => void;
}

export function EmailLoginForm({ onSuccess, onBack }: EmailLoginFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const stytch = useStytch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Use Stytch to send a magic link or OTP to the email
      const response = await stytch.otps.email.loginOrCreate(email, {
        expiration_minutes: 10
      });
      
      const methodId = response.method_id;

      
      // Pass both email and method_id to the parent component
      onSuccess(email, methodId);
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError('Failed to send verification code. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="shadow-lg rounded-lg overflow-hidden">
      
      
      {error && (
        <div className="px-6 py-4 bg-red-900/50 text-red-300 border-t border-b border-red-800">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email Address
          </label>
          
          <div className="mt-1">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4"
              required
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </div>
          
          <p className="mt-2 text-sm text-gray-400">
            We'll send a verification code to this email
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
      
      <div className="px-6 py-4 border-t border-gray-800 bg-gray-950/50 text-center">
        <p className="text-sm text-gray-400 mb-2">
          Or sign in with{' '}
          <button 
            onClick={onBack} 
            className="text-blue-400 hover:text-blue-300"
          >
            phone number
          </button>
        </p>
      </div>
    </div>
  );
}