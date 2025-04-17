'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PhoneLoginForm } from '@/app/components/MainLoginForm';
import { VerificationForm } from '@/app/components/PhoneVerificationForm';
import { EmailLoginForm } from '@/app/components/email/EmailLoginForm';
import { EmailVerificationForm } from '@/app/components/email/EmailVerificationForm';
import { SignUpForm } from '@/app/components/SignUpForm';
import { useStytchUser } from '@stytch/nextjs';
import { useStytchToken } from '@/app/lib/useStytchToken';

// Define a type for the pending login data
type PendingLoginData = {
  stytchUserId: string;
} | null;

// Define auth steps for flow control
enum AuthStep {
  CHOOSE_METHOD, // Initial step to choose between phone/email
  PHONE_LOGIN,
  PHONE_VERIFICATION,
  EMAIL_LOGIN,
  EMAIL_VERIFICATION,
  SIGNUP
}

type AuthMethod = 'phone' | 'email';

export interface UnifiedAuthFlowProps {
  onAuthSuccess?: () => void;
  initialStep?: AuthStep;
  initialMethod?: AuthMethod;
  isInDrawer?: boolean;
}

export default function UnifiedAuthFlow({ 
  onAuthSuccess, 
  initialStep = AuthStep.CHOOSE_METHOD,
  initialMethod = 'phone',
  isInDrawer = false
}: UnifiedAuthFlowProps) {
  // Method selection state
  const [authMethod, setAuthMethod] = useState<AuthMethod>(initialMethod);
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);
  
  // Phone auth states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneMethodId, setPhoneMethodId] = useState('');
  
  // Email auth states
  const [email, setEmail] = useState('');
  const [emailMethodId, setEmailMethodId] = useState('');
  
  // Common states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Create a ref with the proper type
  const pendingLoginRef = useRef<PendingLoginData>(null);
  
  // Signup state
  const [signupParams, setSignupParams] = useState<{
    stytchId?: string;
    phone?: string;
    email?: string;
  }>({});
  
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
      const queryParam = authMethod === 'phone' 
        ? `phoneNumber=${encodeURIComponent(phoneNumber)}`
        : `email=${encodeURIComponent(email)}`;
        
      const response = await fetch(`/api/user/check?${queryParam}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        }
      });

      const data = await response.json();
      console.log('User check response:', data);
      // Clear the pending login
      pendingLoginRef.current = null;
      
      if (response.ok) {
        if (data.userExists) {
          // User exists, proceed to home page or call success callback
          if (onAuthSuccess) {
            onAuthSuccess();
          } else {
            window.location.href = '/';
          }
        } else {
          // User doesn't exist in your database, proceed to signup step
          setSignupParams({
            stytchId: stytchUserId,
            phone: authMethod === 'phone' ? phoneNumber : undefined,
            email: authMethod === 'email' ? email : undefined
          });
          setCurrentStep(AuthStep.SIGNUP);
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

  // Phone auth handlers
  const handlePhoneVerificationSent = useCallback((phone: string, methodId: string) => {
    setPhoneNumber(phone);
    setPhoneMethodId(methodId);
    setCurrentStep(AuthStep.PHONE_VERIFICATION);
    setErrorMessage('');
  }, []);

  const handlePhoneResendCode = useCallback(() => {
    // The VerificationForm will handle the actual resend
    console.log('Resending code to', phoneNumber);
  }, [phoneNumber]);

  // Email auth handlers
  const handleEmailVerificationSent = useCallback((userEmail: string, methodId: string) => {
    setEmail(userEmail);
    setEmailMethodId(methodId);
    setCurrentStep(AuthStep.EMAIL_VERIFICATION);
    setErrorMessage('');
  }, []);

  const handleEmailResendCode = useCallback(() => {
    // The EmailVerificationForm will handle the actual resend
    console.log('Resending code to', email);
  }, [email]);

  // Common success handler
  const handleLoginSuccess = useCallback((stytchUserId: string) => {
    console.log('Login success:', stytchUserId);
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
  }, [authMethod, phoneNumber, email, sessionToken]);

  const handleSignupSuccess = useCallback(() => {
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  }, [onAuthSuccess]);

  // Auto-redirect to phone login on component mount
  useEffect(() => {
    if (currentStep === AuthStep.CHOOSE_METHOD) {
      setAuthMethod('phone');
      setCurrentStep(AuthStep.PHONE_LOGIN);
    }
  }, [currentStep]);

  // No longer needed as we're auto-redirecting
  const renderMethodSelection = () => (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In or Sign Up</h2>
      <div className="space-y-4">
        <button
          onClick={() => {
            setAuthMethod('phone');
            setCurrentStep(AuthStep.PHONE_LOGIN);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Continue with Phone
        </button>
        <button
          onClick={() => {
            setAuthMethod('email');
            setCurrentStep(AuthStep.EMAIL_LOGIN);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Continue with Email
        </button>
      </div>
    </div>
  );

  return (
    <div className={isInDrawer ? "" : "min-h-screen bg-black py-12"}>
      <div className={isInDrawer ? "p-4" : "container mx-auto px-4 sm:px-6 lg:px-8 max-w-md"}>
        {errorMessage && (
          <div className="mb-4 p-3 bg-gray-800 text-red-300 rounded border border-gray-700">
            {errorMessage}
          </div>
        )}
        
        {isLoggingIn && (
          <div className="mb-4 p-3 bg-gray-800 text-white rounded text-center border border-gray-700">
            Logging in...
          </div>
        )}
        
        {currentStep === AuthStep.CHOOSE_METHOD && renderMethodSelection()}
        
        {currentStep === AuthStep.PHONE_LOGIN && (
          <div>
            <PhoneLoginForm 
              onSuccess={handlePhoneVerificationSent} 
              onBack={() => setCurrentStep(AuthStep.CHOOSE_METHOD)}
            />
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Not in US or Canada?{' '}
                <button 
                  onClick={() => {
                    setAuthMethod('email');
                    setCurrentStep(AuthStep.EMAIL_LOGIN);
                  }}
                  className="text-gray-300 hover:text-white underline"
                >
                  Use email instead
                </button>
              </p>
            </div>
          </div>
        )}
        
        {currentStep === AuthStep.PHONE_VERIFICATION && (
          <VerificationForm
            phoneNumber={phoneNumber}
            methodId={phoneMethodId}
            onSuccess={handleLoginSuccess}
            onResendCode={handlePhoneResendCode}
            onChangePhone={() => setCurrentStep(AuthStep.PHONE_LOGIN)}
          />
        )}
        
        {currentStep === AuthStep.EMAIL_LOGIN && (
          <EmailLoginForm 
            onSuccess={handleEmailVerificationSent}
            onBack={() => setCurrentStep(AuthStep.CHOOSE_METHOD)}
          />
        )}
        
        {currentStep === AuthStep.EMAIL_VERIFICATION && (
          <EmailVerificationForm
            email={email}
            methodId={emailMethodId}
            onSuccess={handleLoginSuccess}
            onResendCode={handleEmailResendCode}
            onChangeEmail={() => setCurrentStep(AuthStep.EMAIL_LOGIN)}
          />
        )}
        
        {currentStep === AuthStep.SIGNUP && (
          <SignUpForm
            email={signupParams.email}
            phoneNumber={signupParams.phone}
            stytchId={signupParams.stytchId}
            onSuccess={handleSignupSuccess}
            onBack={() => {
              // Go back to the appropriate verification step
              if (authMethod === 'phone') {
                setCurrentStep(AuthStep.PHONE_VERIFICATION);
              } else {
                setCurrentStep(AuthStep.EMAIL_VERIFICATION);
              }
            }}
          />
        )}
      </div>
    </div>
  );
} 