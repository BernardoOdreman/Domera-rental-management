// middleware.ts
import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/supabase/cookies' 
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = await getAuthSession()

  // Si no hay sesión (usuario no autenticado)
  if (!session) {
    // Permite solo el acceso a las rutas 'login', 'signUp' y 'authentication'
    if (
      !['/login', '/signUp', '/authentication'].includes(request.nextUrl.pathname)
    ) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Si hay sesión (usuario autenticado)
  if (session) {
    // Redirige si intenta acceder a 'login', 'signUp' o 'authentication'
    if (
      ['/login', '/signUp', '/authentication'].includes(request.nextUrl.pathname)
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url)) // Redirige a dashboard o cualquier otra página segura
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth).*)'],
}
