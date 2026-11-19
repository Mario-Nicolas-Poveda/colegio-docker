import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { crearApp } from '../src/app.js';
import { crearServicioEstudiantes } from '../src/servicios/estudiantes.servicio.js';
import { crearRepositorioFalso, ESTUDIANTES } from './repositorio.falso.js';

let servidor;
let base;
let dbArriba = true;

before(async () => {
  const app = crearApp({
    servicioEstudiantes: crearServicioEstudiantes(crearRepositorioFalso(ESTUDIANTES)),
    comprobarDb: async () => { if (!dbArriba) throw new Error('sin db'); },
    version: 'prueba',
    silencioso: true,
  });
  await new Promise((ok) => { servidor = app.listen(0, ok); });
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(() => servidor.close());

const enviar = (ruta, cuerpo) => fetch(base + ruta, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo),
});

test('GET /api/salud responde 200 con la base de datos arriba', async () => {
  const r = await fetch(`${base}/api/salud`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { estado: 'ok', baseDeDatos: 'conectada', version: 'prueba' });
});

test('GET /api/salud responde 503 sin base de datos', async () => {
  dbArriba = false;
  const r = await fetch(`${base}/api/salud`);
  dbArriba = true;
  assert.equal(r.status, 503);
});

test('POST /api/estudiantes responde 201 con cabecera Location', async () => {
  const r = await enviar('/api/estudiantes', { documento: '2001', nombre: 'Mateo', apellido: 'Pérez', grado: 7 });
  assert.equal(r.status, 201);
  const creado = await r.json();
  assert.equal(r.headers.get('location'), `/api/estudiantes/${creado.id}`);
});

test('GET /api/estudiantes/:id inexistente responde 404', async () => {
  const r = await fetch(`${base}/api/estudiantes/9999`);
  assert.equal(r.status, 404);
});

test('DELETE /api/estudiantes/:id responde 204 y luego 404', async () => {
  assert.equal((await fetch(`${base}/api/estudiantes/1`, { method: 'DELETE' })).status, 204);
  assert.equal((await fetch(`${base}/api/estudiantes/1`, { method: 'DELETE' })).status, 404);
});
