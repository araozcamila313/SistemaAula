const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ValidationError,
  parsePositiveInteger,
  parseSeatNumber,
  validateAttendance,
  validateDate,
  validateName,
  validateNote,
  validateStudent,
} = require('../backend/validation');

test('validateName trims and accepts student and subject names', () => {
  assert.equal(validateName({ nombre: '  Ana  ' }, 'estudiante'), 'Ana');
  assert.equal(validateName({ nombre: '  Historia  ' }, 'materia'), 'Historia');
});

test('validateName rejects missing, blank, and oversized names', () => {
  assert.throws(() => validateName({}, 'estudiante'), ValidationError);
  assert.throws(() => validateName({ nombre: '  ' }, 'materia'), ValidationError);
  assert.throws(() => validateName({ nombre: 'a'.repeat(121) }, 'estudiante'), ValidationError);
});

test('parsePositiveInteger accepts positive safe integers', () => {
  assert.equal(parsePositiveInteger('42', 'id'), 42);
});

test('parsePositiveInteger rejects invalid identifiers', () => {
  for (const value of ['', '0', '-1', '1.2', '1e2', '9007199254740992']) {
    assert.throws(() => parsePositiveInteger(value, 'id'), ValidationError);
  }
});

test('parseSeatNumber only accepts seats from 1 to 50', () => {
  assert.equal(parseSeatNumber('1'), 1);
  assert.equal(parseSeatNumber('50'), 50);
  assert.throws(() => parseSeatNumber('51'), ValidationError);
});

test('validateStudent trims the name and accepts an optional matrícula', () => {
  assert.deepEqual(validateStudent({ nombre: ' Ana ', matricula: '  A-123  ' }), {
    nombre: 'Ana',
    matricula: 'A-123',
  });
  assert.deepEqual(validateStudent({ nombre: 'Ana', matricula: ' ' }), {
    nombre: 'Ana',
    matricula: null,
  });
  assert.throws(() => validateStudent({ nombre: 'Ana', matricula: 'x'.repeat(31) }), ValidationError);
});

test('validateDate accepts real calendar dates only', () => {
  assert.equal(validateDate('2026-11-03'), '2026-11-03');
  assert.throws(() => validateDate('2026-02-30'), ValidationError);
  assert.throws(() => validateDate('03-11-2026'), ValidationError);
});

test('validateAttendance accepts the supported states and requires a date', () => {
  assert.deepEqual(validateAttendance({ estado: 'Atrasado', fecha: '2026-11-03' }), {
    estado: 'Atrasado',
    fecha: '2026-11-03',
  });
  assert.throws(() => validateAttendance({ estado: 'Tarde', fecha: '2026-11-03' }), ValidationError);
  assert.throws(() => validateAttendance({ estado: 'Presente' }), ValidationError);
});

test('validateNote trims fields and returns a normalized subject id', () => {
  assert.deepEqual(validateNote({
    titulo: '  Repaso  ',
    contenido: '  Tema de hoy  ',
    idMateria: '2',
  }), {
    titulo: 'Repaso',
    contenido: 'Tema de hoy',
    idMateria: 2,
  });
});

test('validateNote rejects missing and oversized values', () => {
  assert.throws(() => validateNote({ titulo: ' ', contenido: 'texto', idMateria: '1' }), ValidationError);
  assert.throws(() => validateNote({ titulo: 'a'.repeat(151), contenido: 'texto', idMateria: '1' }), ValidationError);
  assert.throws(() => validateNote({ titulo: 'Título', contenido: ' ', idMateria: '1' }), ValidationError);
  assert.throws(() => validateNote({ titulo: 'Título', contenido: 'texto', idMateria: 'x' }), ValidationError);
});
