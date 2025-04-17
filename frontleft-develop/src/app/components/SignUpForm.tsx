'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStytchUser } from '@stytch/nextjs';
import { useStytchToken } from '@/app/lib/useStytchToken';

// Create a client component that safely uses useSearchParams
function SignUpFormContent(initialData: { email?: string, phoneNumber?: string, stytchId?: string, onSuccess?: () => void  }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: initialData.email,
    phoneNumber: initialData.phoneNumber,
  });
  const sessionToken = useStytchToken();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stytchId = searchParams.get('stytchId');
  const email = searchParams.get('email');
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      if (initialData.onSuccess) {
        initialData.onSuccess();
      } else {
        router.push('/dashboard');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
      </div>
      
      {error && (
        <div className="px-6 py-4 bg-red-900/50 text-red-300 border-t border-b border-red-800">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Full Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 placeholder:px-1"
              required
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email Address
          </label>
          <div className="mt-1">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 placeholder:px-1"
              required
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
            Phone Number
          </label>
          <div className="mt-1">
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 placeholder:px-1"
              required
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Creating Account...' : 'Complete Sign Up'}
        </button>
      </form>
    </div>
  );
}

// Fallback component to show while the form is loading
function FormFallback() {
  return (
    <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-800 p-8 text-white">
      <p>Loading sign up form...</p>
    </div>
  );
}

// Main export that wraps the form in Suspense
export function SignUpForm({ 
  email, 
  phoneNumber, 
  stytchId,
  onSuccess,
  onBack 
}: { 
  email?: string, 
  phoneNumber?: string, 
  stytchId?: string,
  onSuccess?: () => void,
  onBack?: () => void 
}) {
  return (
    <Suspense fallback={<FormFallback />}>
      <SignUpFormContent email={email} phoneNumber={phoneNumber} stytchId={stytchId} onSuccess={onSuccess} />
    </Suspense>
  );
}