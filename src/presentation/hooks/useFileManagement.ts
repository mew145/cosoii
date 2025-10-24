import { useState, useCallback } from 'react'
import { FILE_CONFIG, FILE_MESSAGES, FileUtils } from '@/lib/constants/files'

export interface FileUploadOptions {
  idTipoArchivo: number
  idVisibilidadArchivo: number
  descripcion?: string
  idRiesgo?: number
  idAuditoria?: number
  idHallazgo?: number
}

export interface FileUploadResult {
  success: boolean
  data?: {
    id: number
    nombreOriginal: string
    url: string
    tamaño: number
    extension: string
    fechaSubida: string
  }
  message?: string
  error?: string
}

export interface FileInfo {
  id: number
  nombreOriginal: string
  descripcion?: string
  tamaño: number
  extension: string
  fechaSubida: string
  idUsuarioSubio: number
  idRiesgo?: number
  idAuditoria?: number
  idHallazgo?: number
  esImagen: boolean
  esPDF: boolean
  esDocumento: boolean
  url?: string
}

export interface FileConfig {
  tiposArchivo: Array<{
    id: number
    nombre: string
    descripcion?: string
    extensionesPermitidas: string[]
  }>
  visibilidades: Array<{
    id: number
    nombre: string
    descripcion?: string
    esPublico: boolean
    esPrivado: boolean
    esConfidencial: boolean
  }>
  configuracion: {
    tamañoMaximoMB: number
    extensionesPermitidas: string[]
  }
}

export const useFileManagement = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Validar archivo antes de subir
  const validateFile = useCallback((file: File, options?: Partial<FileUploadOptions>): string | null => {
    // Validar que el archivo existe
    if (!file) {
      return FILE_MESSAGES.VALIDATION.REQUIRED_TYPE
    }

    // Validar tamaño
    const maxSizeBytes = FILE_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `${FILE_MESSAGES.UPLOAD.SIZE_EXCEEDED} (${FILE_CONFIG.MAX_FILE_SIZE_MB}MB)`
    }

    if (file.size === 0) {
      return FILE_MESSAGES.UPLOAD.EMPTY_FILE
    }

    // Validar extensión
    const extension = FileUtils.getFileExtension(file.name)
    if (!extension) {
      return FILE_MESSAGES.UPLOAD.INVALID_NAME
    }

    if (!FileUtils.isValidExtension(file.name, FILE_CONFIG.EXTENSIONS.ALL_ALLOWED)) {
      return `${FILE_MESSAGES.VALIDATION.INVALID_EXTENSION}: ${extension}`
    }

    // Validar nombre de archivo
    if (file.name.length > 255) {
      return 'El nombre del archivo es demasiado largo'
    }

    // Validar caracteres peligrosos
    const dangerousChars = /[<>:"|?*\x00-\x1f]/
    if (dangerousChars.test(file.name)) {
      return 'El nombre del archivo contiene caracteres no permitidos'
    }

    // Validar asociaciones si se proporcionan opciones
    if (options && !options.idRiesgo && !options.idAuditoria && !options.idHallazgo) {
      return FILE_MESSAGES.VALIDATION.REQUIRED_ASSOCIATION
    }

    return null
  }, [])

  // Subir archivo
  const uploadFile = useCallback(async (file: File, options: FileUploadOptions): Promise<FileUploadResult> => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Validar archivo
      const validationError = validateFile(file, options)
      if (validationError) {
        return {
          success: false,
          error: validationError
        }
      }

      // Crear FormData
      const formData = new FormData()
      formData.append('archivo', file)
      formData.append('idTipoArchivo', options.idTipoArchivo.toString())
      formData.append('idVisibilidadArchivo', options.idVisibilidadArchivo.toString())
      
      if (options.descripcion) {
        formData.append('descripcion', options.descripcion)
      }
      if (options.idRiesgo) {
        formData.append('idRiesgo', options.idRiesgo.toString())
      }
      if (options.idAuditoria) {
        formData.append('idAuditoria', options.idAuditoria.toString())
      }
      if (options.idHallazgo) {
        formData.append('idHallazgo', options.idHallazgo.toString())
      }

      // Simular progreso (en una implementación real, usarías XMLHttpRequest para progreso real)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || FILE_MESSAGES.UPLOAD.ERROR
        }
      }

      return {
        success: true,
        data: result.data,
        message: result.message || FILE_MESSAGES.UPLOAD.SUCCESS
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : FILE_MESSAGES.UPLOAD.ERROR
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [validateFile])

  // Descargar archivo
  const downloadFile = useCallback(async (fileId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsDownloading(true)

      const response = await fetch(`/api/files/${fileId}?download=true`)

      if (!response.ok) {
        const result = await response.json()
        return {
          success: false,
          error: result.error || FILE_MESSAGES.DOWNLOAD.ERROR
        }
      }

      // Obtener nombre del archivo desde los headers
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `archivo_${fileId}`

      // Crear blob y descargar
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : FILE_MESSAGES.DOWNLOAD.ERROR
      }
    } finally {
      setIsDownloading(false)
    }
  }, [])

  // Eliminar archivo
  const deleteFile = useCallback(async (fileId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsDeleting(true)

      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || FILE_MESSAGES.DELETE.ERROR
        }
      }

      return { success: true }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : FILE_MESSAGES.DELETE.ERROR
      }
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Obtener información de archivo
  const getFileInfo = useCallback(async (fileId: number): Promise<{ success: boolean; data?: FileInfo; error?: string }> => {
    try {
      const response = await fetch(`/api/files/${fileId}`)
      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Error al obtener información del archivo'
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener información del archivo'
      }
    }
  }, [])

  // Obtener lista de archivos
  const getFiles = useCallback(async (filters?: {
    idRiesgo?: number
    idAuditoria?: number
    idHallazgo?: number
    limite?: number
    offset?: number
  }): Promise<{ success: boolean; data?: { evidencias: FileInfo[]; total: number }; error?: string }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.idRiesgo) params.append('idRiesgo', filters.idRiesgo.toString())
      if (filters?.idAuditoria) params.append('idAuditoria', filters.idAuditoria.toString())
      if (filters?.idHallazgo) params.append('idHallazgo', filters.idHallazgo.toString())
      if (filters?.limite) params.append('limite', filters.limite.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`/api/files/upload?${params}`)
      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Error al obtener archivos'
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener archivos'
      }
    }
  }, [])

  // Obtener configuración de archivos
  const getFileConfig = useCallback(async (): Promise<{ success: boolean; data?: FileConfig; error?: string }> => {
    try {
      const response = await fetch('/api/files/config')
      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Error al obtener configuración'
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener configuración'
      }
    }
  }, [])

  return {
    // Estados
    isUploading,
    isDownloading,
    isDeleting,
    uploadProgress,

    // Funciones
    validateFile,
    uploadFile,
    downloadFile,
    deleteFile,
    getFileInfo,
    getFiles,
    getFileConfig,

    // Utilidades
    formatFileSize: FileUtils.formatFileSize,
    getFileExtension: FileUtils.getFileExtension,
    isImage: FileUtils.isImage,
    isDocument: FileUtils.isDocument,
    getFileTypeByExtension: FileUtils.getFileTypeByExtension
  }
}