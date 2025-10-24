// =============================================
// DASHBOARD DE SUPERADMINISTRADOR
// Delta Consult LTDA - Consultoría en Gestión de Riesgos
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
  Clock,
  Database,
  Activity,
  UserPlus,
  Eye,
  Cog,
  TrendingUp,
  TrendingDown,
  Server,
  Bell
} from 'lucide-react'
import { AuthService } from '@/application/services/AuthService'
import { UserService } from '@/application/services/UserService'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { createClient } from '@/lib/supabase/client'

interface SystemStats {
  totalUsuarios: number
  usuariosActivos: number
  usuariosInactivos: number
  distribucionPorRol: { rol: RolUsuario; count: number }[]
  usuariosRecientes: Usuario[]
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<Usuario | null>(null)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const authService = new AuthService()
  const userService = new UserService()
  const supabase = createClient()

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Verificar que el usuario sea administrador
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

      // Verificar que sea administrador (super_admin o administrador)
      const isAdmin = usuario.getRolUsuario() === RolUsuario.SUPER_ADMIN || 
                     usuario.getRolUsuario() === RolUsuario.ADMINISTRADOR ||
                     usuario.getRolUsuario() === 'administrador' // Para compatibilidad
      
      if (!isAdmin) {
        router.push('/dashboard')
        return
      }

      setUser(usuario)

      // Cargar estadísticas del sistema
      try {
        const systemStats = await userService.getUserStats()
        setStats(systemStats)
      } catch (statsError) {
        console.error('Error cargando estadísticas:', statsError)
        // Continuar sin estadísticas si hay error
        setStats({
          totalUsuarios: 0,
          usuariosActivos: 0,
          usuariosInactivos: 0,
          distribucionPorRol: [],
          usuariosRecientes: []
        })
      }

    } catch (error) {
      console.error('Error cargando datos de admin:', error)
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
          <p>Cargando dashboard de administrador...</p>
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
                  Panel de Superadministrador
                </h1>
                <p className="text-sm text-slate-600">Delta Consult</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {user?.getNombresUsuario()} {user?.getApellidosUsuario()}
                </span>
                <Badge variant="destructive">
                  SUPERADMIN
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
            Panel de control administrativo con acceso completo al sistema
          </p>
        </div>

        {/* System Status Alert */}
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Sistema operativo. Todos los servicios funcionando correctamente.
          </AlertDescription>
        </Alert>

        {/* System Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <div className="bg-blue-100 p-1 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsuarios || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.usuariosActivos || 0} activos, {stats?.usuariosInactivos || 0} inactivos
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <div className="bg-emerald-100 p-1 rounded-full">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.usuariosActivos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalUsuarios ? Math.round((stats.usuariosActivos / stats.totalUsuarios) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Riesgos del Sistema</CardTitle>
              <div className="bg-orange-100 p-1 rounded-full">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Riesgos identificados
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
              <div className="bg-emerald-100 p-1 rounded-full">
                <Server className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                Todos los servicios activos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribution by Role */}
        {stats?.distribucionPorRol && stats.distribucionPorRol.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Distribución de Usuarios por Rol</CardTitle>
              <CardDescription>
                Cantidad de usuarios registrados por cada rol del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.distribucionPorRol.map((item) => (
                  <div key={item.rol} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-sm font-semibold text-gray-800 capitalize">
                      {item.rol.replace('_', ' ').replace('super admin', 'Super Admin').replace('auditor', 'Auditor')}
                    </span>
                    <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Crear, modificar y gestionar cuentas de usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/admin/users')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Ver Usuarios
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/admin/users/create')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Monitoreo del Sistema
              </CardTitle>
              <CardDescription>
                Supervisar actividad y logs de auditoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => router.push('/admin/monitoring')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Actividad
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/admin/logs')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Logs de Auditoría
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-purple-600" />
                Configuración del Sistema
              </CardTitle>
              <CardDescription>
                Configurar parámetros y opciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => router.push('/admin/config')}
                >
                  <Cog className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/admin/backup')}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Backup & Restore
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        {stats?.usuariosRecientes && stats.usuariosRecientes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Recientes</CardTitle>
              <CardDescription>
                Últimos usuarios registrados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.usuariosRecientes.map((usuario) => (
                  <div key={usuario.getId()} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {usuario.getNombresUsuario()} {usuario.getApellidosUsuario()}
                        </p>
                        <p className="text-xs text-gray-500">{usuario.getEmailUsuario()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={usuario.getActivo() ? 'default' : 'secondary'}>
                        {usuario.getRolUsuario()}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {usuario.getFechaRegistro().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}