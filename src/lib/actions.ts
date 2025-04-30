'use server';

import { prisma } from './prisma';
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
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingUser) {
      return { error: 'Email already exists' };
    }

    const hashedPassword = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        password: hashedPassword,
        name: parsed.data.name,
      },
    });

    await createToken(user.id);
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
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const isValid = await comparePasswords(parsed.data.password, user.password);
    if (!isValid) {
      return { error: 'Invalid credentials' };
    }

    await createToken(user.id);
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