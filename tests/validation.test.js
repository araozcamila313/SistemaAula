const test = require('node:test');
const assert = require('node:assert/strict');
const { ValidationError, parsePositiveInteger, validateName, validateNote } = require('../backend/validation');

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
