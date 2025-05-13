'use server';

import clientPromise from './mongodb';
import {
  comparePasswords,
  createToken,
  hashPassword,
  signinSchema,
  signupSchema,
} from './auth';
import { revalidatePath } from 'next/cache';

export async function signup(formData: FormData) {
  const data = {
    email: formData.get('email')?.toString(),
    password: formData.get('password')?.toString(),
    name: formData.get('name')?.toString(),
  };

  // Validate all required fields are present
  if (!data.email || !data.password) {
    return { error: 'Email and password are required' };
  }

  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  try {
    const client = await clientPromise;
    const db = client.db('sponti');
    const users = db.collection('users');

    const existingUser = await users.findOne({ email: parsed.data.email });
    if (existingUser) {
      return { error: 'Email already exists' };
    }

    const hashedPassword = await hashPassword(parsed.data.password);
    const user = await users.insertOne({
      email: parsed.data.email,
      password: hashedPassword,
      name: parsed.data.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createToken(user.insertedId.toString());
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to create account. Please check your database connection.' };
  }
}

export async function signin(formData: FormData) {
  const data = {
    email: formData.get('email')?.toString(),
    password: formData.get('password')?.toString(),
  };

  // Validate all required fields are present
  if (!data.email || !data.password) {
    return { error: 'Email and password are required' };
  }

  const parsed = signinSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  try {
    const client = await clientPromise;
    const db = client.db('sponti');
    const users = db.collection('users');

    const user = await users.findOne({ email: parsed.data.email });
    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const isValid = await comparePasswords(parsed.data.password, user.password);
    if (!isValid) {
      return { error: 'Invalid credentials' };
    }

    await createToken(user._id.toString());
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Signin error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to sign in. Please try again later.' };
  }
} 