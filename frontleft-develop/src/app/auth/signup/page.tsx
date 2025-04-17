'use client';
import { SignUpForm } from '@/app/components/SignUpForm';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        <SignUpForm onSuccess={() => {
          router.push('/dashboard');
        }} />
      </div>
    </div>
  );
}