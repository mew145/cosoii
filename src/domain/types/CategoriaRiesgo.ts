// =============================================
// ENUM: Categoría de Riesgo
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export enum CategoriaRiesgo {
  ESTRATEGICO = 'Estratégico',
  OPERATIVO = 'Operativo',
  FINANCIERO = 'Financiero',
  CUMPLIMIENTO = 'Cumplimiento',
  REPUTACIONAL = 'Reputacional',
  TECNOLOGICO = 'Tecnológico',
  SEGURIDAD_INFORMACION = 'Seguridad de la Información'
}

export interface CategoriaRiesgoInfo {
  id: number
  name: CategoriaRiesgo
  description: string
  color: string
  icon: string
}

export const CATEGORIAS_RIESGO_INFO: Record<CategoriaRiesgo, CategoriaRiesgoInfo> = {
  [CategoriaRiesgo.ESTRATEGICO]: {
    id: 1,
    name: CategoriaRiesgo.ESTRATEGICO,
    description: 'Riesgos relacionados con la estrategia y objetivos de la empresa',
    color: '#dc2626', // red-600
    icon: 'Target'
  },
  [CategoriaRiesgo.OPERATIVO]: {
    id: 2,
    name: CategoriaRiesgo.OPERATIVO,
    description: 'Riesgos en procesos operativos y de producción',
    color: '#ea580c', // orange-600
    icon: 'Cog'
  },
  [CategoriaRiesgo.FINANCIERO]: {
    id: 3,
    name: CategoriaRiesgo.FINANCIERO,
    description: 'Riesgos financieros y contables',
    color: '#16a34a', // green-600
    icon: 'DollarSign'
  },
  [CategoriaRiesgo.CUMPLIMIENTO]: {
    id: 4,
    name: CategoriaRiesgo.CUMPLIMIENTO,
    description: 'Riesgos de cumplimiento legal y regulatorio',
    color: '#2563eb', // blue-600
    icon: 'Scale'
  },
  [CategoriaRiesgo.REPUTACIONAL]: {
    id: 5,
    name: CategoriaRiesgo.REPUTACIONAL,
    description: 'Riesgos que afectan la imagen y reputación',
    color: '#7c3aed', // violet-600
    icon: 'Users'
  },
  [CategoriaRiesgo.TECNOLOGICO]: {
    id: 6,
    name: CategoriaRiesgo.TECNOLOGICO,
    description: 'Riesgos relacionados con tecnología y sistemas',
    color: '#0891b2', // cyan-600
    icon: 'Monitor'
  },
  [CategoriaRiesgo.SEGURIDAD_INFORMACION]: {
    id: 7,
    name: CategoriaRiesgo.SEGURIDAD_INFORMACION,
    description: 'Riesgos de seguridad de la información ISO 27001',
    color: '#be123c', // rose-700
    icon: 'Lock'
  }
}

// Funciones utilitarias
export function getCategoriaRiesgoInfo(categoria: CategoriaRiesgo): CategoriaRiesgoInfo {
  return CATEGORIAS_RIESGO_INFO[categoria]
}

export function getCategoriaRiesgoById(id: number): CategoriaRiesgo | null {
  const categoria = Object.values(CATEGORIAS_RIESGO_INFO).find(info => info.id === id)
  return categoria ? categoria.name : null
}

export function getCategoriasRelacionadas(categoria: CategoriaRiesgo): CategoriaRiesgo[] {
  // Lógica para categorías relacionadas
  switch (categoria) {
    case CategoriaRiesgo.TECNOLOGICO:
      return [CategoriaRiesgo.SEGURIDAD_INFORMACION, CategoriaRiesgo.OPERATIVO]
    case CategoriaRiesgo.SEGURIDAD_INFORMACION:
      return [CategoriaRiesgo.TECNOLOGICO, CategoriaRiesgo.CUMPLIMIENTO]
    case CategoriaRiesgo.FINANCIERO:
      return [CategoriaRiesgo.OPERATIVO, CategoriaRiesgo.CUMPLIMIENTO]
    case CategoriaRiesgo.REPUTACIONAL:
      return [CategoriaRiesgo.CUMPLIMIENTO, CategoriaRiesgo.SEGURIDAD_INFORMACION]
    default:
      return []
  }
}

export function isCategoriaCritica(categoria: CategoriaRiesgo): boolean {
  const categoriasCriticas = [
    CategoriaRiesgo.ESTRATEGICO,
    CategoriaRiesgo.FINANCIERO,
    CategoriaRiesgo.SEGURIDAD_INFORMACION
  ]
  return categoriasCriticas.includes(categoria)
}