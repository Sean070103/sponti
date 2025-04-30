'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check auth when route changes

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Sponti
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md ${
                pathname === '/'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/create"
                  className={`px-3 py-2 rounded-md ${
                    pathname === '/create'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Create Trip
                </Link>
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8">
                    <Image
                      src={user?.avatar || 'https://i.pravatar.cc/150?img=0'}
                      alt={user?.name || 'User avatar'}
                      fill
                      className="rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://i.pravatar.cc/150?img=0';
                      }}
                    />
                  </div>
                  <div className="relative group">
                    <button
                      className={`px-3 py-2 rounded-md ${
                        pathname === '/profile'
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {user?.name || 'Profile'}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                href="/auth"
                className={`px-3 py-2 rounded-md ${
                  pathname === '/auth'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 