'use client';
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { useStytchUser } from '@stytch/nextjs'
import { useStytchToken } from '../lib/useStytchToken';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] })

interface MyAppProps {
  children: React.ReactNode;
  openAuthDrawer: () => void;
  isAuthDrawerOpen: boolean;
}

export default function MyApp({ children, openAuthDrawer, isAuthDrawerOpen }: MyAppProps) {
  const sessionToken = useStytchToken();
  const { user } = useStytchUser();
  const pathname = usePathname();
  const router = useRouter();
  
  // Define paths where header and footer should be hidden
  const hideHeaderPaths = ['/mmw'];
  const shouldHideHeader = hideHeaderPaths.includes(pathname);
  
  // You can also hide footer for the same pages if desired
  const hideFooterPaths = ['/mmw']; 
  const shouldHideFooter = hideFooterPaths.includes(pathname);

  // Define protected paths that require authentication
  const protectedPaths = ['/dashboard', '/bounties/new', '/account'];
  
  // Check if current path requires authentication
  useEffect(() => {
    if (protectedPaths.some(path => pathname.startsWith(path)) && !sessionToken) {
      // Path requires authentication but user is not logged in
      // Open the auth drawer instead of redirecting
      openAuthDrawer();
    }
  }, [pathname, sessionToken, openAuthDrawer]);

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-black text-white`}>
        {!shouldHideHeader && (
          <header className="bg-gray-900 border-b border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <Link href="/" className="text-3xl px-3 font-bold text-gray-100 hover:text-white">
                    Dial In
                  </Link>
                </div>
                <nav>
                  <ul className="flex items-center gap-4 sm:gap-6">
                    {sessionToken && (
                      <li>
                        <Link
                          href="/bounties/new"
                          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition whitespace-nowrap"
                        >
                          Post Bounty
                        </Link>
                      </li>
                    )}
                    {!sessionToken && (
                      <li>
                        <button 
                          onClick={openAuthDrawer}
                          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition whitespace-nowrap"
                        >
                          Login
                        </button>
                      </li>
                    )}
                  </ul>
                </nav>
              </div>
            </div>
          </header>
        )}
        
        <div className="flex-grow bg-black">
          {children}
        </div>
        
        {!shouldHideFooter && (
          <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="mb-6 md:mb-0">
                  <Link href="/" className="text-xl font-bold text-gray-100 hover:text-white">
                    Dial In
                  </Link>
                  <p className="mt-2 text-gray-400">
                    Connecting producers with fans through music moments.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Navigation
                    </h3>
                    <ul className="mt-4 space-y-2">
                      <li>
                        <Link href="/" className="text-gray-400 hover:text-gray-100 transition">
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className="text-gray-400 hover:text-gray-100 transition">
                          About
                        </Link>
                      </li>
                      <li>
                        <Link href="/bounties/new" className="text-gray-400 hover:text-gray-100 transition">
                          Post Bounty
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Contact
                    </h3>
                    <ul className="mt-4 space-y-2">
                      <li className="text-gray-400">
                        dialedrecords@gmail.com
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-800">
                <p className="text-gray-400 text-center">
                  &copy; {new Date().getFullYear()} Dial In. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        )}
      </body>
    </html>
  )
}