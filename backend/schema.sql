CREATE TABLE IF NOT EXISTS estudiantes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE
);

ALTER TABLE estudiantes
  ADD COLUMN IF NOT EXISTS matricula VARCHAR(30);

CREATE UNIQUE INDEX IF NOT EXISTS estudiantes_matricula_unique
  ON estudiantes (matricula)
  WHERE matricula IS NOT NULL;

CREATE TABLE IF NOT EXISTS materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS apuntes (
  id SERIAL PRIMARY KEY,
  estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  materia_id INTEGER NOT NULL REFERENCES materias(id),
  titulo VARCHAR(150) NOT NULL,
  contenido TEXT NOT NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_modificacion TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS asignaciones_asientos (
  asiento INTEGER PRIMARY KEY CHECK (asiento BETWEEN 1 AND 50),
  estudiante_id INTEGER NOT NULL UNIQUE REFERENCES estudiantes(id) ON DELETE CASCADE,
  fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asistencia (
  estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado VARCHAR(10) NOT NULL CHECK (estado IN ('Presente', 'Ausente', 'Atrasado')),
  PRIMARY KEY (estudiante_id, fecha)
);

INSERT INTO estudiantes (nombre)
VALUES ('Estudiante de ejemplo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO materias (nombre)
VALUES
  ('Álgebra Lineal'),
  ('Arquitectura de Computadoras'),
  ('Base de Datos I'),
  ('Base de Datos II'),
  ('Cálculo I'),
  ('Cálculo II'),
  ('Estructura de Datos'),
  ('Estadística'),
  ('Ingeniería de Software I'),
  ('Ingeniería de Software II'),
  ('Matemática Discreta'),
  ('Programación I'),
  ('Programación II'),
  ('Programación III'),
  ('Redes de Computadoras'),
  ('Sistemas de Información I'),
  ('Sistemas de Información II'),
  ('Sistemas Operativos'),
  ('General')
ON CONFLICT (nombre) DO NOTHING;
