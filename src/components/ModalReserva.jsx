import { useState, useEffect } from 'react';

export default function ModalReserva({ lugar, usuario, onClose, onConfirmar }) {
  const [patente, setPatente] = useState(usuario?.rol === 'USER' ? usuario.patenteHabitual || '' : '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [tipoPase, setTipoPase] = useState('1_HORA');
  const [turno, setTurno] = useState(usuario?.turnoCursado || 'MANIANA');
  const [monto, setMonto] = useState(500);

  const precios = {
    '1_HORA': 500,
    '2_HORAS': 900,
    '3_HORAS': 1200,
    '4_HORAS': 1500 
  };

  useEffect(() => {
    setMonto(precios[tipoPase]);
  }, [tipoPase]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patente) return alert("Por favor, ingresa una patente válida.");
    if (!email) return alert("Por favor, ingresa un email válido para el comprobante.");
    
    const patenteLimpia = patente.replace(/\s+/g, '').toUpperCase();

    // Disparamos la función que abre el simulador central en App.jsx
    onConfirmar(lugar.codigo, patenteLimpia, tipoPase, turno, monto);
  };

  if (!lugar) return null;

  const opcionesPase = [
    { value: '1_HORA', label: '1 Hora', icono: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { value: '2_HORAS', label: '2 Horas', icono: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { value: '3_HORAS', label: '3 Horas', icono: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { value: '4_HORAS', label: '4 Horas', icono: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )}
  ];

  const opcionesTurno = [
    { value: 'MANIANA', label: 'Mañana', icono: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { value: 'TARDE', label: 'Tarde', icono: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )},
    { value: 'NOCHE', label: 'Noche', icono: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )}
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-[100] animate-[fadeIn_0.3s_ease-out]">
      
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.4)] w-full max-w-md max-h-[95vh] overflow-y-auto relative border border-white/50 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400"></div>
        
        <div className="flex justify-between items-start border-b-2 border-slate-100 pb-5 mb-6 mt-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-[pulse_2s_infinite]"></div>
              <p className="text-xs font-bold text-blue-600 tracking-widest uppercase">Confirmación de Reserva</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Lugar Asignado 
              <span className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-3 py-1 rounded-xl ml-2 border-2 border-blue-200 shadow-sm inline-block">
                {lugar.codigo}
              </span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-90 hover:scale-110 shadow-sm group mt-1 flex-shrink-0 cursor-pointer"
            title="Cancelar Operación"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Dominio / Patente</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              </div>
              <input 
                type="text" 
                className={`w-full pl-12 pr-5 py-4 border-2 rounded-2xl uppercase text-center text-xl font-black tracking-[0.2em] shadow-inner transition-all duration-300
                  ${usuario?.rol === 'USER' 
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-300 cursor-not-allowed' 
                    : 'bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-800 hover:border-slate-300'}`} 
                placeholder="Ej: AB123CD" 
                value={patente} 
                onChange={(e) => setPatente(e.target.value)} 
                maxLength="9"
                required 
                readOnly={usuario?.rol === 'USER'}
              />
            </div>
            {usuario?.rol === 'USER' && (
              <div className="flex items-center justify-center gap-2 mt-2.5 animate-[fadeIn_0.4s_ease-out]">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">
                  Patente oficial vinculada a tu perfil
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Tiempo de Estadía</label>
              <div className="relative">
                <select 
                  className="w-full pl-10 pr-10 py-3.5 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-slate-50 font-bold text-slate-700 text-sm transition-all duration-300 cursor-pointer shadow-sm appearance-none hover:border-slate-300"
                  value={tipoPase}
                  onChange={(e) => setTipoPase(e.target.value)}
                >
                  {opcionesPase.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {opcionesPase.find(o => o.value === tipoPase)?.icono}
                </div>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Turno Asignado</label>
              <div className="relative">
                <select 
                  className="w-full pl-10 pr-10 py-3.5 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-slate-50 font-bold text-slate-700 text-sm transition-all duration-300 cursor-pointer shadow-sm appearance-none hover:border-slate-300"
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                >
                  {opcionesTurno.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {opcionesTurno.find(o => o.value === turno)?.icono}
                </div>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email para el comprobante</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="email" 
                className="w-full pl-12 pr-5 py-3.5 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 bg-white font-bold text-slate-700 text-sm transition-all duration-300 shadow-sm hover:border-slate-300"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 rounded-2xl mt-2 flex justify-between items-center border border-slate-700 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-xs block mb-1">Total a abonar:</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest bg-sky-500/20 text-sky-300">
                Pasarela del Sistema
              </span>
            </div>
            <div>
              <span className="text-4xl font-black text-white tracking-tight">${monto.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button 
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/3 py-4 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-700 transition-all duration-300 border-2 border-transparent hover:border-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-2/3 py-4 rounded-2xl text-white font-black text-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-[0_10px_30px_rgba(14,165,233,0.3)] cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Simular Pago
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}