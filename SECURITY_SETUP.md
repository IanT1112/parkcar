# Configuración de seguridad

## Variables locales

Copiar `frontend/.env.example` a `frontend/.env` y `backend/.env.example` a
`backend/.env`. No confirmar ninguno de los dos archivos `.env` en Git.

El backend usa la clave publicable de Supabase para validar tokens. Nunca se
debe colocar una clave `service_role` en el frontend ni confirmarla en Git.

Iniciar el backend desde la carpeta `backend` para encontrar los modelos:

```powershell
python -m uvicorn app.main:app --env-file .env --host 127.0.0.1 --port 8000
```

En producción, configurar `ALLOWED_ORIGINS` con el dominio HTTPS real. No usar
`*`. Configurar también un límite de cuerpo de 5 MB en el proxy o WAF.

## Base de datos

Ejecutar `supabase/migrations/001_security.sql` en SQL Editor, primero en un
proyecto de prueba. Activa RLS, restringe filas al propietario, valida los
comentarios y limita su frecuencia.

Antes, corregir filas con `user_id`, `comentario` o `valoracion` nulos; los
`NOT NULL` fallarán intencionalmente si existen datos inválidos.

## Roles

Los roles se leen exclusivamente de `app_metadata.role` y deben asignarse
desde un entorno administrativo confiable, nunca desde el navegador:

- `admin`: acceso a `/admin`.
- `operador`: acceso a `/operador`.
- Sin rol: usuario normal.

Las tablas administrativas futuras también necesitan RLS que valide el rol
desde `auth.jwt() -> 'app_metadata' ->> 'role'`.

## Límites de producción

El limitador incluido funciona por proceso. Con varios workers o instancias,
usar un límite compartido mediante Redis o el proveedor edge/WAF. Mantener un
solo worker hasta configurar ese límite compartido.

