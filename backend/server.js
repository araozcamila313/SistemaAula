require('dotenv').config();

const path = require('node:path');
const express = require('express');
const { Pool } = require('pg');
const { ValidationError, parsePositiveInteger, validateName, validateNote } = require('./validation');

const app = express();
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
const publicDirectory = path.join(__dirname, '..', 'public');

app.use(express.json({ limit: '100kb' }));

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function studentIdFromRequest(req) {
  return parsePositiveInteger(req.get('x-estudiante-id') || '', 'El estudiante');
}

function noteIdFromRequest(req) {
  return parsePositiveInteger(req.params.id, 'El apunte');
}

async function ensureSubjectExists(subjectId) {
  const result = await pool.query('SELECT id FROM materias WHERE id = $1', [subjectId]);
  if (result.rowCount === 0) {
    throw new ValidationError('La materia seleccionada no existe');
  }
}

app.get('/api/estudiantes', asyncRoute(async (_req, res) => {
  const result = await pool.query('SELECT id, nombre FROM estudiantes ORDER BY nombre');
  res.json(result.rows);
}));

app.get('/api/materias', asyncRoute(async (_req, res) => {
  const result = await pool.query('SELECT id, nombre FROM materias ORDER BY nombre');
  res.json(result.rows);
}));

app.post('/api/estudiantes', asyncRoute(async (req, res) => {
  const nombre = validateName(req.body, 'estudiante');
  const result = await pool.query(
    'INSERT INTO estudiantes (nombre) VALUES ($1) RETURNING id, nombre',
    [nombre]
  );
  res.status(201).json(result.rows[0]);
}));

app.post('/api/materias', asyncRoute(async (req, res) => {
  const nombre = validateName(req.body, 'materia');
  const result = await pool.query(
    'INSERT INTO materias (nombre) VALUES ($1) RETURNING id, nombre',
    [nombre]
  );
  res.status(201).json(result.rows[0]);
}));

app.get('/api/apuntes', asyncRoute(async (req, res) => {
  const studentId = studentIdFromRequest(req);
  const result = await pool.query(
    `SELECT a.id, a.titulo, a.fecha_creacion, m.nombre AS materia
     FROM apuntes a
     JOIN materias m ON m.id = a.materia_id
     WHERE a.estudiante_id = $1
     ORDER BY a.fecha_creacion DESC, a.id DESC`,
    [studentId]
  );
  res.json(result.rows);
}));

app.get('/api/apuntes/:id', asyncRoute(async (req, res) => {
  const studentId = studentIdFromRequest(req);
  const noteId = noteIdFromRequest(req);
  const result = await pool.query(
    `SELECT a.id, a.titulo, a.contenido, a.materia_id AS id_materia,
            a.fecha_creacion, a.fecha_modificacion, m.nombre AS materia
     FROM apuntes a
     JOIN materias m ON m.id = a.materia_id
     WHERE a.id = $1 AND a.estudiante_id = $2`,
    [noteId, studentId]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Apunte no encontrado' });
  }
  res.json(result.rows[0]);
}));

app.post('/api/apuntes', asyncRoute(async (req, res) => {
  const studentId = studentIdFromRequest(req);
  const note = validateNote(req.body);
  await ensureSubjectExists(note.idMateria);

  const result = await pool.query(
    `INSERT INTO apuntes (estudiante_id, materia_id, titulo, contenido)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [studentId, note.idMateria, note.titulo, note.contenido]
  );
  res.status(201).json({ id: result.rows[0].id });
}));

app.put('/api/apuntes/:id', asyncRoute(async (req, res) => {
  const studentId = studentIdFromRequest(req);
  const noteId = noteIdFromRequest(req);
  const note = validateNote(req.body);
  await ensureSubjectExists(note.idMateria);

  const result = await pool.query(
    `UPDATE apuntes
     SET titulo = $1, materia_id = $2, contenido = $3, fecha_modificacion = NOW()
     WHERE id = $4 AND estudiante_id = $5
     RETURNING id`,
    [note.titulo, note.idMateria, note.contenido, noteId, studentId]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Apunte no encontrado' });
  }
  res.json({ id: result.rows[0].id });
}));

app.delete('/api/apuntes/:id', asyncRoute(async (req, res) => {
  if (req.query.confirmar !== 'true') {
    throw new ValidationError('Se requiere confirmar=true para eliminar el apunte');
  }

  const studentId = studentIdFromRequest(req);
  const noteId = noteIdFromRequest(req);
  const result = await pool.query(
    'DELETE FROM apuntes WHERE id = $1 AND estudiante_id = $2 RETURNING id',
    [noteId, studentId]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Apunte no encontrado' });
  }
  res.json({ id: result.rows[0].id });
}));

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Ruta de API no encontrada' });
});

app.use(express.static(publicDirectory));

app.use((error, _req, res, _next) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Ya existe un registro con ese nombre' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'El JSON de la solicitud no es válido' });
  }
  console.error('Error en la solicitud:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

async function start() {
  if (!process.env.DB_NAME) {
    throw new Error('DB_NAME no está configurado; revisa tu archivo .env');
  }
  await pool.query('SELECT 1');
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => {
    console.log(`SistemaAula disponible en http://localhost:${port}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    });
  }
}

start().catch(async (error) => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  await pool.end();
  process.exitCode = 1;
});
