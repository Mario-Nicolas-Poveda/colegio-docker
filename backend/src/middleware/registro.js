// Una línea JSON por petición en stdout: Docker recoge los logs sin configuración extra.
export function registro(req, res, next) {
  const inicio = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
    console.log(JSON.stringify({
      fecha: new Date().toISOString(),
      metodo: req.method,
      ruta: req.originalUrl,
      estado: res.statusCode,
      ms: Math.round(ms * 10) / 10,
    }));
  });
  next();
}
