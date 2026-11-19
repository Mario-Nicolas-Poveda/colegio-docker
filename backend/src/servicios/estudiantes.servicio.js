import { validarEstudiante, validarGrado } from '../dominio/estudiante.js';
import { HttpError } from '../errores/HttpError.js';

function validarId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, 'Estudiante no encontrado');
  return id;
}

export function crearServicioEstudiantes(repositorio) {
  return {
    async listar(filtros = {}) {
      const grado = validarGrado(filtros.grado);
      if (Number.isNaN(grado)) throw new HttpError(422, 'Grado no válido');
      return repositorio.listar({ grado });
    },

    async obtener(idTexto) {
      const estudiante = await repositorio.buscarPorId(validarId(idTexto));
      if (!estudiante) throw new HttpError(404, 'Estudiante no encontrado');
      return estudiante;
    },

    async crear(datos) {
      const { valido, errores, valor } = validarEstudiante(datos);
      if (!valido) throw new HttpError(422, 'Datos no válidos', errores);
      if (await repositorio.buscarPorDocumento(valor.documento)) {
        throw new HttpError(409, `Ya existe un estudiante con documento ${valor.documento}`);
      }
      return repositorio.crear(valor);
    },

    async eliminar(idTexto) {
      const eliminado = await repositorio.eliminar(validarId(idTexto));
      if (!eliminado) throw new HttpError(404, 'Estudiante no encontrado');
    },

    async estadisticas() {
      const porGrado = await repositorio.estadisticas();
      const total = porGrado.reduce((suma, g) => suma + g.cantidad, 0);
      return { total, porGrado };
    },
  };
}
