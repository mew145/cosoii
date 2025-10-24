// =============================================
// PÁGINA DE INICIO - DELTA CONSULT LTDA
// Consultoría en Gestión de Riesgos
// =============================================

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, ArrowRight, CheckCircle, Users, BarChart3, Lock, Award, Target, TrendingUp } from 'lucide-react'
import { AuthService } from '@/application/services/AuthService'
import { BRAND_INFO } from '@/lib/constants/brand'

export default function Home() {
  const router = useRouter()
  const authService = new AuthService()

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const checkAuth = async () => {
      const isAuthenticated = await authService.isAuthenticated()
      if (isAuthenticated) {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {BRAND_INFO.name}
                  </h1>
                  <p className="text-sm text-slate-600">{BRAND_INFO.tagline}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
              <Award className="h-4 w-4 mr-2" />
              Especialistas en Gestión de Riesgos Empresariales
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Delta Consult
              </span>
              <br />
              <span className="text-slate-700 text-3xl md:text-5xl">
                Gestión Integral de Riesgos
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              {BRAND_INFO.description}. Implementamos marcos internacionales como COSO II e ISO 27001 
              para proteger y fortalecer su organización.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                  Acceder al Sistema
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50">
                <Target className="mr-2 h-5 w-5" />
                Conocer Más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Nuestras Especialidades
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Soluciones integrales para la gestión de riesgos empresariales con estándares internacionales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">Marco COSO II</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  Implementación completa del marco de control interno COSO II
                  para la gestión integral de riesgos empresariales
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">ISO 27001</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  Controles de seguridad de la información basados en la norma
                  ISO 27001 para proteger activos críticos de su organización
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">Análisis Avanzado</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  Dashboards ejecutivos y reportes detallados para el
                  monitoreo continuo y toma de decisiones estratégicas
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg text-slate-900">Mejora Continua</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  Metodologías probadas para la mejora continua de procesos
                  y optimización de la gestión de riesgos
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-8">
                ¿Por qué elegir Delta Consult?
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-4 mt-1">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">Experiencia Comprobada</h3>
                    <p className="text-slate-600">
                      Más de 10 años especializados en gestión de riesgos empresariales 
                      con marcos internacionales COSO II e ISO 27001
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4 mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">Soluciones Integrales</h3>
                    <p className="text-slate-600">
                      Plataforma completa que centraliza toda la gestión de riesgos 
                      en un solo sistema robusto y confiable
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-violet-100 p-2 rounded-lg mr-4 mt-1">
                    <CheckCircle className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">Tecnología Avanzada</h3>
                    <p className="text-slate-600">
                      Automatización inteligente de procesos con dashboards ejecutivos 
                      y reportes en tiempo real
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-amber-100 p-2 rounded-lg mr-4 mt-1">
                    <CheckCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-2">Soporte Especializado</h3>
                    <p className="text-slate-600">
                      Acompañamiento continuo con consultores expertos en gestión 
                      de riesgos y cumplimiento normativo
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-full w-fit mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Acceso al Sistema
                </h3>
                <p className="text-slate-600">
                  Únete a las empresas que ya confían en Delta Consult para
                  gestionar sus riesgos de manera profesional
                </p>
              </div>

              <div className="space-y-4">
                <Link href="/auth/login">
                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    Iniciar Sesión
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <div className="text-center">
                  <p className="text-sm text-slate-500">
                    ¿Necesitas acceso al sistema?
                  </p>
                  <Link href="/auth/request-access" className="text-blue-600 hover:text-blue-700 font-medium">
                    Solicitar acceso →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg mr-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">{BRAND_INFO.fullName}</span>
                  <p className="text-slate-400 text-sm">{BRAND_INFO.tagline}</p>
                </div>
              </div>
              <p className="text-slate-400 max-w-md leading-relaxed">
                {BRAND_INFO.description}. Protegemos y fortalecemos organizaciones 
                con soluciones de clase mundial.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Acceso</h3>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link href="/auth/request-access" className="hover:text-white transition-colors">
                    Solicitar Acceso
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentación
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Soporte Técnico
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contacto</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center">
                  <span className="text-sm">📧</span>
                  <span className="ml-2">{BRAND_INFO.contact.email}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-sm">📞</span>
                  <span className="ml-2">{BRAND_INFO.contact.phone}</span>
                </li>
                <li className="flex items-center">
                  <span className="text-sm">📍</span>
                  <span className="ml-2">{BRAND_INFO.contact.address}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">
                &copy; 2024 {BRAND_INFO.fullName}. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Términos de Servicio
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Política de Privacidad
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
