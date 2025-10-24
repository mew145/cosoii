// =============================================
// CONSTANTES DE BASE DE DATOS
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// Estas constantes deben coincidir con los datos insertados en la base de datos

// =============================================
// ROLES DEL SISTEMA
// =============================================
export const ROLES = {
  SUPERADMIN: {
    id: 1,
    name: 'superadmin',
    description: 'Acceso total al sistema',
    level: 10,
  },
  ADMIN: {
    id: 2,
    name: 'admin',
    description: 'Administrador de la empresa',
    level: 8,
  },
  GERENTE: {
    id: 3,
    name: 'gerente',
    description: 'Gestión de riesgos de proyectos',
    level: 6,
  },
  AUDITOR_INTERNO: {
    id: 4,
    name: 'auditor_interno',
    description: 'Auditoría y cumplimiento',
    level: 7,
  },
  OFICIAL_SEGURIDAD: {
    id: 5,
    name: 'oficial_seguridad',
    description: 'Oficial de Seguridad de la Información ISO 27001',
    level: 7,
  },
  ANALISTA_RIESGOS: {
    id: 6,
    name: 'analista_riesgos',
    description: 'Analista de riesgos COSO e ISO 27001',
    level: 5,
  },
} as const

// =============================================
// DEPARTAMENTOS
// =============================================
export const DEPARTAMENTOS = {
  DIRECCION_GENERAL: {
    id: 1,
    name: 'Dirección General',
    description: 'Dirección y gestión estratégica de la empresa',
  },
  TI_SISTEMAS: {
    id: 2,
    name: 'TI y Sistemas',
    description: 'Tecnologías de la información y desarrollo de sistemas',
  },
  GESTION_RIESGOS: {
    id: 3,
    name: 'Gestión de Riesgos',
    description: 'Identificación y control de riesgos empresariales',
  },
  AUDITORIA_INTERNA: {
    id: 4,
    name: 'Auditoría Interna',
    description: 'Auditoría y cumplimiento normativo',
  },
  SEGURIDAD_INFORMACION: {
    id: 5,
    name: 'Seguridad de la Información',
    description: 'Gestión de seguridad de la información ISO 27001',
  },
} as const

// =============================================
// ESTADOS DE RIESGO
// =============================================
export const ESTADOS_RIESGO = {
  IDENTIFICADO: {
    id: 1,
    name: 'identificado',
    description: 'Riesgo identificado pero no evaluado',
    isFinal: false,
    color: '#fbbf24', // yellow-400
    icon: 'AlertTriangle',
  },
  EVALUADO: {
    id: 2,
    name: 'evaluado',
    description: 'Riesgo evaluado y priorizado',
    isFinal: false,
    color: '#3b82f6', // blue-500
    icon: 'BarChart3',
  },
  MITIGADO: {
    id: 3,
    name: 'mitigado',
    description: 'Riesgo con plan de mitigación activo',
    isFinal: false,
    color: '#8b5cf6', // violet-500
    icon: 'Shield',
  },
  MONITOREADO: {
    id: 4,
    name: 'monitoreado',
    description: 'Riesgo en monitoreo continuo',
    isFinal: false,
    color: '#06b6d4', // cyan-500
    icon: 'Eye',
  },
  CERRADO: {
    id: 5,
    name: 'cerrado',
    description: 'Riesgo cerrado o resuelto',
    isFinal: true,
    color: '#10b981', // emerald-500
    icon: 'CheckCircle',
  },
  MATERIALIZADO: {
    id: 6,
    name: 'materializado',
    description: 'Riesgo que se ha materializado',
    isFinal: true,
    color: '#ef4444', // red-500
    icon: 'AlertCircle',
  },
} as const

// =============================================
// CATEGORÍAS DE RIESGO
// =============================================
export const CATEGORIAS_RIESGO = {
  ESTRATEGICO: {
    id: 1,
    name: 'Estratégico',
    description: 'Riesgos relacionados con la estrategia y objetivos de la empresa',
    color: '#dc2626', // red-600
    icon: 'Target',
  },
  OPERATIVO: {
    id: 2,
    name: 'Operativo',
    description: 'Riesgos en procesos operativos y de producción',
    color: '#ea580c', // orange-600
    icon: 'Cog',
  },
  FINANCIERO: {
    id: 3,
    name: 'Financiero',
    description: 'Riesgos financieros y contables',
    color: '#16a34a', // green-600
    icon: 'DollarSign',
  },
  CUMPLIMIENTO: {
    id: 4,
    name: 'Cumplimiento',
    description: 'Riesgos de cumplimiento legal y regulatorio',
    color: '#2563eb', // blue-600
    icon: 'Scale',
  },
  REPUTACIONAL: {
    id: 5,
    name: 'Reputacional',
    description: 'Riesgos que afectan la imagen y reputación',
    color: '#7c3aed', // violet-600
    icon: 'Users',
  },
  TECNOLOGICO: {
    id: 6,
    name: 'Tecnológico',
    description: 'Riesgos relacionados con tecnología y sistemas',
    color: '#0891b2', // cyan-600
    icon: 'Monitor',
  },
  SEGURIDAD_INFORMACION: {
    id: 7,
    name: 'Seguridad de la Información',
    description: 'Riesgos de seguridad de la información ISO 27001',
    color: '#be123c', // rose-700
    icon: 'Lock',
  },
} as const

