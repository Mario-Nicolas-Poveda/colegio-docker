export function StatsPanel({ estadisticas }) {
  return (
    <section aria-label="Estadísticas" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-lg border-l-4 border-verde bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Total</p>
        <p className="text-3xl font-semibold text-azul-oscuro">{estadisticas.total}</p>
      </div>
      {estadisticas.porGrado.map(({ grado, cantidad }) => (
        <div key={grado} className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Grado {grado}</p>
          <p className="text-2xl font-semibold">{cantidad}</p>
        </div>
      ))}
    </section>
  );
}
