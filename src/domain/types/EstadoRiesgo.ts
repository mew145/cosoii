// =============================================
// ENUM: Estado de Riesgo
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export enum EstadoRiesgo {
  IDENTIFICADO = 'identificado',
  EVALUADO = 'evaluado', 
  MITIGADO = 'mitigado',
  MONITOREADO = 'monitoreado',
  CERRADO = 'cerrado',
  MATERIALIZADO = 'materializado'
}

export interface EstadoRiesgoInfo {
  id: number
  name: EstadoRiesgo
  description: string
  isFinal: boolean
  color: string
  icon: string
}

export const ESTADOS_RIESGO_INFO: Record<EstadoRiesgo, EstadoRiesgoInfo> = {
  [EstadoRiesgo.IDENTIFICADO]: {
    id: 1,
    name: EstadoRiesgo.IDENTIFICADO,
    description: 'Riesgo identificado pero no evaluado',
    isFinal: false,
    color: '#fbbf24', // yellow-400
    icon: 'AlertTriangle'
  },
  [EstadoRiesgo.EVALUADO]: {
    id: 2,
    name: EstadoRiesgo.EVALUADO,
    description: 'Riesgo evaluado y priorizado',
    isFinal: false,
    color: '#3b82f6', // blue-500
    icon: 'BarChart3'
  },
  [EstadoRiesgo.MITIGADO]: {
    id: 3,
    name: EstadoRiesgo.MITIGADO,
    description: 'Riesgo con plan de mitigación activo',
    isFinal: false,
    color: '#8b5cf6', // violet-500
    icon: 'Shield'
  },
  [EstadoRiesgo.MONITOREADO]: {
    id: 4,
    name: EstadoRiesgo.MONITOREADO,
    description: 'Riesgo en monitoreo continuo',
    isFinal: false,
    color: '#06b6d4', // cyan-500
    icon: 'Eye'
  },
  [EstadoRiesgo.CERRADO]: {
    id: 5,
    name: EstadoRiesgo.CERRADO,
    description: 'Riesgo cerrado o resuelto',
    isFinal: true,
    color: '#10b981', // emerald-500
    icon: 'CheckCircle'
  },
  [EstadoRiesgo.MATERIALIZADO]: {
    id: 6,
    name: EstadoRiesgo.MATERIALIZADO,
    description: 'Riesgo que se ha materializado',
    isFinal: true,
    color: '#ef4444', // red-500
    icon: 'AlertCircle'
  }
}

// Funciones utilitarias
export function getEstadoRiesgoInfo(estado: EstadoRiesgo): EstadoRiesgoInfo {
  return ESTADOS_RIESGO_INFO[estado]
}

export function getEstadoRiesgoById(id: number): EstadoRiesgo | null {
  const estado = Object.values(ESTADOS_RIESGO_INFO).find(info => info.id === id)
  return estado ? estado.name : null
}

export function isEstadoFinal(estado: EstadoRiesgo): boolean {
  return ESTADOS_RIESGO_INFO[estado].isFinal
}

export function getEstadosDisponibles(estadoActual: EstadoRiesgo): EstadoRiesgo[] {
  // Lógica de transiciones de estado
  switch (estadoActual) {
    case EstadoRiesgo.IDENTIFICADO:
      return [EstadoRiesgo.EVALUADO, EstadoRiesgo.CERRADO]
    case EstadoRiesgo.EVALUADO:
      return [EstadoRiesgo.MITIGADO, EstadoRiesgo.MONITOREADO, EstadoRiesgo.CERRADO]
    case EstadoRiesgo.MITIGADO:
      return [EstadoRiesgo.MONITOREADO, EstadoRiesgo.CERRADO, EstadoRiesgo.MATERIALIZADO]
    case EstadoRiesgo.MONITOREADO:
      return [EstadoRiesgo.CERRADO, EstadoRiesgo.MATERIALIZADO]
    case EstadoRiesgo.CERRADO:
      return [] // Estado final
    case EstadoRiesgo.MATERIALIZADO:
      return [EstadoRiesgo.MITIGADO] // Puede volver a mitigación
    default:
      return []
  }
}