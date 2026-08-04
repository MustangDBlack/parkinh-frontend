import html2canvas from 'html2canvas';
import { useRef } from 'react';

export default function TicketModal({ ticketModal, setTicketModal, imprimirTicket }) {
  const ticketRef = useRef(null);

  if (!ticketModal) return null;

  // LÓGICA DE DETECCIÓN: ¿Es una reserva nueva o un comprobante de salida?
  const esReserva = !ticketModal.horaSalida;

  const fechaEntrada = new Date(ticketModal.horaEntrada);
  const fechaVencimiento = ticketModal.horaFinEsperada ? new Date(ticketModal.horaFinEsperada) : null;
  const fechaSalida = ticketModal.horaSalida ? new Date(ticketModal.horaSalida) : null;
  
  let tieneMulta = false;
  if (!esReserva && fechaVencimiento && fechaSalida) {
    const diferenciaMinutos = (fechaSalida - fechaVencimiento) / (1000 * 60);
    if (diferenciaMinutos > 15) {
      tieneMulta = true;
    }
  }

  const descargarTicket = async () => {
    if (!ticketRef.current) return;
    
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2 });
      const imagen = canvas.toDataURL('image/png');
      
      const enlace = document.createElement('a');
      enlace.href = imagen;
      const prefijo = esReserva ? 'Reserva' : 'Salida';
      enlace.download = `${prefijo}_${ticketModal.patente}_Lugar${ticketModal.cochera?.codigo}.png`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    } catch (error) {
      console.error("Error al generar la imagen del ticket:", error);
      alert("Hubo un problema al intentar descargar el ticket.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[99999] print:absolute print:inset-0 print:bg-white print:p-0 animate-[fadeIn_0.3s_ease-out]">
      
      {/* 🚀 CONTENEDOR PRINCIPAL: Añadido max-h-[95vh] y overflow-y-auto para responsividad */}
      <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-6 rounded-[2rem] shadow-[0_25px_80px_rgba(0,0,0,0.4)] max-w-sm w-full max-h-[95vh] overflow-y-auto border-2 border-dashed border-gray-300 print:border-none print:shadow-none print:max-h-none print:overflow-visible print:p-0 relative animate-[fadeIn_0.5s_ease-out] scrollbar-hide">
        
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30 rounded-full print:hidden"></div>
        
        {/* === ZONA CAPTURABLE DEL TICKET === */}
        <div ref={ticketRef} className="bg-white p-4 -m-2 sm:-m-4 mb-2 rounded-xl relative">
          
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
            <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
            </svg>
          </div>
          
          {/* 🚀 CABECERA COMPACTADA */}
          <div className="text-center border-b-2 border-gray-200 pb-3 mb-3 relative">
            <div className="flex justify-center mb-1.5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-600 text-white rounded-xl flex items-center justify-center font-black text-base shadow-md">
                NH
              </div>
            </div>
            <h2 className="text-lg font-black tracking-wider text-gray-800">IES NUEVO HORIZONTE</h2>
            <p className={`text-[10px] uppercase font-bold mt-1 tracking-widest px-2 py-0.5 inline-block rounded-full ${esReserva ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-800'}`}>
              {esReserva ? 'Reserva Confirmada' : 'Ticket de Salida'}
            </p>
          </div>
          
          {/* 🚀 DATOS COMPACTADOS (text-xs y gap-2) */}
          <div className="flex flex-col gap-2 text-xs sm:text-sm text-gray-700 font-mono relative">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">COMPROBANTE:</span>
              <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-900">#000{ticketModal.id}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500">LUGAR:</span>
              <span className="font-bold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                {ticketModal.cochera?.codigo}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500">PATENTE:</span>
              <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded tracking-wider">
                {ticketModal.patente}
              </span>
            </div>
            
            <hr className="border-dashed border-gray-300 my-0.5" />
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500">TIPO PASE:</span>
              <span className="font-bold text-gray-800">
                {ticketModal.tipoPase ? ticketModal.tipoPase.replace('_', ' ') : 'ESTANDAR'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500">TURNO:</span>
              <span className="font-bold text-gray-800">{ticketModal.turno || '-'}</span>
            </div>
            
            <hr className="border-dashed border-gray-300 my-0.5" />

            <div className="flex flex-col gap-1.5 text-[11px] sm:text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="font-bold">ENTRADA:</span> 
                <span>{fechaEntrada.toLocaleString()}</span>
              </div>
              
              {fechaVencimiento && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold">{esReserva ? 'VENCE:' : 'VENCÍA:'}</span> 
                  <span>{fechaVencimiento.toLocaleString()}</span>
                </div>
              )}
              
              {!esReserva && fechaSalida && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-bold">SALIDA:</span> 
                  <span>{fechaSalida.toLocaleString()}</span>
                </div>
              )}
            </div>
            
            {tieneMulta && (
              <div className="mt-1 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-center shadow-sm">
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  RECARGO POR EXCESO INCLUIDO
                </div>
              </div>
            )}

            <hr className="border-dashed border-gray-300 my-0.5" />
            
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-500 font-bold">
              <span>PAGO:</span>
              <span className={`uppercase px-2 py-0.5 rounded ${
                ticketModal.metodoPago === 'TRANSFERENCIA' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {ticketModal.metodoPago || 'EFECTIVO'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 bg-gray-50 p-2 rounded-lg -mx-1">
              <span className="text-sm font-bold text-gray-800">{esReserva ? 'ABONADO:' : 'TOTAL:'}</span>
              <span className={`text-xl font-black ${tieneMulta ? 'text-red-600' : 'text-emerald-600'}`}>
                ${ticketModal.montoTotal ? ticketModal.montoTotal.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
          
          <div className="text-center mt-3 pt-2 border-t border-gray-200">
            <div className="flex flex-col items-center justify-center text-[10px] text-gray-400 font-semibold">
              {esReserva ? (
                <span className="text-emerald-500 font-bold">¡Ocupa tu lugar asignado!</span>
              ) : (
                <span>¡Gracias por usar nuestro estacionamiento!</span>
              )}
            </div>
          </div>
        </div>

        {/* 🚀 BOTONERA COMPACTADA (py-2.5 y gap-2) */}
        <div className="mt-3 flex flex-col gap-2 print:hidden">
          <button 
            onClick={descargarTicket} 
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex justify-center items-center gap-2 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar Imagen
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={imprimirTicket} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex justify-center items-center gap-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              PDF / Imprimir
            </button>
            <button 
              onClick={() => setTicketModal(null)} 
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 text-gray-700 font-bold py-2.5 rounded-xl border border-gray-200 transition-all text-sm active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}