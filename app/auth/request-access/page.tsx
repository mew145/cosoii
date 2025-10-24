// =============================================
// PÁGINA SOLICITAR ACCESO
// Sistema de Gestión de Riesgos COSO II + ISO 27001
// =============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Textarea component inline
const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
    {...props}
  />
)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, ArrowLeft, Send, CheckCircle, AlertTriangle } from 'lucide-react'

export default function RequestAccessPage() {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    empresa: '',
    cargo: '',
    departamento: '',
    justificacion: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar errores al escribir
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validar campos requeridos
      const requiredFields = ['nombres', 'apellidos', 'email', 'empresa', 'justificacion']
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData].trim())
      
      if (missingFields.length > 0) {
        setError('Por favor completa todos los campos requeridos')
        setLoading(false)
        return
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Por favor ingresa un email válido')
        setLoading(false)
        return
      }

      // Simular envío de solicitud (aquí podrías integrar con un servicio de email)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // En una implementación real, aquí enviarías los datos a un endpoint
      console.log('Solicitud de acceso:', formData)
      
      setSuccess(true)

    } catch (error) {
      console.error('Error enviando solicitud:', error)
      setError('Error enviando la solicitud. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              ¡Solicitud Enviada!
            </CardTitle>
            <CardDescription>
              Tu solicitud de acceso ha sido enviada exitosamente
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-center">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                Hemos recibido tu solicitud de acceso al Sistema de Gestión de Riesgos. 
                Nuestro equipo la revisará y te contactaremos dentro de las próximas 24-48 horas.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Próximos pasos:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Revisaremos tu solicitud</li>
                <li>• Te contactaremos por email</li>
                <li>• Recibirás credenciales de acceso</li>
                <li>• Podrás acceder al sistema</li>
              </ul>
            </div>

            <div className="pt-4">
              <Link href="/auth/login">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Solicitar Acceso</CardTitle>
          <CardDescription>
            Completa el formulario para solicitar acceso al Sistema de Gestión de Riesgos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres *</Label>
                  <Input
                    id="nombres"
                    name="nombres"
                    type="text"
                    placeholder="Tus nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    name="apellidos"
                    type="text"
                    placeholder="Tus apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="70123456"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Información Laboral */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Laboral</h3>
              
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa/Organización *</Label>
                <Input
                  id="empresa"
                  name="empresa"
                  type="text"
                  placeholder="Nombre de tu empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    name="cargo"
                    type="text"
                    placeholder="Tu cargo actual"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    name="departamento"
                    type="text"
                    placeholder="Departamento o área"
                    value={formData.departamento}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Justificación */}
            <div className="space-y-2">
              <Label htmlFor="justificacion">Justificación del Acceso *</Label>
              <Textarea
                id="justificacion"
                name="justificacion"
                placeholder="Explica por qué necesitas acceso al sistema y cómo lo utilizarás..."
                value={formData.justificacion}
                onChange={handleInputChange}
                required
                disabled={loading}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Describe brevemente tu rol y por qué necesitas acceso al sistema de gestión de riesgos
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Send className="mr-2 h-4 w-4 animate-pulse" />
                  Enviando solicitud...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes acceso?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}