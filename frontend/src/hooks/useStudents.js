import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

export function useStudents() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ total: 0, porGrado: [] });
  const [grado, setGrado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      const [lista, stats] = await Promise.all([api.listarEstudiantes(grado), api.estadisticas()]);
      setEstudiantes(lista);
      setEstadisticas(stats);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [grado]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crear = async (datos) => {
    await api.crearEstudiante(datos);
    await recargar();
  };

  const eliminar = async (id) => {
    await api.eliminarEstudiante(id);
    await recargar();
  };

  return { estudiantes, estadisticas, grado, setGrado, cargando, error, crear, eliminar };
}
