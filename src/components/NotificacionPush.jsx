import { useState, useEffect } from 'react';

export default function NotificacionPush({ mensaje, tipo = 'alerta', onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const configuracion = {
    alerta: {
      fondo: 'bg-gradient-to-r from-amber-500 to-amber-400',
      borde: 'border-amber-300/30',
      sombra: 'shadow-[0_10px_40px_rgba(245,158,11,0.4)]',
      icono: (
        <div className="relative">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full animate-ping"></div>
        </div>
      ),
      titulo: 'Aviso de Estacionamiento',
      iconoGrande: (
        <svg className="w-12 h-12 text-white/10 absolute -top-3 -right-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    },
    peligro: {
      fondo: 'bg-gradient-to-r from-red-600 to-rose-500',
      borde: 'border-red-400/30',
      sombra: 'shadow-[0_10px_40px_rgba(239,68,68,0.4)]',
      icono: (
        <div className="relative">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </div>
      ),
      titulo: 'Multa Aplicada',
      iconoGrande: (
        <svg className="w-12 h-12 text-white/10 absolute -top-3 -right-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      )
    },
    info: {
      fondo: 'bg-gradient-to-r from-blue-500 to-blue-400',
      borde: 'border-blue-300/30',
      sombra: 'shadow-[0_10px_40px_rgba(59,130,246,0.4)]',
      icono: (
        <div className="relative">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full"></div>
        </div>
      ),
      titulo: 'Información',
      iconoGrande: (
        <svg className="w-12 h-12 text-white/10 absolute -top-3 -right-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      )
    }
  };

  const actual = configuracion[tipo] || configuracion.info;

  return (
    <div className={`fixed top-4 right-4 z-[9999] transition-all duration-500 transform 
      ${visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}`}>
      
      <div className={`${actual.fondo} text-white p-4 sm:p-5 rounded-2xl shadow-2xl ${actual.sombra} flex items-start gap-3 sm:gap-4 max-w-[95vw] sm:max-w-sm border ${actual.borde} backdrop-blur-sm relative overflow-hidden animate-[fadeIn_0.5s_ease-out]`}>
        
        {/* Icono decorativo de fondo */}
        {actual.iconoGrande}
        
        {/* Icono principal */}
        <div className="relative z-10 flex-shrink-0">
          {actual.icono}
        </div>
        
        {/* Contenido */}
        <div className="relative z-10 flex-1 min-w-0">
          <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider mb-1">
            {actual.titulo}
          </h4>
          <p className="text-xs sm:text-sm font-medium leading-tight text-white/90 pr-2">
            {mensaje}
          </p>
          
          {/* Barra de progreso para auto-cierre */}
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full barra-progreso"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
        
        {/* Botón de cierre */}
        <button 
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }} 
          className="relative z-10 text-white/70 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-lg p-1 flex-shrink-0 cursor-pointer"
          aria-label="Cerrar notificación"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ESTILOS CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .barra-progreso {
          animation: shrink 6s linear forwards;
        }
        
        @media (max-width: 640px) {
          .barra-progreso {
            animation: shrink 4s linear forwards;
          }
        }
      `}} />
    </div>
  );
}