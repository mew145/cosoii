// =============================================
// DASHBOARD DE GERENTE
// Sistema de Gestión de Riesgos COSO II + ISO 27001
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
  LogOut,
  User,
  CheckCircle,
  Clock,
  Briefcase,
  Target,
  TrendingUp
} from 'lucide-react'
import { AuthService } from '@/application/services/AuthService'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { createClient } from '@/lib/supabase/client'

export default function GerenteDashboardPage() {
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
      // Verificar sesión y obtener usuario
      const session = await authService.getCurrentSession()
      if (!session) {
        router.push('/auth/login')
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/auth/login')
        return
      }

      const { data: dbUser, error: dbError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario_auth', userData.user.id)
        .single()

      if (dbError || !dbUser) {
        router.push('/auth/complete-profile')
        return
      }

      const usuario = new Usuario({
        id: dbUser.id_usuario,
        idUsuarioAuth: dbUser.id_usuario_auth,
        nombresUsuario: dbUser.nombres_usuario || 'Usuario',
        apellidosUsuario: dbUser.apellidos_usuario || 'Temporal',
        emailUsuario: dbUser.email_usuario,
        ciUsuario: dbUser.ci_usuario || 'temp000',
        telefonoUsuario: dbUser.telefono_usuario,
        departamentoUsuario: dbUser.departamento_usuario,
        rolUsuario: dbUser.rol_usuario,
        activo: dbUser.activo,
        fechaRegistro: new Date(dbUser.fecha_registro),
        fechaActualizacion: new Date(dbUser.fecha_actualizacion),
        ultimaConexion: dbUser.ultima_conexion ? new Date(dbUser.ultima_conexion) : undefined
      })

      // Verificar que sea gerente
      if (usuario.getRolUsuario() !== RolUsuario.GERENTE && usuario.getRolUsuario() !== 'gerente') {
        router.push('/dashboard')
        return
      }

      setUser(usuario)

    } catch (error) {
      console.error('Error cargando datos de gerente:', error)
      setError(`Error cargando dashboard: ${error instanceof Error ? error.message : 'Error desconocido'}`)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Cargando dashboard de gerente...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard de Gerente
                </h1>
                <p className="text-sm text-gray-500">Gestión de Proyectos y Riesgos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {user?.getNombresUsuario()} {user?.getApellidosUsuario()}
                </span>
                <Badge variant="default">
                  GERENTE
                </Badge>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.getNombresUsuario()}!
          </h2>
          <p className="text-gray-600">
            Panel de control para gestión de proyectos y supervisión de riesgos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Proyectos</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Proyectos activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Riesgos del Proyecto</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Riesgos identificados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objetivos</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Objetivos completados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">
                Progreso general
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                Gestión de Proyectos
              </CardTitle>
              <CardDescription>
                Administra y supervisa tus proyectos asignados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={!user?.getActivo()}>
                <Briefcase className="h-4 w-4 mr-2" />
                Ver Proyectos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Riesgos del Proyecto
              </CardTitle>
              <CardDescription>
                Identifica y gestiona riesgos específicos del proyecto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={!user?.getActivo()}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Gestionar Riesgos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Reportes de Proyecto
              </CardTitle>
              <CardDescription>
                Genera reportes de progreso y rendimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={!user?.getActivo()}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Reportes
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}