'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { PhoneLoginForm } from '@/app/components/MainLoginForm';
import { VerificationForm } from '@/app/components/PhoneVerificationForm';
import { EmailLoginForm } from '@/app/components/email/EmailLoginForm';
import { EmailVerificationForm } from '@/app/components/email/EmailVerificationForm';
import { SignUpForm } from '@/app/components/SignUpForm';
import { useStytchUser } from '@stytch/nextjs';
import { useStytchToken } from '@/app/lib/useStytchToken';
import UnifiedAuthFlow from '../components/auth/UnifiedAuthFlow';
import { useRouter } from 'next/navigation';
export default function AuthPage() {
  const router = useRouter();
  return <UnifiedAuthFlow onAuthSuccess={() => {
    router.push('/');
  }} />;
}