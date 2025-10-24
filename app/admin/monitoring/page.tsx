// =============================================
// PÁGINA: Monitoreo del Sistema - Dashboard
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
  Activity, 
  ArrowLeft, 
  RefreshCw,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Shield,
  Bell,
  Eye,
  Calendar,
  TrendingUp,
  Server,
  Database,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react'
import { 
  MonitoringService, 
  SystemMetrics, 
  AuditLogEntry, 
  MonitoringFilters 
} from '@/application/services/MonitoringService'
import { 
  TipoNotificacion, 
  EstadoNotificacion, 
  PrioridadNotificacion 
} from '@/domain/entities/Notificacion'

interface MonitoringState {
  auditLogs: AuditLogEntry[]
  metrics: SystemMetrics
  loading: boolean
  error: string
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export default function MonitoringPage() {
  const router = useRouter()
  const [state, setState] = useState<MonitoringState>({
    auditLogs: [],
    metrics: {
      totalNotifications: 0,
      pendingNotifications: 0,
      sentNotifications: 0,
      errorNotifications: 0,
      criticalAlerts: 0,
      securityIncidents: 0,
      systemUptime: '99.9%',
      lastBackup: new Date(),
      userStats: {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0
      }
    },
    loading: true,
    error: '',
    total: 0,
    page: 1,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  })

  const [filters, setFilters] = useState<MonitoringFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedPriority, setSelectedPriority] = useState<string>('')
  const [dateRange, setDateRange] = useState<string>('')

  const ITEMS_PER_PAGE = 20
  const monitoringService = new MonitoringService()