// =============================================
// TIPOS DE RESPUESTA A RIESGOS
// =============================================
export const TIPOS_RESPUESTA_RIESGO = {
  EVITAR: {
    id: 1,
    name: 'Evitar',
    description: 'Eliminar la causa del riesgo',
    color: '#dc2626', // red-600
    icon: 'X',
  },
  REDUCIR: {
    id: 2,
    name: 'Reducir',
    description: 'Implementar controles para reducir probabilidad o impacto',
    color: '#ea580c', // orange-600
    icon: 'TrendingDown',
  },
  TRANSFERIR: {
    id: 3,
    name: 'Transferir',
    description: 'Transferir el riesgo a terceros (ej: seguros)',
    color: '#2563eb', // blue-600
    icon: 'ArrowRightLeft',
  },
  ACEPTAR: {
    id: 4,
    name: 'Aceptar',
    description: 'Aceptar el riesgo sin acciones específicas',
    color: '#16a34a', // green-600
    icon: 'Check',
  },
} as const

// =============================================
// NIVELES DE RIESGO
// =============================================
export const NIVELES_RIESGO = {
  MUY_BAJO: {
    min: 1,
    max: 3,
    label: 'Muy Bajo',
    color: '#22c55e', // green-500
    bgColor: '#dcfce7', // green-100
    textColor: '#166534', // green-800
  },
  BAJO: {
    min: 4,
    max: 6,
    label: 'Bajo',
    color: '#84cc16', // lime-500
    bgColor: '#ecfccb', // lime-100
    textColor: '#365314', // lime-800
  },
  MEDIO: {
    min: 7,
    max: 12,
    label: 'Medio',
    color: '#eab308', // yellow-500
    bgColor: '#fef3c7', // yellow-100
    textColor: '#92400e', // yellow-800
  },
  ALTO: {
    min: 13,
    max: 20,
    label: 'Alto',
    color: '#f97316', // orange-500
    bgColor: '#fed7aa', // orange-100
    textColor: '#9a3412', // orange-800
  },
  CRITICO: {
    min: 21,
    max: 25,
    label: 'Crítico',
    color: '#ef4444', // red-500
    bgColor: '#fecaca', // red-100
    textColor: '#991b1b', // red-800
  },
} as const

// =============================================
// ESCALAS DE PROBABILIDAD E IMPACTO
// =============================================
export const ESCALA_PROBABILIDAD = {
  1: { label: 'Muy Baja', description: 'Menos del 5% de probabilidad', color: '#22c55e' },
  2: { label: 'Baja', description: '5% - 25% de probabilidad', color: '#84cc16' },
  3: { label: 'Media', description: '25% - 50% de probabilidad', color: '#eab308' },
  4: { label: 'Alta', description: '50% - 75% de probabilidad', color: '#f97316' },
  5: { label: 'Muy Alta', description: 'Más del 75% de probabilidad', color: '#ef4444' },
} as const

export const ESCALA_IMPACTO = {
  1: { label: 'Muy Bajo', description: 'Impacto mínimo en objetivos', color: '#22c55e' },
  2: { label: 'Bajo', description: 'Impacto menor en objetivos', color: '#84cc16' },
  3: { label: 'Medio', description: 'Impacto moderado en objetivos', color: '#eab308' },
  4: { label: 'Alto', description: 'Impacto significativo en objetivos', color: '#f97316' },
  5: { label: 'Muy Alto', description: 'Impacto crítico en objetivos', color: '#ef4444' },
} as const

// =============================================
// FUNCIONES UTILITARIAS
// =============================================

// Función para obtener el nivel de riesgo basado en el valor calculado
export function getNivelRiesgo(valor: number) {
  for (const [key, nivel] of Object.entries(NIVELES_RIESGO)) {
    if (valor >= nivel.min && valor <= nivel.max) {
      return { key, ...nivel }
    }
  }
  return { key: 'CRITICO', ...NIVELES_RIESGO.CRITICO }
}

// Función para calcular el nivel de riesgo
export function calcularNivelRiesgo(probabilidad: number, impacto: number): number {
  return probabilidad * impacto
}

// Función para obtener rol por ID
export function getRolById(id: number) {
  return Object.values(ROLES).find(rol => rol.id === id)
}

// Función para obtener departamento por ID
export function getDepartamentoById(id: number) {
  return Object.values(DEPARTAMENTOS).find(dept => dept.id === id)
}

// Función para obtener estado de riesgo por ID
export function getEstadoRiesgoById(id: number) {
  return Object.values(ESTADOS_RIESGO).find(estado => estado.id === id)
}

// Función para obtener categoría de riesgo por ID
export function getCategoriaRiesgoById(id: number) {
  return Object.values(CATEGORIAS_RIESGO).find(categoria => categoria.id === id)
}

// Exportar arrays para uso en componentes
export const ROLES_ARRAY = Object.values(ROLES)
export const DEPARTAMENTOS_ARRAY = Object.values(DEPARTAMENTOS)
export const ESTADOS_RIESGO_ARRAY = Object.values(ESTADOS_RIESGO)
export const CATEGORIAS_RIESGO_ARRAY = Object.values(CATEGORIAS_RIESGO)
export const TIPOS_RESPUESTA_RIESGO_ARRAY = Object.values(TIPOS_RESPUESTA_RIESGO)
