'use client';
import { useState } from 'react';
import { PhoneLoginForm } from './MainLoginForm';
import { VerificationForm } from './PhoneVerificationForm';

export default function AuthPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [methodId, setMethodId] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleVerificationSent = (phone: string, methodId: string) => {
    setPhoneNumber(phone);
    setMethodId(methodId);
    setVerificationSent(true);
  };

  const handleResendCode = () => {
    // The VerificationForm will handle the actual resend
    console.log('Resending code to', phoneNumber);
  };

  const handleLoginSuccess = () => {
    // Redirect or handle successful login
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        {!verificationSent ? (
          <PhoneLoginForm onSuccess={handleVerificationSent} />
        ) : (
          <VerificationForm 
            phoneNumber={phoneNumber}
            methodId={methodId}
            onSuccess={handleLoginSuccess} 
            onResendCode={handleResendCode}
            onChangePhone={() => setVerificationSent(false)}
          />
        )}
      </div>
    </div>
  );
}