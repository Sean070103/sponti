'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function PublicProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const email = decodeURIComponent(params.email as string);
  const [profileUser, setProfileUser] = useState<{ name: string; avatar: string; email: string } | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trips and user info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripsRes = await fetch('/api/trips');
        const tripsData = await tripsRes.json();
        const userTrips = tripsData.filter((trip: Trip) => trip.author && trip.author.email === email);
        setTrips(userTrips.reverse());
        if (userTrips.length > 0) {
          setProfileUser({
            name: userTrips[0].author.name,
            avatar: userTrips[0].author.avatar,
            email: userTrips[0].author.email || email,
          });
        } else {
          setProfileUser({ name: email, avatar: 'https://i.pravatar.cc/150?u=' + email, email });
        }
      } catch (err) {
        setError('Failed to fetch user or trips');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [email]);

  // Fetch followers/following
  useEffect(() => {
    const fetchFollows = async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          fetch(`/api/follow?email=${encodeURIComponent(email)}&type=followers`),
          fetch(`/api/follow?email=${encodeURIComponent(email)}&type=following`),
        ]);
        const followersData = await followersRes.json();
        const followingData = await followingRes.json();
        setFollowers(followersData.count || 0);
        setFollowing(followingData.count || 0);
        // Check if logged-in user is following
        if (user && user.email !== email) {
          setIsFollowing(followersData.list.some((f: any) => f.followerEmail === user.email));
        }
      } catch {}
    };
    fetchFollows();
  }, [email, user]);

  // Follow/Unfollow logic
  const handleFollow = async () => {
    if (!user) return;
    const action = isFollowing ? 'unfollow' : 'follow';
    await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: email, followerEmail: user.email, action }),
    });
    setIsFollowing(!isFollowing);
    setFollowers((prev) => prev + (isFollowing ? -1 : 1));
  };

  // Only show posts with images for the grid
  const imagePosts = trips.filter((trip) => trip.image);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error || !profileUser) {
    return <div className="text-center py-12 text-red-400">{error || 'User not found.'}</div>;
  }

  const isOwnProfile = user && user.email === email;

  return (
    <div className="max-w-2xl mx-auto w-full pt-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-8 border-b border-white/10">
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 overflow-hidden">
            <Image
              src={profileUser.avatar}
              alt={profileUser.name}
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-2xl font-bold text-white">{profileUser.name}</span>
            {isOwnProfile ? (
              <button className="px-4 py-1 rounded-lg border border-white/20 text-white bg-black hover:bg-[#181818] transition text-sm font-medium">Edit Profile</button>
            ) : (
              <button
                className={`px-4 py-1 rounded-lg border text-white text-sm font-medium transition ${isFollowing ? 'border-white/40 bg-white/10 hover:bg-white/20' : 'border-blue-600 bg-blue-600 hover:bg-blue-700'}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
          <div className="flex gap-6 mt-2">
            <span className="text-white text-sm"><span className="font-bold">{trips.length}</span> posts</span>
            <span className="text-white text-sm"><span className="font-bold">{followers}</span> followers</span>
            <span className="text-white text-sm"><span className="font-bold">{following}</span> following</span>
          </div>
          <div className="mt-2 text-gray-300 text-sm text-center sm:text-left">
            {profileUser.email}<br />
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
        {imagePosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No posts with images yet.</div>
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