'use server'

import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase/client'

const env = process.env.NODE_ENV === 'production'

export async function setAuthCookie(token: string) {
  cookies().set({
    name: 'sb-token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: env,
    sameSite: 'lax',
    maxAge: 7000,
  })
}

export async function deleteAuthCookie() {
  cookies().delete('sb-token')
}
export async function getAuthSession() {
  const token = cookies().get('sb-token')?.value
  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return user
}