import { useState } from 'react';

const VACIO = { documento: '', nombre: '', apellido: '', grado: '', correo: '' };
const CAMPOS = [
  { nombre: 'documento', etiqueta: 'Documento', tipo: 'text' },
  { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'text' },
  { nombre: 'apellido', etiqueta: 'Apellido', tipo: 'text' },
  { nombre: 'grado', etiqueta: 'Grado (1-11)', tipo: 'number' },
  { nombre: 'correo', etiqueta: 'Correo (opcional)', tipo: 'email' },
];

export function StudentForm({ onCrear }) {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);

  const enviar = async (evento) => {
    evento.preventDefault();
    try {
      await onCrear({ ...datos, grado: Number(datos.grado) });
      setDatos(VACIO);
      setErrores({});
      setMensaje(null);
    } catch (err) {
      setErrores(err.detalles ?? {});
      setMensaje(err.message);
    }
  };

  return (
    <form onSubmit={enviar} className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-azul-oscuro">Registrar estudiante</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {CAMPOS.map(({ nombre, etiqueta, tipo }) => (
          <label key={nombre} className="text-sm">
            {etiqueta}
            <input
              type={tipo}
              name={nombre}
              value={datos[nombre]}
              onChange={(e) => setDatos({ ...datos, [nombre]: e.target.value })}
              aria-invalid={Boolean(errores[nombre])}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 aria-[invalid=true]:border-red-500"
            />
            {errores[nombre] && <span className="text-xs text-red-600">{errores[nombre]}</span>}
          </label>
        ))}
      </div>
      {mensaje && <p role="alert" className="mt-3 text-sm text-red-600">{mensaje}</p>}
      <button type="submit" className="mt-4 rounded bg-verde px-4 py-2 font-medium text-white hover:bg-verde-oscuro">
        Registrar
      </button>
    </form>
  );
}
