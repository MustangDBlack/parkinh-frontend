import { useEffect } from 'react';

export default function EstadoPago({ estado }) {
  
  // 🚀 BLINDAJE COGNITIVO: Limpia automáticamente los parámetros colgantes de la URL de Mercado Pago tras 3 segundos
  useEffect(() => {
    if (window.location.search) {
      const timer = setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Configuramos los textos y colores segun el resultado
  const configuracion = {
    exitoso: { 
      icono: (
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.3)] animate-[fadeIn_0.5s_ease-out]">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-300 rounded-full animate-[ping_1.5s_infinite] opacity-75"></div>
        </div>
      ), 
      titulo: '¡Pago Aprobado!', 
      texto: 'Tu transacción con Mercado Pago se procesó correctamente. Los cambios e incrementos de tiempo ya impactaron en tu cuenta.',
      colorTexto: 'text-emerald-600',
      colorFondo: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100',
      colorBorde: 'border-emerald-500',
      colorBoton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      sombraBoton: 'shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.4)]',
      decoracion: 'rgba(16, 185, 129, 0.05)'
    },
    pendiente: { 
      icono: (
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(245,158,11,0.3)] animate-[fadeIn_0.5s_ease-out]">
            <svg className="w-10 h-10 text-white animate-[spin_3s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-300 rounded-full animate-[pulse_2s_infinite]"></div>
        </div>
      ), 
      titulo: 'Pago Pendiente', 
      texto: 'Estamos esperando la confirmación de la pasarela. Te avisaremos en cuanto el dinero se encuentre acreditado.',
      colorTexto: 'text-amber-600',
      colorFondo: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100',
      colorBorde: 'border-amber-500',
      colorBoton: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
      sombraBoton: 'shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.4)]',
      decoracion: 'rgba(245, 158, 11, 0.05)'
    },
    fallido: { 
      icono: (
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(239,68,68,0.3)] animate-[fadeIn_0.5s_ease-out]">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-300 rounded-full animate-[pulse_1s_infinite]"></div>
        </div>
      ), 
      titulo: 'Pago Rechazado', 
      texto: 'Hubo un problema procesando la transacción de tu recargo o prórroga. Ningún cargo fue efectuado.',
      colorTexto: 'text-red-600',
      colorFondo: 'bg-gradient-to-br from-red-50 via-rose-50 to-red-100',
      colorBorde: 'border-red-500',
      colorBoton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      sombraBoton: 'shadow-[0_8px_24px_rgba(239,68,68,0.3)] hover:shadow-[0_12px_32px_rgba(239,68,68,0.4)]',
      decoracion: 'rgba(239, 68, 68, 0.05)'
    }
  };

  const actual = configuracion[estado] || configuracion.fallido;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${actual.colorFondo} relative overflow-hidden`}>
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: actual.decoracion }}></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: actual.decoracion }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: actual.decoracion }}></div>
      </div>

      {/* Patron de cuadricula decorativa */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Tarjeta principal */}
      <div className={`bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] max-w-md w-full text-center border-t-4 ${actual.colorBorde} relative animate-[fadeIn_0.6s_ease-out] transition-all duration-500 hover:shadow-[0_25px_70px_rgba(0,0,0,0.15)]`}>
        
        {/* Efecto de brillo superior */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 rounded-full"></div>
        
        {/* Icono */}
        <div className="flex justify-center mb-6">
          {actual.icono}
        </div>
        
        {/* Titulo */}
        <h2 className={`text-3xl font-black mb-4 tracking-tight ${actual.colorTexto} animate-[fadeIn_0.8s_ease-out]`}>
          {actual.titulo}
        </h2>
        
        {/* Linea decorativa */}
        <div className={`w-16 h-1 mx-auto mb-6 rounded-full opacity-50 ${actual.colorTexto.replace('text-', 'bg-')}`}></div>
        
        {/* Texto descriptivo */}
        <p className="text-slate-600 mb-8 font-medium leading-relaxed text-base">
          {actual.texto}
        </p>
        
        {/* Informacion adicional segun estado */}
        {estado === 'pendiente' && (
          <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 animate-[pulse_3s_infinite]">
            <div className="flex items-center justify-center gap-2 text-amber-700 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold">Tiempo estimado: 2-5 minutos</span>
            </div>
          </div>
        )}
        
        {estado === 'fallido' && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-200">
            <p className="text-red-700 text-sm font-medium">
              Verifica los fondos o datos de tu cuenta e intenta nuevamente
            </p>
          </div>
        )}
        
        {estado === 'exitoso' && (
          <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-center gap-2 text-emerald-700 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold">Ecosistema de cobro actualizado</span>
            </div>
          </div>
        )}
        
        {/* Boton de accion controlado */}
        <button 
          onClick={() => window.location.href = '/'}
          className={`${actual.colorBoton} text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 w-full inline-block ${actual.sombraBoton} transform hover:-translate-y-0.5 active:scale-95 relative overflow-hidden group cursor-pointer`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Panel Central
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        </button>
        
        {/* Pie de pagina institucional */}
        <p className="mt-6 text-xs text-slate-400 font-medium">
          IES Nuevo Horizonte - Sistema de Estacionamiento Digital
        </p>
      </div>
    </div>
  );
}