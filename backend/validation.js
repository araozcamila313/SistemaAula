class ValidationError extends Error {}

function validateName(body, label) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.nombre !== 'string') {
    throw new ValidationError(`El nombre de ${label} es obligatorio`);
  }

  const nombre = body.nombre.trim();
  if (!nombre || nombre.length > 120) {
    throw new ValidationError(`El nombre de ${label} debe tener entre 1 y 120 caracteres`);
  }

  return nombre;
}

function parsePositiveInteger(value, fieldName) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new ValidationError(`${fieldName} debe ser un entero positivo`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new ValidationError(`${fieldName} debe ser un entero positivo`);
  }

  return parsed;
}

function validateNote(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('El cuerpo de la solicitud no es válido');
  }

  if (typeof body.titulo !== 'string') {
    throw new ValidationError('El título es obligatorio');
  }
  const titulo = body.titulo.trim();
  if (!titulo || titulo.length > 150) {
    throw new ValidationError('El título debe tener entre 1 y 150 caracteres');
  }

  if (typeof body.contenido !== 'string' || !body.contenido.trim()) {
    throw new ValidationError('El contenido es obligatorio');
  }

  return {
    titulo,
    contenido: body.contenido.trim(),
    idMateria: parsePositiveInteger(String(body.idMateria ?? ''), 'La materia'),
  };
}

module.exports = { ValidationError, parsePositiveInteger, validateName, validateNote };
