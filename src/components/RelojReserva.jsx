import { useState, useEffect } from 'react';

export default function RelojReserva({ reserva, onExtenderExitoso, BACKEND_URL }) {
  const [tiempo, setTiempo] = useState({
    minutos: 0,
    segundos: 0,
    expirado: false,
    textoExceso: '',
    porcentaje: 100
  });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!reserva || !reserva.horaFinEsperada) return;

    const interval = setInterval(() => {
      const ahora = new Date().getTime();
      const entrada = new Date(reserva.horaEntrada).getTime();
      const fin = new Date(reserva.horaFinEsperada).getTime();

      const totalMs = fin - entrada;
      const restanteMs = fin - ahora;

      if (restanteMs <= 0) {
        // Modo multa / Exceso activado
        const excesoMs = Math.abs(restanteMs);
        const totalMinutosExceso = Math.floor(excesoMs / (1000 * 60));
        const horas = Math.floor(totalMinutosExceso / 60);
        const minutos = totalMinutosExceso % 60;

        setTiempo({
          expirado: true,
          textoExceso: horas === 0 ? `${minutos} min` : `${horas}h y ${minutos}m`,
          porcentaje: 0
        });
      } else {
        // Modo regular / Cuenta regresiva
        const minutos = Math.floor(restanteMs / (1000 * 60));
        const segundos = Math.floor((restanteMs % (1000 * 60)) / 1000);
        const porcentaje = Math.max(0, Math.min(100, (restanteMs / totalMs) * 100));

        setTiempo({
          expirado: false,
          minutos,
          segundos,
          porcentaje
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reserva]);

  const handleCargarMasTiempo = async (horasAAnadir) => {
    setCargando(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/reservas/${reserva.id}/extender?horas=${horasAAnadir}`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error("Error al extender el tiempo de estadía");
      
      const reservaActualizada = await response.json();
      if (onExtenderExitoso) onExtenderExitoso(reservaActualizada);
    } catch (error) {
      alert(error.message);
    } finally {
      setCargando(false);
    }
  };

  if (!reserva) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4 text-white animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${tiempo.expirado ? 'bg-rose-500 animate-[pulse_1.5s_infinite]' : 'bg-sky-400 animate-pulse'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Control de Estancia</span>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider border ${
          tiempo.expirado 
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
            : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
        }`}>
          {tiempo.expirado ? '⚠️ Tiempo Excedido' : '⏱️ En Curso'}
        </span>
      </div>

      {/* Reloj Numérico */}
      <div className="text-center py-1">
        {tiempo.expirado ? (
          <div>
            <p className="text-3xl font-black text-rose-500 tracking-tight">+{tiempo.textoExceso}</p>
            <p className="text-[11px] font-bold text-rose-400/80 mt-0.5">Acumulando recargo en la multa</p>
          </div>
        ) : (
          <div>
            <p className="text-4xl font-mono font-black text-sky-400 tracking-widest">
              {String(tiempo.minutos).padStart(2, '0')}:{String(tiempo.segundos).padStart(2, '0')}
            </p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Tiempo disponible restante</p>
          </div>
        )}
      </div>

      {/* Barra de Progreso Glassmorphism */}
      <div className="w-full bg-slate-800/60 rounded-full h-2.5 overflow-hidden p-[2px] border border-slate-700/50">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${tiempo.expirado ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]' : 'bg-gradient-to-r from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.6)]'}`}
          style={{ width: `${tiempo.porcentaje}%` }}
        ></div>
      </div>

      {/* Panel de Extensión Dinámica */}
      <div className="pt-3 border-t border-slate-800/80">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">¿Necesitás cargar más tiempo?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={cargando}
            onClick={() => handleCargarMasTiempo(1)}
            className="bg-slate-800 hover:bg-sky-600 disabled:opacity-40 text-white font-black py-2.5 rounded-xl text-xs transition-all duration-300 shadow-md active:scale-95 cursor-pointer border border-slate-700/50 hover:border-sky-400"
          >
            +1 Hora
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={() => handleCargarMasTiempo(2)}
            className="bg-slate-800 hover:bg-sky-600 disabled:opacity-40 text-white font-black py-2.5 rounded-xl text-xs transition-all duration-300 shadow-md active:scale-95 cursor-pointer border border-slate-700/50 hover:border-sky-400"
          >
            +2 Horas
          </button>
        </div>
      </div>
    </div>
  );
}