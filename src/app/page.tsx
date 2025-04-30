'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Trip {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  image: string | null;
  author: {
    name: string;
    avatar: string;
  };
}

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      title: 'Weekend in the Mountains',
      description: 'Spontaneous trip to the mountains with friends!',
      location: 'Rocky Mountains',
      date: '2024-05-15',
      image: null,
      author: {
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
    },
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sponti Trips</h1>
        <Link href="/create" className="btn-primary">
          Create New Trip
        </Link>
      </div>

      <div className="grid gap-6">
        {trips.map((trip) => (
          <div key={trip.id} className="card">
            {trip.image && (
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={trip.image}
                  alt={trip.title}
                  fill
                  className="object-cover rounded-t-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={trip.author.avatar}
                alt={trip.author.name}
                className="w-12 h-12 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://i.pravatar.cc/150?img=0';
                }}
              />
              <div>
                <h3 className="font-semibold">{trip.author.name}</h3>
                <p className="text-gray-500 text-sm">{trip.date}</p>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">{trip.title}</h2>
            <p className="text-gray-600 mb-2">{trip.description}</p>
            <p className="text-blue-600">
              <span className="font-semibold">Location:</span> {trip.location}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
