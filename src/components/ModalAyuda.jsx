import React from 'react';

export default function ModalAyuda({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-sky-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Cabecera minimalista con el botón de cierre (X) destacado */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-sky-600 to-blue-700 text-white shrink-0 shadow-md z-10">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-wide uppercase">Guía de Uso · PARKINH</span>
          </div>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 bg-white/20 hover:bg-rose-500 text-white rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Cerrar Guía"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenedor de la Imagen - Ahora permite SCROLL si la imagen es grande */}
        <div className="p-0 sm:p-2 overflow-y-auto scrollbar-thin bg-slate-900 flex items-start justify-center flex-1">
          <img 
            src="/instructivo.png" 
            alt="Infografía Instructivo Parkinh" 
            // Eliminamos el max-h-[75vh] para que la imagen se expanda a lo ancho y permita hacer scroll
            className="w-full h-auto object-contain sm:rounded-xl shadow-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="hidden text-center text-white py-12 w-full">
            <p className="text-sm font-bold text-rose-400">No se pudo cargar la imagen "instructivo.png" en la carpeta public.</p>
          </div>
        </div>

        {/* Pie del Modal con botón de entendido */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-black rounded-xl shadow-md hover:from-sky-600 hover:to-blue-700 transition-all cursor-pointer uppercase tracking-wider active:scale-95"
          >
            ¡Entendido, cerrar!
          </button>
        </div>

      </div>
    </div>
  );
}