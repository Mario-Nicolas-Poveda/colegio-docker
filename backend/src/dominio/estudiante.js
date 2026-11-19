// Validación como funciones puras: se prueban sin base de datos.
export const GRADO_MIN = 1;
export const GRADO_MAX = 11;

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEstudiante(datos = {}) {
  const errores = {};
  const documento = String(datos.documento ?? '').trim();
  const nombre = String(datos.nombre ?? '').trim();
  const apellido = String(datos.apellido ?? '').trim();
  const correo = datos.correo ? String(datos.correo).trim() : null;
  const grado = Number(datos.grado);

  if (!/^\d{4,20}$/.test(documento)) errores.documento = 'Debe tener entre 4 y 20 dígitos';
  if (nombre.length < 2) errores.nombre = 'Mínimo 2 caracteres';
  if (apellido.length < 2) errores.apellido = 'Mínimo 2 caracteres';
  if (!Number.isInteger(grado) || grado < GRADO_MIN || grado > GRADO_MAX) {
    errores.grado = `Debe ser un entero entre ${GRADO_MIN} y ${GRADO_MAX}`;
  }
  if (correo && !CORREO.test(correo)) errores.correo = 'Correo no válido';

  const valido = Object.keys(errores).length === 0;
  return { valido, errores, valor: valido ? { documento, nombre, apellido, grado, correo } : null };
}

// undefined = sin filtro; NaN = filtro inválido.
export function validarGrado(valor) {
  if (valor === undefined || valor === '') return undefined;
  const grado = Number(valor);
  return Number.isInteger(grado) && grado >= GRADO_MIN && grado <= GRADO_MAX ? grado : NaN;
}
