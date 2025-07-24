import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// POST - Set up admin user (one-time use)
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    return NextResponse.json({
      message: 'User role updated to admin successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json(
      { error: 'Failed to set up admin' },
      { status: 500 }
    );
  }
} 