'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStytchUser } from '@stytch/nextjs'
import { useStytchToken } from '@/app/lib/useStytchToken'
interface Bounty {
  id: string
  artist: string
  trackTitle: string
  description: string
  supportingArtists: string
  reward: string
  email: string
  phoneNumber: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  proofImages: string[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const sessionToken = useStytchToken()
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { user, isInitialized } = useStytchUser()

  useEffect(() => {
    if (!isInitialized || !user) {
      router.push('/admin')
      return
    }

    fetchBounties()
  }, [isInitialized, user, router])
  

  const fetchBounties = async () => {
    try {
        const response = await fetch('/api/admin/bounties')
      if (!response.ok) {
        throw new Error('Failed to fetch bounties')
      }
      const data = await response.json()
      setBounties(data)
    } catch (error) {
      setError('Failed to load bounties')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bountyId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/bounties/${bountyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update bounty status')
      }

      // Refresh bounties list
      fetchBounties()
    } catch (error) {
      console.error('Error updating bounty:', error)
      setError('Failed to update bounty status')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="text-white text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Link
            href="/admin/dashboard/claimants"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition"
          >
            View All Claims
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Artist / Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {bounties.map((bounty) => (
                  <tr key={bounty.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{bounty.artist}</div>
                      <div className="text-sm text-gray-400">{bounty.trackTitle}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{bounty.email}</div>
                      <div className="text-sm text-gray-400">{bounty.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      ${bounty.reward}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bounty.status === 'APPROVED' ? 'bg-green-900 text-green-200' :
                        bounty.status === 'REJECTED' ? 'bg-red-900 text-red-200' :
                        'bg-yellow-900 text-yellow-200'
                      }`}>
                        {bounty.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(bounty.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {bounty.status === 'PENDING' && (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(bounty.id, 'APPROVED')}
                            className="text-green-400 hover:text-green-300"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(bounty.id, 'REJECTED')}
                            className="text-red-400 hover:text-red-300"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
} 