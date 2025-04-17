import { NextRequest, NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear the admin auth cookie
  response.cookies.set({
    name: 'admin_auth',
    value: '',
    expires: new Date(0),
    path: '/',
  })

  return response
} 