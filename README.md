# CRUD - Mantenimiento de Personal

Proyecto separado en frontend, backend y base de datos para que funcione como sistema distribuido.

## Qué va en cada carpeta

- [frontend](frontend): página web estática
- [backend](backend): API en Node.js
- [database](database): script SQL de PostgreSQL

## Lo que necesitas

- Node.js 18+
- Una base PostgreSQL en DigitalOcean
- Una URL pública para el backend
- Una URL pública para el frontend

## Cómo correrlo en local

1. Crea la base de datos `crud_personal` y el usuario `crud_user` en PostgreSQL.
2. Ejecuta el SQL de [database/schema.sql](database/schema.sql) dentro de esa base.
3. No cambies [frontend/config.js](frontend/config.js) si vas a probar en local, ya apunta a `http://localhost:3000`.
4. Usa los comandos exactos de la sección "Comandos exactos".

## Comandos exactos

### Terminal 1: backend

```bat
cd C:\Users\JHOEL\OneDrive\Desktop\crud\backend
npm install
set DATABASE_URL=postgresql://crud_user:jhoel_crud@localhost:5432/crud_personal
set DATABASE_SSL=false
set FRONTEND_ORIGIN=*
npm start
```

### Terminal 2: frontend

```bat
cd C:\Users\JHOEL\OneDrive\Desktop\crud\frontend
node server.js
```

### Pruebas en navegador

Abre estas URLs:

- http://localhost:5500
- http://localhost:3000/health
- http://localhost:3000/api/info

### Si quieres verificar la API por consola

```bat
curl http://localhost:3000/health
curl http://localhost:3000/api/info
```

### Nota

Si cambias la URL del backend en producción, edita [frontend/config.js](frontend/config.js) y reemplaza `http://localhost:3000` por la URL pública del backend.

## Despliegue práctico en DigitalOcean

Usa 3 servicios separados:

1. Frontend en App Platform como sitio estático.
2. Backend en App Platform como app Node.js.
3. Base de datos en Managed PostgreSQL.

### 1) Crear la base de datos

1. En DigitalOcean crea una base Managed PostgreSQL.
2. Copia la cadena de conexión `DATABASE_URL`.
3. Ejecuta el contenido de [database/schema.sql](database/schema.sql) en esa base.

### 2) Subir el backend

1. Sube este proyecto a GitHub.
2. Crea una app nueva en DigitalOcean desde ese repositorio.
3. Elige el servicio del backend.
4. Usa el directorio `backend` como root si te lo pide.
5. Configura estas variables:
   - `PORT=3000`
   - `DATABASE_URL=postgresql://...`
   - `DATABASE_SSL=true`
   - `FRONTEND_ORIGIN=https://tu-frontend.com`
6. Verifica que el backend responda en `/health`.

### 3) Subir el frontend

1. Crea otro servicio estático en DigitalOcean.
2. Sube la carpeta [frontend](frontend) como sitio web.
3. Edita [frontend/config.js](frontend/config.js) y cambia `API_URL` por la URL pública del backend.
4. Publica el frontend.

## Flujo final

El navegador carga el frontend, el frontend llama al backend por HTTP y el backend consulta la base PostgreSQL. Esa separación es la parte importante para que se vea como sistema distribuido.

## Endpoints del backend

- `GET /api/personal`
- `GET /api/personal/:id`
- `POST /api/personal`
- `PUT /api/personal/:id`
- `DELETE /api/personal/:id`

## JSON de ejemplo

```json
{
  "nombre": "Ana",
  "apellido": "Pérez",
  "cargo": "Analista",
  "email": "ana.perez@empresa.com",
  "telefono": "987654321"
}
```

## Entrega para el curso (paso a paso)

Esta sección está alineada con la rúbrica pedida por el profesor.

### 1. Investigación de plataforma

Plataforma elegida: DigitalOcean App Platform + Managed PostgreSQL.

Modelo elegido: PaaS.

Justificación:
- Reduce complejidad operativa (no administras sistema operativo ni parches del servidor).
- Permite despliegue rápido desde GitHub.
- Escala servicios por separado (frontend, backend, base de datos).
- Es adecuado para un CRUD académico porque prioriza entrega funcional y disponibilidad.

### 2. Desarrollo local

Aplicación mínima para evidencia: endpoint Hola Mundo avanzado.

Endpoint implementado:
- GET /api/info

Respuesta esperada:
- message
- serverTime
- clientIp

Prueba local:
1. Instala dependencias en backend.
2. Configura DATABASE_URL.
3. Inicia backend con npm start.
4. Abre http://localhost:3000/api/info y guarda captura.

### 3. Configuración de red

Si usas PaaS (App Platform):
- El enrutamiento HTTP/HTTPS público lo gestiona la plataforma.
- Debes exponer el servicio backend en el puerto 3000.

Si el profesor exige mostrar firewall manual (modo IaaS en Droplet):
1. Habilita SSH y HTTP/HTTPS.
2. Comandos de ejemplo en Ubuntu:
   - sudo ufw allow OpenSSH
   - sudo ufw allow 80/tcp
   - sudo ufw allow 443/tcp
   - sudo ufw enable
   - sudo ufw status

### 4. Despliegue

Arquitectura distribuida solicitada:
1. Frontend separado (sitio estático).
2. Backend separado (API Node.js).
3. Base de datos separada (Managed PostgreSQL).

Pasos:
1. Sube el repositorio a GitHub.
2. Crea base de datos Managed PostgreSQL.
3. Ejecuta el SQL de database/schema.sql.
4. Crea app Backend en App Platform desde carpeta backend.
5. Configura variables:
   - PORT=3000
   - DATABASE_URL=postgresql://...
   - DATABASE_SSL=true
   - FRONTEND_ORIGIN=https://tu-frontend
6. Crea app Frontend estática desde carpeta frontend.
7. Edita frontend/config.js con la URL pública del backend.

### 5. Prueba de acceso

Validaciones con URL pública (no localhost):
1. Frontend abre correctamente en navegador.
2. Backend responde en https://tu-backend/health.
3. Endpoint de evidencia responde en https://tu-backend/api/info.
4. CRUD completo funcionando desde frontend contra backend remoto.

Evidencias recomendadas para entregar:
1. Captura de recursos separados (frontend, backend, DB).
2. Captura de variables de entorno en backend.
3. Captura de URL pública del frontend.
4. Captura de /health y /api/info en producción.
5. Video corto creando, editando y eliminando un registro.
