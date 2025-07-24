import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get the full user record from database
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasRoleField: 'role' in user,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      session: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        hasRoleField: 'role' in session.user
      }
    });
  } catch (error) {
    console.error('Error fetching user debug info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user info' },
      { status: 500 }
    );
  }
} 