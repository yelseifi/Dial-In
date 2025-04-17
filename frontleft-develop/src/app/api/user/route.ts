import { NextRequest, NextResponse } from 'next/server';
import { createUser, UserCreateInput, getUserById } from '@/app/lib/db'; 
import { getAuthenticatedUser } from '@/app/lib/stytch';


export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userData = await getUserById(user.user_id)
  return NextResponse.json(userData)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    // Extract and validate required fields
    const email = body.email
    const phoneNumber = body.phoneNumber
    const name = body.name
    
    if (!email || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create user data object
    const userData: UserCreateInput = {
      id: user.user_id,
      email,
      phoneNuber: phoneNumber, // Note: Maintaining the typo from the original type definition
      name
    };
    
    // Create the user in the database
    const newUser = await createUser(userData);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}