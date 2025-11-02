"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getAuthSession, deleteAuthCookie } from '@/lib/supabase/cookies'
import { useLandlord } from '@/context/user-context'

export default function AuthPage() {
  const router = useRouter()
  const { updateLandlord } = useLandlord()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    ubication: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getAuthSession()
        if (!user) throw new Error('No session')
        
        const { data: landlord } = await supabase
          .from('LANDLORDS')
          .select('*')
          .eq('id', user.id)
          .single()

        if (landlord) {
          updateLandlord({
            id: user.id,
            email: user.email!,
            name: landlord.name,
            phone: landlord.phone,
            ubication: landlord.ubication,
            themePrefered: 'dark'
          })
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const user = await getAuthSession()
      if (!user) throw new Error('No authenticated session')

      const { data: landlord, error } = await supabase
        .from('LANDLORDS')
        .insert([{
          id: user.id,
          email: user.email,
          name: formData.name || 'New User',
          phone: formData.phone || '',
          ubication: formData.ubication
        }])
        .select()
        .single()

      if (error) throw error

      await supabase.auth.updateUser({
        data: { full_name: formData.name }
      })

      updateLandlord({
        id: user.id,
        email: user.email!,
        name: landlord.name,
        phone: landlord.phone,
        ubication: landlord.ubication,
        themePrefered: 'dark'
      })

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
      await deleteAuthCookie()
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Complete Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-md border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              name="ubication"
              value={formData.ubication}
              onChange={(e) => setFormData({ ...formData, ubication: e.target.value })}
              className="w-full px-3 py-2 border rounded-md border-gray-300"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Complete Registration
          </button>
        </div>
      </form>
    </div>
  )
}