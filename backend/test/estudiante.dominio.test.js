import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarEstudiante, validarGrado } from '../src/dominio/estudiante.js';

const valido = { documento: '123456', nombre: 'Ana', apellido: 'Martínez', grado: 5, correo: 'ana@colegio.edu.co' };

test('acepta un estudiante válido', () => {
  const r = validarEstudiante(valido);
  assert.equal(r.valido, true);
  assert.deepEqual(r.valor, valido);
});

test('recorta espacios de los textos', () => {
  const r = validarEstudiante({ ...valido, nombre: '  Ana  ' });
  assert.equal(r.valor.nombre, 'Ana');
});

test('rechaza un documento con letras', () => {
  const r = validarEstudiante({ ...valido, documento: '12AB' });
  assert.equal(r.valido, false);
  assert.ok(r.errores.documento);
});

test('rechaza un nombre demasiado corto', () => {
  const r = validarEstudiante({ ...valido, nombre: 'A' });
  assert.ok(r.errores.nombre);
});

test('rechaza un apellido vacío', () => {
  const r = validarEstudiante({ ...valido, apellido: '' });
  assert.ok(r.errores.apellido);
});

test('rechaza un grado fuera del rango', () => {
  const r = validarEstudiante({ ...valido, grado: 12 });
  assert.equal(r.valido, false);
  assert.ok(r.errores.grado);
});

test('rechaza un correo mal formado', () => {
  const r = validarEstudiante({ ...valido, correo: 'ana@' });
  assert.ok(r.errores.correo);
});

test('el correo es opcional', () => {
  const r = validarEstudiante({ ...valido, correo: '' });
  assert.equal(r.valido, true);
  assert.equal(r.valor.correo, null);
});

test('validarGrado: sin valor no filtra, valores inválidos dan NaN', () => {
  assert.equal(validarGrado(undefined), undefined);
  assert.equal(validarGrado('7'), 7);
  assert.ok(Number.isNaN(validarGrado('0')));
  assert.ok(Number.isNaN(validarGrado('abc')));
});
