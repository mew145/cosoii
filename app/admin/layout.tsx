// =============================================
// LAYOUT: Protección de Rutas de Administrador
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/application/services/AuthService'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { createClient } from '@/lib/supabase/client'
import { Shield, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState('')
  
  const authService = new AuthService()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      console.log('🔐 Verificando acceso de administrador...')
      
      // Verificar sesión
      const session = await authService.getCurrentSession()
      if (!session) {
        console.log('❌ No hay sesión, redirigiendo al login')
        router.push('/auth/login')
        return
      }

      // Obtener datos del usuario
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        console.log('❌ No se pudo obtener usuario')
        router.push('/auth/login')
        return
      }

      // Buscar usuario en BD
      const { data: dbUser, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario_auth', userData.user.id)
        .single()

      if (error || !dbUser) {
        console.log('❌ Usuario no encontrado en BD')
        router.push('/auth/complete-profile')
        return
      }

      // Verificar que sea administrador (super_admin o administrador)
      const isAdmin = dbUser.rol_usuario === RolUsuario.SUPER_ADMIN || 
                     dbUser.rol_usuario === RolUsuario.ADMINISTRADOR ||
                     dbUser.rol_usuario === 'administrador' // Para compatibilidad con datos existentes
      
      if (!isAdmin) {
        console.log('❌ Usuario no es administrador:', dbUser.rol_usuario)
        setError('No tienes permisos de administrador para acceder a esta sección')
        setLoading(false)
        return
      }

      // Verificar que esté activo
      if (!dbUser.activo) {
        console.log('❌ Usuario no está activo')
        setError('Tu cuenta no está activa. Contacta al administrador.')
        setLoading(false)
        return
      }

      console.log('✅ Acceso de administrador verificado')
      setAuthorized(true)

    } catch (error) {
      console.error('❌ Error verificando acceso:', error)
      setError('Error verificando permisos de acceso')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-spin mx-auto mb-4 text-red-600" />
          <p>Verificando permisos de administrador...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Acceso denegado. No tienes permisos de administrador.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}