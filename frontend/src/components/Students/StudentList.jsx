const GRADOS = Array.from({ length: 11 }, (_, i) => i + 1);

export function StudentList({ estudiantes, grado, onFiltrar, onEliminar, cargando }) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-azul-oscuro">Estudiantes</h2>
        <label className="text-sm">
          Filtrar por grado{' '}
          <select value={grado} onChange={(e) => onFiltrar(e.target.value)} className="rounded border border-slate-300 px-2 py-1">
            <option value="">Todos</option>
            {GRADOS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
      </div>
      {cargando && <p className="text-sm text-slate-500">Cargando…</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr><th className="py-2">Documento</th><th>Apellido</th><th>Nombre</th><th>Grado</th><th>Correo</th><th /></tr>
          </thead>
          <tbody>
            {estudiantes.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="py-2">{e.documento}</td>
                <td>{e.apellido}</td>
                <td>{e.nombre}</td>
                <td>{e.grado}</td>
                <td className="text-slate-500">{e.correo ?? '—'}</td>
                <td className="text-right">
                  <button onClick={() => onEliminar(e.id)} className="text-red-600 hover:underline" aria-label={`Eliminar a ${e.nombre} ${e.apellido}`}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!cargando && estudiantes.length === 0 && (
              <tr><td colSpan={6} className="py-4 text-center text-slate-500">No hay estudiantes</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
