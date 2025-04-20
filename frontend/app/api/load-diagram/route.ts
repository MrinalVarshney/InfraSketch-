import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/api/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const userEmail = searchParams.get('email');
    console.log(userEmail)

    if (!userEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection('diagrams');
  
    const diagrams = await collection
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(diagrams);
  } catch (err) {
    console.error('Error fetching diagrams:', err);
    return NextResponse.json({ error: 'Failed to load diagrams' }, { status: 500 });
  }
}
