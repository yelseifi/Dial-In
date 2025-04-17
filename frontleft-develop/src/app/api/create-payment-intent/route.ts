// app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAuthenticatedUser } from '@/app/lib/stytch';
// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Validate user session
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
   
    
    // Parse request body
    const body = await request.json()
  
    const { amount, currency = 'usd', metadata = {} } = body
    
    if (!amount || isNaN(amount) || amount < 100) { // Minimum $1 in cents
      return NextResponse.json(
        { error: 'Invalid amount. Must be at least $1' },
        { status: 400 }
      )
    }
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      capture_method: 'manual', // This enables the 7-day hold
      metadata: {
        ...metadata,
        userId: user.user_id, // Add user ID to metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
    
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}