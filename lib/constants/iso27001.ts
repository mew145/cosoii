// =============================================
// CONSTANTES ISO 27001
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// =============================================
// TIPOS DE ACTIVOS DE INFORMACIÓN
// =============================================
export const TIPOS_ACTIVO_INFORMACION = {
  HARDWARE: {
    id: 1,
    name: 'Hardware',
    description: 'Equipos físicos de computación y comunicaciones',
    icon: 'HardDrive',
    color: '#6b7280', // gray-500
  },
  SOFTWARE: {
    id: 2,
    name: 'Software',
    description: 'Aplicaciones, sistemas operativos y herramientas',
    icon: 'Code',
    color: '#3b82f6', // blue-500
  },
  DATOS: {
    id: 3,
    name: 'Datos',
    description: 'Información digital y bases de datos',
    icon: 'Database',
    color: '#10b981', // emerald-500
  },
  SERVICIOS: {
    id: 4,
    name: 'Servicios',
    description: 'Servicios de TI y comunicaciones',
    icon: 'Cloud',
    color: '#8b5cf6', // violet-500
  },
  PERSONAS: {
    id: 5,
    name: 'Personas',
    description: 'Personal y recursos humanos',
    icon: 'Users',
    color: '#f59e0b', // amber-500
  },
  INSTALACIONES: {
    id: 6,
    name: 'Instalaciones',
    description: 'Infraestructura física y ubicaciones',
    icon: 'Building',
    color: '#ef4444', // red-500
  },
  DOCUMENTOS: {
    id: 7,
    name: 'Documentos',
    description: 'Documentación física y digital',
    icon: 'FileText',
    color: '#06b6d4', // cyan-500
  },
} as const

// =============================================
// CLASIFICACIONES DE SEGURIDAD
// =============================================
export const CLASIFICACIONES_SEGURIDAD = {
  PUBLICO: {
    id: 1,
    name: 'Público',
    description: 'Información que puede ser divulgada públicamente',
    level: 1,
    color: '#22c55e', // green-500
    bgColor: '#dcfce7', // green-100
    textColor: '#166534', // green-800
  },
  INTERNO: {
    id: 2,
    name: 'Interno',
    description: 'Información para uso interno de la organización',
    level: 2,
    color: '#eab308', // yellow-500
    bgColor: '#fef3c7', // yellow-100
    textColor: '#92400e', // yellow-800
  },
  CONFIDENCIAL: {
    id: 3,
    name: 'Confidencial',
    description: 'Información sensible con acceso restringido',
    level: 3,
    color: '#f97316', // orange-500
    bgColor: '#fed7aa', // orange-100
    textColor: '#9a3412', // orange-800
  },
  RESTRINGIDO: {
    id: 4,
    name: 'Restringido',
    description: 'Información altamente sensible con acceso muy limitado',
    level: 4,
    color: '#ef4444', // red-500
    bgColor: '#fecaca', // red-100
    textColor: '#991b1b', // red-800
  },
} as const

