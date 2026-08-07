import { useEffect, useState } from 'react';

// DEFINICIÓN DE LA URL BASE DESDE EL ENTORNO
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export default function Navbar({ usuario, vista, setVista, onLogout, onAbrirHistorial }) {
  const [tieneDeuda, setTieneDeuda] = useState(false);

  // 🚀 Verifica periódicamente si el usuario tiene alguna deuda pendiente (SOLO PARA ROL 'USER')
  useEffect(() => {
    // Si no hay usuario, o si es ADMIN/GUARDIA, no hacemos nada y apagamos el rastreador
    if (!usuario || usuario.rol !== 'USER') return;

    const verificarDeudas = () => {
      // FETCH CORREGIDO CON LA VARIABLE DE ENTORNO
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
    <nav className="sticky top-0 z-50 print:hidden transition-all duration-300">
      {/* Efecto glass premium */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          
          {/* IDENTIDAD INSTITUCIONAL */}
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <span className="relative z-10">NH</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="hidden sm:flex flex-col cursor-default">
              <span className="font-black text-xl text-slate-800 tracking-tight leading-none">SmartCampus</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">IES Nuevo Horizonte</span>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[pulse_2s_infinite]"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* BOTONES DE NAVEGACION: EXCLUSIVO PARA ADMIN */}
            {usuario?.rol === 'ADMIN' && (
              <div className="flex bg-slate-100/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200/60 shadow-inner">
                <button 
                  onClick={() => setVista('mapa')} 
                  className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    vista === 'mapa' 
                      ? 'bg-white text-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.15)] scale-105 border border-slate-100' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="hidden xs:inline">Mapa</span>
                </button>
                <button 
                  onClick={() => setVista('dashboard')} 
                  className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    vista === 'dashboard' 
                      ? 'bg-white text-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.15)] scale-105 border border-slate-100' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden xs:inline">Panel</span>
                </button>
              </div>
            )}
            
            {/* 🚀 BOTÓN HISTORIAL: EXCLUSIVO PARA USUARIOS NORMALES */}
            {usuario?.rol === 'USER' && (
              <div className="flex bg-slate-100/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200/60 shadow-inner">
                <button 
                  onClick={onAbrirHistorial}
                  className="relative px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-700 hover:bg-white/80 transition-all duration-300 flex items-center gap-2"
                  title="Ver Historial y Multas"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="hidden xs:inline">Tickets</span>
                  
                  {/* 🔴 CAMPANITA DE DEUDA: Parpadea si hay deuda */}
                  {tieneDeuda && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white"></span>
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* PERFIL DE USUARIO Y CIERRE DE SESION */}
            <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-5 border-l-2 border-slate-200">
              
              {/* Textos del Usuario */}
              <div className="text-right hidden md:block cursor-default">
                <p className="text-sm font-black text-slate-800 leading-tight">{usuario?.username}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    usuario?.rol === 'ADMIN' ? 'bg-purple-500' : 
                    usuario?.rol === 'GUARDIA' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{usuario?.rol}</p>
                </div>
              </div>
              
              {/* Avatar Circular */}
              <div className="relative group cursor-default">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full border-2 border-blue-300 flex items-center justify-center text-blue-700 font-black shadow-sm group-hover:shadow-md transition-all duration-300">
                  {usuario?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                {/* Indicador de estado en el avatar: Solo se pone rojo si es USER y debe plata */}
                {usuario?.rol === 'USER' && tieneDeuda ? (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-rose-500"></div>
                ) : (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-500"></div>
                )}
              </div>
              
              {/* Boton Salir Minimalista */}
              <button 
                onClick={onLogout} 
                className="flex items-center justify-center bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 p-2.5 rounded-xl transition-all duration-300 group relative"
                title="Cerrar Sesion"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-active:scale-90 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="absolute -top-8 right-0 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
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