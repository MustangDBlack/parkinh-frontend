import React, { useState, useMemo, useRef, useEffect } from 'react';

// --- SUBCOMPONENTE: BARRA DE TIEMPO HORIZONTAL ULTRA DELGADA Y MINIMALISTA ---
const MiniReloj = ({ reserva, onExtender }) => {
  const [tiempo, setTiempo] = useState({
    horas: 0,
    minutos: 0,
    segundos: 0,
    expirado: false,
    textoExceso: '',
    porcentaje: 100
  });

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
    <div className="mt-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row items-center justify-between gap-4 relative overflow-hidden animate-[fadeIn_0.4s_ease-out]">
      {/* Línea decorativa minimalista superior */}
      <div className={`absolute top-0 left-0 h-[3px] w-full ${tiempo.expirado ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400'}`}></div>

      {/* Info y Contador Digital HH:MM:SS */}
      <div className="flex items-center gap-3 w-full lg:w-auto flex-shrink-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${tiempo.expirado ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
            Tu Lugar Activo: <span className="text-slate-800 font-black">#{reserva.cochera?.codigo}</span>
          </p>
          {tiempo.expirado ? (
            <p className="text-base font-black text-rose-600 leading-none tracking-tight animate-pulse">
              ⚠️ Vencido: +{tiempo.textoExceso}
            </p>
          ) : (
            <p className="text-xl font-mono font-black text-slate-800 leading-none tracking-wider">
              {String(tiempo.horas).padStart(2, '0')}:{String(tiempo.minutos).padStart(2, '0')}:{String(tiempo.segundos).padStart(2, '0')}
            </p>
          )}
        </div>
      </div>

      {/* Barra de progreso ultra delgada */}
      <div className="w-full lg:flex-1 px-1 sm:px-2 flex flex-col gap-1.5">
        <div className="w-full bg-slate-100 rounded-full h-[4px] overflow-hidden border border-slate-200/40">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${tiempo.expirado ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-600 to-sky-400'}`}
            style={{ width: `${tiempo.porcentaje}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-wider">
          <span>Progreso</span>
          <span className={tiempo.expirado ? 'text-rose-500' : 'text-blue-600'}>
            {tiempo.expirado ? 'Multa en Proceso' : `${Math.round(tiempo.porcentaje)}%`}
          </span>
        </div>
      </div>

      {/* Botonera Profesional Responsive de Prórrogas */}
      <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Extender:</span>
        <div className="grid grid-cols-4 sm:flex gap-1.5 w-full sm:w-auto">
          {[1, 2, 3, 4].map((h) => (
            <button
              key={h}
              onClick={() => onExtender(reserva.id, h)}
              className="py-2 px-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black rounded-xl text-xs transition-all duration-300 active:scale-95 shadow-md shadow-blue-500/10 hover:shadow-lg cursor-pointer text-center whitespace-nowrap min-w-[52px]"
            >
              +{h}H
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL MAPA ---
export default function Mapa({ 
  usuario, cocheras, nuevoCodigo, setNuevoCodigo, 
  agregarCochera, manejarClicCochera, eliminarCochera, 
  reservas = [], miCochera, miPatente,
  reservaActivaUsuario, // 🚀 Prop recibido de App.jsx
  onExtenderTiempo      // 🚀 Prop recibido de App.jsx
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

  // Drag para scroll horizontal
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
    <div className="print:hidden space-y-4 sm:space-y-5 fade-in">
      
      {/* Panel Superior */}
      {(usuario?.rol === 'ADMIN' || usuario?.rol === 'GUARDIA') && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-white/50 p-3 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-sm sm:text-base">Estacionamiento PARKINH</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    {lugaresLibres} Libres
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    {lugaresOcupados} Ocupados
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{porcentajeOcupacion}% ocupado</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <svg className={`w-4 h-4 transition-colors duration-300 ${busquedaPatente.length >= 2 ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 uppercase transition-all shadow-sm placeholder:normal-case placeholder:font-medium hover:border-slate-300" 
                  type="text" placeholder="Buscar patente..." value={busquedaPatente} onChange={(e) => setBusquedaPatente(e.target.value)} />
                {busquedaPatente.length >= 2 && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${reservaEncontrada ? 'text-emerald-500' : 'text-rose-400'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {reservaEncontrada ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    </svg>
                  </span>
                )}
              </div>
            </div>
          </div>
          {usuario?.rol === 'ADMIN' && (
            <form onSubmit={agregarCochera} className="flex items-center gap-2 sm:gap-3 p-2.5 bg-slate-50/80 rounded-xl border border-dashed border-slate-300">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 hidden sm:inline">Nuevo Espacio:</span>
              <input className="w-20 sm:w-24 py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs font-black focus:outline-none focus:ring-2 focus:ring-blue-500/30 uppercase text-center shadow-sm" type="text" placeholder="A2" value={nuevoCodigo} onChange={(e) => setNuevoCodigo(e.target.value)} maxLength="3" />
              <button className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-bold text-xs hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 active:scale-95" type="submit">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                <span className="hidden sm:inline">Añadir</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Leyenda */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm"></div><span className="font-bold text-slate-600">Libre</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gradient-to-br from-rose-400 to-rose-600 shadow-sm"></div><span className="font-bold text-slate-600">Ocupado</span></div>
          {usuario?.rol === 'USER' && miCochera && <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm"></div><span className="font-bold text-slate-600">Tu Lugar</span></div>}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/></svg>
          <span className="font-medium text-[10px]">Deslizá para recorrer</span>
        </div>
      </div>

      {/* MAPA DEL ESTACIONAMIENTO */}
      <div className="relative bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden">
        
        {/* Fondo animado sutil */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-[pulse_8s_infinite]"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500 rounded-full filter blur-3xl animate-[pulse_10s_infinite]" style={{animationDelay: '-4s'}}></div>
        </div>

        {/* Pared superior - Límite del estacionamiento */}
        <div className="relative h-6 sm:h-8 bg-gradient-to-b from-slate-500 to-slate-400 flex items-center justify-center border-b-2 border-slate-600">
          <span className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[0.3em]">Límite del predio</span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/30"></div>
        </div>

        <div className="relative p-3 sm:p-4">
          
          {/* Área scrolleable - Una sola fila de cocheras */}
          <div 
            ref={scrollRef}
            className="overflow-x-auto overflow-y-hidden pb-3 cursor-grab active:cursor-grabbing scrollbar-thin"
            onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart} onTouchEnd={handleMouseUp} onTouchMove={handleTouchMove}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex gap-3 sm:gap-4" style={{ minWidth: `${cocheras.length * 110}px` }}>
              
              {/* Entrada del lado IZQUIERDO */}
              <div className="flex-shrink-0 w-16 sm:w-20 flex flex-col items-center justify-center gap-2">
                <div className="w-full h-8 sm:h-10 bg-gradient-to-r from-slate-600 to-slate-500 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-[shimmer_2s_infinite]"></div>
                </div>
                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest text-center leading-tight">Entrada</span>
              </div>

              {/* Cocheras */}
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
                if (esMiLugar) { colorFondo = 'spot-tu-lugar'; bordeColor = 'border-2 border-blue-400/60'; textoEstado = 'Tu Lugar'; }
                else if (lugar.ocupado) { colorFondo = 'spot-ocupado'; bordeColor = 'border-2 border-rose-400/40'; textoEstado = 'Ocupado'; }
                else { colorFondo = 'spot-libre'; bordeColor = 'border-2 border-emerald-400/40'; textoEstado = 'Libre'; }

                return (
                  <div 
                    key={lugar.codigo} 
                    className={`spot-card group relative flex-shrink-0 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 rounded-xl ${colorFondo} ${bordeColor} ${esElBuscado ? 'spot-encontrado ring-4 ring-yellow-400/60 z-10 scale-105' : 'hover:-translate-y-3 hover:scale-105 hover:z-10'} animate-spot shadow-lg`}
                    style={{ animationDelay: `${index * 0.03}s`, width: '100px', height: '140px' }}
                    onClick={() => intentarManejarClic(lugar)}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none"></div>
                    
                    <div className="absolute inset-1.5 border-2 border-dashed border-white/15 rounded-lg pointer-events-none"></div>
                    <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-white/10"></div>
                    <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-white/10"></div>

                    {usuario?.rol === 'ADMIN' && !lugar.ocupado && (
                      <button onClick={(e) => { e.stopPropagation(); eliminarCochera(lugar.codigo); }}
                        className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 z-20">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    )}

                    {esElBuscado && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 px-2.5 py-0.5 rounded-full text-[9px] font-black shadow-[0_0_12px_rgba(250,204,21,0.6)] animate-bounce z-30 whitespace-nowrap">Encontrado</div>
                    )}

                    <div className="relative z-10 flex flex-col items-center justify-center w-full gap-1.5 p-1">
                      <span className={`font-black text-white leading-none drop-shadow-md ${patenteAMostrar ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'}`}>{lugar.codigo}</span>
                      
                      {patenteAMostrar ? (
                        <div className="plate-realista w-full">
                          <div className="plate-header-mini"><span className="text-[6px] text-white font-black tracking-[0.15em] uppercase">ARG</span></div>
                          <div className="flex-1 flex items-center justify-center py-1 px-1"><span className="text-[11px] sm:text-xs font-black text-slate-800 tracking-[0.1em] uppercase leading-tight text-center">{patenteAMostrar}</span></div>
                          <div className="plate-footer-mini"><span className="text-[5px] text-slate-400 font-bold uppercase">Rep. Argentina</span></div>
                        </div>
                      ) : (
                        <span className={`text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg ${
                          esMiLugar ? 'bg-white/25 text-white border border-white/30' : 
                          lugar.ocupado ? 'bg-white/15 text-white border border-white/20' : 
                          'bg-white/20 text-white border border-white/30'
                        }`}>
                          <span className="flex items-center gap-1">
                            {esMiLugar && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>}
                            {textoEstado}
                            {!lugar.ocupado && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>}
                          </span>
                        </span>
                      )}
                    </div>

                    {!patenteAMostrar && lugar.ocupado && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/80 animate-pulse shadow-md"></div>
                    )}

                    <div className="absolute -bottom-0.5 left-3 right-3 h-1.5 bg-black/15 rounded-full blur-[2px]"></div>
                  </div>
                );
              })}

              {/* Salida del lado DERECHO */}
              <div className="flex-shrink-0 w-16 sm:w-20 flex flex-col items-center justify-center gap-2">
                <div className="w-full h-8 sm:h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-[shimmer_2s_infinite]"></div>
                </div>
                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest text-center leading-tight">Salida</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pared inferior */}
        <div className="relative h-6 sm:h-8 bg-gradient-to-b from-slate-400 to-slate-500 flex items-center justify-center border-t-2 border-slate-600">
          <span className="text-[8px] sm:text-[10px] font-bold text-white/60 uppercase tracking-[0.3em]">Límite del predio</span>
        </div>
      </div>

      {/* PASILLO DE CIRCULACIÓN */}
      <div className="pasillo-central h-10 sm:h-12 rounded-2xl flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-around opacity-10 pointer-events-none">
          {[...Array(12)].map((_, i) => (<div key={i} className="w-6 sm:w-10 h-1 bg-slate-300 rounded-full"></div>))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_3s_infinite]"></div>
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 tracking-[1em] sm:tracking-[1.5em] uppercase z-10">Circulación</span>
      </div>

      {/* 🚀 EL MINI RELOJ DINÁMICO SE RENDERIZA EN ESTA SECCIÓN EXACTA (SÓLO ALUMNO CON RESERVA ACTIVA) */}
      {usuario?.rol === 'USER' && reservaActivaUsuario && (
        <MiniReloj 
          reserva={reservaActivaUsuario} 
          onExtender={onExtenderTiempo} 
        />
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
        <span className="font-medium">{cocheras.length} espacios · 6m x 20m</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Actualizado en tiempo real
        </span>
      </div>

      {/* ESTILOS */}
      <style dangerouslySetInnerHTML={{__html: `
        .spot-tu-lugar { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); }
        .spot-ocupado { background: linear-gradient(135deg, #dc2626 0%, #e11d48 50%, #f43f5e 100%); }
        .spot-libre { background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); }
        .spot-card { transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); position: relative; }
        
        @keyframes entrance { from { opacity: 0; transform: translateY(12px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-spot { animation: entrance 0.4s ease-out forwards; opacity: 0; }
        
        @keyframes pulse-search { 0% { box-shadow: 0 0 0 0 rgba(250,204,21,0.7); } 70% { box-shadow: 0 0 0 16px rgba(250,204,21,0); } 100% { box-shadow: 0 0 0 0 rgba(250,204,21,0); } }
        .spot-encontrado { animation: pulse-search 2s infinite; border-color: #facc15 !important; border-width: 3px !important; }
        
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        
        .plate-realista { background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%); border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9); width: 100%; display: flex; flex-direction: column; overflow: hidden; border: 2px solid #334155; }
        .plate-header-mini { background: linear-gradient(to bottom, #1e3a8a 0%, #1e40af 100%); height: 11px; width: 100%; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.2); }
        .plate-footer-mini { background: #f1f5f9; height: 9px; width: 100%; display: flex; align-items: center; justify-content: center; border-top: 1px solid #cbd5e1; }
        
        .pasillo-central { background: linear-gradient(to right, rgba(241,245,249,0.3), rgba(241,245,249,0.7), rgba(241,245,249,0.3)); border-top: 2px dashed #cbd5e1; border-bottom: 2px dashed #cbd5e1; }
        
        .scrollbar-thin::-webkit-scrollbar { height: 5px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        @media (max-width: 640px) {
          .spot-card { width: 90px !important; height: 130px !important; }
        }
      `}} />
    </div>
  );
}