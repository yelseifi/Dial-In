'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { EmailLoginForm } from '@/app/components/email/EmailLoginForm';
import { EmailVerificationForm } from '@/app/components/email/EmailVerificationForm';
import { useStytchUser } from '@stytch/nextjs';
import { useStytchToken } from '@/app/lib/useStytchToken';

// Define a type for the pending login data
type PendingLoginData = {
  stytchUserId: string;
} | null;

export default function EmailAuthPage() {
  const [email, setEmail] = useState('');
  const [methodId, setMethodId] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Create a ref with the proper type
  const pendingLoginRef = useRef<PendingLoginData>(null);
  
  // Get the session token
  const sessionToken = useStytchToken();
  const { user } = useStytchUser();

  // Effect to handle authentication state changes
  useEffect(() => {
    // If we have a pending login and now we have a token, proceed with the API call
    if (pendingLoginRef.current && sessionToken) {
      const { stytchUserId } = pendingLoginRef.current;
      processPendingLogin(stytchUserId);
    }
  }, [sessionToken]);

  const processPendingLogin = async (stytchUserId: string) => {
    try {
      if (!sessionToken) {
        console.error('No session token available');
        setErrorMessage('Authentication failed. Please try again.');
        setIsLoggingIn(false);
        return;
      }

      // Check if the user exists in your database
      const response = await fetch(`/api/user/check?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        }
      });

      const data = await response.json();
      
      // Clear the pending login
      pendingLoginRef.current = null;
      
      if (response.ok) {
        if (data.userExists) {
          // User exists, proceed to home page
          window.location.href = '/';
        } else {
          // User doesn't exist in your database, redirect to signup
          window.location.href = `/auth/signup?email=${encodeURIComponent(email)}&stytchId=${encodeURIComponent(stytchUserId)}`;
        }
      } else {
        throw new Error(data.message || 'Failed to check user status');
      }
    } catch (error) {
      console.error('Error during login process:', error);
      setErrorMessage('There was a problem logging in. Please try again.');
      setIsLoggingIn(false);
    }
  };

  const handleVerificationSent = useCallback((userEmail: string, methodId: string) => {
    setEmail(userEmail);
    setMethodId(methodId);
    setVerificationSent(true);
    setErrorMessage('');
  }, []);

  const handleResendCode = useCallback(() => {
    // The EmailVerificationForm will handle the actual resend
    console.log('Resending code to', email);
  }, [email]);

  const handleLoginSuccess = useCallback((stytchUserId: string) => {

    
    if (!stytchUserId) {
      setErrorMessage('Authentication failed. Please try again.');
      return;
    }
    
    setIsLoggingIn(true);
    
    // Store the pending login data with proper typing
    pendingLoginRef.current = { stytchUserId };
    
    // If we already have a token, process immediately
    if (sessionToken) {
      console.log('Token already available, processing login immediately');
      processPendingLogin(stytchUserId);
    } else {
      console.log('Waiting for authentication token...');
      // The useEffect will handle this once the token is available
      
      // Optional: Set a timeout to fail gracefully if token never arrives
      setTimeout(() => {
        if (pendingLoginRef.current && pendingLoginRef.current.stytchUserId === stytchUserId) {
          console.log('Token wait timeout, login attempt failed');
          setErrorMessage('Login timed out. Please try again.');
          setIsLoggingIn(false);
          pendingLoginRef.current = null;
        }
      }, 10000); // 10 second timeout
    }
  }, [email, sessionToken]);

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-800 text-white rounded">
            {errorMessage}
          </div>
        )}
        
        {isLoggingIn && (
          <div className="mb-4 p-3 bg-gray-800 text-white rounded text-center">
            Logging in...
          </div>
        )}
        
        {!verificationSent ? (
          <EmailLoginForm onSuccess={handleVerificationSent} />
        ) : (
          <EmailVerificationForm
            email={email}
            methodId={methodId}
            onSuccess={handleLoginSuccess}
            onResendCode={handleResendCode}
            onChangeEmail={() => {
              setVerificationSent(false);
              setErrorMessage('');
            }}
          />
        )}
      </div>
    </div>
  );
}