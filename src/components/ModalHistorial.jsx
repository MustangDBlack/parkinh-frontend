import React, { useEffect, useState } from 'react';

// DEFINICIÓN DE LA URL BASE DESDE EL ENTORNO
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export default function ModalHistorial({ usuario, onClose, onPagarDeuda }) {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 🚀 Obtenemos el historial fresco del backend usando la variable de entorno
    fetch(`${BACKEND_URL}/api/reservas/usuario/${usuario.username}`)
      .then(res => res.json())
      .then(data => {
        setHistorial(data);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error cargando historial:", err);
        setCargando(false);
      });
  }, [usuario]);

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "En curso";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Mis Tickets y Deudas</h2>
              <p className="text-xs text-slate-500 font-medium">Historial de {usuario.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Cuerpo del Modal (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium text-sm">Cargando historial...</p>
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <h3 className="text-slate-700 font-bold">No tienes tickets aún</h3>
              <p className="text-slate-500 text-sm mt-1">Tus reservas aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historial.map(reserva => {
                const esDeudor = reserva.estadoPago === 'PENDIENTE';
                
                return (
                  <div key={reserva.id} className={`bg-white border-2 rounded-2xl p-4 transition-all shadow-sm ${esDeudor ? 'border-rose-400 shadow-rose-100' : 'border-slate-100 hover:border-blue-200'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      
                      {/* Info principal */}
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${esDeudor ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                          {reserva.cochera?.codigo || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-800 text-lg uppercase tracking-wide">{reserva.patente}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${esDeudor ? 'bg-rose-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                              {esDeudor ? 'Deuda' : 'Pagado'}
                            </span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            <p className="text-xs text-slate-500 font-medium">
                              <span className="text-slate-400">Entrada:</span> {formatearFecha(reserva.horaEntrada)}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              <span className="text-slate-400">Salida:</span> {formatearFecha(reserva.horaSalida)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Monto y Acción */}
                      <div className="text-right flex flex-col items-end justify-center min-w-[100px]">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total</p>
                        <p className={`text-xl font-black ${esDeudor ? 'text-rose-600' : 'text-slate-800'}`}>
                          ${reserva.montoTotal}
                        </p>
                      </div>
                    </div>

                    {/* Botón de pago (Solo si debe) */}
                    {esDeudor && (
                      <div className="mt-4 pt-4 border-t border-rose-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          Requiere pago para habilitar cuenta
                        </div>
                        <button 
                          onClick={() => onPagarDeuda(reserva)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                          Pagar Deuda
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}