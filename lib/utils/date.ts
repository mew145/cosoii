// =============================================
// UTILIDADES DE FECHA CON DATE-FNS
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import {
  format,
  isAfter,
  isBefore,
  isToday,
  isYesterday,
  isTomorrow,
  addDays,
  addMonths,
  subDays,
  subMonths,
  differenceInDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
} from 'date-fns'

// =============================================
// CONFIGURACIÓN REGIONAL
// =============================================

// Configuración regional para español (simplificada)

// =============================================
// FORMATEO DE FECHAS
// =============================================

/**
 * Formatea una fecha en formato legible español
 */
export function formatDate(date: Date | string, pattern: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'Fecha inválida'
  return format(dateObj, pattern)
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

/**
 * Formatea una fecha de forma relativa (simplificada)
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'Fecha inválida'

  const now = new Date()
  const diffInDays = differenceInDays(dateObj, now)

  if (diffInDays === 0) return 'Hoy'
  if (diffInDays === 1) return 'Mañana'
  if (diffInDays === -1) return 'Ayer'
  if (diffInDays > 0) return `En ${diffInDays} días`
  return `Hace ${Math.abs(diffInDays)} días`
}

/**
 * Formatea la distancia entre fechas (simplificada)
 */
export function formatDistanceDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return 'Fecha inválida'

  const now = new Date()
  const diffInDays = differenceInDays(dateObj, now)

  if (Math.abs(diffInDays) < 1) return 'Hoy'
  if (diffInDays > 0) return `En ${diffInDays} días`
  return `Hace ${Math.abs(diffInDays)} días`
}

// =============================================
// VALIDACIONES DE FECHA
// =============================================

/**
 * Verifica si una fecha es hoy
 */
export function isDateToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return !isNaN(dateObj.getTime()) && isToday(dateObj)
}

/**
 * Verifica si una fecha es ayer
 */
export function isDateYesterday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return !isNaN(dateObj.getTime()) && isYesterday(dateObj)
}

/**
 * Verifica si una fecha es mañana
 */
export function isDateTomorrow(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return !isNaN(dateObj.getTime()) && isTomorrow(dateObj)
}

/**
 * Verifica si una fecha está vencida
 */
export function isDateOverdue(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return !isNaN(dateObj.getTime()) && isBefore(dateObj, startOfDay(new Date()))
}

/**
 * Verifica si una fecha está próxima a vencer (dentro de los próximos días especificados)
 */
export function isDateDueSoon(date: Date | string, days: number = 7): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return false

  const today = startOfDay(new Date())
  const dueDate = addDays(today, days)

  return isAfter(dateObj, today) && isBefore(dateObj, dueDate)
}

// =============================================
// CÁLCULOS DE FECHA
// =============================================

/**
 * Calcula los días entre dos fechas
 */
export function daysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  return differenceInDays(end, start)
}

/**
 * Calcula las semanas entre dos fechas (aproximado)
 */
export function weeksBetween(startDate: Date | string, endDate: Date | string): number {
  const days = daysBetween(startDate, endDate)
  return Math.floor(days / 7)
}

/**
 * Calcula los meses entre dos fechas (aproximado)
 */
export function monthsBetween(startDate: Date | string, endDate: Date | string): number {
  const days = daysBetween(startDate, endDate)
  return Math.floor(days / 30)
}

// =============================================
// RANGOS DE FECHA
// =============================================

/**
 * Obtiene el rango de la semana actual (simplificado)
 */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const start = subDays(now, dayOfWeek)
  const end = addDays(start, 6)
  return {
    start: startOfDay(start),
    end: endOfDay(end),
  }
}

/**
 * Obtiene el rango del mes actual
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  }
}

/**
 * Obtiene fechas comunes para filtros
 */
export function getCommonDateRanges() {
  const now = new Date()

  return {
    today: {
      start: startOfDay(now),
      end: endOfDay(now),
      label: 'Hoy',
    },
    yesterday: {
      start: startOfDay(subDays(now, 1)),
      end: endOfDay(subDays(now, 1)),
      label: 'Ayer',
    },
    thisWeek: {
      start: getCurrentWeekRange().start,
      end: getCurrentWeekRange().end,
      label: 'Esta semana',
    },
    lastWeek: {
      start: subDays(getCurrentWeekRange().start, 7),
      end: subDays(getCurrentWeekRange().end, 7),
      label: 'Semana pasada',
    },
    thisMonth: {
      start: startOfMonth(now),
      end: endOfMonth(now),
      label: 'Este mes',
    },
    lastMonth: {
      start: startOfMonth(subMonths(now, 1)),
      end: endOfMonth(subMonths(now, 1)),
      label: 'Mes pasado',
    },
    last30Days: {
      start: startOfDay(subDays(now, 30)),
      end: endOfDay(now),
      label: 'Últimos 30 días',
    },
    last90Days: {
      start: startOfDay(subDays(now, 90)),
      end: endOfDay(now),
      label: 'Últimos 90 días',
    },
  }
}

// =============================================
// UTILIDADES ESPECÍFICAS DEL SISTEMA
// =============================================

/**
 * Calcula la fecha de vencimiento de una revisión
 */
export function calculateReviewDueDate(lastReview: Date | string, frequencyMonths: number): Date {
  const lastReviewDate = typeof lastReview === 'string' ? new Date(lastReview) : lastReview
  return addMonths(lastReviewDate, frequencyMonths)
}

/**
 * Obtiene el estado de vencimiento de una tarea
 */
export function getTaskStatus(dueDate: Date | string): 'overdue' | 'due-soon' | 'on-time' {
  if (isDateOverdue(dueDate)) return 'overdue'
  if (isDateDueSoon(dueDate, 7)) return 'due-soon'
  return 'on-time'
}

/**
 * Formatea una fecha para input de tipo date
 */
export function formatForDateInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''
  return format(dateObj, 'yyyy-MM-dd')
}

/**
 * Formatea una fecha para input de tipo datetime-local
 */
export function formatForDateTimeInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''
  return format(dateObj, "yyyy-MM-dd'T'HH:mm")
}
