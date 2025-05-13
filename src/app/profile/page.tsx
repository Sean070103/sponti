'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

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

export default function ProfilePage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/trips');
        if (!response.ok) throw new Error('Failed to fetch trips');
        const data = await response.json();
        // Only show trips by this user (match by email)
        const userTrips = data.filter((trip: Trip) =>
          trip.author && trip.author.email === user.email
        );
        setTrips(userTrips.reverse());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trips');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Please sign in to view your profile</h2>
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
          Sign in
        </Link>
      </div>
    );
  }

  // Only show posts with images for the grid
  const imagePosts = trips.filter((trip) => trip.image);

  return (
    <div className="max-w-2xl mx-auto w-full pt-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-8 border-b border-white/10">
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 overflow-hidden">
            <Image
              src={user.avatar}
              alt={user.name}
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-2xl font-bold text-white">{user.name}</span>
            <button className="px-4 py-1 rounded-lg border border-white/20 text-white bg-black hover:bg-[#181818] transition text-sm font-medium">Edit Profile</button>
          </div>
          <div className="flex gap-6 mt-2">
            <span className="text-white text-sm"><span className="font-bold">{trips.length}</span> posts</span>
            <span className="text-white text-sm"><span className="font-bold">60</span> followers</span>
            <span className="text-white text-sm"><span className="font-bold">121</span> following</span>
          </div>
          <div className="mt-2 text-gray-300 text-sm text-center sm:text-left">
            {user.email}<br />
            <span className="text-gray-400">Happy to share my adventures!</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-white/10 mt-6">
        <button className="px-4 py-2 text-white font-semibold border-b-2 border-white">Posts</button>
        <button className="px-4 py-2 text-gray-500 font-semibold">Saved</button>
        <button className="px-4 py-2 text-gray-500 font-semibold">Tagged</button>
      </div>

      {/* Posts Grid */}
      <div className="py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[30vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : imagePosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">You haven&apos;t posted any trips with images yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {imagePosts.map((trip) => (
              <div key={trip._id} className="relative aspect-square bg-black border border-white/10 rounded-md overflow-hidden group">
                <Image
                  src={trip.image!}
                  alt={trip.title}
                  fill
                  className="object-cover group-hover:opacity-80 transition"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                  {trip.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 