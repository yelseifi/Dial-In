'use client';
import './globals.css'
import { Inter } from 'next/font/google'
import { StytchProvider } from '@stytch/nextjs'
import { createStytchUIClient } from '@stytch/nextjs/ui';
import { useState, useEffect } from 'react';
import AuthDrawer from './components/auth/authDrawer';
import UnifiedAuthFlow from './components/auth/authDrawer';
import MyApp from './components/MyApp';

const inter = Inter({ subsets: ['latin'] })

// Configure Stytch client
const stytchClient = createStytchUIClient(
  process.env.NEXT_PUBLIC_STYTCH_MAIN_PUBLIC_TOKEN ?? '',
  {
    cookieOptions: {
      opaqueTokenCookieName: "client_stytch_session",
      jwtCookieName: "client_stytch_session_jwt",
      path: "/",
      domain: "",
      availableToSubdomains: false,
    }
  }
);

// This could be moved to your route protection middleware or a custom hook
const protectedPaths = ['/dashboard', '/bounties/new', '/account'];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This state will be passed to MyApp component
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  
  // Handle auth drawer open/close
  const openAuthDrawer = () => setIsAuthDrawerOpen(true);
  const closeAuthDrawer = () => setIsAuthDrawerOpen(false);
  
  // Handle successful authentication
  const handleAuthSuccess = () => {
    closeAuthDrawer();
    // Additional logic on auth success if needed
  };
  
  return (
    <StytchProvider stytch={stytchClient}>
      {/* Pass the drawer state and handlers to MyApp */}
      <MyApp 
        openAuthDrawer={openAuthDrawer}
        isAuthDrawerOpen={isAuthDrawerOpen}
      >
        {children}
        
        {/* Auth Drawer */}
        <AuthDrawer 
          isOpen={isAuthDrawerOpen} 
          onClose={closeAuthDrawer}
          onAuthSuccess={handleAuthSuccess}
        />
      </MyApp>
    </StytchProvider>
  )
}