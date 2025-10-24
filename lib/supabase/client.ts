import { createBrowserClient } from '@supabase/ssr'
import { appConfig } from '@/lib/config'

export function createClient() {
  // Validar configuración
  if (!appConfig.supabase.url || !appConfig.supabase.anonKey) {
    throw new Error(
      'Configuración de Supabase incompleta. Verifica NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local'
    )
  }

  return createBrowserClient(appConfig.supabase.url, appConfig.supabase.anonKey)
}
