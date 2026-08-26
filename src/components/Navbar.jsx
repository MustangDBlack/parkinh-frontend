import { useEffect, useState } from 'react';

// DEFINICIÓN DE LA URL BASE DESDE EL ENTORNO
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export default function Navbar({ usuario, vista, setVista, onLogout, onAbrirHistorial }) {
  const [tieneDeuda, setTieneDeuda] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 🚀 Controla el efecto visual: sólido arriba, más transparente al deslizar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🚀 Verifica periódicamente si el usuario tiene alguna deuda pendiente (SOLO PARA ROL 'USER')
  useEffect(() => {
    if (!usuario || usuario.rol !== 'USER') return;

    const verificarDeudas = () => {
      fetch(`${BACKEND_URL}/api/reservas/usuario/${usuario.username}`)
        .then(res => res.json())
        .then(data => {
          const deudaEncontrada = data.some(reserva => reserva.estadoPago === 'PENDIENTE');
          setTieneDeuda(deudaEncontrada);
        })
        .catch(err => console.error("Error verificando deudas:", err));
    };

    verificarDeudas();
    const intervalo = setInterval(verificarDeudas, 60000); 
    
    return () => clearInterval(intervalo);
  }, [usuario]);

  return (
    <nav className="sticky top-0 z-50 print:hidden transition-all duration-500">
      <div className={`transition-all duration-500 border-b ${
        scrolled 
          ? 'bg-slate-200/60 backdrop-blur-md border-sky-300/60 shadow-[0_8px_25px_rgba(56,189,248,0.12)]' 
          : 'bg-slate-200/95 border-sky-300 shadow-[0_4px_20px_rgba(56,189,248,0.08)]'
      }`}>
        <div className="max-w-6xl mx-auto px-2.5 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
          
          {/* IDENTIDAD INSTITUCIONAL & LOGO */}
          <div className="flex items-center gap-2 sm:gap-3.5 group cursor-default">
            
            {/* Logo institucional adaptado para celular y web */}
            <div className="relative flex items-center justify-center shrink-0">
              <img 
                src="/logoiesnh.png" 
                alt="Logo IES Nuevo Horizonte" 
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain transform group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <span className="absolute inset-0 hidden items-center justify-center font-black text-blue-700 text-xs">NH</span>
            </div>

            {/* Títulos adaptados (Oculta texto largo en celular para evitar desproporción) */}
            <div className="flex flex-col cursor-default">
              <div className="flex items-center">
                <span className="font-black text-base sm:text-2xl tracking-tight text-slate-800">
                  PARKI<span className="text-white bg-blue-600 px-1 py-0.5 rounded-md ml-0.5 shadow-2xs border border-blue-400">NH</span>
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Instituto Nuevo Horizonte</span>
                <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-[pulse_2s_infinite]"></div>
              </div>
            </div>

          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* BOTONES DE NAVEGACION: EXCLUSIVO PARA ADMIN */}
            {usuario?.rol === 'ADMIN' && (
              <div className="flex bg-white/80 p-0.5 sm:p-1 rounded-xl border border-sky-200/80 shadow-inner">
                <button 
                  onClick={() => setVista('mapa')} 
                  className={`px-2 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all duration-300 flex items-center gap-1 sm:gap-2 cursor-pointer ${
                    vista === 'mapa' 
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 scale-105 border border-sky-300' 
                      : 'text-slate-600 hover:text-blue-900 hover:bg-sky-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Mapa</span>
                </button>
                <button 
                  onClick={() => setVista('dashboard')} 
                  className={`px-2 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all duration-300 flex items-center gap-1 sm:gap-2 cursor-pointer ${
                    vista === 'dashboard' 
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 scale-105 border border-sky-300' 
                      : 'text-slate-600 hover:text-blue-900 hover:bg-sky-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Panel</span>
                </button>
              </div>
            )}
            
            {/* 🚀 BOTÓN HISTORIAL: EXCLUSIVO PARA USUARIOS NORMALES */}
            {usuario?.rol === 'USER' && (
              <div className="flex bg-white/80 p-0.5 sm:p-1 rounded-xl border border-sky-200/80 shadow-inner">
                <button 
                  onClick={onAbrirHistorial}
                  className="relative px-2 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-bold text-slate-700 hover:text-blue-900 hover:bg-sky-50 transition-all duration-300 flex items-center gap-1 sm:gap-2 cursor-pointer border border-transparent hover:border-sky-200"
                  title="Ver Historial y Multas"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>Tickets</span>
                  
                  {/* 🔴 CAMPANITA DE DEUDA: Parpadea si hay deuda */}
                  {tieneDeuda && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-rose-500 border-2 border-white"></span>
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* PERFIL DE USUARIO Y CIERRE DE SESION */}
            <div className="flex items-center gap-2 sm:gap-3.5 pl-2 sm:pl-4 border-l-2 border-sky-200">
              
              {/* Textos del Usuario */}
              <div className="text-right hidden md:block cursor-default">
                <p className="text-sm font-black text-slate-800 leading-tight">{usuario?.username}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    usuario?.rol === 'ADMIN' ? 'bg-purple-500' : 
                    usuario?.rol === 'GUARDIA' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{usuario?.rol}</p>
                </div>
              </div>
              
              {/* Avatar Circular */}
              <div className="relative group cursor-default">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white font-black shadow-xs group-hover:shadow-sm transition-all duration-300 text-xs sm:text-sm">
                  {usuario?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                {usuario?.rol === 'USER' && tieneDeuda ? (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white bg-rose-500"></div>
                ) : (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white bg-emerald-500"></div>
                )}
              </div>
              
              {/* Boton Salir Estilizado */}
              <button 
                onClick={onLogout} 
                className="flex items-center justify-center bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 p-2 sm:p-2.5 rounded-xl transition-all duration-300 group relative border border-sky-200 hover:border-rose-200 cursor-pointer shadow-2xs"
                title="Cerrar Sesion"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 group-active:scale-90 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                  Cerrar Sesion
                </span>
              </button>

            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}