# 🚀 Guía de Implementación - Supabase COSO II + ISO 27001

## 📋 Pasos para Implementar el Esquema en Supabase

### **Paso 1: Ejecutar el Esquema en Supabase**

1. **Abrir Supabase Dashboard**
   - Ir a: https://supabase.com/dashboard/project/prcsicfnvyaoxwfrjnky/sql
   - (Reemplazar con tu Project ID)

2. **Ejecutar el Script de Migración**
   - Copiar todo el contenido del archivo `migrate-to-supabase.sql`
   - Pegarlo en el SQL Editor de Supabase
   - Hacer clic en "Run" para ejecutar

3. **Verificar Creación de Tablas**
   - Ir a Database > Tables
   - Verificar que se crearon todas las tablas (aproximadamente 40+ tablas)

### **Paso 2: Configurar Autenticación OAuth**

1. **Ir a Authentication > Providers**
   - Dashboard: https://supabase.com/dashboard/project/prcsicfnvyaoxwfrjnky/auth/providers

2. **Configurar Google OAuth**
   - Habilitar Google Provider
   - Obtener Client ID y Client Secret de Google Cloud Console
   - Configurar redirect URL: `https://prcsicfnvyaoxwfrjnky.supabase.co/auth/v1/callback`

3. **Configurar LinkedIn OAuth**
   - Habilitar LinkedIn Provider
   - Obtener Client ID y Client Secret de LinkedIn Developer Portal
   - Configurar redirect URL

4. **Configurar GitHub OAuth**
   - Habilitar GitHub Provider
   - Obtener Client ID y Client Secret de GitHub Developer Settings
   - Configurar redirect URL

### **Paso 3: Generar Tipos TypeScript**

1. **Instalar Supabase CLI** (si no está instalado)

   ```bash
   npm install -g supabase
   ```

2. **Generar Tipos TypeScript**

   ```bash
   supabase gen types typescript --project-id prcsicfnvyaoxwfrjnky > lib/supabase/types.ts
   ```

3. **Verificar Archivo de Tipos**
   - Revisar que se creó `lib/supabase/types.ts`
   - Verificar que contiene todas las tablas y tipos

### **Paso 4: Actualizar Variables de Entorno**

1. **Actualizar `.env.local`**

   ```env
   # Supabase (ya configurado)
   NEXT_PUBLIC_SUPABASE_URL=https://prcsicfnvyaoxwfrjnky.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # OAuth Providers (agregar después de configurar)
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id
   NEXT_PUBLIC_LINKEDIN_CLIENT_ID=tu_linkedin_client_id
   NEXT_PUBLIC_GITHUB_CLIENT_ID=tu_github_client_id
   ```

### **Paso 5: Configurar Storage (Opcional)**

1. **Crear Buckets para Archivos**
   - Ir a Storage en Supabase Dashboard
   - Crear bucket "evidencias" para documentos de auditoría
   - Crear bucket "avatars" para fotos de perfil

2. **Configurar Políticas de Storage**

   ```sql
   -- Política para evidencias
   CREATE POLICY "Usuarios autenticados pueden subir evidencias" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'evidencias' AND auth.role() = 'authenticated');

   -- Política para avatars
   CREATE POLICY "Usuarios pueden subir su avatar" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### **Paso 6: Verificar Implementación**

1. **Probar Conexión a Base de Datos**

   ```typescript
   // Crear archivo test-connection.ts
   import { createClient } from '@/lib/supabase/client'

   async function testConnection() {
     const supabase = createClient()
     const { data, error } = await supabase.from('roles').select('*')
     console.log('Roles:', data)
     console.log('Error:', error)
   }

   testConnection()
   ```

2. **Probar Autenticación**
   - Intentar login con email/password
   - Probar OAuth con Google/LinkedIn/GitHub
   - Verificar que se crean usuarios en la tabla `usuarios`

3. **Verificar Políticas RLS**
   - Probar que usuarios solo ven datos permitidos
   - Verificar que las políticas de seguridad funcionan

### **Paso 7: Datos de Prueba (Opcional)**

1. **Insertar Cliente de Prueba**

   ```sql
   INSERT INTO clientes (nombre_cliente, tipo_industria, tamaño_empresa, nombre_contacto_principal, apellido_contacto_principal, correo_contacto)
   VALUES ('Empresa Demo', 'Tecnología', 'Mediana', 'Juan', 'Pérez', 'juan@empresa.com');
   ```

2. **Insertar Proyecto de Prueba**

   ```sql
   INSERT INTO proyectos (id_cliente, nombre_proyecto, descripcion_proyecto, fecha_inicio_proyecto, id_gerente_proyecto)
   VALUES (1, 'Proyecto Piloto COSO-ISO', 'Implementación piloto del sistema', CURRENT_DATE, 1);
   ```

3. **Insertar Riesgo de Prueba**
   ```sql
   INSERT INTO riesgos (id_proyecto, id_categoria_riesgo, id_tipo_riesgo, id_estado_riesgo, id_usuario_registro, id_propietario_riesgo, titulo_riesgo, descripcion_riesgo, valor_probabilidad, valor_impacto)
   VALUES (1, 6, 1, 1, 1, 1, 'Riesgo de Seguridad Piloto', 'Riesgo de prueba para validar el sistema', 3, 4);
   ```

## ✅ **Checklist de Verificación**

- [ ] ✅ Esquema de base de datos ejecutado sin errores
- [ ] ✅ Todas las tablas creadas (40+ tablas)
- [ ] ✅ Datos iniciales insertados correctamente
- [ ] ✅ OAuth providers configurados (Google, LinkedIn, GitHub)
- [ ] ✅ Tipos TypeScript generados
- [ ] ✅ Variables de entorno actualizadas
- [ ] ✅ Storage configurado (opcional)
- [ ] ✅ Conexión a base de datos probada
- [ ] ✅ Autenticación funcionando
- [ ] ✅ Políticas RLS verificadas
- [ ] ✅ Datos de prueba insertados (opcional)

## 🔧 **Solución de Problemas Comunes**

### **Error: "relation does not exist"**

- Verificar que el esquema se ejecutó completamente
- Revisar que no hay errores en el SQL Editor

### **Error de autenticación OAuth**

- Verificar Client ID y Client Secret
- Confirmar redirect URLs configuradas correctamente
- Revisar que los providers están habilitados

### **Error de tipos TypeScript**

- Reinstalar Supabase CLI: `npm uninstall -g supabase && npm install -g supabase`
- Regenerar tipos: `supabase gen types typescript --project-id [PROJECT_ID]`

### **Error de políticas RLS**

- Verificar que las políticas están habilitadas
- Revisar que auth.uid() retorna el ID correcto
- Probar con usuario superadmin primero

## 📞 **Siguiente Paso**

Una vez completada la implementación del esquema, puedes continuar con:

- **Tarea 1.4**: Implementar sistema de configuración y constantes
- **Tarea 2.1**: Crear estructura de directorios por capas

¡El esquema COSO II + ISO 27001 está listo para usar! 🎉
