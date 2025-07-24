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
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid JSON' 
    }, { status: 400 });
  }
} 