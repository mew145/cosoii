// =============================================
// PÁGINA PRINCIPAL DEL DASHBOARD - REDIRECCIÓN POR ROL
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'
import { AuthService } from '@/application/services/AuthService'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const authService = new AuthService()
  const supabase = createClient()

  useEffect(() => {
    redirectToRoleDashboard()
  }, [])

  const redirectToRoleDashboard = async () => {
    try {
      console.log('🔍 Verificando usuario y redirigiendo por rol...')

      // Verificar sesión
      const session = await authService.getCurrentSession()
      if (!session) {
        console.log('❌ No hay sesión, redirigiendo al login')
        router.push('/auth/login')
        return
      }

      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        console.log('❌ Error obteniendo usuario auth:', userError?.message)
        router.push('/auth/login')
        return
      }

      // Buscar usuario en BD
      const { data: dbUser, error: dbError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario_auth', userData.user.id)
        .single()

      if (dbError) {
        console.log('❌ Error consultando BD:', dbError.message)
        if (dbError.code === 'PGRST116') {
          console.log('🔄 Usuario no existe en BD, redirigiendo a completar perfil')
          router.push('/auth/complete-profile')
        } else {
          router.push('/auth/login')
        }
        return
      }

      if (!dbUser) {
        console.log('❌ Usuario no encontrado en BD, redirigiendo a completar perfil')
        router.push('/auth/complete-profile')
        return
      }

      // Verificar si necesita completar perfil
      const needsProfile = !dbUser.ci_usuario || !dbUser.activo ||
        !dbUser.nombres_usuario || dbUser.nombres_usuario === 'Usuario'

      if (needsProfile) {
        console.log('⚠️ Usuario necesita completar perfil')
        router.push('/auth/complete-profile')
        return
      }

      // Redireccionar según el rol
      const rol = dbUser.rol_usuario as RolUsuario
      console.log('👤 Rol del usuario:', rol)

      switch (rol) {
        case RolUsuario.SUPER_ADMIN:
        case RolUsuario.ADMINISTRADOR:
          console.log('🔐 Redirigiendo a dashboard de administrador')
          router.push('/admin/dashboard')
          break
        case RolUsuario.GERENTE:
          console.log('📊 Redirigiendo a dashboard de gerente')
          router.push('/gerente/dashboard')
          break
        case RolUsuario.AUDITOR:
          console.log('🔍 Redirigiendo a dashboard de auditor')
          router.push('/auditor/dashboard')
          break
        default:
          console.log('❓ Rol no reconocido, usando dashboard general')
          router.push('/dashboard/general')
          break
      }

    } catch (error) {
      console.error('❌ Error verificando usuario:', error)
      router.push('/auth/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Shield className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p>Redirigiendo al dashboard apropiado...</p>
      </div>
    </div>
  )
}