  useEffect(() => {
    // Check for URL parameters on initial load
    const urlParams = new URLSearchParams(window.location.search)
    const typeParam = urlParams.get('type')
    
    if (typeParam && Object.values(TipoNotificacion).includes(typeParam as TipoNotificacion)) {
      setSelectedType(typeParam)
      setFilters({ tipoNotificacion: typeParam as TipoNotificacion })
    }
    
    loadMonitoringData()
  }, [state.page, filters])

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadMonitoringData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadMonitoringData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }))

      // Load system metrics and audit logs in parallel
      const [metrics, auditResult] = await Promise.all([
        monitoringService.getSystemMetrics(),
        monitoringService.getAuditLogs(filters, state.page, ITEMS_PER_PAGE)
      ])

      setState(prev => ({
        ...prev,
        auditLogs: auditResult.auditLogs,
        metrics,
        total: auditResult.total,
        totalPages: auditResult.totalPages,
        hasNext: auditResult.hasNext,
        hasPrevious: auditResult.hasPrevious,
        loading: false
      }))

    } catch (error) {
      console.error('Error cargando datos de monitoreo:', error)
      setState(prev => ({
        ...prev,
        error: `Error cargando datos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        loading: false
      }))
    }
  }

  const handleSearch = () => {
    const newFilters: MonitoringFilters = {}

    if (searchTerm.trim()) {
      newFilters.searchTerm = searchTerm.trim()
    }

    if (selectedType && selectedType !== 'all') {
      newFilters.tipoNotificacion = selectedType as TipoNotificacion
    }

    if (selectedStatus && selectedStatus !== 'all') {
      newFilters.estadoNotificacion = selectedStatus as EstadoNotificacion
    }

    if (selectedPriority && selectedPriority !== 'all') {
      newFilters.prioridadNotificacion = selectedPriority as PrioridadNotificacion
    }

    if (dateRange && dateRange !== 'all') {
      newFilters.dateRange = dateRange as 'today' | 'week' | 'month' | 'all'
    }

    setFilters(newFilters)
    setState(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedType('')
    setSelectedStatus('')
    setSelectedPriority('')
    setDateRange('')
    setFilters({})
    setState(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setState(prev => ({ ...prev, page: newPage }))
  }

  const handleExport = async () => {
    try {
      const csvData = await monitoringService.exportAuditLogs(filters, 'csv')
      
      // Create and download CSV file
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error exportando logs:', error)
      alert('Error exportando logs de auditoría')
    }
  }

  const getStatusBadgeVariant = (status: EstadoNotificacion) => {
    switch (status) {
      case EstadoNotificacion.ENVIADA:
        return 'default'
      case EstadoNotificacion.PENDIENTE:
        return 'secondary'
      case EstadoNotificacion.ERROR:
        return 'destructive'
      case EstadoNotificacion.LEIDA:
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getPriorityBadgeVariant = (priority: PrioridadNotificacion) => {
    switch (priority) {
      case PrioridadNotificacion.CRITICA:
        return 'destructive'
      case PrioridadNotificacion.ALTA:
        return 'default'
      case PrioridadNotificacion.MEDIA:
        return 'secondary'
      case PrioridadNotificacion.BAJA:
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getTypeIcon = (type: TipoNotificacion) => {
    switch (type) {
      case TipoNotificacion.INCIDENTE_SEGURIDAD:
        return <Shield className="h-4 w-4 text-red-600" />
      case TipoNotificacion.RIESGO_CRITICO:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case TipoNotificacion.VENCIMIENTO_ACTIVIDAD:
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  if (state.loading && state.auditLogs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p>Cargando datos de monitoreo...</p>
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
              <Activity className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Monitoreo del Sistema
                </h1>
                <p className="text-sm text-gray-500">
                  Supervisión de actividad y logs de auditoría en tiempo real
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMonitoringData}
                disabled={state.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                disabled={state.loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notificaciones</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.metrics.totalNotifications}</div>
              <p className="text-xs text-muted-foreground">
                Últimas 24 horas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {state.metrics.criticalAlerts}
              </div>
              <p className="text-xs text-muted-foreground">
                Requieren atención inmediata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidentes de Seguridad</CardTitle>
              <Shield className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {state.metrics.securityIncidents}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 7 días
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo de Actividad</CardTitle>
              <Server className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {state.metrics.systemUptime}
              </div>
              <p className="text-xs text-muted-foreground">
                Último mes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Notificaciones Enviadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {state.metrics.sentNotifications}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Tasa de éxito: 98.5%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                Pendientes de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {state.metrics.pendingNotifications}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                En cola de procesamiento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Errores de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {state.metrics.errorNotifications}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Requieren revisión
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Alerts Section */}
        <SecurityAlertsSection 
          criticalAlerts={state.metrics.criticalAlerts}
          securityIncidents={state.metrics.securityIncidents}
          onRefresh={loadMonitoringData}
        />

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros de Auditoría
            </CardTitle>
            <CardDescription>
              Filtrar logs de auditoría por diferentes criterios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <Input
                  placeholder="Buscar en logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  className="w-full"
                />
              </div>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value={TipoNotificacion.INCIDENTE_SEGURIDAD}>Incidente Seguridad</SelectItem>
                  <SelectItem value={TipoNotificacion.RIESGO_CRITICO}>Riesgo Crítico</SelectItem>
                  <SelectItem value={TipoNotificacion.VENCIMIENTO_ACTIVIDAD}>Vencimiento</SelectItem>
                  <SelectItem value={TipoNotificacion.AUDITORIA_PROGRAMADA}>Auditoría</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value={EstadoNotificacion.PENDIENTE}>Pendiente</SelectItem>
                  <SelectItem value={EstadoNotificacion.ENVIADA}>Enviada</SelectItem>
                  <SelectItem value={EstadoNotificacion.ERROR}>Error</SelectItem>
                  <SelectItem value={EstadoNotificacion.LEIDA}>Leída</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value={PrioridadNotificacion.CRITICA}>Crítica</SelectItem>
                  <SelectItem value={PrioridadNotificacion.ALTA}>Alta</SelectItem>
                  <SelectItem value={PrioridadNotificacion.MEDIA}>Media</SelectItem>
                  <SelectItem value={PrioridadNotificacion.BAJA}>Baja</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSearch()}
                disabled={state.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${state.loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Logs de Auditoría</CardTitle>
                <CardDescription>
                  {state.total} registro{state.total !== 1 ? 's' : ''} encontrado{state.total !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                  En tiempo real
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {state.auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No se encontraron registros de auditoría</p>
                <p className="text-sm text-gray-400 mt-2">
                  Los logs aparecerán aquí cuando se genere actividad en el sistema
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Mensaje</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getTypeIcon(log.type)}
                            <span className="ml-2 text-sm">
                              {log.type.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">
                              {log.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {log.message}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">
                              ID: {log.userId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityBadgeVariant(log.priority)}>
                            {log.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(log.status)}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {log.channel}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {log.createdAt.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.createdAt.toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {state.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                      Página {state.page} de {state.totalPages} ({state.total} registros)
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

// Security Alerts Section Component
interface SecurityAlertsSectionProps {
  criticalAlerts: number
  securityIncidents: number
  onRefresh: () => void
}

function SecurityAlertsSection({ criticalAlerts, securityIncidents, onRefresh }: SecurityAlertsSectionProps) {
  const [alerts, setAlerts] = useState<AuditLogEntry[]>([])
  const [incidents, setIncidents] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const monitoringService = new MonitoringService()

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    try {
      setLoading(true)
      const [criticalAlertsData, securityIncidentsData] = await Promise.all([
        monitoringService.getCriticalAlerts(5),
        monitoringService.getSecurityIncidents(5)
      ])
      
      setAlerts(criticalAlertsData)
      setIncidents(securityIncidentsData)
    } catch (error) {
      console.error('Error cargando datos de seguridad:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPending = async () => {
    try {
      setLoading(true)
      await monitoringService.processePendingNotifications()
      onRefresh()
      alert('Notificaciones pendientes procesadas exitosamente')
    } catch (error) {
      console.error('Error procesando notificaciones:', error)
      alert('Error procesando notificaciones pendientes')
    } finally {
      setLoading(false)
    }
  }

  const handleRetryFailed = async () => {
    try {
      setLoading(true)
      const result = await monitoringService.retryFailedNotifications()
      onRefresh()
      alert(`Reintentadas: ${result.retried}, Exitosas: ${result.successful}, Fallidas permanentemente: ${result.permanentlyFailed}`)
    } catch (error) {
      console.error('Error reintentando notificaciones:', error)
      alert('Error reintentando notificaciones fallidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Critical Alerts */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Alertas Críticas Recientes
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              {criticalAlerts} activas
            </Badge>
          </div>
          <CardDescription>
            Alertas de alta prioridad que requieren atención inmediata
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-sm text-gray-500">No hay alertas críticas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-900 truncate">
                      {alert.title}
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {alert.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2 mt-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleProcessPending}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Procesar Pendientes
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRetryFailed}
              disabled={loading}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reintentar Fallidas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Incidents */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-orange-600" />
              Incidentes de Seguridad
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {securityIncidents} últimos 7 días
            </Badge>
          </div>
          <CardDescription>
            Eventos de seguridad detectados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-4">
              <Shield className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-sm text-gray-500">No hay incidentes recientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Shield className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-orange-900 truncate">
                      {incident.title}
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      {incident.message}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Usuario ID: {incident.userId} - {incident.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {incident.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2 mt-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={loadSecurityData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                // Filter to show only security incidents
                window.location.href = '/admin/monitoring?type=INCIDENTE_SEGURIDAD'
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Todos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}