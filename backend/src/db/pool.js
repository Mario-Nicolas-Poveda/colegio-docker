import pg from 'pg';

export function crearPool(configDb) {
  const pool = new pg.Pool({ ...configDb, max: 10, connectionTimeoutMillis: 2000 });
  // Un error en una conexión inactiva no debe tumbar el proceso.
  pool.on('error', (err) => {
    console.error(JSON.stringify({ nivel: 'error', mensaje: 'pool', detalle: err.message }));
  });
  return pool;
}
