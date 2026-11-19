import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

// Consulta /api/salud cada 15 s para mostrar el estado en el pie de página.
export function useHealth() {
  const [salud, setSalud] = useState(null);

  useEffect(() => {
    let activo = true;
    const consultar = () =>
      api.salud()
        .then((s) => activo && setSalud(s))
        .catch(() => activo && setSalud({ estado: 'error', baseDeDatos: 'sin respuesta' }));
    consultar();
    const intervalo = setInterval(consultar, 15000);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  return salud;
}
