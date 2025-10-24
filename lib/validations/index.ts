// =============================================
// ESQUEMAS DE VALIDACIÓN CON ZOD
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

import { z } from 'zod'

// =============================================
// VALIDACIONES COMUNES
// =============================================

// Validación de CI boliviano
export const ciSchema = z
  .string()
  .min(7, 'El CI debe tener al menos 7 dígitos')
  .max(10, 'El CI no puede tener más de 10 dígitos')
  .regex(/^\d+$/, 'El CI solo puede contener números')

// Validación de email
export const emailSchema = z
  .string()
  .email('Formato de email inválido')
  .min(1, 'El email es requerido')

// Validación de teléfono
export const phoneSchema = z
  .string()
  .regex(/^[+]?[\d\s\-()]+$/, 'Formato de teléfono inválido')
  .min(7, 'El teléfono debe tener al menos 7 dígitos')
  .optional()

// Validación de probabilidad e impacto (1-5)
export const probabilidadSchema = z
  .number()
  .int('Debe ser un número entero')
  .min(1, 'La probabilidad debe ser entre 1 y 5')
  .max(5, 'La probabilidad debe ser entre 1 y 5')

export const impactoSchema = z
  .number()
  .int('Debe ser un número entero')
  .min(1, 'El impacto debe ser entre 1 y 5')
  .max(5, 'El impacto debe ser entre 1 y 5')

// =============================================
// ESQUEMAS DE USUARIO
// =============================================

export const usuarioCreateSchema = z.object({
  nombres: z.string().min(2, 'Los nombres deben tener al menos 2 caracteres'),
  apellido_paterno: z.string().min(2, 'El apellido paterno debe tener al menos 2 caracteres'),
  apellido_materno: z.string().optional(),
  ci: ciSchema,
  correo_electronico: emailSchema,
  telefono_contacto: phoneSchema,
  id_rol: z.number().int().positive('Debe seleccionar un rol'),
  id_departamento: z.number().int().positive('Debe seleccionar un departamento'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
})

export const usuarioUpdateSchema = usuarioCreateSchema.partial().extend({
  id_usuario: z.number().int().positive(),
})

export const loginSchema = z.object({
  correo_electronico: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
})

// =============================================
// ESQUEMAS DE RIESGO COSO
// =============================================

export const riesgoCreateSchema = z.object({
  titulo_riesgo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  descripcion_riesgo: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  causa_raiz_riesgo: z.string().optional(),
  consecuencia_riesgo: z.string().optional(),
  valor_probabilidad: probabilidadSchema,
  valor_impacto: impactoSchema,
  id_proyecto: z.number().int().positive('Debe seleccionar un proyecto'),
  id_categoria_riesgo: z.number().int().positive('Debe seleccionar una categoría'),
  id_tipo_riesgo: z.number().int().positive('Debe seleccionar un tipo'),
  id_propietario_riesgo: z.number().int().positive('Debe asignar un propietario'),
  id_velocidad_impacto: z.number().int().positive().optional(),
})

export const riesgoUpdateSchema = riesgoCreateSchema.partial().extend({
  id_riesgo: z.number().int().positive(),
})

// =============================================
// ESQUEMAS DE PROYECTO
// =============================================

export const proyectoCreateSchema = z.object({
  nombre_proyecto: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion_proyecto: z.string().optional(),
  presupuesto_proyecto: z.number().positive('El presupuesto debe ser positivo').optional(),
  fecha_inicio_proyecto: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin_estimada_proyecto: z.string().optional(),
  id_cliente: z.number().int().positive('Debe seleccionar un cliente'),
  id_gerente_proyecto: z.number().int().positive('Debe asignar un gerente'),
  prioridad_proyecto: z.enum(['baja', 'media', 'alta', 'critica']).default('media'),
})

export const proyectoUpdateSchema = proyectoCreateSchema.partial().extend({
  id_proyecto: z.number().int().positive(),
})

// =============================================
// ESQUEMAS ISO 27001
// =============================================

export const activoInformacionCreateSchema = z.object({
  nombre_activo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion_activo: z.string().optional(),
  id_tipo_activo: z.number().int().positive('Debe seleccionar un tipo de activo'),
  id_clasificacion: z.number().int().positive('Debe seleccionar una clasificación'),
  id_propietario: z.number().int().positive('Debe asignar un propietario'),
  id_custodio: z.number().int().positive().optional(),
  ubicacion_activo: z.string().optional(),
  valor_activo: z.number().int().min(1).max(5, 'El valor debe ser entre 1 y 5'),
  version_activo: z.string().optional(),
  proveedor_activo: z.string().optional(),
  fecha_adquisicion: z.string().optional(),
  costo_activo: z.number().positive().optional(),
})

export const controlISOCreateSchema = z.object({
  codigo_control: z.string().min(3, 'El código debe tener al menos 3 caracteres'),
  nombre_control: z.string().min(5, 'El nombre debe tener al menos 5 caracteres'),
  descripcion_control: z.string().optional(),
  objetivo_control: z.string().optional(),
  tipo_control: z.enum(['preventivo', 'detectivo', 'correctivo']),
  categoria_control: z.enum(['tecnico', 'administrativo', 'fisico']),
  id_dominio: z.number().int().positive('Debe seleccionar un dominio'),
  id_responsable: z.number().int().positive().optional(),
  nivel_madurez: z.number().int().min(0).max(5).default(0),
  costo_implementacion: z.number().positive().optional(),
  fecha_implementacion: z.string().optional(),
  observaciones_control: z.string().optional(),
})

export const incidenteCreateSchema = z.object({
  titulo_incidente: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  descripcion_incidente: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  id_tipo_incidente: z.number().int().positive('Debe seleccionar un tipo de incidente'),
  severidad_incidente: z.enum(['baja', 'media', 'alta', 'critica']),
  fecha_deteccion: z.string().min(1, 'La fecha de detección es requerida'),
  id_reportado_por: z.number().int().positive('Debe especificar quién reportó'),
  id_asignado_a: z.number().int().positive().optional(),
  impacto_negocio: z.string().optional(),
  acciones_inmediatas: z.string().optional(),
})

// =============================================
// TIPOS INFERIDOS
// =============================================

export type UsuarioCreate = z.infer<typeof usuarioCreateSchema>
export type UsuarioUpdate = z.infer<typeof usuarioUpdateSchema>
export type Login = z.infer<typeof loginSchema>

export type RiesgoCreate = z.infer<typeof riesgoCreateSchema>
export type RiesgoUpdate = z.infer<typeof riesgoUpdateSchema>

export type ProyectoCreate = z.infer<typeof proyectoCreateSchema>
export type ProyectoUpdate = z.infer<typeof proyectoUpdateSchema>

export type ActivoInformacionCreate = z.infer<typeof activoInformacionCreateSchema>
export type ControlISOCreate = z.infer<typeof controlISOCreateSchema>
export type IncidenteCreate = z.infer<typeof incidenteCreateSchema>
