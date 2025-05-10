import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporalmente deshabilitamos toda la lógica del middleware
// Solo dejamos que todas las peticiones continúen normalmente
export function middleware(request: NextRequest) {
  // Simplemente permitimos todas las solicitudes sin redirecciones
  return NextResponse.next();
}

// Mantenemos el matcher para que el middleware siga procesando las mismas rutas
export const config = {
  matcher: ['/', '/schedule', '/admin']
}