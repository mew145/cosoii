export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      actividades_mitigacion: {
        Row: {
          dependencias_actividad: string | null
          descripcion_actividad: string
          fecha_fin_actividad: string
          fecha_inicio_actividad: string
          id_actividad: number
          id_estado_actividad: number | null
          id_plan: number | null
          id_prioridad_actividad: number | null
          id_responsable_actividad: number | null
        }
        Insert: {
          dependencias_actividad?: string | null
          descripcion_actividad: string
          fecha_fin_actividad: string
          fecha_inicio_actividad: string
          id_actividad?: number
          id_estado_actividad?: number | null
          id_plan?: number | null
          id_prioridad_actividad?: number | null
          id_responsable_actividad?: number | null
        }
        Update: {
          dependencias_actividad?: string | null
          descripcion_actividad?: string
          fecha_fin_actividad?: string
          fecha_inicio_actividad?: string
          id_actividad?: number
          id_estado_actividad?: number | null
          id_plan?: number | null
          id_prioridad_actividad?: number | null
          id_responsable_actividad?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'actividades_mitigacion_id_estado_actividad_fkey'
            columns: ['id_estado_actividad']
            isOneToOne: false
            referencedRelation: 'estados_actividad'
            referencedColumns: ['id_estado_actividad']
          },
          {
            foreignKeyName: 'actividades_mitigacion_id_plan_fkey'
            columns: ['id_plan']
            isOneToOne: false
            referencedRelation: 'planes_mitigacion'
            referencedColumns: ['id_plan']
          },
          {
            foreignKeyName: 'actividades_mitigacion_id_prioridad_actividad_fkey'
            columns: ['id_prioridad_actividad']
            isOneToOne: false
            referencedRelation: 'prioridades_actividad'
            referencedColumns: ['id_prioridad_actividad']
          },
          {
            foreignKeyName: 'actividades_mitigacion_id_responsable_actividad_fkey'
            columns: ['id_responsable_actividad']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      activos_afectados_incidente: {
        Row: {
          descripcion_afectacion: string | null
          id_activo: number | null
          id_activo_afectado: number
          id_incidente: number | null
          nivel_afectacion: string | null
        }
        Insert: {
          descripcion_afectacion?: string | null
          id_activo?: number | null
          id_activo_afectado?: number
          id_incidente?: number | null
          nivel_afectacion?: string | null
        }
        Update: {
          descripcion_afectacion?: string | null
          id_activo?: number | null
          id_activo_afectado?: number
          id_incidente?: number | null
          nivel_afectacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'activos_afectados_incidente_id_activo_fkey'
            columns: ['id_activo']
            isOneToOne: false
            referencedRelation: 'activos_informacion'
            referencedColumns: ['id_activo']
          },
          {
            foreignKeyName: 'activos_afectados_incidente_id_incidente_fkey'
            columns: ['id_incidente']
            isOneToOne: false
            referencedRelation: 'incidentes_seguridad'
            referencedColumns: ['id_incidente']
          },
        ]
      }
      activos_informacion: {
        Row: {
          costo_activo: number | null
          descripcion_activo: string | null
          estado_activo: string | null
          fecha_actualizacion: string | null
          fecha_adquisicion: string | null
          fecha_registro: string | null
          id_activo: number
          id_clasificacion: number | null
          id_custodio: number | null
          id_propietario: number | null
          id_tipo_activo: number | null
          nombre_activo: string
          proveedor_activo: string | null
          ubicacion_activo: string | null
          valor_activo: number | null
          version_activo: string | null
        }
        Insert: {
          costo_activo?: number | null
          descripcion_activo?: string | null
          estado_activo?: string | null
          fecha_actualizacion?: string | null
          fecha_adquisicion?: string | null
          fecha_registro?: string | null
          id_activo?: number
          id_clasificacion?: number | null
          id_custodio?: number | null
          id_propietario?: number | null
          id_tipo_activo?: number | null
          nombre_activo: string
          proveedor_activo?: string | null
          ubicacion_activo?: string | null
          valor_activo?: number | null
          version_activo?: string | null
        }
        Update: {
          costo_activo?: number | null
          descripcion_activo?: string | null
          estado_activo?: string | null
          fecha_actualizacion?: string | null
          fecha_adquisicion?: string | null
          fecha_registro?: string | null
          id_activo?: number
          id_clasificacion?: number | null
          id_custodio?: number | null
          id_propietario?: number | null
          id_tipo_activo?: number | null
          nombre_activo?: string
          proveedor_activo?: string | null
          ubicacion_activo?: string | null
          valor_activo?: number | null
          version_activo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'activos_informacion_id_clasificacion_fkey'
            columns: ['id_clasificacion']
            isOneToOne: false
            referencedRelation: 'clasificaciones_seguridad'
            referencedColumns: ['id_clasificacion']
          },
          {
            foreignKeyName: 'activos_informacion_id_custodio_fkey'
            columns: ['id_custodio']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'activos_informacion_id_propietario_fkey'
            columns: ['id_propietario']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'activos_informacion_id_tipo_activo_fkey'
            columns: ['id_tipo_activo']
            isOneToOne: false
            referencedRelation: 'tipos_activo_informacion'
            referencedColumns: ['id_tipo_activo']
          },
        ]
      }
      amenazas_seguridad: {
        Row: {
          descripcion_amenaza: string | null
          id_amenaza: number
          nivel_amenaza: number | null
          nombre_amenaza: string
          origen_amenaza: string | null
          tipo_amenaza: string | null
        }
        Insert: {
          descripcion_amenaza?: string | null
          id_amenaza?: number
          nivel_amenaza?: number | null
          nombre_amenaza: string
          origen_amenaza?: string | null
          tipo_amenaza?: string | null
        }
        Update: {
          descripcion_amenaza?: string | null
          id_amenaza?: number
          nivel_amenaza?: number | null
          nombre_amenaza?: string
          origen_amenaza?: string | null
          tipo_amenaza?: string | null
        }
        Relationships: []
      }
      auditorias: {
        Row: {
          alcance_auditoria: string | null
          fecha_fin_auditoria: string | null
          fecha_inicio_auditoria: string
          id_auditor: number | null
          id_auditoria: number
          id_estado_auditoria: number | null
          id_riesgo: number | null
          id_tipo_auditoria: number | null
          observaciones_auditoria: string | null
        }
        Insert: {
          alcance_auditoria?: string | null
          fecha_fin_auditoria?: string | null
          fecha_inicio_auditoria: string
          id_auditor?: number | null
          id_auditoria?: number
          id_estado_auditoria?: number | null
          id_riesgo?: number | null
          id_tipo_auditoria?: number | null
          observaciones_auditoria?: string | null
        }
        Update: {
          alcance_auditoria?: string | null
          fecha_fin_auditoria?: string | null
          fecha_inicio_auditoria?: string
          id_auditor?: number | null
          id_auditoria?: number
          id_estado_auditoria?: number | null
          id_riesgo?: number | null
          id_tipo_auditoria?: number | null
          observaciones_auditoria?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'auditorias_id_auditor_fkey'
            columns: ['id_auditor']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'auditorias_id_estado_auditoria_fkey'
            columns: ['id_estado_auditoria']
            isOneToOne: false
            referencedRelation: 'estados_auditoria'
            referencedColumns: ['id_estado_auditoria']
          },
          {
            foreignKeyName: 'auditorias_id_riesgo_fkey'
            columns: ['id_riesgo']
            isOneToOne: false
            referencedRelation: 'riesgos'
            referencedColumns: ['id_riesgo']
          },
          {
            foreignKeyName: 'auditorias_id_tipo_auditoria_fkey'
            columns: ['id_tipo_auditoria']
            isOneToOne: false
            referencedRelation: 'tipos_auditoria'
            referencedColumns: ['id_tipo_auditoria']
          },
        ]
      }
      bitacora: {
        Row: {
          accion_realizada: string
          descripcion_cambio_bitacora: string | null
          direccion_ip_bitacora: unknown | null
          fecha_accion_bitacora: string | null
          id_bitacora: number
          id_usuario: number | null
          modulo_afectado: string
          tabla_afectada: string
          valores_anteriores_bitacora: Json | null
          valores_nuevos_bitacora: Json | null
        }
        Insert: {
          accion_realizada: string
          descripcion_cambio_bitacora?: string | null
          direccion_ip_bitacora?: unknown | null
          fecha_accion_bitacora?: string | null
          id_bitacora?: number
          id_usuario?: number | null
          modulo_afectado: string
          tabla_afectada: string
          valores_anteriores_bitacora?: Json | null
          valores_nuevos_bitacora?: Json | null
        }
        Update: {
          accion_realizada?: string
          descripcion_cambio_bitacora?: string | null
          direccion_ip_bitacora?: unknown | null
          fecha_accion_bitacora?: string | null
          id_bitacora?: number
          id_usuario?: number | null
          modulo_afectado?: string
          tabla_afectada?: string
          valores_anteriores_bitacora?: Json | null
          valores_nuevos_bitacora?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'bitacora_id_usuario_fkey'
            columns: ['id_usuario']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      categorias_objetivos: {
        Row: {
          color_categoria: string | null
          descripcion_categoria_objetivo: string | null
          icono_categoria: string | null
          id_categoria_objetivo: number
          nombre_categoria_objetivo: string
        }
        Insert: {
          color_categoria?: string | null
          descripcion_categoria_objetivo?: string | null
          icono_categoria?: string | null
          id_categoria_objetivo?: number
          nombre_categoria_objetivo: string
        }
        Update: {
          color_categoria?: string | null
          descripcion_categoria_objetivo?: string | null
          icono_categoria?: string | null
          id_categoria_objetivo?: number
          nombre_categoria_objetivo?: string
        }
        Relationships: []
      }
      categorias_riesgo: {
        Row: {
          color_hex_categoria: string | null
          descripcion_categoria_riesgo: string | null
          icono_categoria: string | null
          id_categoria_riesgo: number
          nivel_categoria: string | null
          nombre_categoria_riesgo: string
        }
        Insert: {
          color_hex_categoria?: string | null
          descripcion_categoria_riesgo?: string | null
          icono_categoria?: string | null
          id_categoria_riesgo?: number
          nivel_categoria?: string | null
          nombre_categoria_riesgo: string
        }
        Update: {
          color_hex_categoria?: string | null
          descripcion_categoria_riesgo?: string | null
          icono_categoria?: string | null
          id_categoria_riesgo?: number
          nivel_categoria?: string | null
          nombre_categoria_riesgo?: string
        }
        Relationships: []
      }
      clasificaciones_seguridad: {
        Row: {
          color_clasificacion: string | null
          descripcion_clasificacion: string | null
          id_clasificacion: number
          nivel_clasificacion: number | null
          nombre_clasificacion: string
        }
        Insert: {
          color_clasificacion?: string | null
          descripcion_clasificacion?: string | null
          id_clasificacion?: number
          nivel_clasificacion?: number | null
          nombre_clasificacion: string
        }
        Update: {
          color_clasificacion?: string | null
          descripcion_clasificacion?: string | null
          id_clasificacion?: number
          nivel_clasificacion?: number | null
          nombre_clasificacion?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          apellido_contacto_principal: string | null
          correo_contacto: string | null
          direccion_empresa: string | null
          estado_cliente: string | null
          id_cliente: number
          nombre_cliente: string
          nombre_contacto_principal: string | null
          tamaño_empresa: string | null
          telefono_contacto: string | null
          tipo_industria: string | null
        }
        Insert: {
          apellido_contacto_principal?: string | null
          correo_contacto?: string | null
          direccion_empresa?: string | null
          estado_cliente?: string | null
          id_cliente?: number
          nombre_cliente: string
          nombre_contacto_principal?: string | null
          tamaño_empresa?: string | null
          telefono_contacto?: string | null
          tipo_industria?: string | null
        }
        Update: {
          apellido_contacto_principal?: string | null
          correo_contacto?: string | null
          direccion_empresa?: string | null
          estado_cliente?: string | null
          id_cliente?: number
          nombre_cliente?: string
          nombre_contacto_principal?: string | null
          tamaño_empresa?: string | null
          telefono_contacto?: string | null
          tipo_industria?: string | null
        }
        Relationships: []
      }
      controles_aplicables_evaluacion: {
        Row: {
          efectividad_control: number | null
          fecha_aplicacion: string | null
          id_control_aplicable: number
          id_control_iso: number | null
          id_evaluacion_iso: number | null
        }
        Insert: {
          efectividad_control?: number | null
          fecha_aplicacion?: string | null
          id_control_aplicable?: number
          id_control_iso?: number | null
          id_evaluacion_iso?: number | null
        }
        Update: {
          efectividad_control?: number | null
          fecha_aplicacion?: string | null
          id_control_aplicable?: number
          id_control_iso?: number | null
          id_evaluacion_iso?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'controles_aplicables_evaluacion_id_control_iso_fkey'
            columns: ['id_control_iso']
            isOneToOne: false
            referencedRelation: 'controles_iso27001'
            referencedColumns: ['id_control_iso']
          },
          {
            foreignKeyName: 'controles_aplicables_evaluacion_id_evaluacion_iso_fkey'
            columns: ['id_evaluacion_iso']
            isOneToOne: false
            referencedRelation: 'evaluaciones_riesgo_iso'
            referencedColumns: ['id_evaluacion_iso']
          },
        ]
      }
      controles_internos: {
        Row: {
          costo_implementacion_control: number | null
          descripcion_control: string | null
          estado_control: string | null
          fecha_creacion_control: string | null
          fecha_ultima_evaluacion_control: string | null
          id_control: number
          id_frecuencia_control: number | null
          id_responsable_control: number | null
          id_riesgo: number | null
          id_tipo_control: number | null
          nombre_control: string
        }
        Insert: {
          costo_implementacion_control?: number | null
          descripcion_control?: string | null
          estado_control?: string | null
          fecha_creacion_control?: string | null
          fecha_ultima_evaluacion_control?: string | null
          id_control?: number
          id_frecuencia_control?: number | null
          id_responsable_control?: number | null
          id_riesgo?: number | null
          id_tipo_control?: number | null
          nombre_control: string
        }
        Update: {
          costo_implementacion_control?: number | null
          descripcion_control?: string | null
          estado_control?: string | null
          fecha_creacion_control?: string | null
          fecha_ultima_evaluacion_control?: string | null
          id_control?: number
          id_frecuencia_control?: number | null
          id_responsable_control?: number | null
          id_riesgo?: number | null
          id_tipo_control?: number | null
          nombre_control?: string
        }
        Relationships: [
          {
            foreignKeyName: 'controles_internos_id_frecuencia_control_fkey'
            columns: ['id_frecuencia_control']
            isOneToOne: false
            referencedRelation: 'frecuencias_control'
            referencedColumns: ['id_frecuencia_control']
          },
          {
            foreignKeyName: 'controles_internos_id_responsable_control_fkey'
            columns: ['id_responsable_control']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'controles_internos_id_riesgo_fkey'
            columns: ['id_riesgo']
            isOneToOne: false
            referencedRelation: 'riesgos'
            referencedColumns: ['id_riesgo']
          },
          {
            foreignKeyName: 'controles_internos_id_tipo_control_fkey'
            columns: ['id_tipo_control']
            isOneToOne: false
            referencedRelation: 'tipos_control'
            referencedColumns: ['id_tipo_control']
          },
        ]
      }
      controles_iso27001: {
        Row: {
          categoria_control: string
          codigo_control: string
          costo_implementacion: number | null
          descripcion_control: string | null
          estado_implementacion: string | null
          evidencias_control: string[] | null
          fecha_implementacion: string | null
          fecha_revision: string | null
          id_control_iso: number
          id_dominio: number | null
          id_responsable: number | null
          nivel_madurez: number | null
          nombre_control: string
          objetivo_control: string | null
          observaciones_control: string | null
          tipo_control: string
        }
        Insert: {
          categoria_control: string
          codigo_control: string
          costo_implementacion?: number | null
          descripcion_control?: string | null
          estado_implementacion?: string | null
          evidencias_control?: string[] | null
          fecha_implementacion?: string | null
          fecha_revision?: string | null
          id_control_iso?: number
          id_dominio?: number | null
          id_responsable?: number | null
          nivel_madurez?: number | null
          nombre_control: string
          objetivo_control?: string | null
          observaciones_control?: string | null
          tipo_control: string
        }
        Update: {
          categoria_control?: string
          codigo_control?: string
          costo_implementacion?: number | null
          descripcion_control?: string | null
          estado_implementacion?: string | null
          evidencias_control?: string[] | null
          fecha_implementacion?: string | null
          fecha_revision?: string | null
          id_control_iso?: number
          id_dominio?: number | null
          id_responsable?: number | null
          nivel_madurez?: number | null
          nombre_control?: string
          objetivo_control?: string | null
          observaciones_control?: string | null
          tipo_control?: string
        }
        Relationships: [
          {
            foreignKeyName: 'controles_iso27001_id_dominio_fkey'
            columns: ['id_dominio']
            isOneToOne: false
            referencedRelation: 'dominios_iso27001'
            referencedColumns: ['id_dominio']
          },
          {
            foreignKeyName: 'controles_iso27001_id_responsable_fkey'
            columns: ['id_responsable']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      departamentos: {
        Row: {
          descripcion_departamento: string | null
          estado_departamento: string | null
          fecha_creacion_departamento: string | null
          id_departamento: number
          id_jefe_departamento: number | null
          nombre_departamento: string
        }
        Insert: {
          descripcion_departamento?: string | null
          estado_departamento?: string | null
          fecha_creacion_departamento?: string | null
          id_departamento?: number
          id_jefe_departamento?: number | null
          nombre_departamento: string
        }
        Update: {
          descripcion_departamento?: string | null
          estado_departamento?: string | null
          fecha_creacion_departamento?: string | null
          id_departamento?: number
          id_jefe_departamento?: number | null
          nombre_departamento?: string
        }
        Relationships: []
      }
      dominios_iso27001: {
        Row: {
          codigo_dominio: string
          descripcion_dominio: string | null
          id_dominio: number
          nombre_dominio: string
          orden_dominio: number | null
        }
        Insert: {
          codigo_dominio: string
          descripcion_dominio?: string | null
          id_dominio?: number
          nombre_dominio: string
          orden_dominio?: number | null
        }
        Update: {
          codigo_dominio?: string
          descripcion_dominio?: string | null
          id_dominio?: number
          nombre_dominio?: string
          orden_dominio?: number | null
        }
        Relationships: []
      }
      efectividades_control: {
        Row: {
          descripcion_efectividad_control: string | null
          id_efectividad_control: number
          nombre_efectividad_control: string
          valor_efectividad: number | null
        }
        Insert: {
          descripcion_efectividad_control?: string | null
          id_efectividad_control?: number
          nombre_efectividad_control: string
          valor_efectividad?: number | null
        }
        Update: {
          descripcion_efectividad_control?: string | null
          id_efectividad_control?: number
          nombre_efectividad_control?: string
          valor_efectividad?: number | null
        }
        Relationships: []
      }
      estados_actividad: {
        Row: {
          descripcion_estado_actividad: string | null
          id_estado_actividad: number
          nombre_estado_actividad: string
        }
        Insert: {
          descripcion_estado_actividad?: string | null
          id_estado_actividad?: number
          nombre_estado_actividad: string
        }
        Update: {
          descripcion_estado_actividad?: string | null
          id_estado_actividad?: number
          nombre_estado_actividad?: string
        }
        Relationships: []
      }
      estados_auditoria: {
        Row: {
          descripcion_estado_auditoria: string | null
          id_estado_auditoria: number
          nombre_estado_auditoria: string
        }
        Insert: {
          descripcion_estado_auditoria?: string | null
          id_estado_auditoria?: number
          nombre_estado_auditoria: string
        }
        Update: {
          descripcion_estado_auditoria?: string | null
          id_estado_auditoria?: number
          nombre_estado_auditoria?: string
        }
        Relationships: []
      }
      estados_hallazgo: {
        Row: {
          descripcion_estado_hallazgo: string | null
          id_estado_hallazgo: number
          nombre_estado_hallazgo: string
        }
        Insert: {
          descripcion_estado_hallazgo?: string | null
          id_estado_hallazgo?: number
          nombre_estado_hallazgo: string
        }
        Update: {
          descripcion_estado_hallazgo?: string | null
          id_estado_hallazgo?: number
          nombre_estado_hallazgo?: string
        }
        Relationships: []
      }
      estados_plan_mitigacion: {
        Row: {
          descripcion_estado_plan: string | null
          id_estado_plan: number
          nombre_estado_plan: string
        }
        Insert: {
          descripcion_estado_plan?: string | null
          id_estado_plan?: number
          nombre_estado_plan: string
        }
        Update: {
          descripcion_estado_plan?: string | null
          id_estado_plan?: number
          nombre_estado_plan?: string
        }
        Relationships: []
      }
      estados_riesgo: {
        Row: {
          descripcion_estado_riesgo: string | null
          es_estado_final: boolean | null
          id_estado_riesgo: number
          nombre_estado_riesgo: string
        }
        Insert: {
          descripcion_estado_riesgo?: string | null
          es_estado_final?: boolean | null
          id_estado_riesgo?: number
          nombre_estado_riesgo: string
        }
        Update: {
          descripcion_estado_riesgo?: string | null
          es_estado_final?: boolean | null
          id_estado_riesgo?: number
          nombre_estado_riesgo?: string
        }
        Relationships: []
      }
      evaluacion_controles: {
        Row: {
          estado_evaluacion: string | null
          fecha_evaluacion_control: string | null
          hallazgos_evaluacion: string | null
          id_control: number | null
          id_efectividad_control: number | null
          id_evaluacion: number
          id_evaluador: number | null
          recomendaciones_evaluacion: string | null
        }
        Insert: {
          estado_evaluacion?: string | null
          fecha_evaluacion_control?: string | null
          hallazgos_evaluacion?: string | null
          id_control?: number | null
          id_efectividad_control?: number | null
          id_evaluacion?: number
          id_evaluador?: number | null
          recomendaciones_evaluacion?: string | null
        }
        Update: {
          estado_evaluacion?: string | null
          fecha_evaluacion_control?: string | null
          hallazgos_evaluacion?: string | null
          id_control?: number | null
          id_efectividad_control?: number | null
          id_evaluacion?: number
          id_evaluador?: number | null
          recomendaciones_evaluacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'evaluacion_controles_id_control_fkey'
            columns: ['id_control']
            isOneToOne: false
            referencedRelation: 'controles_internos'
            referencedColumns: ['id_control']
          },
          {
            foreignKeyName: 'evaluacion_controles_id_efectividad_control_fkey'
            columns: ['id_efectividad_control']
            isOneToOne: false
            referencedRelation: 'efectividades_control'
            referencedColumns: ['id_efectividad_control']
          },
          {
            foreignKeyName: 'evaluacion_controles_id_evaluador_fkey'
            columns: ['id_evaluador']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      evaluaciones_riesgo_iso: {
        Row: {
          estado_evaluacion: string | null
          fecha_evaluacion: string | null
          fecha_proxima_revision: string | null
          id_activo: number | null
          id_amenaza: number | null
          id_evaluacion_iso: number
          id_evaluador: number | null
          id_vulnerabilidad: number | null
          impacto_confidencialidad: number | null
          impacto_disponibilidad: number | null
          impacto_integridad: number | null
          justificacion_tratamiento: string | null
          nivel_riesgo_aceptable: boolean | null
          probabilidad_iso: number | null
          riesgo_inherente: number | null
          riesgo_residual: number | null
          tratamiento_riesgo: string
        }
        Insert: {
          estado_evaluacion?: string | null
          fecha_evaluacion?: string | null
          fecha_proxima_revision?: string | null
          id_activo?: number | null
          id_amenaza?: number | null
          id_evaluacion_iso?: number
          id_evaluador?: number | null
          id_vulnerabilidad?: number | null
          impacto_confidencialidad?: number | null
          impacto_disponibilidad?: number | null
          impacto_integridad?: number | null
          justificacion_tratamiento?: string | null
          nivel_riesgo_aceptable?: boolean | null
          probabilidad_iso?: number | null
          riesgo_inherente?: number | null
          riesgo_residual?: number | null
          tratamiento_riesgo: string
        }
        Update: {
          estado_evaluacion?: string | null
          fecha_evaluacion?: string | null
          fecha_proxima_revision?: string | null
          id_activo?: number | null
          id_amenaza?: number | null
          id_evaluacion_iso?: number
          id_evaluador?: number | null
          id_vulnerabilidad?: number | null
          impacto_confidencialidad?: number | null
          impacto_disponibilidad?: number | null
          impacto_integridad?: number | null
          justificacion_tratamiento?: string | null
          nivel_riesgo_aceptable?: boolean | null
          probabilidad_iso?: number | null
          riesgo_inherente?: number | null
          riesgo_residual?: number | null
          tratamiento_riesgo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'evaluaciones_riesgo_iso_id_activo_fkey'
            columns: ['id_activo']
            isOneToOne: false
            referencedRelation: 'activos_informacion'
            referencedColumns: ['id_activo']
          },
          {
            foreignKeyName: 'evaluaciones_riesgo_iso_id_amenaza_fkey'
            columns: ['id_amenaza']
            isOneToOne: false
            referencedRelation: 'amenazas_seguridad'
            referencedColumns: ['id_amenaza']
          },
          {
            foreignKeyName: 'evaluaciones_riesgo_iso_id_evaluador_fkey'
            columns: ['id_evaluador']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'evaluaciones_riesgo_iso_id_vulnerabilidad_fkey'
            columns: ['id_vulnerabilidad']
            isOneToOne: false
            referencedRelation: 'vulnerabilidades_seguridad'
            referencedColumns: ['id_vulnerabilidad']
          },
        ]
      }
      evidencias: {
        Row: {
          descripcion_evidencia: string | null
          fecha_subida_archivo: string | null
          id_auditoria: number | null
          id_evidencia: number
          id_hallazgo: number | null
          id_riesgo: number | null
          id_tipo_archivo: number | null
          id_usuario_subio: number | null
          id_visibilidad_archivo: number | null
          nombre_archivo_almacenado: string
          nombre_archivo_original: string
          tamaño_bytes_archivo: number | null
          url_almacenamiento_archivo: string
        }
        Insert: {
          descripcion_evidencia?: string | null
          fecha_subida_archivo?: string | null
          id_auditoria?: number | null
          id_evidencia?: number
          id_hallazgo?: number | null
          id_riesgo?: number | null
          id_tipo_archivo?: number | null
          id_usuario_subio?: number | null
          id_visibilidad_archivo?: number | null
          nombre_archivo_almacenado: string
          nombre_archivo_original: string
          tamaño_bytes_archivo?: number | null
          url_almacenamiento_archivo: string
        }
        Update: {
          descripcion_evidencia?: string | null
          fecha_subida_archivo?: string | null
          id_auditoria?: number | null
          id_evidencia?: number
          id_hallazgo?: number | null
          id_riesgo?: number | null
          id_tipo_archivo?: number | null
          id_usuario_subio?: number | null
          id_visibilidad_archivo?: number | null
          nombre_archivo_almacenado?: string
          nombre_archivo_original?: string
          tamaño_bytes_archivo?: number | null
          url_almacenamiento_archivo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'evidencias_id_auditoria_fkey'
            columns: ['id_auditoria']
            isOneToOne: false
            referencedRelation: 'auditorias'
            referencedColumns: ['id_auditoria']
          },
          {
            foreignKeyName: 'evidencias_id_hallazgo_fkey'
            columns: ['id_hallazgo']
            isOneToOne: false
            referencedRelation: 'hallazgos_auditoria'
            referencedColumns: ['id_hallazgo']
          },
          {
            foreignKeyName: 'evidencias_id_riesgo_fkey'
            columns: ['id_riesgo']
            isOneToOne: false
            referencedRelation: 'riesgos'
            referencedColumns: ['id_riesgo']
          },
          {
            foreignKeyName: 'evidencias_id_tipo_archivo_fkey'
            columns: ['id_tipo_archivo']
            isOneToOne: false
            referencedRelation: 'tipos_archivo'
            referencedColumns: ['id_tipo_archivo']
          },
          {
            foreignKeyName: 'evidencias_id_usuario_subio_fkey'
            columns: ['id_usuario_subio']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'evidencias_id_visibilidad_archivo_fkey'
            columns: ['id_visibilidad_archivo']
            isOneToOne: false
            referencedRelation: 'visibilidades_archivo'
            referencedColumns: ['id_visibilidad_archivo']
          },
        ]
      }
      frecuencias_control: {
        Row: {
          descripcion_frecuencia_control: string | null
          id_frecuencia_control: number
          nombre_frecuencia_control: string
        }
        Insert: {
          descripcion_frecuencia_control?: string | null
          id_frecuencia_control?: number
          nombre_frecuencia_control: string
        }
        Update: {
          descripcion_frecuencia_control?: string | null
          id_frecuencia_control?: number
          nombre_frecuencia_control?: string
        }
        Relationships: []
      }
      hallazgos_auditoria: {
        Row: {
          accion_correctiva_hallazgo: string | null
          descripcion_hallazgo: string
          fecha_limite_hallazgo: string | null
          id_auditoria: number | null
          id_estado_hallazgo: number | null
          id_hallazgo: number
          id_responsable_hallazgo: number | null
          id_severidad_hallazgo: number | null
          id_tipo_hallazgo: number | null
        }
        Insert: {
          accion_correctiva_hallazgo?: string | null
          descripcion_hallazgo: string
          fecha_limite_hallazgo?: string | null
          id_auditoria?: number | null
          id_estado_hallazgo?: number | null
          id_hallazgo?: number
          id_responsable_hallazgo?: number | null
          id_severidad_hallazgo?: number | null
          id_tipo_hallazgo?: number | null
        }
        Update: {
          accion_correctiva_hallazgo?: string | null
          descripcion_hallazgo?: string
          fecha_limite_hallazgo?: string | null
          id_auditoria?: number | null
          id_estado_hallazgo?: number | null
          id_hallazgo?: number
          id_responsable_hallazgo?: number | null
          id_severidad_hallazgo?: number | null
          id_tipo_hallazgo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'hallazgos_auditoria_id_auditoria_fkey'
            columns: ['id_auditoria']
            isOneToOne: false
            referencedRelation: 'auditorias'
            referencedColumns: ['id_auditoria']
          },
          {
            foreignKeyName: 'hallazgos_auditoria_id_estado_hallazgo_fkey'
            columns: ['id_estado_hallazgo']
            isOneToOne: false
            referencedRelation: 'estados_hallazgo'
            referencedColumns: ['id_estado_hallazgo']
          },
          {
            foreignKeyName: 'hallazgos_auditoria_id_responsable_hallazgo_fkey'
            columns: ['id_responsable_hallazgo']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'hallazgos_auditoria_id_severidad_hallazgo_fkey'
            columns: ['id_severidad_hallazgo']
            isOneToOne: false
            referencedRelation: 'severidades_hallazgo'
            referencedColumns: ['id_severidad_hallazgo']
          },
          {
            foreignKeyName: 'hallazgos_auditoria_id_tipo_hallazgo_fkey'
            columns: ['id_tipo_hallazgo']
            isOneToOne: false
            referencedRelation: 'tipos_hallazgo'
            referencedColumns: ['id_tipo_hallazgo']
          },
        ]
      }
      incidentes_seguridad: {
        Row: {
          acciones_inmediatas: string | null
          causa_raiz: string | null
          costo_incidente: number | null
          descripcion_incidente: string
          estado_incidente: string | null
          fecha_deteccion: string
          fecha_reporte: string | null
          fecha_resolucion: string | null
          id_asignado_a: number | null
          id_incidente: number
          id_reportado_por: number | null
          id_tipo_incidente: number | null
          impacto_negocio: string | null
          lecciones_aprendidas: string | null
          severidad_incidente: string
          tiempo_resolucion_horas: number | null
          titulo_incidente: string
        }
        Insert: {
          acciones_inmediatas?: string | null
          causa_raiz?: string | null
          costo_incidente?: number | null
          descripcion_incidente: string
          estado_incidente?: string | null
          fecha_deteccion: string
          fecha_reporte?: string | null
          fecha_resolucion?: string | null
          id_asignado_a?: number | null
          id_incidente?: number
          id_reportado_por?: number | null
          id_tipo_incidente?: number | null
          impacto_negocio?: string | null
          lecciones_aprendidas?: string | null
          severidad_incidente: string
          tiempo_resolucion_horas?: number | null
          titulo_incidente: string
        }
        Update: {
          acciones_inmediatas?: string | null
          causa_raiz?: string | null
          costo_incidente?: number | null
          descripcion_incidente?: string
          estado_incidente?: string | null
          fecha_deteccion?: string
          fecha_reporte?: string | null
          fecha_resolucion?: string | null
          id_asignado_a?: number | null
          id_incidente?: number
          id_reportado_por?: number | null
          id_tipo_incidente?: number | null
          impacto_negocio?: string | null
          lecciones_aprendidas?: string | null
          severidad_incidente?: string
          tiempo_resolucion_horas?: number | null
          titulo_incidente?: string
        }
        Relationships: [
          {
            foreignKeyName: 'incidentes_seguridad_id_asignado_a_fkey'
            columns: ['id_asignado_a']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'incidentes_seguridad_id_reportado_por_fkey'
            columns: ['id_reportado_por']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'incidentes_seguridad_id_tipo_incidente_fkey'
            columns: ['id_tipo_incidente']
            isOneToOne: false
            referencedRelation: 'tipos_incidente_seguridad'
            referencedColumns: ['id_tipo_incidente']
          },
        ]
      }
      indicadores_desempeno: {
        Row: {
          descripcion_indicador: string | null
          formula_calculo_indicador: string | null
          frecuencia_medicion_indicador: string | null
          id_kpi: number
          id_objetivo: number | null
          id_responsable_kpi: number | null
          nombre_indicador: string
          unidad_medida_indicador: string | null
          valor_meta_indicador: number | null
        }
        Insert: {
          descripcion_indicador?: string | null
          formula_calculo_indicador?: string | null
          frecuencia_medicion_indicador?: string | null
          id_kpi?: number
          id_objetivo?: number | null
          id_responsable_kpi?: number | null
          nombre_indicador: string
          unidad_medida_indicador?: string | null
          valor_meta_indicador?: number | null
        }
        Update: {
          descripcion_indicador?: string | null
          formula_calculo_indicador?: string | null
          frecuencia_medicion_indicador?: string | null
          id_kpi?: number
          id_objetivo?: number | null
          id_responsable_kpi?: number | null
          nombre_indicador?: string
          unidad_medida_indicador?: string | null
          valor_meta_indicador?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'indicadores_desempeno_id_objetivo_fkey'
            columns: ['id_objetivo']
            isOneToOne: false
            referencedRelation: 'objetivos_estrategicos'
            referencedColumns: ['id_objetivo']
          },
          {
            foreignKeyName: 'indicadores_desempeno_id_responsable_kpi_fkey'
            columns: ['id_responsable_kpi']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      indicadores_riesgo: {
        Row: {
          descripcion_indicador_riesgo: string | null
          direccion_indicador: string | null
          estado_alerta_kri: string | null
          formula_calculo_kri: string | null
          frecuencia_medicion_kri: string | null
          id_kri: number
          id_riesgo: number | null
          nombre_indicador_riesgo: string
          unidad_medida_kri: string | null
          valor_actual_kri: number | null
          valor_umbral_kri: number | null
        }
        Insert: {
          descripcion_indicador_riesgo?: string | null
          direccion_indicador?: string | null
          estado_alerta_kri?: string | null
          formula_calculo_kri?: string | null
          frecuencia_medicion_kri?: string | null
          id_kri?: number
          id_riesgo?: number | null
          nombre_indicador_riesgo: string
          unidad_medida_kri?: string | null
          valor_actual_kri?: number | null
          valor_umbral_kri?: number | null
        }
        Update: {
          descripcion_indicador_riesgo?: string | null
          direccion_indicador?: string | null
          estado_alerta_kri?: string | null
          formula_calculo_kri?: string | null
          frecuencia_medicion_kri?: string | null
          id_kri?: number
          id_riesgo?: number | null
          nombre_indicador_riesgo?: string
          unidad_medida_kri?: string | null
          valor_actual_kri?: number | null
          valor_umbral_kri?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'indicadores_riesgo_id_riesgo_fkey'
            columns: ['id_riesgo']
            isOneToOne: false
            referencedRelation: 'riesgos'
            referencedColumns: ['id_riesgo']
          },
        ]
      }
      mapeo_coso_iso: {
        Row: {
          descripcion_relacion: string | null
          fecha_mapeo: string | null
          id_control_interno: number | null
          id_control_iso: number | null
          id_evaluacion_iso: number | null
          id_mapeo: number
          id_riesgo: number | null
          id_usuario_mapeo: number | null
          tipo_relacion: string | null
        }
        Insert: {
          descripcion_relacion?: string | null
          fecha_mapeo?: string | null
          id_control_interno?: number | null
          id_control_iso?: number | null
          id_evaluacion_iso?: number | null
          id_mapeo?: number
          id_riesgo?: number | null
          id_usuario_mapeo?: number | null
          tipo_relacion?: string | null
        }
        Update: {
          descripcion_relacion?: string | null
          fecha_mapeo?: string | null
          id_control_interno?: number | null
          id_control_iso?: number | null
          id_evaluacion_iso?: number | null
          id_mapeo?: number
          id_riesgo?: number | null
          id_usuario_mapeo?: number | null
          tipo_relacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'mapeo_coso_iso_id_control_interno_fkey'
            columns: ['id_control_interno']
            isOneToOne: false
            referencedRelation: 'controles_internos'
            referencedColumns: ['id_control']
          },
          {
            foreignKeyName: 'mapeo_coso_iso_id_control_iso_fkey'
            columns: ['id_control_iso']
            isOneToOne: false
            referencedRelation: 'controles_iso27001'
            referencedColumns: ['id_control_iso']
          },
          {
            foreignKeyName: 'mapeo_coso_iso_id_evaluacion_iso_fkey'
            columns: ['id_evaluacion_iso']
            isOneToOne: false
            referencedRelation: 'evaluaciones_riesgo_iso'
            referencedColumns: ['id_evaluacion_iso']
          },
          {
            foreignKeyName: 'mapeo_coso_iso_id_riesgo_fkey'
            columns: ['id_riesgo']
            isOneToOne: false
            referencedRelation: 'riesgos'
            referencedColumns: ['id_riesgo']
          },
          {
            foreignKeyName: 'mapeo_coso_iso_id_usuario_mapeo_fkey'
            columns: ['id_usuario_mapeo']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      metricas_seguridad: {
        Row: {
          descripcion_metrica: string | null
          estado_metrica: string | null
          fecha_ultima_medicion: string | null
          formula_calculo: string | null
          frecuencia_medicion: string | null
          id_metrica: number
          id_responsable: number | null
          nombre_metrica: string
          tipo_metrica: string | null
          unidad_medida: string | null
          valor_actual: number | null
          valor_objetivo: number | null
        }
        Insert: {
          descripcion_metrica?: string | null
          estado_metrica?: string | null
          fecha_ultima_medicion?: string | null
          formula_calculo?: string | null
          frecuencia_medicion?: string | null
          id_metrica?: number
          id_responsable?: number | null
          nombre_metrica: string
          tipo_metrica?: string | null
          unidad_medida?: string | null
          valor_actual?: number | null
          valor_objetivo?: number | null
        }
        Update: {
          descripcion_metrica?: string | null
          estado_metrica?: string | null
          fecha_ultima_medicion?: string | null
          formula_calculo?: string | null
          frecuencia_medicion?: string | null
          id_metrica?: number
          id_responsable?: number | null
          nombre_metrica?: string
          tipo_metrica?: string | null
          unidad_medida?: string | null
          valor_actual?: number | null
          valor_objetivo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'metricas_seguridad_id_responsable_fkey'
            columns: ['id_responsable']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      objetivos_estrategicos: {
        Row: {
          descripcion_objetivo: string | null
          estado_objetivo: string | null
          fecha_inicio_objetivo: string
          fecha_meta_objetivo: string
          id_categoria_objetivo: number | null
          id_objetivo: number
          id_responsable_objetivo: number | null
          nivel_objetivo: string
          nombre_objetivo: string
          prioridad_objetivo: string
          tipo_objetivo: string
        }
        Insert: {
          descripcion_objetivo?: string | null
          estado_objetivo?: string | null
          fecha_inicio_objetivo: string
          fecha_meta_objetivo: string
          id_categoria_objetivo?: number | null
          id_objetivo?: number
          id_responsable_objetivo?: number | null
          nivel_objetivo: string
          nombre_objetivo: string
          prioridad_objetivo: string
          tipo_objetivo: string
        }
        Update: {
          descripcion_objetivo?: string | null
          estado_objetivo?: string | null
          fecha_inicio_objetivo?: string
          fecha_meta_objetivo?: string
          id_categoria_objetivo?: number | null
          id_objetivo?: number
          id_responsable_objetivo?: number | null
          nivel_objetivo?: string
          nombre_objetivo?: string
          prioridad_objetivo?: string
          tipo_objetivo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'objetivos_estrategicos_id_categoria_objetivo_fkey'
            columns: ['id_categoria_objetivo']
            isOneToOne: false
            referencedRelation: 'categorias_objetivos'
            referencedColumns: ['id_categoria_objetivo']
          },
          {
            foreignKeyName: 'objetivos_estrategicos_id_responsable_objetivo_fkey'
            columns: ['id_responsable_objetivo']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      permisos_modulos: {
        Row: {
          alcance_permiso: string
          fecha_asignacion_permiso: string | null
          id_permiso: number
          id_rol: number | null
          nombre_accion: string
          nombre_modulo: string
        }
        Insert: {
          alcance_permiso: string
          fecha_asignacion_permiso?: string | null
          id_permiso?: number
          id_rol?: number | null
          nombre_accion: string
          nombre_modulo: string
        }
        Update: {
          alcance_permiso?: string
          fecha_asignacion_permiso?: string | null
          id_permiso?: number
          id_rol?: number | null
          nombre_accion?: string
          nombre_modulo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'permisos_modulos_id_rol_fkey'
            columns: ['id_rol']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id_rol']
          },
        ]
      }
      planes_mitigacion: {
        Row: {
          descripcion_plan_mitigacion: string | null
          fecha_fin_plan: string
          fecha_inicio_plan: string
          id_estado_plan: number | null
          id_plan: number
          id_riesgo: number | null
          id_tipo_respuesta: number | null
          nombre_plan_mitigacion: string
          porcentaje_completado_plan: number | null
          presupuesto_asignado_plan: number | null
        }
        Insert: {
          descripcion_plan_mitigacion?: string | null
          fecha_fin_plan: string
          fecha_inicio_plan: string
          id_estado_plan?: number | null
          id_plan?: number
          id_riesgo?: number | null
          id_tipo_respuesta?: number | null
          nombre_plan_mitigacion: string
          porcentaje_completado_plan?: number | null
          presupuesto_asignado_plan?: number | null
        }
        Update: {
          descripcion_plan_mitigacion?: string | null
          fecha_fin_plan?: string
          fecha_inicio_plan?: string
          id_estado_plan?: number | null
          id_plan?: number
          id_riesgo?: number | null
          id_tipo_respuesta?: number | null
          nombre_plan_mitigacion?: string
          porcentaje_completado_plan?: number | null
          presupuesto_asignado_plan?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'planes_mitigacion_id_estado_plan_fkey'
            columns: ['id_estado_plan']
            isOneToOne: false
            referencedRelation: 'estados_plan_mitigacion'
            referencedColumns: ['id_estado_plan']
          },
          {
            foreignKeyName: 'planes_mitigacion_id_riesgo_fkey'
            columns: ['id_riesgo']
            isOneToOne: false
            referencedRelation: 'riesgos'
            referencedColumns: ['id_riesgo']
          },
          {
            foreignKeyName: 'planes_mitigacion_id_tipo_respuesta_fkey'
            columns: ['id_tipo_respuesta']
            isOneToOne: false
            referencedRelation: 'tipos_respuesta_riesgo'
            referencedColumns: ['id_tipo_respuesta']
          },
        ]
      }
      prioridades_actividad: {
        Row: {
          descripcion_prioridad_actividad: string | null
          id_prioridad_actividad: number
          nivel_prioridad: number | null
          nombre_prioridad_actividad: string
        }
        Insert: {
          descripcion_prioridad_actividad?: string | null
          id_prioridad_actividad?: number
          nivel_prioridad?: number | null
          nombre_prioridad_actividad: string
        }
        Update: {
          descripcion_prioridad_actividad?: string | null
          id_prioridad_actividad?: number
          nivel_prioridad?: number | null
          nombre_prioridad_actividad?: string
        }
        Relationships: []
      }
      proyecto_equipo: {
        Row: {
          estado_asignacion: string | null
          fecha_fin_asignacion: string | null
          fecha_inicio_asignacion: string
          id_asignacion: number
          id_proyecto: number | null
          id_rol_proyecto: number | null
          id_usuario: number | null
          porcentaje_dedicacion: number | null
        }
        Insert: {
          estado_asignacion?: string | null
          fecha_fin_asignacion?: string | null
          fecha_inicio_asignacion: string
          id_asignacion?: number
          id_proyecto?: number | null
          id_rol_proyecto?: number | null
          id_usuario?: number | null
          porcentaje_dedicacion?: number | null
        }
        Update: {
          estado_asignacion?: string | null
          fecha_fin_asignacion?: string | null
          fecha_inicio_asignacion?: string
          id_asignacion?: number
          id_proyecto?: number | null
          id_rol_proyecto?: number | null
          id_usuario?: number | null
          porcentaje_dedicacion?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'proyecto_equipo_id_proyecto_fkey'
            columns: ['id_proyecto']
            isOneToOne: false
            referencedRelation: 'proyectos'
            referencedColumns: ['id_proyecto']
          },
          {
            foreignKeyName: 'proyecto_equipo_id_rol_proyecto_fkey'
            columns: ['id_rol_proyecto']
            isOneToOne: false
            referencedRelation: 'roles_proyecto'
            referencedColumns: ['id_rol_proyecto']
          },
          {
            foreignKeyName: 'proyecto_equipo_id_usuario_fkey'
            columns: ['id_usuario']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      proyectos: {
        Row: {
          descripcion_proyecto: string | null
          estado_proyecto: string | null
          fecha_fin_estimada_proyecto: string | null
          fecha_fin_real_proyecto: string | null
          fecha_inicio_proyecto: string
          id_cliente: number | null
          id_gerente_proyecto: number | null
          id_proyecto: number
          nombre_proyecto: string
          porcentaje_avance_proyecto: number | null
          presupuesto_proyecto: number | null
          prioridad_proyecto: string | null
        }
        Insert: {
          descripcion_proyecto?: string | null
          estado_proyecto?: string | null
          fecha_fin_estimada_proyecto?: string | null
          fecha_fin_real_proyecto?: string | null
          fecha_inicio_proyecto: string
          id_cliente?: number | null
          id_gerente_proyecto?: number | null
          id_proyecto?: number
          nombre_proyecto: string
          porcentaje_avance_proyecto?: number | null
          presupuesto_proyecto?: number | null
          prioridad_proyecto?: string | null
        }
        Update: {
          descripcion_proyecto?: string | null
          estado_proyecto?: string | null
          fecha_fin_estimada_proyecto?: string | null
          fecha_fin_real_proyecto?: string | null
          fecha_inicio_proyecto?: string
          id_cliente?: number | null
          id_gerente_proyecto?: number | null
          id_proyecto?: number
          nombre_proyecto?: string
          porcentaje_avance_proyecto?: number | null
          presupuesto_proyecto?: number | null
          prioridad_proyecto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'proyectos_id_cliente_fkey'
            columns: ['id_cliente']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id_cliente']
          },
          {
            foreignKeyName: 'proyectos_id_gerente_proyecto_fkey'
            columns: ['id_gerente_proyecto']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      riesgos: {
        Row: {
          causa_raiz_riesgo: string | null
          consecuencia_riesgo: string | null
          descripcion_riesgo: string
          fecha_actualizacion_riesgo: string | null
          fecha_registro_riesgo: string | null
          id_categoria_riesgo: number | null
          id_estado_riesgo: number | null
          id_propietario_riesgo: number | null
          id_proyecto: number | null
          id_riesgo: number
          id_tipo_riesgo: number | null
          id_usuario_registro: number | null
          id_velocidad_impacto: number | null
          nivel_riesgo_calculado: number | null
          titulo_riesgo: string
          valor_impacto: number | null
          valor_probabilidad: number | null
        }
        Insert: {
          causa_raiz_riesgo?: string | null
          consecuencia_riesgo?: string | null
          descripcion_riesgo: string
          fecha_actualizacion_riesgo?: string | null
          fecha_registro_riesgo?: string | null
          id_categoria_riesgo?: number | null
          id_estado_riesgo?: number | null
          id_propietario_riesgo?: number | null
          id_proyecto?: number | null
          id_riesgo?: number
          id_tipo_riesgo?: number | null
          id_usuario_registro?: number | null
          id_velocidad_impacto?: number | null
          nivel_riesgo_calculado?: number | null
          titulo_riesgo: string
          valor_impacto?: number | null
          valor_probabilidad?: number | null
        }
        Update: {
          causa_raiz_riesgo?: string | null
          consecuencia_riesgo?: string | null
          descripcion_riesgo?: string
          fecha_actualizacion_riesgo?: string | null
          fecha_registro_riesgo?: string | null
          id_categoria_riesgo?: number | null
          id_estado_riesgo?: number | null
          id_propietario_riesgo?: number | null
          id_proyecto?: number | null
          id_riesgo?: number
          id_tipo_riesgo?: number | null
          id_usuario_registro?: number | null
          id_velocidad_impacto?: number | null
          nivel_riesgo_calculado?: number | null
          titulo_riesgo?: string
          valor_impacto?: number | null
          valor_probabilidad?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'riesgos_id_categoria_riesgo_fkey'
            columns: ['id_categoria_riesgo']
            isOneToOne: false
            referencedRelation: 'categorias_riesgo'
            referencedColumns: ['id_categoria_riesgo']
          },
          {
            foreignKeyName: 'riesgos_id_estado_riesgo_fkey'
            columns: ['id_estado_riesgo']
            isOneToOne: false
            referencedRelation: 'estados_riesgo'
            referencedColumns: ['id_estado_riesgo']
          },
          {
            foreignKeyName: 'riesgos_id_propietario_riesgo_fkey'
            columns: ['id_propietario_riesgo']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'riesgos_id_proyecto_fkey'
            columns: ['id_proyecto']
            isOneToOne: false
            referencedRelation: 'proyectos'
            referencedColumns: ['id_proyecto']
          },
          {
            foreignKeyName: 'riesgos_id_tipo_riesgo_fkey'
            columns: ['id_tipo_riesgo']
            isOneToOne: false
            referencedRelation: 'tipos_riesgo'
            referencedColumns: ['id_tipo_riesgo']
          },
          {
            foreignKeyName: 'riesgos_id_usuario_registro_fkey'
            columns: ['id_usuario_registro']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
          {
            foreignKeyName: 'riesgos_id_velocidad_impacto_fkey'
            columns: ['id_velocidad_impacto']
            isOneToOne: false
            referencedRelation: 'velocidades_impacto'
            referencedColumns: ['id_velocidad_impacto']
          },
        ]
      }
      riesgos_objetivos: {
        Row: {
          comentarios_afectacion: string | null
          id_objetivo: number | null
          id_riesgo: number | null
          id_riesgo_objetivo: number
          nivel_afectacion: string
          tipo_impacto: string
        }
        Insert: {
          comentarios_afectacion?: string | null
          id_objetivo?: number | null
          id_riesgo?: number | null
          id_riesgo_objetivo?: number
          nivel_afectacion: string
          tipo_impacto: string
        }
        Update: {
          comentarios_afectacion?: string | null
          id_objetivo?: number | null
          id_riesgo?: number | null
          id_riesgo_objetivo?: number
          nivel_afectacion?: string
          tipo_impacto?: string
        }
        Relationships: [
          {
            foreignKeyName: 'riesgos_objetivos_id_objetivo_fkey'
            columns: ['id_objetivo']
            isOneToOne: false
            referencedRelation: 'objetivos_estrategicos'
            referencedColumns: ['id_objetivo']
          },
          {
            foreignKeyName: 'riesgos_objetivos_id_riesgo_fkey'
            columns: ['id_riesgo']
            isOneToOne: false
            referencedRelation: 'riesgos'
            referencedColumns: ['id_riesgo']
          },
        ]
      }
      roles: {
        Row: {
          descripcion_rol: string | null
          estado_rol: string | null
          fecha_creacion_rol: string | null
          id_rol: number
          nivel_acceso_rol: number | null
          nombre_rol: string
        }
        Insert: {
          descripcion_rol?: string | null
          estado_rol?: string | null
          fecha_creacion_rol?: string | null
          id_rol?: number
          nivel_acceso_rol?: number | null
          nombre_rol: string
        }
        Update: {
          descripcion_rol?: string | null
          estado_rol?: string | null
          fecha_creacion_rol?: string | null
          id_rol?: number
          nivel_acceso_rol?: number | null
          nombre_rol?: string
        }
        Relationships: []
      }
      roles_proyecto: {
        Row: {
          descripcion_rol_proyecto: string | null
          id_rol_proyecto: number
          nivel_autoridad_rol: number | null
          nombre_rol_proyecto: string
        }
        Insert: {
          descripcion_rol_proyecto?: string | null
          id_rol_proyecto?: number
          nivel_autoridad_rol?: number | null
          nombre_rol_proyecto: string
        }
        Update: {
          descripcion_rol_proyecto?: string | null
          id_rol_proyecto?: number
          nivel_autoridad_rol?: number | null
          nombre_rol_proyecto?: string
        }
        Relationships: []
      }
      sesiones_usuarios: {
        Row: {
          direccion_ip: unknown | null
          estado_sesion: string | null
          fecha_expiracion_sesion: string
          fecha_inicio_sesion: string | null
          id_sesion: number
          id_usuario: number | null
          tipo_dispositivo: string | null
          token_sesion: string
        }
        Insert: {
          direccion_ip?: unknown | null
          estado_sesion?: string | null
          fecha_expiracion_sesion: string
          fecha_inicio_sesion?: string | null
          id_sesion?: number
          id_usuario?: number | null
          tipo_dispositivo?: string | null
          token_sesion: string
        }
        Update: {
          direccion_ip?: unknown | null
          estado_sesion?: string | null
          fecha_expiracion_sesion?: string
          fecha_inicio_sesion?: string | null
          id_sesion?: number
          id_usuario?: number | null
          tipo_dispositivo?: string | null
          token_sesion?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sesiones_usuarios_id_usuario_fkey'
            columns: ['id_usuario']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id_usuario']
          },
        ]
      }
      severidades_hallazgo: {
        Row: {
          descripcion_severidad_hallazgo: string | null
          id_severidad_hallazgo: number
          nivel_severidad: number | null
          nombre_severidad_hallazgo: string
        }
        Insert: {
          descripcion_severidad_hallazgo?: string | null
          id_severidad_hallazgo?: number
          nivel_severidad?: number | null
          nombre_severidad_hallazgo: string
        }
        Update: {
          descripcion_severidad_hallazgo?: string | null
          id_severidad_hallazgo?: number
          nivel_severidad?: number | null
          nombre_severidad_hallazgo?: string
        }
        Relationships: []
      }
      tipos_activo_informacion: {
        Row: {
          descripcion_tipo_activo: string | null
          icono_tipo_activo: string | null
          id_tipo_activo: number
          nombre_tipo_activo: string
        }
        Insert: {
          descripcion_tipo_activo?: string | null
          icono_tipo_activo?: string | null
          id_tipo_activo?: number
          nombre_tipo_activo: string
        }
        Update: {
          descripcion_tipo_activo?: string | null
          icono_tipo_activo?: string | null
          id_tipo_activo?: number
          nombre_tipo_activo?: string
        }
        Relationships: []
      }
      tipos_archivo: {
        Row: {
          descripcion_tipo_archivo: string | null
          extensiones_permitidas: string | null
          id_tipo_archivo: number
          nombre_tipo_archivo: string
        }
        Insert: {
          descripcion_tipo_archivo?: string | null
          extensiones_permitidas?: string | null
          id_tipo_archivo?: number
          nombre_tipo_archivo: string
        }
        Update: {
          descripcion_tipo_archivo?: string | null
          extensiones_permitidas?: string | null
          id_tipo_archivo?: number
          nombre_tipo_archivo?: string
        }
        Relationships: []
      }
      tipos_auditoria: {
        Row: {
          descripcion_tipo_auditoria: string | null
          id_tipo_auditoria: number
          nombre_tipo_auditoria: string
        }
        Insert: {
          descripcion_tipo_auditoria?: string | null
          id_tipo_auditoria?: number
          nombre_tipo_auditoria: string
        }
        Update: {
          descripcion_tipo_auditoria?: string | null
          id_tipo_auditoria?: number
          nombre_tipo_auditoria?: string
        }
        Relationships: []
      }
      tipos_control: {
        Row: {
          descripcion_tipo_control: string | null
          id_tipo_control: number
          nombre_tipo_control: string
        }
        Insert: {
          descripcion_tipo_control?: string | null
          id_tipo_control?: number
          nombre_tipo_control: string
        }
        Update: {
          descripcion_tipo_control?: string | null
          id_tipo_control?: number
          nombre_tipo_control?: string
        }
        Relationships: []
      }
      tipos_hallazgo: {
        Row: {
          descripcion_tipo_hallazgo: string | null
          id_tipo_hallazgo: number
          nombre_tipo_hallazgo: string
        }
        Insert: {
          descripcion_tipo_hallazgo?: string | null
          id_tipo_hallazgo?: number
          nombre_tipo_hallazgo: string
        }
        Update: {
          descripcion_tipo_hallazgo?: string | null
          id_tipo_hallazgo?: number
          nombre_tipo_hallazgo?: string
        }
        Relationships: []
      }
      tipos_incidente_seguridad: {
        Row: {
          descripcion_tipo_incidente: string | null
          id_tipo_incidente: number
          nombre_tipo_incidente: string
          severidad_base: number | null
        }
        Insert: {
          descripcion_tipo_incidente?: string | null
          id_tipo_incidente?: number
          nombre_tipo_incidente: string
          severidad_base?: number | null
        }
        Update: {
          descripcion_tipo_incidente?: string | null
          id_tipo_incidente?: number
          nombre_tipo_incidente?: string
          severidad_base?: number | null
        }
        Relationships: []
      }
      tipos_respuesta_riesgo: {
        Row: {
          descripcion_tipo_respuesta: string | null
          id_tipo_respuesta: number
          nombre_tipo_respuesta: string
        }
        Insert: {
          descripcion_tipo_respuesta?: string | null
          id_tipo_respuesta?: number
          nombre_tipo_respuesta: string
        }
        Update: {
          descripcion_tipo_respuesta?: string | null
          id_tipo_respuesta?: number
          nombre_tipo_respuesta?: string
        }
        Relationships: []
      }
      tipos_riesgo: {
        Row: {
          descripcion_tipo_riesgo: string | null
          id_tipo_riesgo: number
          nombre_tipo_riesgo: string
        }
        Insert: {
          descripcion_tipo_riesgo?: string | null
          id_tipo_riesgo?: number
          nombre_tipo_riesgo: string
        }
        Update: {
          descripcion_tipo_riesgo?: string | null
          id_tipo_riesgo?: number
          nombre_tipo_riesgo?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          apellido_materno: string | null
          apellido_paterno: string
          ci: string
          correo_electronico: string
          email_verificado: boolean | null
          estado_usuario: string | null
          fecha_ingreso_empresa: string | null
          fecha_registro_sistema: string | null
          id_departamento: number | null
          id_rol: number | null
          id_usuario: number
          nombres: string
          password_hash: string | null
          provider_id: string | null
          provider_oauth: string | null
          telefono_contacto: string | null
          ultimo_acceso: string | null
          url_foto_perfil: string | null
        }
        Insert: {
          apellido_materno?: string | null
          apellido_paterno: string
          ci: string
          correo_electronico: string
          email_verificado?: boolean | null
          estado_usuario?: string | null
          fecha_ingreso_empresa?: string | null
          fecha_registro_sistema?: string | null
          id_departamento?: number | null
          id_rol?: number | null
          id_usuario?: number
          nombres: string
          password_hash?: string | null
          provider_id?: string | null
          provider_oauth?: string | null
          telefono_contacto?: string | null
          ultimo_acceso?: string | null
          url_foto_perfil?: string | null
        }
        Update: {
          apellido_materno?: string | null
          apellido_paterno?: string
          ci?: string
          correo_electronico?: string
          email_verificado?: boolean | null
          estado_usuario?: string | null
          fecha_ingreso_empresa?: string | null
          fecha_registro_sistema?: string | null
          id_departamento?: number | null
          id_rol?: number | null
          id_usuario?: number
          nombres?: string
          password_hash?: string | null
          provider_id?: string | null
          provider_oauth?: string | null
          telefono_contacto?: string | null
          ultimo_acceso?: string | null
          url_foto_perfil?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'usuarios_id_departamento_fkey'
            columns: ['id_departamento']
            isOneToOne: false
            referencedRelation: 'departamentos'
            referencedColumns: ['id_departamento']
          },
          {
            foreignKeyName: 'usuarios_id_rol_fkey'
            columns: ['id_rol']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id_rol']
          },
        ]
      }
      velocidades_impacto: {
        Row: {
          descripcion_velocidad_impacto: string | null
          id_velocidad_impacto: number
          nombre_velocidad_impacto: string
          rango_tiempo_impacto: string | null
        }
        Insert: {
          descripcion_velocidad_impacto?: string | null
          id_velocidad_impacto?: number
          nombre_velocidad_impacto: string
          rango_tiempo_impacto?: string | null
        }
        Update: {
          descripcion_velocidad_impacto?: string | null
          id_velocidad_impacto?: number
          nombre_velocidad_impacto?: string
          rango_tiempo_impacto?: string | null
        }
        Relationships: []
      }
      visibilidades_archivo: {
        Row: {
          descripcion_visibilidad_archivo: string | null
          id_visibilidad_archivo: number
          nombre_visibilidad_archivo: string
        }
        Insert: {
          descripcion_visibilidad_archivo?: string | null
          id_visibilidad_archivo?: number
          nombre_visibilidad_archivo: string
        }
        Update: {
          descripcion_visibilidad_archivo?: string | null
          id_visibilidad_archivo?: number
          nombre_visibilidad_archivo?: string
        }
        Relationships: []
      }
      vulnerabilidades_seguridad: {
        Row: {
          descripcion_vulnerabilidad: string | null
          facilidad_explotacion: number | null
          id_vulnerabilidad: number
          nivel_vulnerabilidad: number | null
          nombre_vulnerabilidad: string
          tipo_vulnerabilidad: string | null
        }
        Insert: {
          descripcion_vulnerabilidad?: string | null
          facilidad_explotacion?: number | null
          id_vulnerabilidad?: number
          nivel_vulnerabilidad?: number | null
          nombre_vulnerabilidad: string
          tipo_vulnerabilidad?: string | null
        }
        Update: {
          descripcion_vulnerabilidad?: string | null
          facilidad_explotacion?: number | null
          id_vulnerabilidad?: number
          nivel_vulnerabilidad?: number | null
          nombre_vulnerabilidad?: string
          tipo_vulnerabilidad?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      vista_dashboard_iso27001: {
        Row: {
          activos_criticos: number | null
          controles_implementados: number | null
          incidentes_abiertos: number | null
          madurez_promedio: number | null
          total_activos: number | null
          total_controles: number | null
        }
        Relationships: []
      }
      vista_riesgos_categoria: {
        Row: {
          nombre_categoria_riesgo: string | null
          promedio_nivel_riesgo: number | null
          riesgos_altos: number | null
          riesgos_bajos: number | null
          riesgos_medios: number | null
          total_riesgos: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
