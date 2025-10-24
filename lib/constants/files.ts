// =============================================
// CONSTANTES: Gestión de Archivos
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

export const FILE_CONFIG = {
  // Tamaños máximos en MB
  MAX_FILE_SIZE_MB: 100,
  MAX_IMAGE_SIZE_MB: 10,
  MAX_AVATAR_SIZE_MB: 5,

  // Buckets de Supabase Storage
  BUCKETS: {
    EVIDENCIAS: 'evidencias',
    AVATARS: 'avatars',
    TEMPORAL: 'temporal'
  },

  // Extensiones permitidas por categoría
  EXTENSIONS: {
    DOCUMENTS: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
    SPREADSHEETS: ['xls', 'xlsx', 'csv', 'ods'],
    PRESENTATIONS: ['ppt', 'pptx', 'odp'],
    IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
    ARCHIVES: ['zip', 'rar', '7z', 'tar', 'gz'],
    ALL_ALLOWED: [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
      'txt', 'csv', 'zip', 'rar', '7z'
    ]
  },

  // Tipos MIME permitidos
  MIME_TYPES: {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed'
  }
} as const

export const FILE_TYPES = {
  DOCUMENTO_PDF: {
    id: 1,
    name: 'Documentos PDF',
    description: 'Archivos en formato PDF',
    extensions: ['pdf'],
    icon: 'FileText',
    color: '#dc2626' // red-600
  },
  DOCUMENTO_WORD: {
    id: 2,
    name: 'Documentos Word',
    description: 'Documentos de Microsoft Word',
    extensions: ['doc', 'docx'],
    icon: 'FileText',
    color: '#2563eb' // blue-600
  },
  HOJA_CALCULO: {
    id: 3,
    name: 'Hojas de Cálculo',
    description: 'Archivos de Excel y similares',
    extensions: ['xls', 'xlsx', 'csv'],
    icon: 'Sheet',
    color: '#16a34a' // green-600
  },
  PRESENTACION: {
    id: 4,
    name: 'Presentaciones',
    description: 'Archivos de PowerPoint',
    extensions: ['ppt', 'pptx'],
    icon: 'Presentation',
    color: '#ea580c' // orange-600
  },
  IMAGEN: {
    id: 5,
    name: 'Imágenes',
    description: 'Archivos de imagen',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
    icon: 'Image',
    color: '#7c3aed' // violet-600
  },
  TEXTO: {
    id: 6,
    name: 'Archivos de Texto',
    description: 'Documentos de texto plano',
    extensions: ['txt'],
    icon: 'FileText',
    color: '#64748b' // slate-600
  },
  COMPRIMIDO: {
    id: 7,
    name: 'Archivos Comprimidos',
    description: 'Archivos ZIP, RAR, etc.',
    extensions: ['zip', 'rar', '7z'],
    icon: 'Archive',
    color: '#0891b2' // cyan-600
  },
  GENERAL: {
    id: 8,
    name: 'Evidencias Generales',
    description: 'Cualquier tipo de evidencia',
    extensions: FILE_CONFIG.EXTENSIONS.ALL_ALLOWED,
    icon: 'File',
    color: '#6b7280' // gray-500
  }
} as const

export const FILE_VISIBILITY = {
  PUBLICO: {
    id: 1,
    name: 'Público',
    description: 'Visible para todos los usuarios del sistema',
    icon: 'Globe',
    color: '#16a34a' // green-600
  },
  PRIVADO: {
    id: 2,
    name: 'Privado',
    description: 'Visible solo para el usuario que subió el archivo',
    icon: 'Lock',
    color: '#dc2626' // red-600
  },
  CONFIDENCIAL: {
    id: 3,
    name: 'Confidencial',
    description: 'Visible solo para usuarios con permisos especiales',
    icon: 'Shield',
    color: '#7c2d12' // orange-800
  },
  DEPARTAMENTAL: {
    id: 4,
    name: 'Departamental',
    description: 'Visible para usuarios del mismo departamento',
    icon: 'Users',
    color: '#2563eb' // blue-600
  },
  PROYECTO: {
    id: 5,
    name: 'Proyecto',
    description: 'Visible para miembros del proyecto asociado',
    icon: 'Briefcase',
    color: '#7c3aed' // violet-600
  }
} as const

