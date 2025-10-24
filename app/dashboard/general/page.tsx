// =============================================
// DASHBOARD GENERAL - DELTA CONSULT LTDA
// Consultoría en Gestión de Riesgos
// =============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Shield,
  Users,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { AuthService } from '@/application/services/AuthService'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { createClient } from '@/lib/supabase/client'
import { BRAND_INFO } from '@/lib/constants/brand'

export default function GeneralDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const authService = new AuthService()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      console.log('🔍 Cargando datos del usuario...')

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
          setError('Error consultando base de datos')
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

      console.log('✅ Usuario cargado exitosamente para dashboard')
      setUser(usuario)

    } catch (error) {
      console.error('❌ Error cargando usuario:', error)
      setError(`Error cargando datos del usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }

  const getRoleDisplayName = (rol: RolUsuario | string): string => {
    // Usar directamente los valores string para evitar duplicados
    const roleNames: Record<string, string> = {
      'super_admin': 'Super Administrador',
      'administrador': 'Administrador',
      'gerente': 'Gerente',
      'auditor': 'Auditor'
    }
    return roleNames[rol as string] || rol
  }

  const getRoleColor = (rol: RolUsuario | string): string => {
    // Usar directamente los valores string para evitar duplicados
    const roleColors: Record<string, string> = {
      'super_admin': 'destructive',
      'administrador': 'destructive',
      'gerente': 'default',
      'auditor': 'secondary'
    }
    return roleColors[rol as string] || 'secondary'
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {BRAND_INFO.name}
                </h1>
                <p className="text-sm text-slate-600">{BRAND_INFO.tagline}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    {user?.getNombresUsuario()} {user?.getApellidosUsuario()}
                  </span>
                </div>
                <Badge variant={getRoleColor(user?.getRolUsuario() || RolUsuario.AUDITOR) as any} className="bg-blue-100 text-blue-800 border-blue-200">
                  {getRoleDisplayName(user?.getRolUsuario() || RolUsuario.AUDITOR)}
                </Badge>
              </div>

              <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-300 text-slate-700 hover:bg-slate-50">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8 delta-animate-fade-in">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            ¡Bienvenido, {user?.getNombresUsuario()}!
          </h2>
          <p className="text-lg text-slate-600">
            {BRAND_INFO.description}
          </p>
        </div>

        {/* User Status Alert */}
        {!user?.getActivo() && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Tu cuenta está pendiente de activación. Contacta al administrador para obtener acceso completo.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 delta-animate-slide-up">
          <Card className="delta-card border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Estado del Usuario</CardTitle>
              {user?.getActivo() ? (
                <div className="bg-emerald-100 p-1 rounded-full">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
              ) : (
                <div className="bg-red-100 p-1 rounded-full">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {user?.getActivo() ? 'Activo' : 'Inactivo'}
              </div>
              <p className="text-xs text-slate-500">
                Rol: {getRoleDisplayName(user?.getRolUsuario() || RolUsuario.AUDITOR)}
              </p>
            </CardContent>
          </Card>

          <Card className="delta-card border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Mis Riesgos</CardTitle>
              <div className="bg-orange-100 p-1 rounded-full">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500">
                Riesgos asignados
              </p>
            </CardContent>
          </Card>

          <Card className="delta-card border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Mis Controles</CardTitle>
              <div className="bg-blue-100 p-1 rounded-full">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500">
                Controles a cargo
              </p>
            </CardContent>
          </Card>

          <Card className="delta-card border-slate-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Mis Reportes</CardTitle>
              <div className="bg-violet-100 p-1 rounded-full">
                <BarChart3 className="h-4 w-4 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">0</div>
              <p className="text-xs text-slate-500">
                Reportes generados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="delta-card-elevated border-slate-200 hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                Gestión de Riesgos
              </CardTitle>
              <CardDescription className="text-slate-600">
                Identifica, evalúa y gestiona los riesgos empresariales con metodología COSO II
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white" disabled={!user?.getActivo()}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Gestionar Riesgos
              </Button>
            </CardContent>
          </Card>

          <Card className="delta-card-elevated border-slate-200 hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                Controles ISO 27001
              </CardTitle>
              <CardDescription className="text-slate-600">
                Implementa y monitorea controles de seguridad de la información
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white" disabled={!user?.getActivo()}>
                <Shield className="h-4 w-4 mr-2" />
                Ver Controles
              </Button>
            </CardContent>
          </Card>

          <Card className="delta-card-elevated border-slate-200 hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Reportes y Auditoría
              </CardTitle>
              <CardDescription className="text-slate-600">
                Genera reportes ejecutivos y rastrea cambios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white" disabled={!user?.getActivo()}>
                <FileText className="h-4 w-4 mr-2" />
                Ver Reportes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Information */}
        <Card className="mt-8 delta-card-elevated border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Información del Usuario
            </CardTitle>
            <CardDescription className="text-slate-600">
              Detalles de tu cuenta y perfil en {BRAND_INFO.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">Nombre Completo</label>
                <p className="text-base font-medium text-slate-900">
                  {user?.getNombresUsuario()} {user?.getApellidosUsuario()}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">Email</label>
                <p className="text-base text-slate-900">{user?.getEmailUsuario()}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">CI</label>
                <p className="text-base text-slate-900">
                  {user?.getCiUsuario() || 'No especificado'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">Departamento</label>
                <p className="text-base text-slate-900">
                  {user?.getDepartamentoUsuario() || 'No especificado'}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">Rol</label>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRoleColor(user?.getRolUsuario() || RolUsuario.AUDITOR) as any} className="bg-blue-100 text-blue-800 border-blue-200">
                    {getRoleDisplayName(user?.getRolUsuario() || RolUsuario.AUDITOR)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-500">Fecha de Registro</label>
                <p className="text-base text-slate-900">
                  {user?.getFechaRegistro()?.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {(!user?.getCiUsuario() || !user?.getActivo()) && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button
                  onClick={() => router.push('/auth/complete-profile')}
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Completar Perfil
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}