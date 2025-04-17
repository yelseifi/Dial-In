import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!ADMIN_PASSWORD) {
  console.warn('Warning: ADMIN_PASSWORD environment variable not set')
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    console.log('Login attempt:', { 
      passwordProvided: !!password,
      adminPasswordSet: !!ADMIN_PASSWORD,
      matches: password === ADMIN_PASSWORD 
    })

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Set simple auth cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: 'admin_auth',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
} 