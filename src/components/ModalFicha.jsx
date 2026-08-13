import { useState, useEffect } from 'react';

// DEFINICIÓN DE LA URL BASE DESDE EL ENTORNO
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export default function ModalFicha({ info, onClose, onLiberar }) {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [confirmando, setConfirmando] = useState(false); // Estado interno para la confirmación

  useEffect(() => {
    if (info && info.reserva) {
      const patenteLimpia = info.reserva.patente.replace(/\s+/g, '').toUpperCase();
      
      fetch(`${BACKEND_URL}/api/usuarios/patente/${patenteLimpia}`)
        .then(res => {
          if (!res.ok) throw new Error("No registrado");
          return res.json();
        })
        .then(data => { setPerfil(data); setCargando(false); })
        .catch(() => { setPerfil(null); setCargando(false); });
    }
  }, [info]);

  if (!info) return null;
  const { lugar, reserva } = info;

  const abrirWhatsApp = (numero) => {
    const numeroLimpio = numero.replace(/\D/g, ''); 
    window.open(`https://wa.me/${numeroLimpio}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-[fadeIn_0.3s_ease-out]">
      
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.4)] w-full max-w-md border border-white/50 relative animate-[fadeIn_0.5s_ease-out] overflow-hidden">
        
        {/* VISTA DE CONFIRMACIÓN INTERNA */}
        {confirmando ? (
          <div className="text-center space-y-5 py-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-2">¿Forzar liberación de la cochera {lugar.codigo}?</h3>
              <p className="text-sm text-slate-500 font-medium">
                Esta acción cerrará el ticket actual del usuario de forma administrativa.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setConfirmando(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  onLiberar(lugar.codigo);
                  onClose();
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-rose-500/30 transition-all cursor-pointer"
              >
                Sí, liberar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Efecto de brillo superior */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-50 rounded-full"></div>
            
            {/* Encabezado */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-[pulse_2s_infinite]"></div>
                  <p className="text-xs font-black text-rose-500 uppercase tracking-widest">Panel de Administración</p>
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Cochera {lugar.codigo}</h2>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-90 hover:scale-110 group cursor-pointer"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info Vehículo */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl mb-6 border-2 border-slate-200 flex justify-between items-center relative overflow-hidden group hover:border-blue-300 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dominio Ocupante</p>
                <p className="text-2xl font-black text-slate-800 tracking-[0.2em]">{reserva.patente}</p>
              </div>
              <div className="flex gap-2 relative z-10">
                <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase border border-blue-300 shadow-sm">
                  {reserva.tipoPase ? reserva.tipoPase.replace('_', ' ') : 'ESTANDAR'}
                </span>
              </div>
            </div>

            {/* Ficha Institucional */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Información del Propietario</p>
              </div>
              
              {cargando ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-full animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-lg w-3/4 mx-auto animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]"></div>
                    <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-lg w-1/2 mx-auto animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]"></div>
                  </div>
                </div>
              ) : perfil ? (
                <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shadow-blue-500/20">
                      {perfil.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-lg">{perfil.username}</p>
                      <p className={`text-xs font-bold inline-block px-3 py-1 rounded-lg uppercase mt-1 ${
                        perfil.tipoPerfil === 'ALUMNO' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : perfil.tipoPerfil === 'DOCENTE'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {perfil.tipoPerfil}
                      </p>
                    </div>
                  </div>
                  
                  {perfil.tipoPerfil !== 'PARTICULAR' && (
                    <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Carrera / Cursado</p>
                      </div>
                      <p className="text-slate-800 font-bold">{perfil.carrera}</p>
                      {perfil.tipoPerfil === 'ALUMNO' && (
                        <div className="flex items-center gap-2 mt-2 text-slate-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{perfil.curso} Año - Com. "{perfil.comision}" ({perfil.turnoCursado})</span>
                        </div>
                      )}
                    </div>
                  )}

                  {perfil.whatsapp && (
                    <button 
                      onClick={() => abrirWhatsApp(perfil.whatsapp)}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.4)] active:scale-95 group relative overflow-hidden cursor-pointer"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                        </svg>
                        Contactar Propietario por WhatsApp
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 p-4 rounded-2xl text-xs font-bold border-2 border-amber-200 flex items-center gap-3 animate-[fadeIn_0.4s_ease-out]">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span>Vehículo sin registro institucional activo.</span>
                </div>
              )}
            </div>

            {/* BOTÓN QUE ACTIVA LA CONFIRMACIÓN */}
            <button 
              onClick={() => setConfirmando(true)}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(225,29,72,0.3)] hover:shadow-[0_15px_40px_rgba(225,29,72,0.4)] transition-all duration-300 active:scale-95 text-base group relative overflow-hidden cursor-pointer"
            >
              <span className="relative z-15 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Forzar Liberación de Espacio
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </>
        )}

      </div>
    </div>
  );
}