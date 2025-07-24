import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // Get all users
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    // Calculate statistics
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

    const [totalUsers, newUsersToday, newUsersThisWeek] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: startOfDay } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } })
    ]);

    const stats = {
      totalUsers,
      newUsersToday,
      newUsersThisWeek
    };

    return NextResponse.json({
      users,
      stats
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 