// =============================================
// DOMINIOS ISO 27001:2022
// =============================================
export const DOMINIOS_ISO27001 = {
  A5: {
    id: 1,
    code: 'A.5',
    name: 'Políticas de seguridad de la información',
    description: 'Políticas de seguridad de la información',
    order: 1,
    color: '#dc2626', // red-600
  },
  A6: {
    id: 2,
    code: 'A.6',
    name: 'Organización de la seguridad de la información',
    description: 'Organización de la seguridad de la información',
    order: 2,
    color: '#ea580c', // orange-600
  },
  A7: {
    id: 3,
    code: 'A.7',
    name: 'Seguridad de los recursos humanos',
    description: 'Seguridad de los recursos humanos',
    order: 3,
    color: '#ca8a04', // yellow-600
  },
  A8: {
    id: 4,
    code: 'A.8',
    name: 'Gestión de activos',
    description: 'Gestión de activos',
    order: 4,
    color: '#16a34a', // green-600
  },
  A9: {
    id: 5,
    code: 'A.9',
    name: 'Control de acceso',
    description: 'Control de acceso',
    order: 5,
    color: '#0891b2', // cyan-600
  },
  A10: {
    id: 6,
    code: 'A.10',
    name: 'Criptografía',
    description: 'Criptografía',
    order: 6,
    color: '#2563eb', // blue-600
  },
  A11: {
    id: 7,
    code: 'A.11',
    name: 'Seguridad física y del entorno',
    description: 'Seguridad física y del entorno',
    order: 7,
    color: '#7c3aed', // violet-600
  },
  A12: {
    id: 8,
    code: 'A.12',
    name: 'Seguridad de las operaciones',
    description: 'Seguridad de las operaciones',
    order: 8,
    color: '#be185d', // pink-600
  },
  A13: {
    id: 9,
    code: 'A.13',
    name: 'Seguridad de las comunicaciones',
    description: 'Seguridad de las comunicaciones',
    order: 9,
    color: '#059669', // emerald-600
  },
  A14: {
    id: 10,
    code: 'A.14',
    name: 'Adquisición, desarrollo y mantenimiento de sistemas',
    description: 'Adquisición, desarrollo y mantenimiento de sistemas',
    order: 10,
    color: '#0d9488', // teal-600
  },
  A15: {
    id: 11,
    code: 'A.15',
    name: 'Relaciones con los proveedores',
    description: 'Relaciones con los proveedores',
    order: 11,
    color: '#4338ca', // indigo-600
  },
  A16: {
    id: 12,
    code: 'A.16',
    name: 'Gestión de incidentes de seguridad de la información',
    description: 'Gestión de incidentes de seguridad de la información',
    order: 12,
    color: '#7c2d12', // orange-800
  },
  A17: {
    id: 13,
    code: 'A.17',
    name: 'Aspectos de seguridad de la información de la gestión de la continuidad del negocio',
    description:
      'Aspectos de seguridad de la información de la gestión de la continuidad del negocio',
    order: 13,
    color: '#991b1b', // red-800
  },
  A18: {
    id: 14,
    code: 'A.18',
    name: 'Cumplimiento',
    description: 'Cumplimiento',
    order: 14,
    color: '#1e40af', // blue-700
  },
} as const

// =============================================
// TIPOS DE CONTROL ISO 27001
// =============================================
export const TIPOS_CONTROL_ISO = {
  PREVENTIVO: {
    name: 'preventivo',
    label: 'Preventivo',
    description: 'Controles que previenen la ocurrencia de incidentes',
    color: '#16a34a', // green-600
    icon: 'Shield',
  },
  DETECTIVO: {
    name: 'detectivo',
    label: 'Detectivo',
    description: 'Controles que detectan incidentes cuando ocurren',
    color: '#eab308', // yellow-500
    icon: 'Eye',
  },
  CORRECTIVO: {
    name: 'correctivo',
    label: 'Correctivo',
    description: 'Controles que corrigen incidentes después de que ocurren',
    color: '#ef4444', // red-500
    icon: 'Wrench',
  },
} as const

// =============================================
// CATEGORÍAS DE CONTROL ISO 27001
// =============================================
export const CATEGORIAS_CONTROL_ISO = {
  TECNICO: {
    name: 'tecnico',
    label: 'Técnico',
    description: 'Controles implementados a través de tecnología',
    color: '#3b82f6', // blue-500
    icon: 'Monitor',
  },
  ADMINISTRATIVO: {
    name: 'administrativo',
    label: 'Administrativo',
    description: 'Controles basados en políticas y procedimientos',
    color: '#8b5cf6', // violet-500
    icon: 'FileText',
  },
  FISICO: {
    name: 'fisico',
    label: 'Físico',
    description: 'Controles de seguridad física y ambiental',
    color: '#f59e0b', // amber-500
    icon: 'Lock',
  },
} as const

// =============================================
// ESTADOS DE IMPLEMENTACIÓN
// =============================================
export const ESTADOS_IMPLEMENTACION = {
  NO_IMPLEMENTADO: {
    name: 'no_implementado',
    label: 'No Implementado',
    description: 'Control no implementado',
    color: '#6b7280', // gray-500
    bgColor: '#f3f4f6', // gray-100
    textColor: '#374151', // gray-700
  },
  PARCIALMENTE_IMPLEMENTADO: {
    name: 'parcialmente_implementado',
    label: 'Parcialmente Implementado',
    description: 'Control parcialmente implementado',
    color: '#eab308', // yellow-500
    bgColor: '#fef3c7', // yellow-100
    textColor: '#92400e', // yellow-800
  },
  IMPLEMENTADO: {
    name: 'implementado',
    label: 'Implementado',
    description: 'Control completamente implementado',
    color: '#16a34a', // green-600
    bgColor: '#dcfce7', // green-100
    textColor: '#166534', // green-800
  },
  NO_APLICABLE: {
    name: 'no_aplicable',
    label: 'No Aplicable',
    description: 'Control no aplicable a la organización',
    color: '#6b7280', // gray-500
    bgColor: '#f9fafb', // gray-50
    textColor: '#4b5563', // gray-600
  },
} as const

