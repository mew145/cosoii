# 🔧 Configuración del Sistema

## 📋 Resumen

Este documento describe la configuración del Sistema de Gestión de Riesgos COSO II + ISO 27001 para DELTA CONSULT LTDA.

## 🗂️ Estructura de Configuración

### **📁 Archivos Creados:**

```
lib/
├── config/
│   ├── index.ts          # Configuración principal centralizada
│   └── validation.ts     # Validación de configuración
├── constants/
│   ├── index.ts          # Exportaciones centralizadas
│   ├── database.ts       # Constantes de base de datos COSO
│   ├── iso27001.ts       # Constantes específicas ISO 27001
│   ├── auth.ts           # Constantes de autenticación y permisos
│   └── ui.ts             # Constantes de interfaz de usuario
└── init.ts               # Inicialización del sistema
```

### **🔧 Archivos de Configuración:**

- `.env.local` - Variables de entorno (actualizado)
- `.env.example` - Plantilla de variables de entorno
- `CONFIGURACION.md` - Esta documentación

## ⚙️ **Configuración Implementada**

### **1. 🏗️ Configuración Centralizada (`lib/config/index.ts`)**

- **Configuración de la aplicación**: Nombre, versión, empresa, entorno
- **Configuración de Supabase**: URL, clave, project ID
- **Configuración OAuth**: Google, LinkedIn, GitHub
- **Características del sistema**: Habilitación/deshabilitación de módulos
- **Configuración de UI**: Tema, colores corporativos

### **2. 🗄️ Constantes de Base de Datos (`lib/constants/database.ts`)**

- **Roles del sistema**: 6 roles con niveles de acceso
- **Departamentos**: 5 departamentos organizacionales
- **Estados de riesgo**: 6 estados del ciclo de vida
- **Categorías de riesgo**: 7 categorías incluyendo ISO 27001
- **Escalas de evaluación**: Probabilidad e impacto (1-5)
- **Niveles de riesgo**: Muy Bajo → Crítico con colores
- **Funciones utilitarias**: Cálculos y búsquedas

### **3. 🔒 Constantes ISO 27001 (`lib/constants/iso27001.ts`)**

- **Tipos de activos**: 7 tipos de activos de información
- **Clasificaciones CIA**: Público → Restringido
- **Dominios ISO**: 14 dominios ISO 27001:2022
- **Controles de seguridad**: Tipos y categorías
- **Estados de implementación**: No implementado → Implementado
- **Niveles de madurez**: 0-5 con descripciones
- **Incidentes de seguridad**: 8 tipos con severidades
- **Tratamientos de riesgo**: Aceptar, Mitigar, Transferir, Evitar

### **4. 🔐 Constantes de Autenticación (`lib/constants/auth.ts`)**

- **Proveedores OAuth**: Google, LinkedIn, GitHub
- **Rutas del sistema**: Públicas y protegidas
- **Permisos granulares**: Por módulo y acción
- **Permisos por rol**: Mapeo completo rol-permisos
- **Configuración de sesión**: Timeouts y seguridad
- **Funciones de autorización**: Verificación de permisos

### **5. 🎨 Constantes de UI (`lib/constants/ui.ts`)**

- **Navegación principal**: 8 módulos principales
- **Navegación ISO 27001**: 6 submódulos
- **Configuración de tablas**: Paginación, filtros, ordenamiento
- **Configuración de formularios**: Validación, archivos
- **Notificaciones**: Tipos, duraciones, posiciones
- **Gráficos y dashboards**: Colores, configuraciones
- **Matriz de riesgos**: Configuración 5x5
- **Mensajes del sistema**: Textos estándar

### **6. ✅ Validación de Configuración (`lib/config/validation.ts`)**

- **Validación de variables de entorno**: Requeridas y opcionales
- **Validación de Supabase**: Conexión y autenticación
- **Validación OAuth**: Proveedores configurados
- **Validación completa del sistema**: Todas las validaciones
- **Logging de estado**: Información en consola
- **Información de configuración**: Estado actual

## 🚀 **Uso de la Configuración**

### **Importar Configuración:**

```typescript
// Configuración principal
import { appConfig } from '@/lib/config'

// Constantes específicas
import { ROLES, ESTADOS_RIESGO, NIVELES_RIESGO } from '@/lib/constants'

// Constantes ISO 27001
import { DOMINIOS_ISO27001, TIPOS_ACTIVO_INFORMACION } from '@/lib/constants'

// Funciones de autorización
import { hasPermission, canAccessModule } from '@/lib/constants'
```

### **Ejemplos de Uso:**

```typescript
// Verificar permisos
const canEditRisks = hasPermission(userRole, PERMISSIONS.RISKS.EDIT)

// Obtener nivel de riesgo
const nivelRiesgo = getNivelRiesgo(probabilidad * impacto)

// Configurar OAuth
const googleEnabled = appConfig.oauth.google.enabled

// Obtener colores de categoría
const colorCategoria = CATEGORIAS_RIESGO.TECNOLOGICO.color
```

## 🔧 **Variables de Entorno**

### **Requeridas:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_PROJECT_ID`

### **OAuth (Opcionales):**

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_LINKEDIN_CLIENT_ID`
- `NEXT_PUBLIC_GITHUB_CLIENT_ID`

### **Configuración (Opcionales):**

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_COMPANY_NAME`
- `NODE_ENV`

### **Características (Opcionales):**

- `NEXT_PUBLIC_ENABLE_OAUTH`
- `NEXT_PUBLIC_ENABLE_ISO27001`
- `NEXT_PUBLIC_ENABLE_AUDIT_TRAIL`
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS`

## ✅ **Validación Automática**

El sistema incluye validación automática que:

1. **Verifica variables de entorno** al iniciar
2. **Valida conexión a Supabase**
3. **Verifica configuración OAuth**
4. **Muestra estado en consola**
5. **Previene errores en producción**

## 🎯 **Próximos Pasos**

Con la configuración completada, puedes:

1. **✅ Continuar con Tarea 2.1**: Estructura de directorios por capas
2. **✅ Implementar autenticación OAuth**
3. **✅ Desarrollar componentes UI**
4. **✅ Crear módulos de gestión**

## 📞 **Soporte**

- **Configuración OAuth**: Ver `.env.example` para URLs de configuración
- **Errores de Supabase**: Verificar variables en dashboard de Supabase
- **Validación**: Revisar logs de consola al iniciar la aplicación

---

**✅ Tarea 1.4 Completada**: Sistema de configuración y constantes implementado exitosamente.
