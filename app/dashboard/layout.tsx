// =============================================
// LAYOUT: Dashboard con Redirección por Rol
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/application/services/AuthService'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { createClient } from '@/lib/supabase/client'
import { Shield } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<Usuario | null>(null)
  
  const authService = new AuthService()
  const supabase = createClient()

  useEffect(() => {
    checkUserAndRedirect()
  }, [])

  const checkUserAndRedirect = async () => {
    try {
      // Verificar sesión
      const session = await authService.getCurrentSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      // Obtener datos del usuario
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
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
        router.push('/auth/complete-profile')
        return
      }

      // Crear objeto Usuario
      const usuario = new Usuario({
        id: dbUser.id_usuario,
        idUsuarioAuth: dbUser.id_usuario_auth,
        nombresUsuario: dbUser.nombres_usuario,
        apellidosUsuario: dbUser.apellidos_usuario,
        emailUsuario: dbUser.email_usuario,
        ciUsuario: dbUser.ci_usuario,
        telefonoUsuario: dbUser.telefono_usuario,
        departamentoUsuario: dbUser.departamento_usuario,
        rolUsuario: dbUser.rol_usuario,
        activo: dbUser.activo,
        fechaRegistro: new Date(dbUser.fecha_registro),
        fechaActualizacion: new Date(dbUser.fecha_actualizacion),
        ultimaConexion: dbUser.ultima_conexion ? new Date(dbUser.ultima_conexion) : undefined
      })

      setUser(usuario)

      // Redireccionar según el rol
      const currentPath = window.location.pathname
      const rol = usuario.getRolUsuario()

      // Si ya está en la ruta correcta, no redireccionar
      if (shouldRedirectToRoleDashboard(currentPath, rol)) {
        redirectToRoleDashboard(rol)
        return
      }

      setLoading(false)

    } catch (error) {
      console.error('Error verificando usuario:', error)
      router.push('/auth/login')
    }
  }

  const shouldRedirectToRoleDashboard = (currentPath: string, rol: RolUsuario | string): boolean => {
    // Si está en /dashboard genérico, redireccionar
    if (currentPath === '/dashboard') return true
    
    // Verificar si es admin
    const isAdmin = rol === RolUsuario.SUPER_ADMIN || 
                   rol === RolUsuario.ADMINISTRADOR || 
                   rol === 'administrador' || 
                   rol === 'super_admin'
    
    // Si está en dashboard de admin pero no es admin, redireccionar
    if (currentPath.startsWith('/admin') && !isAdmin) return true
    
    return false
  }

  const redirectToRoleDashboard = (rol: RolUsuario | string) => {
    switch (rol) {
      case RolUsuario.SUPER_ADMIN:
      case RolUsuario.ADMINISTRADOR:
      case 'administrador':
      case 'super_admin':
        router.push('/admin/dashboard')
        break
      case RolUsuario.GERENTE:
      case 'gerente':
        router.push('/gerente/dashboard')
        break
      case RolUsuario.AUDITOR:
      case 'auditor':
        router.push('/auditor/dashboard')
        break
      default:
        router.push('/dashboard/general')
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}