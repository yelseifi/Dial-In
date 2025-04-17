'use client';

import { useState } from 'react';
import { useStytch } from '@stytch/nextjs';

const ALLOWED_EMAILS = ['rcuevas@alumni.stanford.edu', 'josh@crowdvolt.com'];

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const stytch = useStytch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
      setError('This email is not authorized for admin access.');
      return;
    }

    setLoading(true);
    try {
      await stytch.magicLinks.email.loginOrCreate(email, {
        login_magic_link_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/authenticate`,
        signup_magic_link_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/authenticate`,
      });
      setError('Check your email for a login link!');
      setLoading(false);
    } catch (err) {
      setError('Failed to send login link. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-800">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          </div>

          {error && (
            <div className={`px-6 py-4 ${error.includes('Check your email') ? 'bg-green-900/50 text-green-300 border-green-800' : 'bg-red-900/50 text-red-300 border-red-800'} border-t border-b`}>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Admin Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 placeholder:px-1"
                  required
                  placeholder="Enter your admin email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending...' : 'Send Login Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 