import { cargarConfig } from './config/config.js';
import { crearPool } from './db/pool.js';
import { crearRepositorioEstudiantes } from './repositorios/estudiantes.repositorio.js';
import { crearServicioEstudiantes } from './servicios/estudiantes.servicio.js';
import { crearApp } from './app.js';

let config;
try {
  config = cargarConfig();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const pool = crearPool(config.db);
const app = crearApp({
  servicioEstudiantes: crearServicioEstudiantes(crearRepositorioEstudiantes(pool)),
  comprobarDb: () => pool.query('SELECT 1'),
  version: config.version,
});

const servidor = app.listen(config.puerto, () => {
  console.log(JSON.stringify({ nivel: 'info', mensaje: `API escuchando en el puerto ${config.puerto}`, version: config.version }));
});

// Apagado ordenado: docker stop envía SIGTERM al PID 1.
function apagar(senal) {
  console.log(JSON.stringify({ nivel: 'info', mensaje: `${senal} recibido, cerrando` }));
  servidor.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 8000).unref();
}

process.on('SIGTERM', () => apagar('SIGTERM'));
process.on('SIGINT', () => apagar('SIGINT'));
