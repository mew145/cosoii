# 🏗️ Arquitectura por Capas

## 📋 Resumen

El Sistema de Gestión de Riesgos COSO II + ISO 27001 implementa una **Arquitectura por Capas** (Layered Architecture) que separa las responsabilidades en capas bien definidas, siguiendo los principios de Clean Architecture y Domain-Driven Design (DDD).

## 🎯 Principios de Diseño

### **1. Separación de Responsabilidades**

Cada capa tiene una responsabilidad específica y bien definida.

### **2. Dependencia Unidireccional**

Las dependencias fluyen hacia adentro: Presentación → Aplicación → Dominio ← Infraestructura.

### **3. Inversión de Dependencias**

Las capas superiores definen interfaces que las capas inferiores implementan.

### **4. Independencia de Frameworks**

La lógica de negocio no depende de frameworks externos.

## 🏛️ Estructura de Capas

```
src/
├── domain/              # 🎯 CAPA DE DOMINIO
│   ├── entities/        # Entidades de negocio
│   ├── value-objects/   # Value Objects
│   ├── services/        # Servicios de dominio
│   ├── repositories/    # Interfaces de repositorio
│   ├── types/           # Tipos y enums
│   └── exceptions/      # Excepciones de dominio
│
├── application/         # 🔄 CAPA DE APLICACIÓN
│   ├── use-cases/       # Casos de uso
│   ├── services/        # Servicios de aplicación
│   ├── dtos/            # Data Transfer Objects
│   ├── commands/        # Comandos (CQRS)
│   ├── queries/         # Consultas (CQRS)
│   └── interfaces/      # Interfaces de servicios
│
├── infrastructure/      # 🔧 CAPA DE INFRAESTRUCTURA
│   ├── repositories/    # Implementaciones de repositorio
│   ├── database/        # Configuración de BD
│   ├── auth/            # Autenticación
│   ├── services/        # Servicios externos
│   └── external-apis/   # APIs externas
│
└── presentation/        # 🎨 CAPA DE PRESENTACIÓN
    ├── components/      # Componentes React
    ├── pages/           # Páginas Next.js
    ├── hooks/           # Hooks personalizados
    ├── api/             # API Routes
    └── utils/           # Utilidades de UI
```

## 📚 Descripción de Capas

### **🎯 1. Capa de Dominio** (`src/domain/`)

**Responsabilidad**: Contiene la lógica de negocio pura y las reglas de dominio.

**Características**:

- ✅ No tiene dependencias externas
- ✅ Contiene las entidades principales del negocio
- ✅ Define las reglas de negocio
- ✅ Es independiente de frameworks

**Componentes**:

- **Entidades**: `Usuario`, `Riesgo`, `Proyecto`, `ActivoInformacion`
- **Value Objects**: `Email`, `CI`, `Probabilidad`, `Impacto`
- **Servicios**: `CalculadoraRiesgo`, `EvaluadorControles`
- **Repositorios**: Interfaces para persistencia
- **Excepciones**: Errores específicos del dominio

### **🔄 2. Capa de Aplicación** (`src/application/`)

**Responsabilidad**: Orquesta los casos de uso y coordina entre dominio e infraestructura.

**Características**:

- ✅ Implementa casos de uso específicos
- ✅ Coordina servicios de dominio
- ✅ Maneja transacciones
- ✅ Valida entrada y salida

**Componentes**:

- **Casos de Uso**: `CrearRiesgo`, `EvaluarControl`, `GenerarReporte`
- **Servicios**: Orquestación de lógica compleja
- **DTOs**: Objetos de transferencia de datos
- **Comandos/Queries**: Patrón CQRS

### **🔧 3. Capa de Infraestructura** (`src/infrastructure/`)

**Responsabilidad**: Implementa las interfaces definidas por las capas superiores.

**Características**:

- ✅ Implementa repositorios concretos
- ✅ Maneja persistencia de datos
- ✅ Integra servicios externos
- ✅ Configura frameworks

**Componentes**:

- **Repositorios**: Implementaciones con Supabase
- **Base de Datos**: Configuración y conexiones
- **Autenticación**: OAuth, JWT, sesiones
- **APIs Externas**: Integraciones con terceros

### **🎨 4. Capa de Presentación** (`src/presentation/`)

**Responsabilidad**: Maneja la interfaz de usuario y la interacción con el usuario.

**Características**:

- ✅ Componentes React
- ✅ Páginas Next.js
- ✅ API Routes
- ✅ Hooks personalizados

**Componentes**:

- **Componentes**: UI reutilizable
- **Páginas**: Rutas de la aplicación
- **Hooks**: Lógica de estado y efectos
- **API**: Controladores REST

## 🔗 Path Aliases Configurados

```typescript
// tsconfig.json
{
  "paths": {
    "@/*": ["./*"],                           // Raíz del proyecto
    "@/domain/*": ["./src/domain/*"],         // Capa de dominio
    "@/application/*": ["./src/application/*"], // Capa de aplicación
    "@/infrastructure/*": ["./src/infrastructure/*"], // Capa de infraestructura
    "@/presentation/*": ["./src/presentation/*"]      // Capa de presentación
  }
}
```

## 📖 Ejemplos de Uso

### **Importaciones por Capa**:

```typescript
// Desde capa de dominio
import { Usuario, Riesgo } from '@/domain/entities'
import { CalculadoraRiesgo } from '@/domain/services'
import { IUsuarioRepository } from '@/domain/repositories'

// Desde capa de aplicación
import { CrearUsuarioUseCase } from '@/application/use-cases'
import { UsuarioDTO } from '@/application/dtos'

// Desde capa de infraestructura
import { UsuarioSupabaseRepository } from '@/infrastructure/repositories'
import { SupabaseClient } from '@/infrastructure/database'

// Desde capa de presentación
import { UsuarioForm } from '@/presentation/components'
import { useUsuarios } from '@/presentation/hooks'
```

### **Flujo de Dependencias**:

```typescript
// ❌ INCORRECTO - Dominio no debe depender de infraestructura
import { SupabaseClient } from '@/infrastructure/database'

// ✅ CORRECTO - Dominio define interfaces
interface IUsuarioRepository {
  findById(id: number): Promise<Usuario>
}

// ✅ CORRECTO - Infraestructura implementa interfaces
class UsuarioSupabaseRepository implements IUsuarioRepository {
  async findById(id: number): Promise<Usuario> {
    // Implementación con Supabase
  }
}
```

## 🎯 Beneficios de esta Arquitectura

### **1. 🧪 Testabilidad**

- Cada capa se puede testear independientemente
- Fácil creación de mocks y stubs
- Tests unitarios aislados

### **2. 🔄 Mantenibilidad**

- Cambios en una capa no afectan otras
- Código organizado y predecible
- Fácil localización de funcionalidades

### **3. 🚀 Escalabilidad**

- Fácil agregar nuevas funcionalidades
- Reutilización de componentes
- Separación clara de responsabilidades

### **4. 🔧 Flexibilidad**

- Fácil cambio de tecnologías
- Independencia de frameworks
- Adaptable a nuevos requerimientos

## 📋 Próximos Pasos

Con la estructura de capas creada, puedes continuar con:

1. **✅ Tarea 2.2**: Implementar entidades de dominio principales
2. **✅ Tarea 2.3**: Implementar servicios de dominio
3. **✅ Tarea 4.1**: Implementar repositorios de infraestructura
4. **✅ Tarea 5.1**: Crear componentes de presentación

---

**✅ Tarea 2.1 Completada**: Estructura de directorios por capas implementada exitosamente.
