'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStytchUser } from '@stytch/nextjs'
import { AdminLoginForm } from '@/app/components/AdminLoginForm'

export default function AdminLoginPage() {
  const { user, isInitialized } = useStytchUser()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && user) {
      // Redirect authenticated users to the dashboard
      router.replace('/admin/dashboard')
    }
  }, [user, isInitialized, router])

  return <AdminLoginForm />
} 