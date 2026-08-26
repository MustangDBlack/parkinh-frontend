import React, { useState, useMemo, useRef, useEffect } from 'react';

// --- SUBCOMPONENTE 1: PANEL DE DISPONIBILIDAD INMEDIATA ---
const PanelDisponibilidad = ({ cocheras, reservas, usuario, miCochera, miPatente }) => {
  const [minimizado, setMinimizado] = useState(true);

  const libres = cocheras.filter(c => !c.ocupado);
  
  const ocupadosConDetalle = cocheras.filter(c => c.ocupado).map(c => {
    let patente = 'Ocupado';
    if (usuario?.rol === 'ADMIN' || usuario?.rol === 'GUARDIA') {
      const res = [...reservas].sort((a, b) => b.id - a.id).find(r => r.cochera?.codigo === c.codigo && !r.horaSalida);
      if (res) patente = res.patente;
    } else if (usuario?.rol === 'USER' && c.codigo === miCochera) {
      patente = miPatente || 'Tu Patente';
    }
    return { codigo: c.codigo, patente };
  });

  return (
    <div className="w-full transition-all duration-500 animate-[fadeIn_0.4s_ease-out]">
      {minimizado ? (
        <div className="w-full">
          <button
            onClick={() => setMinimizado(false)}
            className="w-full group flex items-center justify-between px-6 py-4 bg-white/95 hover:bg-white text-blue-900 rounded-2xl text-xs sm:text-sm font-black tracking-wider uppercase shadow-[0_10px_30px_rgba(56,189,248,0.15)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer border border-sky-200"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ver Disponibilidad Inmediata ({libres.length} libres)</span>
            </div>
            <svg className="w-4 h-4 text-blue-600 transform group-hover:translate-y-0.5 transition-transform animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="w-full bg-white/95 backdrop-blur-2xl border border-sky-200 rounded-2xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(56,189,248,0.12)] relative overflow-hidden text-slate-800 space-y-4">
          
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 via-blue-500 to-sky-300"></div>
          
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-900">Resumen Rápido de Espacios</span>
            </div>
            <button 
              onClick={() => setMinimizado(true)}
              className="text-slate-500 hover:text-blue-900 bg-sky-50 hover:bg-sky-100 px-3.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-sky-200 cursor-pointer"
            >
              <span>Ocultar</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 space-y-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Espacios Libres ({libres.length})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-thin p-0.5">
                {libres.length > 0 ? (
                  libres.map(c => (
                    <span key={c.codigo} className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-black text-emerald-800 shadow-sm">
                      #{c.codigo}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No hay espacios libres</span>
                )}
              </div>
            </div>

            <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3.5 space-y-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Espacios Ocupados ({ocupadosConDetalle.length})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-thin p-0.5">
                {ocupadosConDetalle.length > 0 ? (
                  ocupadosConDetalle.map(o => (
                    <span key={o.codigo} className="px-2.5 py-1 bg-white border border-rose-300 rounded-lg text-xs font-bold text-rose-900 shadow-sm flex items-center gap-1.5">
                      <span className="font-black">#{o.codigo}</span>
                      <span className="text-[10px] opacity-75 uppercase">({o.patente})</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Todo libre</span>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};


// --- SUBCOMPONENTE 2: BANNER DEL RELOJ ACTIVO ---
const MiniReloj = ({ reserva, onExtender }) => {
  const [tiempo, setTiempo] = useState({
    horas: 0,
    minutos: 0,
    segundos: 0,
    expirado: false,
    textoExceso: '',
    porcentaje: 100
  });

  const [minimizado, setMinimizado] = useState(false);

  useEffect(() => {
    if (!reserva || !reserva.horaFinEsperada) return;

    const interval = setInterval(() => {
      const ahora = new Date().getTime();
      const entrada = new Date(reserva.horaEntrada).getTime();
      const fin = new Date(reserva.horaFinEsperada).getTime();

      const totalMs = fin - entrada;
      const restanteMs = fin - ahora;

      if (restanteMs <= 0) {
        const excesoMs = Math.abs(restanteMs);
        const totalSegundos = Math.floor(excesoMs / 1000);
        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;

        setTiempo({
          expirado: true,
          textoExceso: `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`,
          porcentaje: 0
        });
      } else {
        const totalSegundos = Math.floor(restanteMs / 1000);
        const horas = Math.floor(totalSegundos / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = totalSegundos % 60;
        const porcentaje = Math.max(0, Math.min(100, (restanteMs / totalMs) * 100));

        setTiempo({
          expirado: false,
          horas,
          minutos,
          segundos,
          porcentaje
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reserva]);

  return (
    <div className="w-full transition-all duration-500 animate-[fadeIn_0.4s_ease-out]">
      {minimizado ? (
        <div className="w-full">
          <button
            onClick={() => setMinimizado(false)}
            className="w-full group flex items-center justify-between px-6 py-4 bg-white/95 hover:bg-white text-blue-900 rounded-2xl text-xs sm:text-sm font-black tracking-wider uppercase shadow-[0_10px_30px_rgba(56,189,248,0.15)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] cursor-pointer border border-sky-200"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-sky-500 animate-pulse"></span>
              <span>Mostrar Reloj Activo (#{reserva.cochera?.codigo})</span>
            </div>
            <svg className="w-4 h-4 text-blue-600 transform group-hover:translate-y-0.5 transition-transform animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="w-full bg-white/95 backdrop-blur-2xl border border-sky-200 rounded-2xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(56,189,248,0.12)] relative overflow-hidden text-slate-800 space-y-4">
          
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400"></div>

          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-inner border ${tiempo.expirado ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-sky-100 border-sky-200 text-blue-700'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-black text-blue-900 uppercase tracking-widest leading-none">
                Tu Lugar Activo: <span className="text-blue-700 font-black">#{reserva.cochera?.codigo}</span>
              </p>
            </div>

            <button 
              onClick={() => setMinimizado(true)}
              className="text-slate-600 hover:text-blue-900 bg-sky-50 hover:bg-sky-100 px-3.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-sky-200 cursor-pointer"
            >
              <span>Ocultar</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            <div className="lg:col-span-4 bg-sky-50/60 border border-sky-200/80 p-4 rounded-xl">
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block mb-1">Tiempo Restante</span>
              {tiempo.expirado ? (
                <p className="text-lg font-black text-rose-600 tracking-tight animate-pulse">
                  ⚠️ Vencido: +{tiempo.textoExceso}
                </p>
              ) : (
                <p className="text-3xl font-mono font-black text-blue-950 tracking-wider">
                  {String(tiempo.horas).padStart(2, '0')}:{String(tiempo.minutos).padStart(2, '0')}:{String(tiempo.segundos).padStart(2, '0')}
                </p>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-2.5 px-1">
              <div className="flex justify-between items-center text-xs font-black text-blue-900 uppercase tracking-wider">
                <span>Progreso</span>
                <span className={tiempo.expirado ? 'text-rose-600' : 'text-blue-700'}>
                  {tiempo.expirado ? 'Multa en Proceso' : `${Math.round(tiempo.porcentaje)}%`}
                </span>
              </div>
              <div className="w-full bg-sky-100 rounded-full h-3 overflow-hidden border border-sky-200 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${tiempo.expirado ? 'bg-rose-500' : 'bg-gradient-to-r from-sky-400 to-blue-600'}`}
                  style={{ width: `${tiempo.porcentaje}%` }}
                ></div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-900">Extender Estadía:</span>
              <div className="grid grid-cols-4 gap-2 w-full">
                {[1, 2, 3, 4].map((h) => (
                  <button
                    key={h}
                    onClick={() => onExtender(reserva.id, h)}
                    className="py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black rounded-xl text-xs transition-all duration-300 active:scale-95 shadow-sm shadow-sky-500/20 hover:shadow cursor-pointer text-center border border-sky-300/40"
                  >
                    +{h}H
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};


// --- COMPONENTE PRINCIPAL MAPA ---
export default function Mapa({ 
  usuario, cocheras, nuevoCodigo, setNuevoCodigo, 
  agregarCochera, manejarClicCochera, eliminarCochera, 
  reservas = [], miCochera, miPatente,
  reservaActivaUsuario, 
  onExtenderTiempo      
}) {
  
  const [busquedaPatente, setBusquedaPatente] = useState('');
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const reservaEncontrada = useMemo(() => {
    if (busquedaPatente.length < 2) return null;
    return [...reservas]
      .sort((a, b) => b.id - a.id)
      .find(r => r.patente?.toLowerCase().includes(busquedaPatente.toLowerCase()) && !r.horaSalida);
  }, [busquedaPatente, reservas]);

  const cocheraResaltada = reservaEncontrada ? reservaEncontrada.cochera?.codigo : null;
  const lugaresLibres = cocheras.filter(c => !c.ocupado).length;
  const lugaresOcupados = cocheras.filter(c => c.ocupado).length;
  const porcentajeOcupacion = cocheras.length > 0 ? Math.round((lugaresOcupados / cocheras.length) * 100) : 0;

  const handleMouseDown = (e) => { setIsDragging(true); setStartX(e.pageX - scrollRef.current.offsetLeft); setScrollLeft(scrollRef.current.scrollLeft); };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseMove = (e) => { if (!isDragging) return; e.preventDefault(); const x = e.pageX - scrollRef.current.offsetLeft; const walk = (x - startX) * 1.5; scrollRef.current.scrollLeft = scrollLeft - walk; };
  const handleTouchStart = (e) => { setIsDragging(true); setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft); setScrollLeft(scrollRef.current.scrollLeft); };
  const handleTouchMove = (e) => { if (!isDragging) return; const x = e.touches[0].pageX - scrollRef.current.offsetLeft; const walk = (x - startX) * 1.5; scrollRef.current.scrollLeft = scrollLeft - walk; };

  const intentarManejarClic = (lugar) => {
    if (isDragging) return;
    manejarClicCochera(lugar);
  };

  return (
    <div className="print:hidden space-y-4 sm:space-y-6 fade-in pb-3 bg-gradient-to-br from-sky-50/50 via-white to-blue-50/40 px-2 sm:px-6 pt-2 rounded-3xl w-full">
      
      {/* Panel Superior (Admin/Guardia) */}
      {(usuario?.rol === 'ADMIN' || usuario?.rol === 'GUARDIA') && (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(56,189,248,0.08)] border border-sky-100 p-4 sm:p-6 w-full">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base sm:text-lg">Estacionamiento PARKINH</h3>
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Instituto de Educación Superior "Nuevo Horizonte" (IESNH)</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    {lugaresLibres} Libres
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold uppercase">
                    <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                    {lugaresOcupados} Ocupados
                  </span>
                  <span className="text-xs text-slate-400 font-bold hidden sm:inline">{porcentajeOcupacion}% ocupado</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  <svg className={`w-4 h-4 transition-colors duration-300 ${busquedaPatente.length >= 2 ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input className="w-full pl-10 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 uppercase transition-all shadow-sm placeholder:normal-case placeholder:font-medium hover:border-slate-300" 
                  type="text" placeholder="Buscar patente..." value={busquedaPatente} onChange={(e) => setBusquedaPatente(e.target.value)} />
                {busquedaPatente.length >= 2 && (
                  <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${reservaEncontrada ? 'text-emerald-500' : 'text-rose-400'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {reservaEncontrada ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    </svg>
                  </span>
                )}
              </div>
            </div>
          </div>
          {usuario?.rol === 'ADMIN' && (
            <form onSubmit={agregarCochera} className="flex items-center gap-3 p-3 bg-sky-50/60 rounded-xl border border-dashed border-sky-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nuevo Espacio:</span>
              <input className="w-24 py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs font-black focus:outline-none focus:ring-2 focus:ring-sky-500/30 uppercase text-center shadow-sm" type="text" placeholder="A2" value={nuevoCodigo} onChange={(e) => setNuevoCodigo(e.target.value)} maxLength="3" />
              <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-lg font-bold text-xs hover:from-blue-700 hover:to-sky-600 transition-all shadow-md shadow-sky-500/20 active:scale-95 cursor-pointer" type="submit">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                <span>Añadir</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* 🚀 VISTA DE LOS LUGARES (MAPA) */}
      <div className="space-y-2 w-full">
        
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-lg border border-sky-100 shadow-2xs shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="font-black text-[10px] text-slate-700 uppercase tracking-tight">Libre</span>
            </div>
            <div className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-lg border border-sky-100 shadow-2xs shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <span className="font-black text-[10px] text-slate-700 uppercase tracking-tight">Ocupado</span>
            </div>
            {usuario?.rol === 'USER' && miCochera && (
              <div className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-lg border border-sky-100 shadow-2xs shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <span className="font-black text-[10px] text-slate-700 uppercase tracking-tight">Tu Lugar</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full bg-sky-100/90 border border-sky-300 rounded-xl py-1 px-3 flex items-center justify-center gap-2 shadow-2xs">
          <div className="relative w-5 overflow-hidden flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-blue-700 animate-swipe" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.5 7.5c0-.83-.67-1.5-1.5-1.5h-5.03l.66-3.18.02-.23c0-.38-.15-.74-.42-1.01L11.16 1 4.58 7.59c-.37.37-.58.88-.58 1.41V19c0 1.1.9 2 2 2h9.27c.81 0 1.54-.48 1.87-1.22l2.35-5.5c.14-.33.21-.7.21-1.07V8.5c0-.55-.45-1-1-1zM6 19v-9.59l4.59-4.59.81 3.79-.89.89V10h1.41l3.39 7.91L6 19z"/>
            </svg>
          </div>
          <span className="font-black text-[9px] sm:text-[10px] uppercase tracking-wider text-blue-900 text-center">
            Deslizá para recorrer los lugares
          </span>
        </div>

        <div className="relative bg-gradient-to-br from-white via-sky-50/70 to-blue-50/50 rounded-2xl shadow-[0_10px_30px_rgba(56,189,248,0.1)] border border-sky-200 overflow-hidden w-full">
          
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-96 h-96 bg-sky-200 rounded-full filter blur-[100px] animate-[pulse_8s_infinite]"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200 rounded-full filter blur-[100px] animate-[pulse_10s_infinite]" style={{animationDelay: '-4s'}}></div>
          </div>

          <div className="relative h-8 sm:h-9 bg-gradient-to-b from-sky-100/90 to-blue-100/70 backdrop-blur-md flex items-center justify-center border-b border-sky-200 shadow-inner w-full px-2">
            <span className="text-[9px] sm:text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-center truncate">
              Límite del Predio · IES Nuevo Horizonte
            </span>
          </div>

          <div className="relative p-2.5 sm:p-4 w-full">
            <div 
              ref={scrollRef}
              className="overflow-x-auto overflow-y-hidden pb-1 cursor-grab active:cursor-grabbing scrollbar-thin w-full"
              onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart} onTouchEnd={handleMouseUp} onTouchMove={handleTouchMove}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex gap-3 sm:gap-4 items-center" style={{ minWidth: `${(cocheras.length * 115) + 180}px` }}>
                
                <div className="flex-shrink-0 w-20 sm:w-24 flex flex-col items-center justify-center gap-1">
                  <div className="w-full h-9 sm:h-11 bg-gradient-to-r from-blue-100 to-sky-100 rounded-xl flex items-center justify-center shadow-sm border border-sky-200 relative overflow-hidden backdrop-blur-sm">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-800 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
                    </svg>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-blue-900 uppercase tracking-widest text-center">Salida</span>
                </div>

                {cocheras.map((lugar, index) => {
                  let patenteAMostrar = null;
                  if (usuario?.rol === 'ADMIN' || usuario?.rol === 'GUARDIA') {
                    if (lugar.ocupado) {
                      const reservaActiva = [...reservas].sort((a, b) => b.id - a.id).find(r => r.cochera?.codigo === lugar.codigo && !r.horaSalida);
                      if (reservaActiva) patenteAMostrar = reservaActiva.patente;
                    }
                  } else if (usuario?.rol === 'USER') {
                    if (lugar.codigo === miCochera && miPatente) patenteAMostrar = miPatente;
                  }

                  const esElBuscado = lugar.codigo === cocheraResaltada;
                  const esMiLugar = lugar.codigo === miCochera;

                  let colorFondo = '', bordeColor = '', textoEstado = '';
                  if (esMiLugar) { colorFondo = 'spot-tu-lugar'; bordeColor = 'border-2 border-blue-400'; textoEstado = 'Tu Lugar'; }
                  else if (lugar.ocupado) { colorFondo = 'spot-ocupado'; bordeColor = 'border-2 border-rose-400/70'; textoEstado = 'Ocupado'; }
                  else { colorFondo = 'spot-libre'; bordeColor = 'border-2 border-emerald-400/70'; textoEstado = 'Libre'; }

                  return (
                    <div 
                      key={lugar.codigo} 
                      className={`spot-card group relative flex-shrink-0 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 rounded-2xl ${colorFondo} ${bordeColor} ${esElBuscado ? 'spot-encontrado ring-4 ring-yellow-400/80 z-10 scale-105' : 'hover:-translate-y-2 hover:scale-105 hover:z-10'} animate-spot shadow-lg`}
                      style={{ animationDelay: `${index * 0.03}s`, width: '100px', height: '135px' }}
                      onClick={() => intentarManejarClic(lugar)}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent opacity-60 pointer-events-none"></div>
                      
                      <div className="absolute inset-1.5 border-2 border-dashed border-white/30 rounded-xl pointer-events-none"></div>
                      <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-white/20"></div>
                      <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-white/20"></div>

                      {usuario?.rol === 'ADMIN' && !lugar.ocupado && (
                        <button onClick={(e) => { e.stopPropagation(); eliminarCochera(lugar.codigo); }}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 z-20">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      )}

                      {esElBuscado && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 px-3 py-0.5 rounded-full text-[10px] font-black shadow-[0_0_12px_rgba(250,204,21,0.6)] animate-bounce z-30 whitespace-nowrap">Encontrado</div>
                      )}

                      <div className="relative z-10 flex flex-col items-center justify-center w-full gap-1.5 p-1">
                        <span className={`font-black text-white leading-none drop-shadow-md ${patenteAMostrar ? 'text-lg sm:text-2xl' : 'text-3xl sm:text-4xl'}`}>{lugar.codigo}</span>
                        
                        {patenteAMostrar ? (
                          <div className="plate-realista w-full">
                            <div className="plate-header-mini"><span className="text-[6px] text-white font-black tracking-[0.15em] uppercase">ARG</span></div>
                            <div className="flex-1 flex items-center justify-center py-1 px-1"><span className="text-[10px] sm:text-xs font-black text-slate-800 tracking-[0.1em] uppercase leading-tight text-center">{patenteAMostrar}</span></div>
                            <div className="plate-footer-mini"><span className="text-[5px] text-slate-400 font-bold uppercase">Rep. Argentina</span></div>
                          </div>
                        ) : (
                          <span className={`text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg ${
                            esMiLugar ? 'bg-white/35 text-white border border-white/50' : 
                            lugar.ocupado ? 'bg-white/20 text-white border border-white/30' : 
                            'bg-white/30 text-white border border-white/50'
                          }`}>
                            <span className="flex items-center gap-1">
                              {esMiLugar && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>}
                              {textoEstado}
                            </span>
                          </span>
                        )}
                      </div>

                      {!patenteAMostrar && lugar.ocupado && (
                        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-white/90 animate-pulse shadow-sm"></div>
                      )}

                      <div className="absolute -bottom-0.5 left-3 right-3 h-1.5 bg-black/20 rounded-full blur-[3px]"></div>
                    </div>
                  );
                })}

                <div className="flex-shrink-0 w-20 sm:w-24 flex flex-col items-center justify-center gap-1">
                  <div className="w-full h-9 sm:h-11 bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm border border-sky-200 relative overflow-hidden backdrop-blur-sm">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
                    </svg>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-blue-900 uppercase tracking-widest text-center">Entrada</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🚀 PANEL DE DISPONIBILIDAD INMEDIATA */}
      <PanelDisponibilidad 
        cocheras={cocheras} 
        reservas={reservas} 
        usuario={usuario} 
        miCochera={miCochera} 
        miPatente={miPatente} 
      />

      {/* 🚀 RELOJ ACTIVO */}
      {usuario?.rol === 'USER' && reservaActivaUsuario && (
        <MiniReloj 
          reserva={reservaActivaUsuario} 
          onExtender={onExtenderTiempo} 
        />
      )}

      {/* 🚀 BANNER DE VIDEO (ZOOM 10% [scale-[1.10]] SOLO EN WEB/ESCRITORIO, MÓVIL INTACTO CON object-cover) */}
      <div className="w-full flex justify-center mt-2">
        <div className="w-full sm:max-w-2xl rounded-2xl overflow-hidden shadow-xl border border-sky-200 relative bg-slate-900 group">
          <div className="relative w-full h-36 sm:h-44 overflow-hidden flex items-center justify-center">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover sm:object-contain sm:scale-[1.10] opacity-90 group-hover:scale-105 transition-transform duration-700"
            >
              <source src="/videobanerpiedepagina.mp4" type="video/mp4" />
              Tu navegador no soporta videos HTML5.
            </video>
          </div>
        </div>
      </div>

      {/* 🚀 MINI BANNER INFERIOR EN COLOR CLARO DIFERENCIADO */}
      <div className="w-full flex justify-center mb-2">
        <div className="w-full sm:max-w-2xl bg-gradient-to-r from-sky-50 via-blue-50/70 to-sky-100/80 border border-sky-300 rounded-2xl p-3.5 sm:p-4 shadow-[0_8px_25px_rgba(56,189,248,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 shadow-sm flex items-center justify-center text-blue-700 shrink-0">
              <svg className="w-5 h-5 animate-pulse text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-[9px] font-black tracking-widest text-blue-900 uppercase px-2 py-0.5 bg-white rounded-md border border-sky-200 shadow-2xs">IES Nuevo Horizonte (IESNH)</span>
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase px-2 py-0.5 bg-emerald-100 rounded-md border border-emerald-300 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Protegido
                </span>
              </div>
              <h4 className="text-blue-950 font-black text-xs sm:text-sm tracking-tight">Monitoreo 24/7 con Cámaras de Seguridad y Control Institucional</h4>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-sky-200 rounded-xl text-blue-900 text-xs font-bold shadow-sm shrink-0 w-full sm:w-auto justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CCTV Activo en Tiempo Real</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .spot-tu-lugar { background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%); }
        .spot-ocupado { background: linear-gradient(135deg, #e11d48 0%, #f43f5e 50%, #fb7185 100%); }
        .spot-libre { background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); }
        .spot-card { transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); position: relative; }
        
        @keyframes entrance { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-spot { animation: entrance 0.4s ease-out forwards; opacity: 0; }
        
        @keyframes pulse-search { 0% { box-shadow: 0 0 0 0 rgba(250,204,21,0.7); } 70% { box-shadow: 0 0 0 16px rgba(250,204,21,0); } 100% { box-shadow: 0 0 0 0 rgba(250,204,21,0); } }
        .spot-encontrado { animation: pulse-search 2s infinite; border-color: #facc15 !important; border-width: 3px !important; }
        
        @keyframes swipe-hand {
          0% { transform: translateX(-10px); opacity: 0.6; }
          50% { transform: translateX(10px); opacity: 1; }
          100% { transform: translateX(-10px); opacity: 0.6; }
        }
        .animate-swipe { animation: swipe-hand 2s ease-in-out infinite; }

        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        
        .plate-realista { background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%); border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9); width: 100%; display: flex; flex-direction: column; overflow: hidden; border: 2px solid #334155; }
        .plate-header-mini { background: linear-gradient(to bottom, #1e3a8a 0%, #1e40af 100%); height: 11px; width: 100%; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.2); }
        .plate-footer-mini { background: #f1f5f9; height: 9px; width: 100%; display: flex; align-items: center; justify-content: center; border-top: 1px solid #cbd5e1; }
        
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        .scrollbar-thin::-webkit-scrollbar { height: 5px; width: 5px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(56,189,248,0.1); border-radius: 8px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.4); border-radius: 8px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(56,189,248,0.7); }

        @media (max-width: 640px) {
          .spot-card { width: 90px !important; height: 125px !important; }
        }
      `}} />
    </div>
  );
}