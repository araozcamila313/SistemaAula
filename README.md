# SistemaAula
Proyecto de gestión de aula sobre (Tomar apuntes y Asignación de asientos)

## Requisitos

- Node.js 20.13 o posterior
- PostgreSQL

## Configuración

1. Instala las dependencias con `npm install`.
2. Copia `.env.example` a `.env` y configura la conexión a PostgreSQL.
3. Ejecuta `npm run db:setup`. El comando crea la base de datos configurada si hace falta, crea las tablas y agrega materias iniciales de ejemplo.
4. Inicia la aplicación con `npm run dev` y abre `http://localhost:3000`.

Puedes agregar estudiantes y materias desde la interfaz; sus nombres se guardan en la base de datos configurada.
Usa `npm start` para iniciar el servidor sin el modo de recarga automática. La configuración local `.env` no debe subirse al repositorio.
