'use client';

import { StytchProvider } from '@stytch/nextjs';
import { createStytchUIClient } from '@stytch/nextjs/ui';

// Configure Stytch client
const stytchClient = createStytchUIClient(
  process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN ?? '',
  {
    cookieOptions: {
      opaqueTokenCookieName: "stytch_session",
      jwtCookieName: "stytch_session_jwt",
      path: "/",
      availableToSubdomains: false,
      domain: "",
    }
  }
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StytchProvider stytch={stytchClient}>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </div>
    </StytchProvider>
  );
} 