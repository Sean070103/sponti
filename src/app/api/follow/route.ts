import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// POST: Follow or unfollow a user
export async function POST(request: Request) {
  try {
    const { userEmail, followerEmail, action } = await request.json();
    if (!userEmail || !followerEmail || !['follow', 'unfollow'].includes(action)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('sponti');
    const followers = db.collection('followers');

    if (action === 'follow') {
      await followers.updateOne(
        { userEmail, followerEmail },
        { $set: { userEmail, followerEmail } },
        { upsert: true }
      );
      return NextResponse.json({ success: true, followed: true });
    } else {
      await followers.deleteOne({ userEmail, followerEmail });
      return NextResponse.json({ success: true, followed: false });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update follow status' }, { status: 500 });
  }
}

// GET: Get followers or following count/list
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const type = searchParams.get('type'); // 'followers' or 'following'
    if (!email || !['followers', 'following'].includes(type || '')) {
      return NextResponse.json({ error: 'Missing or invalid query' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('sponti');
    const followers = db.collection('followers');

    if (type === 'followers') {
      const list = await followers.find({ userEmail: email }).toArray();
      return NextResponse.json({ count: list.length, list });
    } else {
      const list = await followers.find({ followerEmail: email }).toArray();
      return NextResponse.json({ count: list.length, list });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch followers/following' }, { status: 500 });
  }
} 