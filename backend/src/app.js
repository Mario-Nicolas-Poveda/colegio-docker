import express from 'express';
import { registro } from './middleware/registro.js';
import { crearRutasEstudiantes } from './rutas/estudiantes.rutas.js';
import { HttpError } from './errores/HttpError.js';

// Recibe sus dependencias: las pruebas pasan un servicio falso, sin base de datos.
export function crearApp({ servicioEstudiantes, comprobarDb, version = 'dev', silencioso = false }) {
  const app = express();
  app.disable('x-powered-by');
  if (!silencioso) app.use(registro);
  app.use(express.json());

  app.get('/api/salud', async (_req, res) => {
    try {
      await comprobarDb();
      res.json({ estado: 'ok', baseDeDatos: 'conectada', version });
    } catch {
      res.status(503).json({ estado: 'error', baseDeDatos: 'desconectada', version });
    }
  });

  app.use('/api/estudiantes', crearRutasEstudiantes(servicioEstudiantes));

  app.use((_req, _res, next) => next(new HttpError(404, 'Ruta no encontrada')));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'JSON mal formado' });
    }
    const estado = err instanceof HttpError ? err.estado : 500;
    if (estado === 500) console.error(JSON.stringify({ nivel: 'error', mensaje: err.message }));
    res.status(estado).json({
      error: estado === 500 ? 'Error interno' : err.message,
      ...(err.detalles && { detalles: err.detalles }),
    });
  });

  return app;
}
