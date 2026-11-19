import { readFileSync } from 'node:fs';

// Lee NOMBRE o, si existe, el archivo indicado en NOMBRE_FILE (secretos de Docker).
export function leerVariable(nombre, env = process.env) {
  const archivo = env[`${nombre}_FILE`];
  if (archivo) return readFileSync(archivo, 'utf8').trim();
  return env[nombre];
}

export function cargarConfig(env = process.env) {
  const obligatorias = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const faltantes = obligatorias.filter((nombre) => !leerVariable(nombre, env));
  if (faltantes.length) {
    throw new Error(`Faltan variables de entorno obligatorias: ${faltantes.join(', ')} (o su versión _FILE)`);
  }
  return {
    puerto: Number(env.PORT ?? 3000),
    version: env.APP_VERSION ?? 'dev',
    db: {
      host: env.DB_HOST ?? 'localhost',
      port: Number(env.DB_PORT ?? 5432),
      database: leerVariable('DB_NAME', env),
      user: leerVariable('DB_USER', env),
      password: leerVariable('DB_PASSWORD', env),
    },
  };
}
