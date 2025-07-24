import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// POST - Fix roles for existing users
export async function POST() {
  try {
    await connectDB();

    // Find all users that don't have a role field
    const usersWithoutRole = await User.find({ role: { $exists: false } });

    if (usersWithoutRole.length === 0) {
      return NextResponse.json({
        message: 'All users already have role field',
        updatedCount: 0
      });
    }

    // Update all users without role to have 'user' role
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );

    return NextResponse.json({
      message: `Updated ${result.modifiedCount} users with role field`,
      updatedCount: result.modifiedCount,
      usersFound: usersWithoutRole.length
    });
  } catch (error) {
    console.error('Error fixing user roles:', error);
    return NextResponse.json(
      { error: 'Failed to fix user roles' },
      { status: 500 }
    );
  }
}

// GET - Check current user roles status
export async function GET() {
  try {
    await connectDB();

    const totalUsers = await User.countDocuments({});
    const usersWithRole = await User.countDocuments({ role: { $exists: true } });
    const usersWithoutRole = await User.countDocuments({ role: { $exists: false } });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    return NextResponse.json({
      totalUsers,
      usersWithRole,
      usersWithoutRole,
      adminUsers,
      regularUsers,
      needsFix: usersWithoutRole > 0
    });
  } catch (error) {
    console.error('Error checking user roles:', error);
    return NextResponse.json(
      { error: 'Failed to check user roles' },
      { status: 500 }
    );
  }
} 