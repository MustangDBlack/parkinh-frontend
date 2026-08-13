import React from 'react';

export default function ModalConfirmacion({ isOpen, titulo, mensaje, onConfirmar, onCancelar, tipo = 'peligro' }) {
  if (!isOpen) return null;

  const esPeligro = tipo === 'peligro';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
      
      {/* Contenedor principal con diseño Glass Premium */}
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.4)] w-full max-w-md border border-white/50 relative animate-[fadeIn_0.5s_ease-out] overflow-hidden">

        {/* Efecto de brillo superior */}
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent ${esPeligro ? 'via-rose-500' : 'via-blue-500'} to-transparent opacity-50 rounded-full`}></div>

        <div className="flex flex-col items-center text-center pt-2">
          
          {/* Icono animado estilizado */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md ${
            esPeligro 
              ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20' 
              : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-500/20'
          }`}>
            {esPeligro ? (
              <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>

          <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{titulo}</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{mensaje}</p>

          {/* Botones de acción estandarizados */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onCancelar}
              className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all duration-300 active:scale-95 shadow-sm border border-slate-200/60 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              className={`flex-1 px-4 py-3.5 text-white font-black rounded-2xl shadow-lg transition-all duration-300 active:scale-95 relative overflow-hidden group cursor-pointer ${
                esPeligro
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/30'
                  : 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 shadow-blue-500/30'
              }`}
            >
              <span className="relative z-10">Confirmar</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}