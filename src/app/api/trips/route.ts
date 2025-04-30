import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const date = formData.get('date') as string;
    const image = formData.get('image') as File;

    if (!title || !description || !location || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let imagePath = null;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create a unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const filename = `${uniqueSuffix}-${image.name}`;
      
      // Save the file to the public directory
      const path = join(process.cwd(), 'public/uploads', filename);
      await writeFile(path, buffer);
      
      imagePath = `/uploads/${filename}`;
    }

    // TODO: Save the trip data to your database
    // For now, we'll just return a success response
    return NextResponse.json({
      success: true,
      trip: {
        title,
        description,
        location,
        date,
        image: imagePath,
      },
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
} 