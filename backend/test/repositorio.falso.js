// Doble de prueba: misma interfaz que el repositorio real, datos en memoria.
export function crearRepositorioFalso(iniciales = []) {
  let datos = iniciales.map((e, i) => ({ id: i + 1, ...e }));
  let siguienteId = datos.length + 1;
  return {
    async listar({ grado } = {}) {
      return datos.filter((e) => !grado || e.grado === grado).sort((a, b) => a.apellido.localeCompare(b.apellido));
    },
    async buscarPorId(id) {
      return datos.find((e) => e.id === id) ?? null;
    },
    async buscarPorDocumento(documento) {
      return datos.find((e) => e.documento === documento) ?? null;
    },
    async crear(estudiante) {
      const nuevo = { id: siguienteId++, ...estudiante };
      datos.push(nuevo);
      return nuevo;
    },
    async eliminar(id) {
      const antes = datos.length;
      datos = datos.filter((e) => e.id !== id);
      return datos.length < antes;
    },
    async estadisticas() {
      const conteo = {};
      for (const e of datos) conteo[e.grado] = (conteo[e.grado] ?? 0) + 1;
      return Object.entries(conteo).map(([grado, cantidad]) => ({ grado: Number(grado), cantidad }));
    },
  };
}

export const ESTUDIANTES = [
  { documento: '1001', nombre: 'Ana', apellido: 'Martínez', grado: 5, correo: null },
  { documento: '1002', nombre: 'Carlos', apellido: 'Gómez', grado: 5, correo: null },
  { documento: '1003', nombre: 'Lucía', apellido: 'Rodríguez', grado: 7, correo: null },
];
