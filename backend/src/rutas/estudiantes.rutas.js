import { Router } from 'express';

// Express 5 propaga solo los errores de handlers async: no hace falta try/catch.
export function crearRutasEstudiantes(servicio) {
  const router = Router();

  router.get('/', async (req, res) => {
    res.json(await servicio.listar(req.query));
  });

  // Antes de /:id para que "estadisticas" no se tome como un id.
  router.get('/estadisticas', async (_req, res) => {
    res.json(await servicio.estadisticas());
  });

  router.get('/:id', async (req, res) => {
    res.json(await servicio.obtener(req.params.id));
  });

  router.post('/', async (req, res) => {
    const creado = await servicio.crear(req.body);
    res.status(201).location(`/api/estudiantes/${creado.id}`).json(creado);
  });

  router.delete('/:id', async (req, res) => {
    await servicio.eliminar(req.params.id);
    res.status(204).end();
  });

  return router;
}
