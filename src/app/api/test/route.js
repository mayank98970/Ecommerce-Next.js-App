import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'API is working!' });
}

export async function POST(request) {
  try {
    const data = await request.json();
    return NextResponse.json({ 
      message: 'POST request received!',
      data: data 
    });
  } catch (err) {
    console.error('Test failed:', err);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
} 