'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

interface Trip {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  image: string | null;
  author: {
    name: string;
    avatar: string;
    email?: string;
  };
  createdAt: string;
}

export default function Home() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/trips');
        if (!response.ok) throw new Error('Failed to fetch trips');
        const data = await response.json();
        setTrips(data.reverse()); // newest first
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trips');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-400 hover:text-blue-300"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 border border-white/10 rounded-xl bg-black">
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-white/10 px-2 sm:px-6 py-4 flex items-center justify-between rounded-t-xl">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Home</h1>
        {user ? (
          <Link
            href="/create"
            className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-black"
          >
            + New Trip
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-black"
          >
            Sign in
          </Link>
        )}
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12 bg-black rounded-lg shadow mt-8 mx-2 sm:mx-0">
          <h3 className="text-lg font-medium text-white mb-2">No trips yet</h3>
          <p className="text-gray-400 mb-4">Be the first to share your spontaneous adventure!</p>
          {user ? (
            <Link
              href="/create"
              className="text-blue-400 hover:text-blue-300"
            >
              Create your first trip →
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300"
            >
              Sign in to create trips →
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-white/10">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="group bg-black hover:bg-[#111] transition-colors duration-200 px-2 sm:px-6 py-6 flex flex-col gap-3 border-b border-white/10 last:border-b-0"
            >
              <div className="flex items-center gap-3 mb-1">
                <Link href={trip.author.email ? `/profile/${encodeURIComponent(trip.author.email)}` : '#'} className="flex items-center gap-3 group/profile">
                  <img
                    src={trip.author.avatar}
                    alt={trip.author.name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white/10 object-cover group-hover/profile:ring-2 group-hover/profile:ring-blue-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://i.pravatar.cc/150?img=0';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm sm:text-base group-hover/profile:underline">{trip.author.name}</span>
                      <span className="text-xs text-gray-400">· {new Date(trip.date).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs text-gray-400">{trip.location}</span>
                  </div>
                </Link>
              </div>
              <div className="ml-12 sm:ml-14">
                <h2 className="text-base sm:text-lg font-bold text-white mb-1 break-words">{trip.title}</h2>
                <p className="text-gray-200 mb-2 whitespace-pre-line break-words text-sm sm:text-base">{trip.description}</p>
                {trip.image && (
                  <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-white/10 mb-2">
                    <Image
                      src={trip.image}
                      alt={trip.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-6 sm:gap-8 mt-2 text-gray-400 text-xs sm:text-sm">
                  <button className="flex items-center gap-1 hover:text-blue-400 transition"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9l-5 5m0 0l-5-5m5 5V3" /></svg>Reply</button>
                  <button className="flex items-center gap-1 hover:text-pink-400 transition"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>Like</button>
                  <button className="flex items-center gap-1 hover:text-green-400 transition"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h-6a2 2 0 00-2 2v4a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>Share</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