// =============================================
// NIVELES DE MADUREZ
// =============================================
export const NIVELES_MADUREZ = {
  0: { label: 'No Implementado', description: 'No existe el control', color: '#6b7280' },
  1: { label: 'Inicial', description: 'Control ad-hoc, no documentado', color: '#ef4444' },
  2: {
    label: 'Repetible',
    description: 'Control documentado pero no consistente',
    color: '#f97316',
  },
  3: { label: 'Definido', description: 'Control estandarizado y documentado', color: '#eab308' },
  4: { label: 'Gestionado', description: 'Control medido y monitoreado', color: '#84cc16' },
  5: { label: 'Optimizado', description: 'Control optimizado continuamente', color: '#22c55e' },
} as const

// =============================================
// TIPOS DE INCIDENTES DE SEGURIDAD
// =============================================
export const TIPOS_INCIDENTE_SEGURIDAD = {
  ACCESO_NO_AUTORIZADO: {
    id: 1,
    name: 'Acceso no autorizado',
    description: 'Acceso no autorizado a sistemas o información',
    severityBase: 3,
    color: '#ef4444', // red-500
    icon: 'UserX',
  },
  MALWARE: {
    id: 2,
    name: 'Malware',
    description: 'Infección por software malicioso',
    severityBase: 4,
    color: '#dc2626', // red-600
    icon: 'Bug',
  },
  PHISHING: {
    id: 3,
    name: 'Phishing',
    description: 'Intento de obtener información confidencial mediante engaño',
    severityBase: 3,
    color: '#f97316', // orange-500
    icon: 'Fish',
  },
  PERDIDA_DATOS: {
    id: 4,
    name: 'Pérdida de datos',
    description: 'Pérdida o filtración de información confidencial',
    severityBase: 5,
    color: '#991b1b', // red-800
    icon: 'Database',
  },
  DENEGACION_SERVICIO: {
    id: 5,
    name: 'Denegación de servicio',
    description: 'Interrupción de servicios de TI',
    severityBase: 4,
    color: '#ea580c', // orange-600
    icon: 'Wifi',
  },
  ROBO_FISICO: {
    id: 6,
    name: 'Robo físico',
    description: 'Robo de equipos o documentos',
    severityBase: 3,
    color: '#7c2d12', // orange-800
    icon: 'AlertTriangle',
  },
  ERROR_HUMANO: {
    id: 7,
    name: 'Error humano',
    description: 'Incidente causado por error del usuario',
    severityBase: 2,
    color: '#eab308', // yellow-500
    icon: 'User',
  },
  FALLA_SISTEMA: {
    id: 8,
    name: 'Falla de sistema',
    description: 'Falla técnica de sistemas o infraestructura',
    severityBase: 3,
    color: '#6b7280', // gray-500
    icon: 'AlertCircle',
  },
} as const

// =============================================
// SEVERIDADES DE INCIDENTES
// =============================================
export const SEVERIDADES_INCIDENTE = {
  BAJA: {
    name: 'baja',
    label: 'Baja',
    description: 'Impacto mínimo en las operaciones',
    color: '#22c55e', // green-500
    bgColor: '#dcfce7', // green-100
    textColor: '#166534', // green-800
  },
  MEDIA: {
    name: 'media',
    label: 'Media',
    description: 'Impacto moderado en las operaciones',
    color: '#eab308', // yellow-500
    bgColor: '#fef3c7', // yellow-100
    textColor: '#92400e', // yellow-800
  },
  ALTA: {
    name: 'alta',
    label: 'Alta',
    description: 'Impacto significativo en las operaciones',
    color: '#f97316', // orange-500
    bgColor: '#fed7aa', // orange-100
    textColor: '#9a3412', // orange-800
  },
  CRITICA: {
    name: 'critica',
    label: 'Crítica',
    description: 'Impacto crítico en las operaciones',
    color: '#ef4444', // red-500
    bgColor: '#fecaca', // red-100
    textColor: '#991b1b', // red-800
  },
} as const

