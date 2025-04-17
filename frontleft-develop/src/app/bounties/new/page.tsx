'use client'

import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStytchToken } from '@/app/lib/useStytchToken'
import { useStytchUser } from '@stytch/nextjs'
import {loadStripe } from '@stripe/stripe-js'
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

// Initialize Stripe - replace with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Validation helpers
const formatPhoneNumber = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

const sanitizeAmount = (value: string) => {
  // Remove any non-digit or decimal point
  const cleaned = value.replace(/[^\d.]/g, '')
  // Ensure only one decimal point
  const parts = cleaned.split('.')
  if (parts.length > 2) return parts[0] + '.' + parts[1]
  return cleaned
}

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      color: '#fff',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
}

// The actual form component
function BountyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const sessionToken = useStytchToken()
  const { user } = useStytchUser()
  const stripe = useStripe()
  const elements = useElements()
  const [clientSecret, setClientSecret] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const router = useRouter()
  
  // Keep these state variables for user data
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  if (!sessionToken) {
    router.push('/auth')
  }

  // Keep the useEffect to fetch user data
  useEffect(() => {
    if (user) {
      fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      })
      .then(res => res.json())
      .then(data => {
        setEmail(data.email);
        setPhoneNumber(data.phoneNuber);
      })
      .catch(error => console.error('Error fetching user data:', error));
    }
  }, [user, sessionToken]);
  
  const [formData, setFormData] = useState({
    artist: '',
    trackTitle: '',
    description: '',
    supportingArtists: '',
    reward: '',
    songUrl: '', 
  })

  const [errors, setErrors] = useState({
    artist: '',
    trackTitle: '',
    reward: '',
    supportingArtists: '',
    payment: '',
    songUrl: '',
  })
  
  const [proofFiles, setProofFiles] = useState<File[]>([])
  
  // Create payment intent when reward amount changes
  
  
  const validateForm = () => {
    const newErrors = {
      artist: '',
      trackTitle: '',
      reward: '',
      supportingArtists: '',
      payment: '',
      songUrl: '',
    }
    
    // Artist validation
    if (formData.artist.trim().length < 2) {
      newErrors.artist = 'Artist name must be at least 2 characters'
    }
    
    // Track title validation
    if (formData.trackTitle.trim().length < 2) {
      newErrors.trackTitle = 'Track title must be at least 2 characters'
    }
    
    // Reward validation
    const rewardNum = parseFloat(formData.reward)
    if (isNaN(rewardNum) || rewardNum < 1) {
      newErrors.reward = 'Reward must be at least $1'
    }

    const supportingArtistsArray = formData.supportingArtists.split(',').map(artist => artist.trim())
    if (supportingArtistsArray.length === 0) {
      newErrors.supportingArtists = 'At least one supporting artist is required'
    }
    
    // Payment validation
    if (!stripe || !elements) {
      newErrors.payment = 'Payment system not loaded'
    }
    
    // Supporting artists validation
    if (!formData.supportingArtists.trim()) {
      newErrors.supportingArtists = 'Please enter at least one supporting artist'
    }

    if (!formData.songUrl.trim()) {
      newErrors.songUrl = 'Please enter a song URL'
    }
    
    setErrors(newErrors)
    return Object.values(newErrors).every(error => error === '')
  }
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    let sanitizedValue = value
    
    switch (name) {
      case 'reward':
        sanitizedValue = sanitizeAmount(value)
        break
      default:
        sanitizedValue = value
    }
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }))
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setProofFiles(filesArray)
    }
  }
  
  const handleCardChange = (event: any) => {
    // Clear payment error when user updates card details
    if (paymentError) {
      setPaymentError('')
    }
    if (errors.payment) {
      setErrors(prev => ({ ...prev, payment: '' }))
    }
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Please fix the errors in the form before submitting.'
      })
      return
    }
    
    if (!stripe || !elements) {
      setErrors(prev => ({ ...prev, payment: 'Payment system not loaded' }))
      return
    }
    
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setErrors(prev => ({ ...prev, payment: 'Card information is required' }))
      return
    }
    
    setIsSubmitting(true)
    setPaymentProcessing(true)
    setMessage(null)
    
    try {
      // Step 1: Create a payment intent
      const amount = Math.round(parseFloat(formData.reward) * 100) // Convert to cents
      
      const createIntentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          amount,
          currency: 'usd',
          userId: user?.user_id, // Pass user ID directly
          })
      })
      
      if (!createIntentResponse.ok) {
        const errorData = await createIntentResponse.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }
      
      const { clientSecret } = await createIntentResponse.json()
      
      if (!clientSecret) {
        throw new Error('Failed to get payment authorization from server')
      }
      
      // Step 2: Confirm the payment intent with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: email,
            },
          },
        }
      )
      
      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed')
      }
      
      if (!paymentIntent || paymentIntent.status !== 'requires_capture') {
        throw new Error('Payment authorization failed')
      }
      
      // Step 3: Now that payment is authorized, submit the bounty
      // Create FormData object
      const submissionData = new FormData()
      submissionData.append('artist', formData.artist.trim())
      submissionData.append('trackTitle', formData.trackTitle.trim())
      submissionData.append('description', formData.description.trim())
      submissionData.append('supportingArtists', formData.supportingArtists.trim())
      submissionData.append('reward', formData.reward)
      submissionData.append('email', email)
      submissionData.append('phoneNumber', phoneNumber)
      submissionData.append('paymentIntentId', paymentIntent.id)
      submissionData.append('userId', user?.user_id as string)
      submissionData.append('songUrl', formData.songUrl)
      // Add proof files
      
      
      // Submit to API
      const response = await fetch('/api/bounties', {
        method: 'POST',
        body: submissionData,
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      })
  
      let errorMessage: string;
      try {
        const data = await response.json();
        
        if (!response.ok) {
          errorMessage = data.error || 'Failed to submit bounty';
          throw new Error(errorMessage);
        }
  
        setMessage({
          type: 'success',
          text: 'Bounty submitted successfully! Your payment will be held for 7 days until a claim is verified.'
        });
        
        // Reset form
        setFormData({
          artist: '',
          trackTitle: '',
          description: '',
          supportingArtists: '',
          reward: '',
          songUrl: '',
        });
        setProofFiles([]);
        
        // Redirect to home page after a delay
        setTimeout(() => router.push('/'), 2000);
        
      } catch (jsonError) {
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please check server configuration.');
        } else if (!response.ok) {
          throw new Error('Server error. Please try again later.');
        }
        throw jsonError;
      }
    } catch (error) {
      console.error('Submission error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment processing failed');
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to submit bounty. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
      setPaymentProcessing(false);
    }
  }

  return (
    <main className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-800">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">New Bounty</h1>
            <p className="text-blue-100 mt-1">
              Get fans to capture DJs playing your track
            </p>
          </div>
          
          {message && (
            <div className={`px-6 py-4 ${
              message.type === 'success' 
                ? 'bg-green-900/50 text-green-300 border-t border-b border-green-800' 
                : 'bg-red-900/50 text-red-300 border-t border-b border-red-800'
            }`}>
              <p className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {message.text}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            <div className="space-y-6 sm:space-y-5">
              <div>
                <label htmlFor="artist" className="block text-sm font-medium text-gray-300 sm:mt-px sm:pt-2">
                  Your Artist Name <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="artist"
                    id="artist"
                    value={formData.artist}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 placeholder:px-1 ${errors.artist ? 'border-red-500' : ''}`}
                    required
                    minLength={2}
                    placeholder="Enter your artist name"
                  />
                  {errors.artist && <p className="mt-1 text-sm text-red-400">{errors.artist}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="trackTitle" className="block text-sm font-medium text-gray-300 sm:mt-px sm:pt-2">
                  Track Title <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="trackTitle"
                    id="trackTitle"
                    value={formData.trackTitle}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 placeholder:px-1 ${errors.trackTitle ? 'border-red-500' : ''}`}
                    required
                    minLength={2}
                    placeholder="Enter your track title"
                  />
                  {errors.trackTitle && <p className="mt-1 text-sm text-red-400">{errors.trackTitle}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="songUrl" className="block text-sm font-medium text-gray-300 sm:mt-px sm:pt-2">
                  Song URL <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="songUrl"
                    id="songUrl"
                    value={formData.songUrl}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 placeholder:px-1 ${errors.songUrl ? 'border-red-500' : ''}`}
                    required
                    placeholder="Enter your song URL"
                  />
                  {errors.songUrl && <p className="mt-1 text-sm text-red-400">{errors.songUrl}</p>}
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                    This will only be shared with people approved to claim your bounty.
              </p>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 sm:mt-px sm:pt-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 placeholder:px-1"
                    placeholder="Tell fans why your track is special and why you're excited to hear it played out"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="supportingArtists" className="block text-sm font-medium text-gray-300 sm:mt-px sm:pt-2">
                  Supporting Artists (comma separated) <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="supportingArtists"
                    id="supportingArtists"
                    value={formData.supportingArtists}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 placeholder:px-1 ${errors.supportingArtists ? 'border-red-500' : ''}`}
                    required
                    placeholder="e.g. Four Tet, Floating Points, Skrillex"
                  />
                  {errors.supportingArtists && <p className="mt-1 text-sm text-red-400">{errors.supportingArtists}</p>}
                  <p className="mt-1 text-sm text-gray-400">
                    DJs who have supported or downloaded your track
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="reward" className="block text-sm font-medium text-gray-300 sm:mt-px sm:pt-2">
                  Reward Amount ($) <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="text"
                    name="reward"
                    id="reward"
                    value={formData.reward}
                    onChange={handleChange}
                    className={`block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-3 px-4 placeholder:px-1 ${errors.reward ? 'border-red-500' : ''}`}
                    required
                    placeholder="Enter reward amount"
                  />
                  {errors.reward && <p className="mt-1 text-sm text-red-400">{errors.reward}</p>}
                  <p className="mt-1 text-sm text-gray-400">
                    How much you're willing to pay for a video capture
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="card-element" className="block text-sm font-medium text-gray-300 sm:mt-px sm:pt-2">
                  Payment Details <span className="text-red-400">*</span>
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <div className={`p-4 rounded-md border ${paymentError || errors.payment ? 'border-red-500' : 'border-gray-700'} bg-gray-800`}>
                    <CardElement id="card-element" options={cardElementOptions} onChange={handleCardChange} />
                  </div>
                  {(paymentError || errors.payment) && 
                    <p className="mt-1 text-sm text-red-400">{paymentError || errors.payment}</p>
                  }
                  <p className="mt-1 text-sm text-gray-400">
                    Your card will be authorized for {formData.reward ? `$${formData.reward}` : 'the reward amount'} with a 7-day hold. The payment will only be captured if a claim is verified and you approve the video.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="proofImages" className="block text-sm font-medium text-gray-300 sm:mt-px sm:pt-2">
                  Proof Images (optional)
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    type="file"
                    id="proofImages"
                    name="proofImages"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
                  />
                  <p className="mt-1 text-sm text-gray-400">
                    Upload screenshots showing DJs supporting your track (screenshots of downloads, messages, etc.)
                  </p>
                </div>
              </div>
              
              {proofFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300">Selected files:</h3>
                  <ul className="mt-1 text-sm text-gray-400 list-disc pl-5">
                    {proofFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-5">
              <div className="flex justify-end gap-3">
                <Link
                  href="/"
                  className="rounded-md border border-gray-700 bg-gray-800 py-2 px-4 text-sm font-medium text-gray-300 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !stripe || paymentProcessing}
                  className={`inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    (isSubmitting || !stripe || paymentProcessing) ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {paymentProcessing ? 'Processing Payment...' : isSubmitting ? 'Submitting...' : 'Submit Bounty'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

// Wrap the form with Stripe Elements
export default function NewBountyPage() {
  return (
    <Elements stripe={stripePromise}>
      <BountyForm />
    </Elements>
  )
}