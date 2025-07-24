import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET /api/reviews?productId=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
  }
  try {
    await connectDB();
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch reviews', details: err.message }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const { productId, rating, comment } = await request.json();
  if (!productId || !rating || !comment) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  await connectDB();
  // Only one review per user per product
  const existing = await Review.findOne({ productId, userId: session.user.id });
  if (existing) {
    return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 400 });
  }
  // Optionally check product exists
  const product = await Product.findById(productId);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  const review = new Review({
    productId,
    userId: session.user.id,
    userName: session.user.name,
    rating,
    comment,
  });
  await review.save();
  return NextResponse.json({ message: 'Review added' }, { status: 201 });
}

// PUT /api/reviews?id=REVIEW_ID
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing review id' }, { status: 400 });
  }
  const { rating, comment } = await request.json();
  await connectDB();
  const review = await Review.findById(id);
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }
  if (review.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  review.rating = rating;
  review.comment = comment;
  await review.save();
  return NextResponse.json({ message: 'Review updated' });
}

// DELETE /api/reviews?id=REVIEW_ID
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing review id' }, { status: 400 });
  }
  await connectDB();
  const review = await Review.findById(id);
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }
  if (review.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  await review.deleteOne();
  return NextResponse.json({ message: 'Review deleted' });
} 