// =============================================
// ESTADOS DE INCIDENTES
// =============================================
export const ESTADOS_INCIDENTE = {
  REPORTADO: {
    name: 'reportado',
    label: 'Reportado',
    description: 'Incidente reportado, pendiente de asignación',
    color: '#6b7280', // gray-500
    icon: 'AlertTriangle',
  },
  EN_INVESTIGACION: {
    name: 'en_investigacion',
    label: 'En Investigación',
    description: 'Incidente en proceso de investigación',
    color: '#eab308', // yellow-500
    icon: 'Search',
  },
  CONTENIDO: {
    name: 'contenido',
    label: 'Contenido',
    description: 'Incidente contenido, impacto controlado',
    color: '#f97316', // orange-500
    icon: 'Shield',
  },
  RESUELTO: {
    name: 'resuelto',
    label: 'Resuelto',
    description: 'Incidente resuelto, pendiente de cierre',
    color: '#84cc16', // lime-500
    icon: 'CheckCircle',
  },
  CERRADO: {
    name: 'cerrado',
    label: 'Cerrado',
    description: 'Incidente cerrado completamente',
    color: '#22c55e', // green-500
    icon: 'Check',
  },
} as const

// =============================================
// TRATAMIENTOS DE RIESGO ISO
// =============================================
export const TRATAMIENTOS_RIESGO_ISO = {
  ACEPTAR: {
    name: 'aceptar',
    label: 'Aceptar',
    description: 'Aceptar el riesgo sin controles adicionales',
    color: '#16a34a', // green-600
    icon: 'Check',
  },
  MITIGAR: {
    name: 'mitigar',
    label: 'Mitigar',
    description: 'Implementar controles para reducir el riesgo',
    color: '#2563eb', // blue-600
    icon: 'Shield',
  },
  TRANSFERIR: {
    name: 'transferir',
    label: 'Transferir',
    description: 'Transferir el riesgo a terceros',
    color: '#7c3aed', // violet-600
    icon: 'ArrowRightLeft',
  },
  EVITAR: {
    name: 'evitar',
    label: 'Evitar',
    description: 'Eliminar la actividad que genera el riesgo',
    color: '#dc2626', // red-600
    icon: 'X',
  },
} as const

// =============================================
// FUNCIONES UTILITARIAS ISO 27001
// =============================================

// Función para calcular riesgo inherente CIA
export function calcularRiesgoInherenteISO(
  probabilidad: number,
  impactoC: number,
  impactoI: number,
  impactoA: number
): number {
  const promedioImpacto = (impactoC + impactoI + impactoA) / 3
  return probabilidad * promedioImpacto
}

// Función para obtener clasificación de seguridad por nivel
export function getClasificacionByNivel(nivel: number) {
  return Object.values(CLASIFICACIONES_SEGURIDAD).find(c => c.level === nivel)
}

// Función para obtener dominio ISO por código
export function getDominioByCode(code: string) {
  return Object.values(DOMINIOS_ISO27001).find(d => d.code === code)
}

// Función para obtener nivel de madurez
export function getNivelMadurez(nivel: number) {
  return NIVELES_MADUREZ[nivel as keyof typeof NIVELES_MADUREZ]
}

// Exportar arrays para uso en componentes
export const TIPOS_ACTIVO_INFORMACION_ARRAY = Object.values(TIPOS_ACTIVO_INFORMACION)
export const CLASIFICACIONES_SEGURIDAD_ARRAY = Object.values(CLASIFICACIONES_SEGURIDAD)
export const DOMINIOS_ISO27001_ARRAY = Object.values(DOMINIOS_ISO27001)
export const TIPOS_INCIDENTE_SEGURIDAD_ARRAY = Object.values(TIPOS_INCIDENTE_SEGURIDAD)
export const SEVERIDADES_INCIDENTE_ARRAY = Object.values(SEVERIDADES_INCIDENTE)
export const ESTADOS_INCIDENTE_ARRAY = Object.values(ESTADOS_INCIDENTE)
