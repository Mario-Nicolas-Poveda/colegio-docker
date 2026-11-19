import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearServicioEstudiantes } from '../src/servicios/estudiantes.servicio.js';
import { crearRepositorioFalso, ESTUDIANTES } from './repositorio.falso.js';

const nuevoServicio = () => crearServicioEstudiantes(crearRepositorioFalso(ESTUDIANTES));

test('servicio: lista ordenada por apellido', async () => {
  const lista = await nuevoServicio().listar();
  assert.deepEqual(lista.map((e) => e.apellido), ['Gómez', 'Martínez', 'Rodríguez']);
});

test('servicio: filtra por grado', async () => {
  const lista = await nuevoServicio().listar({ grado: '7' });
  assert.equal(lista.length, 1);
  assert.equal(lista[0].nombre, 'Lucía');
});

test('servicio: grado de filtro inválido da 422', async () => {
  await assert.rejects(nuevoServicio().listar({ grado: '99' }), { estado: 422 });
});

test('servicio: crear rechaza documento duplicado con 409', async () => {
  const datos = { documento: '1001', nombre: 'Otra', apellido: 'Persona', grado: 3 };
  await assert.rejects(nuevoServicio().crear(datos), { estado: 409 });
});

test('servicio: crear rechaza datos inválidos con 422 y detalles', async () => {
  await assert.rejects(nuevoServicio().crear({ documento: 'x' }), (err) => {
    assert.equal(err.estado, 422);
    assert.ok(err.detalles.documento);
    return true;
  });
});

test('servicio: estadísticas con total y conteo por grado', async () => {
  const { total, porGrado } = await nuevoServicio().estadisticas();
  assert.equal(total, 3);
  assert.deepEqual(porGrado.find((g) => g.grado === 5), { grado: 5, cantidad: 2 });
});
