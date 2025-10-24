# Sistema de Gestión de Riesgos COSO II + ISO 27001

Sistema integral de gestión de riesgos empresariales y seguridad de la información desarrollado con Next.js 14, TypeScript y Supabase.

## 🚀 Tecnologías

- **Frontend**: Next.js 14, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: Tailwind CSS, shadcn/ui, Lucide React
- **Estado**: Zustand
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Fechas**: date-fns
- **Testing**: Jest, Testing Library, Playwright
- **Calidad**: ESLint, Prettier, Husky

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd cosoii
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Completar las variables en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

4. **Configurar base de datos**
- Ejecutar el script `supabase-setup.sql` en Supabase Dashboard
- Configurar OAuth providers si es necesario

## 🏃‍♂️ Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start
```

## 🧪 Testing

### Tests Unitarios (Jest + Testing Library)
```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage
```

### Tests E2E (Playwright)
```bash
# Ejecutar tests E2E
npm run test:e2e

# Tests E2E con UI
npm run test:e2e:ui

# Tests E2E en modo headed
npm run test:e2e:headed
```

## 🎨 Calidad de Código

```bash
# Linting
npm run lint
npm run lint:fix

# Formateo
npm run format
npm run format:check
```

## 📁 Estructura del Proyecto

```
├── app/                    # App Router de Next.js
├── components/             # Componentes de UI
├── lib/                    # Utilidades y configuración
│   ├── charts/            # Configuración de gráficos
│   ├── config/            # Configuración de la app
│   ├── constants/         # Constantes del sistema
│   ├── store/             # Estado global (Zustand)
│   ├── supabase/          # Cliente de Supabase
│   ├── utils/             # Utilidades generales
│   └── validations/       # Esquemas de validación
├── src/                   # Arquitectura por capas
│   ├── domain/            # Entidades y lógica de negocio
│   ├── application/       # Casos de uso y servicios
│   ├── infrastructure/    # Repositorios e integraciones
│   └── presentation/      # Componentes y páginas
├── __tests__/             # Tests unitarios
├── e2e/                   # Tests end-to-end
└── docs/                  # Documentación
```

## 🔧 Configuración de Desarrollo

### Pre-commit Hooks
El proyecto usa Husky para ejecutar automáticamente:
- ESLint (corrección de errores)
- Prettier (formateo de código)

### Variables de Entorno
- `.env.local` - Variables locales de desarrollo
- `.env.example` - Plantilla de variables de entorno

## 📚 Documentación Adicional

- [Arquitectura del Sistema](./ARQUITECTURA.md)
- [Configuración](./CONFIGURACION.md)
- [Implementación Supabase](./IMPLEMENTACION_SUPABASE.md)
- [Estado de Implementación](./ESTADO_IMPLEMENTACION.md)

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🏢 Empresa

**DELTA CONSULT LTDA**  
Sistema de Gestión de Riesgos COSO II + ISO 27001