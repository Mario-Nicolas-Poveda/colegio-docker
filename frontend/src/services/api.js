// Rutas relativas: en producción Nginx reenvía /api a la API; en desarrollo lo hace Vite.
async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(`/api${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  if (respuesta.status === 204) return null;
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(cuerpo.error ?? `Error ${respuesta.status}`);
    error.detalles = cuerpo.detalles;
    error.estado = respuesta.status;
    throw error;
  }
  return cuerpo;
}

export const api = {
  salud: () => pedir('/salud'),
  listarEstudiantes: (grado) => pedir(`/estudiantes${grado ? `?grado=${grado}` : ''}`),
  estadisticas: () => pedir('/estudiantes/estadisticas'),
  crearEstudiante: (datos) => pedir('/estudiantes', { method: 'POST', body: JSON.stringify(datos) }),
  eliminarEstudiante: (id) => pedir(`/estudiantes/${id}`, { method: 'DELETE' }),
};
