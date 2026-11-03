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

function validateStudent(body) {
  const nombre = validateName(body, 'estudiante');
  if (body.matricula !== undefined && body.matricula !== null && typeof body.matricula !== 'string') {
    throw new ValidationError('La matrícula debe ser texto');
  }

  const matricula = typeof body.matricula === 'string' ? body.matricula.trim() : '';
  if (matricula.length > 30) {
    throw new ValidationError('La matrícula no puede superar 30 caracteres');
  }

  return { nombre, matricula: matricula || null };
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

function parseSeatNumber(value) {
  const seatNumber = parsePositiveInteger(value, 'El asiento');
  if (seatNumber > 50) {
    throw new ValidationError('El número de asiento debe estar entre 1 y 50');
  }
  return seatNumber;
}

function validateDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ValidationError('La fecha debe tener el formato AAAA-MM-DD');
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== value) {
    throw new ValidationError('La fecha no es válida');
  }
  return value;
}

function validateAttendance(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Los datos de asistencia no son válidos');
  }
  if (!['Presente', 'Ausente', 'Atrasado'].includes(body.estado)) {
    throw new ValidationError('El estado debe ser Presente, Ausente o Atrasado');
  }

  return {
    estado: body.estado,
    fecha: validateDate(body.fecha),
  };
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

module.exports = {
  ValidationError,
  parsePositiveInteger,
  parseSeatNumber,
  validateAttendance,
  validateDate,
  validateName,
  validateNote,
  validateStudent,
};