export const FILE_MESSAGES = {
  UPLOAD: {
    SUCCESS: 'Archivo subido exitosamente',
    ERROR: 'Error al subir el archivo',
    SIZE_EXCEEDED: 'El archivo excede el tamaño máximo permitido',
    INVALID_TYPE: 'Tipo de archivo no permitido',
    EMPTY_FILE: 'El archivo está vacío',
    INVALID_NAME: 'Nombre de archivo inválido'
  },
  DOWNLOAD: {
    SUCCESS: 'Archivo descargado exitosamente',
    ERROR: 'Error al descargar el archivo',
    NOT_FOUND: 'Archivo no encontrado',
    NO_PERMISSION: 'No tiene permisos para descargar este archivo'
  },
  DELETE: {
    SUCCESS: 'Archivo eliminado exitosamente',
    ERROR: 'Error al eliminar el archivo',
    NO_PERMISSION: 'No tiene permisos para eliminar este archivo',
    CONFIRM: '¿Está seguro de que desea eliminar este archivo?'
  },
  VALIDATION: {
    REQUIRED_ASSOCIATION: 'Debe especificar al menos una asociación (riesgo, auditoría o hallazgo)',
    REQUIRED_TYPE: 'Debe seleccionar un tipo de archivo',
    REQUIRED_VISIBILITY: 'Debe seleccionar la visibilidad del archivo',
    INVALID_EXTENSION: 'La extensión del archivo no está permitida',
    DANGEROUS_FILE: 'Archivo potencialmente peligroso no permitido'
  }
} as const

export const FILE_PATHS = {
  // Rutas para organización de archivos
  RIESGOS: 'riesgos',
  AUDITORIAS: 'auditorias',
  HALLAZGOS: 'hallazgos',
  USUARIOS: 'usuarios',
  TEMPORAL: 'temporal',
  
  // Generadores de rutas
  generateRiskPath: (riskId: number, year?: number) => 
    `riesgos/${year || new Date().getFullYear()}/${riskId}`,
  
  generateAuditPath: (auditId: number, year?: number) => 
    `auditorias/${year || new Date().getFullYear()}/${auditId}`,
  
  generateFindingPath: (findingId: number, year?: number) => 
    `hallazgos/${year || new Date().getFullYear()}/${findingId}`,
  
  generateUserPath: (userId: number, year?: number) => 
    `usuarios/${year || new Date().getFullYear()}/${userId}`,
  
  generateTempPath: () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `temporal/${year}/${month}`
  }
} as const

// Utilidades para validación de archivos
export const FileUtils = {
  isValidExtension: (filename: string, allowedExtensions: readonly string[]): boolean => {
    const extension = filename.split('.').pop()?.toLowerCase()
    return extension ? allowedExtensions.includes(extension) : false
  },

  getFileExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  isImage: (filename: string): boolean => {
    return FileUtils.isValidExtension(filename, FILE_CONFIG.EXTENSIONS.IMAGES)
  },

  isDocument: (filename: string): boolean => {
    return FileUtils.isValidExtension(filename, FILE_CONFIG.EXTENSIONS.DOCUMENTS)
  },

  getFileTypeByExtension: (filename: string) => {
    const extension = FileUtils.getFileExtension(filename)
    
    for (const [key, type] of Object.entries(FILE_TYPES)) {
      if ((type.extensions as readonly string[]).includes(extension)) {
        return type
      }
    }
    
    return FILE_TYPES.GENERAL
  },

  getMimeType: (filename: string): string => {
    const extension = FileUtils.getFileExtension(filename)
    return FILE_CONFIG.MIME_TYPES[extension as keyof typeof FILE_CONFIG.MIME_TYPES] || 'application/octet-stream'
  }
} as const