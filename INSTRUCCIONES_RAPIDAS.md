# 🚀 Solución Rápida: Error "column id_usuario_auth does not exist"

## 🎯 Problema
El código busca la columna `id_usuario_auth` en la tabla `usuarios`, pero no existe.

## ⚡ Solución en 3 Pasos

### Paso 1: Abrir Supabase Dashboard
1. Ve a: **https://supabase.com/dashboard/project/prcsicfnvyaoxwfrjnky**
2. Haz clic en **"SQL Editor"** en el menú lateral izquierdo

### Paso 2: Ejecutar SQL
Copia y pega este SQL en el editor:

```sql
-- Agregar columnas necesarias para Supabase Auth
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS id_usuario_auth UUID;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombres_usuario VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellidos_usuario VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_usuario VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ci_usuario VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono_usuario VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS departamento_usuario VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol_usuario VARCHAR(50) DEFAULT 'CONSULTOR';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT NOW();
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT NOW();
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultima_conexion TIMESTAMP;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios(id_usuario_auth);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email_usuario);
```

### Paso 3: Ejecutar y Probar
1. Haz clic en **"Run"** para ejecutar el SQL
2. Deberías ver: **"Success. No rows returned"**
3. Ve a **"Table Editor"** > **"usuarios"** para verificar las nuevas columnas

## 🧪 Probar el Sistema

1. **Iniciar servidor**:
   ```bash
   npm run dev
   ```

2. **Probar login**:
   - Ve a http://localhost:3000/auth/login
   - Haz clic en "Iniciar sesión con Google"
   - **Resultado esperado**: Ya no debería haber error 404

## 🔍 Verificar que Funcionó

Ejecuta este comando para verificar:
```bash
node scripts/check-users.js
```

Deberías ver:
- ✅ Tabla usuarios con estructura correcta
- ✅ Usuario OAuth creado automáticamente
- ✅ Dashboard carga correctamente

## 🆘 Si Aún Hay Problemas

1. **Verifica las columnas**: En Supabase Dashboard > Table Editor > usuarios
   - Debe tener: `id_usuario_auth`, `nombres_usuario`, `apellidos_usuario`, etc.

2. **Revisa la consola del navegador**: 
   - Abre DevTools (F12) y busca logs como:
   - `🔍 Buscando usuario en BD con authId: ...`
   - `✅ Usuario encontrado en BD: ...`

3. **Si sigue fallando**: 
   - Ejecuta el SQL completo de `supabase-users-table.sql`
   - O contacta para más ayuda

## ✅ Resultado Final

Después de ejecutar el SQL:
- ✅ Login con Google funciona
- ✅ Usuario se crea automáticamente en la tabla
- ✅ Dashboard carga sin error 404
- ✅ Sistema completamente funcional

¡Eso es todo! Con estos 3 pasos simples el error debería desaparecer.