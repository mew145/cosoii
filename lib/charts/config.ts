// =============================================
// CONFIGURACIÓN DE GRÁFICOS CON RECHARTS
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

// =============================================
// COLORES DEL TEMA
// =============================================

export const chartColors = {
  // Colores principales
  primary: '#1e40af', // blue-700
  secondary: '#64748b', // slate-500
  accent: '#0891b2', // cyan-600

  // Colores de riesgo
  riskLow: '#22c55e', // green-500
  riskMedium: '#eab308', // yellow-500
  riskHigh: '#f97316', // orange-500
  riskCritical: '#ef4444', // red-500

  // Colores de estado
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  info: '#3b82f6', // blue-500

  // Paleta extendida para gráficos múltiples
  palette: [
    '#1e40af', // blue-700
    '#dc2626', // red-600
    '#16a34a', // green-600
    '#ea580c', // orange-600
    '#7c3aed', // violet-600
    '#0891b2', // cyan-600
    '#be123c', // rose-700
    '#4338ca', // indigo-700
    '#059669', // emerald-600
    '#d97706', // amber-600
  ],
}

// =============================================
// CONFIGURACIONES COMUNES
// =============================================

export const defaultChartConfig = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  fontSize: 12,
  fontFamily: 'Inter, system-ui, sans-serif',
}

export const responsiveConfig = {
  width: '100%',
  height: 300,
  minHeight: 200,
}

// =============================================
// CONFIGURACIONES ESPECÍFICAS
// =============================================

// Configuración para matriz de riesgos
export const riskMatrixConfig = {
  width: 500,
  height: 400,
  margin: { top: 40, right: 40, left: 40, bottom: 40 },
  grid: {
    rows: 5,
    cols: 5,
  },
  colors: {
    low: '#22c55e', // 1-3 puntos
    medium: '#eab308', // 4-6 puntos
    high: '#f97316', // 7-12 puntos
    critical: '#ef4444', // 13+ puntos
  },
}

// Configuración para gráficos de barras
export const barChartConfig = {
  ...defaultChartConfig,
  ...responsiveConfig,
  barSize: 40,
  barGap: 10,
}

// Configuración para gráficos de líneas
export const lineChartConfig = {
  ...defaultChartConfig,
  ...responsiveConfig,
  strokeWidth: 2,
  dot: { r: 4 },
  activeDot: { r: 6 },
}

// Configuración para gráficos de área
export const areaChartConfig = {
  ...defaultChartConfig,
  ...responsiveConfig,
  strokeWidth: 2,
  fillOpacity: 0.6,
}

// Configuración para gráficos de pastel
export const pieChartConfig = {
  ...responsiveConfig,
  innerRadius: 60,
  outerRadius: 120,
  paddingAngle: 2,
  dataKey: 'value',
  nameKey: 'name',
}

// Configuración para gráficos de dona
export const donutChartConfig = {
  ...pieChartConfig,
  innerRadius: 80,
  outerRadius: 120,
}

// =============================================
// UTILIDADES PARA DATOS
// =============================================

/**
 * Obtiene el color según el nivel de riesgo
 */
export function getRiskColor(riskLevel: number): string {
  if (riskLevel <= 3) return chartColors.riskLow
  if (riskLevel <= 6) return chartColors.riskMedium
  if (riskLevel <= 12) return chartColors.riskHigh
  return chartColors.riskCritical
}

/**
 * Obtiene el color según el estado
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'activo':
    case 'completado':
    case 'cerrado':
      return chartColors.success
    case 'pendiente':
    case 'en_progreso':
      return chartColors.warning
    case 'vencido':
    case 'materializado':
      return chartColors.error
    default:
      return chartColors.info
  }
}

/**
 * Formatea números para mostrar en gráficos
 */
export function formatChartNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

/**
 * Formatea porcentajes para gráficos
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

// =============================================
// CONFIGURACIONES PARA DASHBOARDS
// =============================================

export const dashboardChartConfig = {
  small: {
    width: '100%',
    height: 200,
    margin: { top: 10, right: 10, left: 10, bottom: 10 },
  },
  medium: {
    width: '100%',
    height: 300,
    margin: { top: 20, right: 20, left: 20, bottom: 20 },
  },
  large: {
    width: '100%',
    height: 400,
    margin: { top: 30, right: 30, left: 30, bottom: 30 },
  },
}

// =============================================
// ANIMACIONES
// =============================================

export const animationConfig = {
  duration: 300,
  easing: 'ease-in-out',
}

// =============================================
// TOOLTIPS
// =============================================

export const tooltipConfig = {
  contentStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontSize: '12px',
  },
  labelStyle: {
    color: '#374151',
    fontWeight: 'bold',
  },
}
