// =============================================
// PÁGINA: Gestión de Usuarios - Lista
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { UserService, UserFilters } from '@/application/services/UserService'
import { Usuario, RolUsuario } from '@/domain/entities/Usuario'
import { ROLES_DISPLAY_NAMES } from '@/domain/types/RolUsuario'
import { PaginationOptions } from '@/domain/repositories/common'

interface UserListState {
  users: Usuario[]
  loading: boolean
  error: string
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function UsersPage() {
  const router = useRouter()
  const [state, setState] = useState<UserListState>({
    users: [],
    loading: true,
    error: '',
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  })

  const [filters, setFilters] = useState<UserFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  const userService = new UserService()
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    loadUsers()
  }, [state.page, filters])

  const loadUsers = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }))

      const pagination: PaginationOptions = {
        page: state.page,
        limit: ITEMS_PER_PAGE
      }

      const result = await userService.getUsers(filters, pagination)

      setState(prev => ({
        ...prev,
        users: result.data,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious,
        loading: false
      }))

    } catch (error) {
      console.error('Error cargando usuarios:', error)
      setState(prev => ({
        ...prev,
        error: `Error cargando usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        loading: false
      }))
    }
  }

  const handleSearch = () => {
    const newFilters: UserFilters = {}

    if (searchTerm.trim()) {
      newFilters.search = searchTerm.trim()
    }

    if (selectedRole && selectedRole !== 'all') {
      newFilters.rol = selectedRole as RolUsuario
    }

    if (selectedStatus && selectedStatus !== 'all') {
      newFilters.activo = selectedStatus === 'active'
    }

    setFilters(newFilters)
    setState(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedRole('')
    setSelectedStatus('')
    setFilters({})
    setState(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setState(prev => ({ ...prev, page: newPage }))
  }

  const handleEditUser = (userId: number) => {
    router.push(`/admin/users/${userId}/edit`)
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
      return
    }

    try {
      await userService.deactivateUser(userId, 1) // TODO: Get current admin user ID
      await loadUsers()
    } catch (error) {
      console.error('Error desactivando usuario:', error)
      alert('Error desactivando usuario')
    }
  }

  const getRoleBadgeVariant = (rol: RolUsuario) => {
    switch (rol) {
      case RolUsuario.SUPER_ADMIN:
        return 'destructive'
      case RolUsuario.ADMINISTRADOR:
        return 'default'
      case RolUsuario.GERENTE:
        return 'secondary'
      case RolUsuario.AUDITOR:
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (state.loading && state.users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Cargando usuarios...</p>
        </div>
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
                onClick={() => router.push('/admin/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Gestión de Usuarios
                </h1>
                <p className="text-sm text-gray-500">
                  Administrar cuentas de usuario del sistema
                </p>
              </div>
            </div>
            
            <Button onClick={() => router.push('/admin/users/create')}>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Búsqueda
            </CardTitle>
            <CardDescription>
              Filtra usuarios por diferentes criterios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <Input
                  placeholder="Buscar por nombre, email o CI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Role Filter */}
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {Object.entries(ROLES_DISPLAY_NAMES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lista de Usuarios</CardTitle>
                <CardDescription>
                  {state.total} usuario{state.total !== 1 ? 's' : ''} encontrado{state.total !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadUsers}
                disabled={state.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {state.users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No se encontraron usuarios</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>CI</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.users.map((user) => (
                      <TableRow key={user.getId()}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.getNombresUsuario()} {user.getApellidosUsuario()}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.getId()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.getEmailUsuario()}</TableCell>
                        <TableCell>{user.getCiUsuario()}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.getRolUsuario())}>
                            {ROLES_DISPLAY_NAMES[user.getRolUsuario()] || user.getRolUsuario()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {user.getActivo() ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-green-600">Activo</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-600 mr-2" />
                                <span className="text-red-600">Inactivo</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.getFechaRegistro().toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user.getId())}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.getId())}
                              disabled={!user.getActivo()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {state.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Página {state.page} de {state.totalPages} ({state.total} usuarios)
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(state.page - 1)}
                        disabled={!state.hasPrevious}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(state.page + 1)}
                        disabled={!state.hasNext}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}