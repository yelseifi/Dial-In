'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStytchUser } from '@stytch/nextjs';
import { useStytchToken } from '@/app/lib/useStytchToken';
type ClaimFormProps = {
  bountyId: string;
};

export function ClaimForm({ bountyId }: ClaimFormProps) {
  const router = useRouter();
  const {user, isInitialized} = useStytchUser();
  const sessionToken = useStytchToken();

  const userId = user?.user_id;


  useEffect(() => {
    if (!isInitialized) return;
    fetch('/api/claims', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        bountyId,
        ...formData
      }),
    });
  }, [isInitialized, userId, sessionToken]);


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          bountyId,
          ...formData
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit claim');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', phoneNumber: '' });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-green-400 mb-4">
          Claim submitted successfully!
        </h3>
        <p className="text-gray-300">
          We'll review your claim and get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your phone number"
        />
      </div>

      {error && (
        <div className="text-red-400 text-sm py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
          isSubmitting
            ? 'bg-blue-800 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500'
        } transition`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Claim'}
      </button>
    </form>
  );
} 