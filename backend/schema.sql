CREATE TABLE IF NOT EXISTS estudiantes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE
);

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
