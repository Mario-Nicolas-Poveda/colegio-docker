const CAMPOS = 'id, documento, nombre, apellido, grado, correo, creado_en AS "creadoEn"';

export function crearRepositorioEstudiantes(pool) {
  return {
    async listar({ grado } = {}) {
      const { rows } = grado
        ? await pool.query(`SELECT ${CAMPOS} FROM estudiantes WHERE grado = $1 ORDER BY apellido, nombre`, [grado])
        : await pool.query(`SELECT ${CAMPOS} FROM estudiantes ORDER BY apellido, nombre`);
      return rows;
    },

    async buscarPorId(id) {
      const { rows } = await pool.query(`SELECT ${CAMPOS} FROM estudiantes WHERE id = $1`, [id]);
      return rows[0] ?? null;
    },

    async buscarPorDocumento(documento) {
      const { rows } = await pool.query(`SELECT ${CAMPOS} FROM estudiantes WHERE documento = $1`, [documento]);
      return rows[0] ?? null;
    },

    async crear({ documento, nombre, apellido, grado, correo }) {
      const { rows } = await pool.query(
        `INSERT INTO estudiantes (documento, nombre, apellido, grado, correo)
         VALUES ($1, $2, $3, $4, $5) RETURNING ${CAMPOS}`,
        [documento, nombre, apellido, grado, correo],
      );
      return rows[0];
    },

    async eliminar(id) {
      const { rowCount } = await pool.query('DELETE FROM estudiantes WHERE id = $1', [id]);
      return rowCount > 0;
    },

    async estadisticas() {
      const { rows } = await pool.query(
        'SELECT grado, COUNT(*)::int AS cantidad FROM estudiantes GROUP BY grado ORDER BY grado',
      );
      return rows;
    },
  };
}
