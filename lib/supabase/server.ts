import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { appConfig } from '@/lib/config'

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  // Validar configuración
  if (!appConfig.supabase.url || !appConfig.supabase.anonKey) {
    throw new Error(
      'Configuración de Supabase incompleta. Verifica NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(appConfig.supabase.url, appConfig.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
