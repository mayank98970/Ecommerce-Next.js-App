import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// POST - Create new order
export async function POST(request) {
  try {
    console.log('Orders API: POST request received');
    
    const session = await getServerSession(authOptions);
    console.log('Orders API: Session:', session);
    
    if (!session) {
      console.log('Orders API: No session found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const orderData = await request.json();
    console.log('Orders API: Order data received:', orderData);
    
    await connectDB();
    console.log('Orders API: Database connected');

    // Generate unique order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    console.log('Orders API: Generated order number:', orderNumber);

    // Create new order
    const order = new Order({
      userId: session.user.id,
      orderNumber,
      items: orderData.items,
      total: orderData.total,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      status: 'pending',
      shippingAddress: orderData.shippingAddress,
      paymentInfo: orderData.paymentInfo,
    });

    console.log('Orders API: Order object created:', order);

    await order.save();
    console.log('Orders API: Order saved successfully');

    return NextResponse.json({
      message: 'Order created successfully',
      orderNumber: order.orderNumber,
      orderId: order._id
    }, { status: 201 });
  } catch (error) {
    console.error('Orders API: Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order: ' + error.message },
      { status: 500 }
    );
  }
}

// GET - Get user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select('-paymentInfo');

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 