# SistemaAula
Proyecto de gestión de aula sobre (Tomar apuntes y Asignación de asientos)

## Requisitos

- Node.js 20.13 o posterior
- PostgreSQL

## Configuración

1. Instala Node.js 20.13 o posterior y PostgreSQL.
2. Desde la carpeta del proyecto, instala las dependencias con `npm install`.
3. Copia `.env.example` como `.env` y configura las credenciales de PostgreSQL. `DB_NAME` es la base de datos que compartirá el proyecto; no subas `.env` a GitHub.
4. Ejecuta `npm run db:setup`. El comando crea la base de datos si hace falta y configura las tablas de apuntes, estudiantes, materias, asientos y asistencia.
5. Inicia el servidor con `npm run dev`.

La aplicación de apuntes está en `http://localhost:3000` y la de asientos en `http://localhost:3000/asignacion-de-asientos/`. Los endpoints de la API están bajo `http://localhost:3000/api`.

Los apuntes se asocian al estudiante mediante el encabezado `x-estudiante-id`. Usa `npm start` para iniciar el servidor sin recarga automática. La configuración local `.env` no debe subirse al repositorio.

## Interfaz

Abre `http://localhost:3000` para usar la interfaz de apuntes. Permite crear, editar, consultar y eliminar apuntes, cambiar de estudiante, y agregar estudiantes y materias. Los nombres de materias iniciales incluyen cursos universitarios como Sistemas de Información II y Base de Datos II.

Los archivos del frontend están en `public/`: `index.html`, `styles.css` y `app.js`. La interfaz envía los datos a la API mediante `fetch` y muestra mensajes cuando faltan campos obligatorios.

La interfaz de asientos permite registrar estudiantes con nombre y matrícula, asignar o liberar asientos, y registrar asistencia por fecha. Esos datos se guardan en PostgreSQL, así que las personas que usan la misma instalación del servidor ven los mismos cambios. La migración no importa datos guardados previamente en `localStorage`; registra los estudiantes desde la pestaña **Alumnos** y vuelve a asignar los asientos necesarios.

Para compartir la aplicación entre varias computadoras, todas deben abrir la dirección de un mismo servidor y ese servidor debe conectarse a la misma base de datos. El proyecto no implementa inicio de sesión ni permisos por docente; úsalo solo en un entorno de confianza y no lo expongas directamente a Internet.
