'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStytch, useStytchUser } from "@stytch/nextjs";
import { AdminLoginForm } from "@/app/components/AdminLoginForm";

export default function AuthenticatePage() {
  const { user, isInitialized } = useStytchUser();
  const stytch = useStytch();
  const router = useRouter();

  useEffect(() => {
    if (stytch && !user && isInitialized) {
      // Get the URL parameters
      const params = new URLSearchParams(window.location.search);
      const tokenType = params.get('stytch_token_type');
      const token = params.get('token');

      if (token && tokenType === 'magic_links') {
        stytch.magicLinks.authenticate(token, {
          session_duration_minutes: 60,
        });
      }
    }
  }, [isInitialized, stytch, user]);

  useEffect(() => {
    if (isInitialized && user) {
      // Redirect authenticated users to the admin dashboard
      router.replace("/admin/dashboard");
    }
  }, [user, isInitialized, router]);

  return <AdminLoginForm />;
} 