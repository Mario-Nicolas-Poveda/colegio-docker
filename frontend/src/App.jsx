import { Header, StatsPanel, StudentForm, StudentList, Footer } from './components';
import { useStudents } from './hooks/useStudents.js';
import { useHealth } from './hooks/useHealth.js';

export default function App() {
  const { estudiantes, estadisticas, grado, setGrado, cargando, error, crear, eliminar } = useStudents();
  const salud = useHealth();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">No se pudo cargar: {error}</p>}
        <StatsPanel estadisticas={estadisticas} />
        <StudentForm onCrear={crear} />
        <StudentList estudiantes={estudiantes} grado={grado} onFiltrar={setGrado} onEliminar={eliminar} cargando={cargando} />
        <Footer salud={salud} />
      </main>
    </>
  );
}
