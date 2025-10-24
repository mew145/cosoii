// =============================================
// PÁGINA: Editar Usuario
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Edit, 
  ArrowLeft,
  Save,
  AlertTriangle,
  CheckCircle,
  User,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react'
import { UserService, UpdateUserRequest } from '@/application/services/UserService'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { ROLES_DISPLAY_NAMES, ROLES_DESCRIPTIONS } from '@/domain/types/RolUsuario'

interface FormData {
  nombres: string
  apellidos: string
  email: string
  ci: string
  telefono: string
  departamento: string
  rol: RolUsuario | ''
  activo: boolean
}

interface FormErrors {
  nombres?: string
  apellidos?: string
  email?: string
  ci?: string
  telefono?: string
  departamento?: string
  rol?: string
}

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = parseInt(params.id as string)

  const [user, setUser] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState<FormData>({
    nombres: '',
    apellidos: '',
    email: '',
    ci: '',
    telefono: '',
    departamento: '',
    rol: '',
    activo: true
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const userService = new UserService()

  useEffect(() => {
    if (userId) {
      loadUser()
    }
  }, [userId])

  const loadUser = async () => {
    try {
      setLoading(true)
      setGeneralError('')

      const userData = await userService.getUserById(userId)
      
      if (!userData) {
        setGeneralError('Usuario no encontrado')
        return
      }

      setUser(userData)
      setFormData({
        nombres: userData.getNombresUsuario(),
        apellidos: userData.getApellidosUsuario(),
        email: userData.getEmailUsuario(),
        ci: userData.getCiUsuario(),
        telefono: userData.getTelefonoUsuario() || '',
        departamento: userData.getDepartamentoUsuario() || '',
        rol: userData.getRolUsuario(),
        activo: userData.getActivo()
      })

    } catch (error) {
      console.error('Error cargando usuario:', error)
      setGeneralError(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al cargar el usuario'
      )
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Nombres
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos'
    } else if (formData.nombres.trim().length < 2) {
      newErrors.nombres = 'Los nombres deben tener al menos 2 caracteres'
    }

    // Apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos'
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres'
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido'
    }

    // CI
    if (!formData.ci.trim()) {
      newErrors.ci = 'El CI es requerido'
    } else if (formData.ci.trim().length < 6) {
      newErrors.ci = 'El CI debe tener al menos 6 caracteres'
    }

    // Rol
    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido'
    }

    // Teléfono (opcional pero si se proporciona debe ser válido)
    if (formData.telefono.trim() && formData.telefono.trim().length < 7) {
      newErrors.telefono = 'El teléfono debe tener al menos 7 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean | RolUsuario) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (typeof value === 'string' && errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setGeneralError('')
    setSuccess(false)

    try {
      const updateRequest: UpdateUserRequest = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        email: formData.email.trim().toLowerCase(),
        ci: formData.ci.trim(),
        telefono: formData.telefono.trim() || undefined,
        departamento: formData.departamento.trim() || undefined,
        rol: formData.rol as RolUsuario,
        activo: formData.activo
      }

      await userService.updateUser(userId, updateRequest, 1) // TODO: Get current admin user ID
      
      setSuccess(true)
      
      // Reload user data
      await loadUser()
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Error actualizando usuario:', error)
      setGeneralError(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al actualizar el usuario'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleActivateUser = async () => {
    try {
      setSaving(true)
      await userService.activateUser(userId, 1) // TODO: Get current admin user ID
      await loadUser()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error activando usuario:', error)
      setGeneralError('Error activando usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivateUser = async () => {
    if (!confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
      return
    }

    try {
      setSaving(true)
      await userService.deactivateUser(userId, 1) // TODO: Get current admin user ID
      await loadUser()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error desactivando usuario:', error)
      setGeneralError('Error desactivando usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/users')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    )
  }

  if (generalError && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error
              </h3>
              <p className="text-gray-600 mb-4">{generalError}</p>
              <Button onClick={() => router.push('/admin/users')}>
                Volver a Lista de Usuarios
              </Button>
            </div>
          </CardContent>
        </Card>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Edit className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Editar Usuario
                </h1>
                <p className="text-sm text-gray-500">
                  Modificar información del usuario: {user?.getNombreCompleto()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Usuario actualizado exitosamente
            </AlertDescription>
          </Alert>
        )}

        {generalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Datos básicos del usuario
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Nombres y Apellidos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombres">
                        Nombres <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nombres"
                        type="text"
                        placeholder="Ingrese los nombres"
                        value={formData.nombres}
                        onChange={(e) => handleInputChange('nombres', e.target.value)}
                        className={errors.nombres ? 'border-red-500' : ''}
                      />
                      {errors.nombres && (
                        <p className="text-sm text-red-500">{errors.nombres}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apellidos">
                        Apellidos <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="apellidos"
                        type="text"
                        placeholder="Ingrese los apellidos"
                        value={formData.apellidos}
                        onChange={(e) => handleInputChange('apellidos', e.target.value)}
                        className={errors.apellidos ? 'border-red-500' : ''}
                      />
                      {errors.apellidos && (
                        <p className="text-sm text-red-500">{errors.apellidos}</p>
                      )}
                    </div>
                  </div>

                  {/* Email y CI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ci">
                        CI <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ci"
                        type="text"
                        placeholder="Ingrese el CI"
                        value={formData.ci}
                        onChange={(e) => handleInputChange('ci', e.target.value)}
                        className={errors.ci ? 'border-red-500' : ''}
                      />
                      {errors.ci && (
                        <p className="text-sm text-red-500">{errors.ci}</p>
                      )}
                    </div>
                  </div>

                  {/* Teléfono y Departamento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        placeholder="Ingrese el teléfono"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        className={errors.telefono ? 'border-red-500' : ''}
                      />
                      {errors.telefono && (
                        <p className="text-sm text-red-500">{errors.telefono}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="departamento">Departamento</Label>
                      <Input
                        id="departamento"
                        type="text"
                        placeholder="Ingrese el departamento"
                        value={formData.departamento}
                        onChange={(e) => handleInputChange('departamento', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Rol */}
                  <div className="space-y-2">
                    <Label htmlFor="rol">
                      Rol del Usuario <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.rol} 
                      onValueChange={(value) => handleInputChange('rol', value as RolUsuario)}
                    >
                      <SelectTrigger className={errors.rol ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLES_DISPLAY_NAMES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.rol && (
                      <p className="text-sm text-red-500">{errors.rol}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Estado del Usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Estado Actual:</span>
                      <Badge variant={formData.activo ? 'default' : 'secondary'}>
                        {formData.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.activo ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 hover:text-red-700"
                          onClick={handleDeactivateUser}
                          disabled={saving}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Desactivar Usuario
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-green-600 hover:text-green-700"
                          onClick={handleActivateUser}
                          disabled={saving}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activar Usuario
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Role Information */}
              {formData.rol && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Información del Rol</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium">
                        {ROLES_DISPLAY_NAMES[formData.rol as RolUsuario]}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {ROLES_DESCRIPTIONS[formData.rol as RolUsuario]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Info */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Información del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">ID:</span> {user.getId()}
                      </div>
                      <div>
                        <span className="font-medium">Registrado:</span>{' '}
                        {user.getFechaRegistro().toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Actualizado:</span>{' '}
                        {user.getFechaActualizacion().toLocaleDateString()}
                      </div>
                      {user.getUltimaConexion() && (
                        <div>
                          <span className="font-medium">Última conexión:</span>{' '}
                          {user.getUltimaConexion()?.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}