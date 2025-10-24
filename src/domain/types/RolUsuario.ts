// =============================================
// TIPO: Rol de Usuario
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export enum RolUsuario {
  SUPER_ADMIN = 'super_admin',
  ADMINISTRADOR = 'administrador', 
  GERENTE = 'gerente',
  AUDITOR = 'auditor'
}

export const ROLES_DISPLAY_NAMES: Record<RolUsuario, string> = {
  [RolUsuario.SUPER_ADMIN]: 'Super Administrador',
  [RolUsuario.ADMINISTRADOR]: 'Administrador',
  [RolUsuario.GERENTE]: 'Gerente',
  [RolUsuario.AUDITOR]: 'Auditor'
}

export const ROLES_DESCRIPTIONS: Record<RolUsuario, string> = {
  [RolUsuario.SUPER_ADMIN]: 'Acceso completo al sistema. Gestiona usuarios, configuraciones y tiene permisos sobre todos los módulos.',
  [RolUsuario.ADMINISTRADOR]: 'Administrador del sistema con permisos avanzados de gestión y configuración.',
  [RolUsuario.GERENTE]: 'Gestiona proyectos específicos y los riesgos asociados a los mismos.',
  [RolUsuario.AUDITOR]: 'Ejecuta auditorías, registra hallazgos y evalúa riesgos del sistema.'
}

export const ROLES_HIERARCHY: Record<RolUsuario, number> = {
  [RolUsuario.SUPER_ADMIN]: 1,
  [RolUsuario.ADMINISTRADOR]: 2,
  [RolUsuario.GERENTE]: 3,
  [RolUsuario.AUDITOR]: 4
}