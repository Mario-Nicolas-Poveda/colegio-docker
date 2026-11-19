const VERSION_WEB = import.meta.env.VITE_APP_VERSION ?? 'dev';

export function Footer({ salud }) {
  const ok = salud?.estado === 'ok';
  return (
    <footer className="mt-8 border-t border-slate-200 py-4 text-center text-xs text-slate-500">
      Frontend v{VERSION_WEB} ·{' '}
      <span className={ok ? 'text-verde-oscuro' : 'text-red-600'}>
        {salud ? `API: ${salud.estado}${salud.version ? ` (v${salud.version})` : ''} - base de datos ${salud.baseDeDatos}` : 'API: consultando…'}
      </span>
    </footer>
  );
}
