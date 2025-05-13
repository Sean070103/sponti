import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('sponti');
    const trips = await db.collection('trips').find({}).toArray();
    
    return NextResponse.json(trips);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const date = formData.get('date') as string;
    const image = formData.get('image') as File | null;
    const authorName = formData.get('authorName') as string | null;
    const authorAvatar = formData.get('authorAvatar') as string | null;
    const authorEmail = formData.get('authorEmail') as string | null;

    if (!title || !description || !location || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let imagePath = null;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      const ext = extname(image.name) || '.jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = join(uploadsDir, filename);
      await writeFile(filePath, buffer);
      imagePath = `/uploads/${filename}`;
    }

    // Use real user info if provided, otherwise fallback to anonymous
    const author = {
      name: authorName || 'Anonymous',
      avatar: authorAvatar || 'https://i.pravatar.cc/150?img=0',
      email: authorEmail || '',
    };

    const client = await clientPromise;
    const db = client.db('sponti');
    const result = await db.collection('trips').insertOne({
      title,
      description,
      location,
      date,
      image: imagePath,
      author,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Trip creation error:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
} 