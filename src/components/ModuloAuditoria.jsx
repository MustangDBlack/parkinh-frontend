import { useState, useMemo, Fragment } from 'react';

export default function ModuloAuditoria({ reservas }) {
  const [patenteExpandida, setPatenteExpandida] = useState(null);
  const [busquedaPatente, setBusquedaPatente] = useState('');
  const [filtroComportamiento, setFiltroComportamiento] = useState('TODOS'); 
  const [mostrarTickets, setMostrarTickets] = useState(false);
  const [cargandoFicha, setCargandoFicha] = useState(false);

  const handleExpandirFicha = (patente) => {
    if (patenteExpandida === patente) {
      setPatenteExpandida(null);
      setMostrarTickets(false);
    } else {
      setCargandoFicha(true);
      setPatenteExpandida(patente);
      setMostrarTickets(false);
      setTimeout(() => setCargandoFicha(false), 300);
    }
  };

  const reservasCompletadas = useMemo(() => {
    return reservas.filter(r => r.horaSalida != null);
  }, [reservas]);

  const auditoriaVehiculos = useMemo(() => {
    const agrupado = {};
    reservasCompletadas.forEach(reserva => {
      if (!reserva.patente) return;
      const pat = reserva.patente.toUpperCase();
      const monto = reserva.montoTotal || 0;
      
      if (!agrupado[pat]) {
        agrupado[pat] = { 
          patente: pat, 
          totalGastado: 0, 
          totalMultas: 0, 
          operaciones: 0, 
          historial: [],
          datosInstitucionales: {
            username: reserva.usuario?.username || 'USUARIO_NO_VINCULADO',
            tipoPerfil: reserva.usuario?.tipoPerfil || 'PARTICULAR',
            carrera: reserva.usuario?.carrera || 'N/A',
            turnoCursado: reserva.usuario?.turnoCursado || 'N/A',
            curso: reserva.usuario?.curso || '-',
            comision: reserva.usuario?.comision || '-',
            whatsapp: reserva.usuario?.whatsapp || 'SIN REGISTRO'
          }
        };
      }
      
      agrupado[pat].totalGastado += monto;
      agrupado[pat].operaciones += 1;
      
      if (reserva.horaFinEsperada) {
        const difMinutos = (new Date(reserva.horaSalida) - new Date(reserva.horaFinEsperada)) / (1000 * 60);
        if (difMinutos > 15 && monto > 500) agrupado[pat].totalMultas += (monto - 500);
      }
      agrupado[pat].historial.push(reserva);
    });

    return Object.values(agrupado).sort((a, b) => b.totalGastado - a.totalGastado);
  }, [reservasCompletadas]);

  const auditoriaFiltrada = useMemo(() => {
    return auditoriaVehiculos.filter(vehiculo => {
      const coincidePatente = vehiculo.patente.includes(busquedaPatente.trim().toUpperCase());
      const coincideComportamiento = 
        filtroComportamiento === 'TODOS' ? true :
        filtroComportamiento === 'INFRACTOR' ? vehiculo.totalMultas > 0 :
        vehiculo.totalMultas === 0;
      return coincidePatente && coincideComportamiento;
    });
  }, [auditoriaVehiculos, busquedaPatente, filtroComportamiento]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden fade-in">
      
      {/* CABECERA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-blue-600/10 to-blue-800/5"></div>
        <div className="relative p-3 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl font-black text-gray-800 tracking-tight">Directorio de Usuarios</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                <span className="font-bold text-blue-600">{auditoriaFiltrada.length}</span> de <span className="font-bold">{auditoriaVehiculos.length}</span> perfiles
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none z-10">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Buscar Patente..." 
                value={busquedaPatente} 
                onChange={(e) => setBusquedaPatente(e.target.value)} 
                className="pl-9 sm:pl-10 pr-4 py-2.5 text-xs sm:text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 w-full bg-white transition-all duration-300"
              />
            </div>
            <div className="relative w-full sm:w-44">
              <select 
                value={filtroComportamiento} 
                onChange={(e) => setFiltroComportamiento(e.target.value)} 
                className="w-full px-3 sm:px-4 py-2.5 text-xs sm:text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-gray-700 font-medium bg-white transition-all duration-300 appearance-none pr-8 sm:pr-10 cursor-pointer"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="INFRACTOR">Solo Infractores</option>
                <option value="EJEMPLAR">Solo Ejemplares</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA - Versión mobile con tarjetas, desktop con tabla */}
      
      {/* Vista Mobile: Tarjetas */}
      <div className="block sm:hidden divide-y divide-gray-100">
        {auditoriaFiltrada.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="font-black text-gray-700 text-base mb-1">Sin resultados</p>
            <p className="text-gray-400 text-xs">Ajustá los filtros de búsqueda</p>
          </div>
        ) : (
          auditoriaFiltrada.map((vehiculo, index) => {
            const { datosInstitucionales } = vehiculo;
            return (
              <div key={vehiculo.patente} className="p-3 space-y-3 animate-[fadeIn_0.3s_ease-out]" style={{ animationDelay: `${index * 0.05}s` }}>
                
                {/* Fila principal */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-gradient-to-b from-white to-gray-50 text-gray-900 px-3 py-1.5 rounded-lg font-mono text-sm font-black tracking-wider border-2 border-gray-800 shadow-sm">
                      {vehiculo.patente}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{datosInstitucionales.username}</p>
                      <p className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded-lg mt-0.5 uppercase ${
                        datosInstitucionales.tipoPerfil === 'ALUMNO' ? 'bg-blue-100 text-blue-700' :
                        datosInstitucionales.tipoPerfil === 'DOCENTE' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{datosInstitucionales.tipoPerfil}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleExpandirFicha(vehiculo.patente)} 
                    className={`px-3 py-2 rounded-lg font-black text-[10px] transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 ${
                      patenteExpandida === vehiculo.patente
                        ? 'bg-gray-800 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {patenteExpandida === vehiculo.patente ? 'CERRAR' : 'VER'}
                  </button>
                </div>
                
                {/* Info secundaria */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">
                    {vehiculo.operaciones} ingresos
                  </span>
                  {vehiculo.totalMultas > 0 ? (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-lg font-bold border border-red-200 text-[10px]">
                      Deuda: ${vehiculo.totalMultas.toLocaleString('es-AR')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg font-bold border border-emerald-200 text-[10px]">
                      Al Día
                    </span>
                  )}
                </div>

                {/* Acordeón expandido en mobile */}
                {patenteExpandida === vehiculo.patente && (
                  <div className="pt-2 border-t border-gray-100 space-y-3 animate-[expandDown_0.3s_ease-out] origin-top">
                    
                    {cargandoFicha ? (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="space-y-3">
                          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-3/4 animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]"></div>
                          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-1/2 animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Datos del usuario */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-black text-blue-700 text-sm flex-shrink-0">
                              {datosInstitucionales.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-black text-gray-800">{datosInstitucionales.username}</p>
                              <p className="text-[10px] text-gray-500">#{vehiculo.patente}</p>
                            </div>
                          </div>
                          
                          {datosInstitucionales.tipoPerfil !== 'PARTICULAR' && (
                            <div className="bg-blue-50 p-3 rounded-xl text-xs">
                              <p className="text-gray-500 font-bold uppercase text-[10px] mb-1">Carrera</p>
                              <p className="font-bold text-gray-800">{datosInstitucionales.carrera}</p>
                            </div>
                          )}
                          
                          {datosInstitucionales.tipoPerfil === 'ALUMNO' && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-gray-50 p-2.5 rounded-xl">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Turno</p>
                                <p className="font-bold text-gray-800 text-xs">{datosInstitucionales.turnoCursado}</p>
                              </div>
                              <div className="bg-gray-50 p-2.5 rounded-xl">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Año / Com.</p>
                                <p className="font-bold text-gray-800 text-xs">{datosInstitucionales.curso}° - {datosInstitucionales.comision}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="bg-green-50 p-3 rounded-xl">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">WhatsApp</p>
                            <p className="font-bold text-green-700 text-xs">{datosInstitucionales.whatsapp}</p>
                          </div>
                          
                          {vehiculo.totalMultas > 0 ? (
                            <div className="bg-red-50 p-3 rounded-xl text-center">
                              <p className="font-black text-red-700 text-sm">Deuda: ${vehiculo.totalMultas.toLocaleString('es-AR')}</p>
                            </div>
                          ) : (
                            <div className="bg-emerald-50 p-3 rounded-xl text-center">
                              <p className="font-black text-emerald-700 text-sm">Activo y al día</p>
                            </div>
                          )}
                        </div>

                        {/* Botón tickets */}
                        <button 
                          onClick={() => setMostrarTickets(!mostrarTickets)}
                          className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <svg className={`w-4 h-4 transition-transform ${mostrarTickets ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                          {mostrarTickets ? 'Ocultar Tickets' : `Ver Tickets (${vehiculo.historial.length})`}
                        </button>

                        {/* Tickets en mobile */}
                        {mostrarTickets && (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {vehiculo.historial.slice().reverse().map(ticket => (
                              <div key={ticket.id} className="bg-white border-2 border-dashed border-gray-300 p-3 rounded-xl text-xs">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-black text-gray-800">#{ticket.id}</span>
                                  <span className="text-gray-500">{new Date(ticket.horaSalida).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Lugar: <b>{ticket.cochera?.codigo}</b></span>
                                  <span className={`font-black ${ticket.montoTotal > 500 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    ${ticket.montoTotal.toLocaleString('es-AR')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Vista Desktop: Tabla */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="min-w-[700px] lg:min-w-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 text-gray-500 text-xs uppercase tracking-wider border-y-2 border-gray-100">
                <th className="p-3 lg:p-4 font-bold">Dominio / Patente</th>
                <th className="p-3 lg:p-4 font-bold">Usuario / Matrícula</th>
                <th className="p-3 lg:p-4 font-bold text-center">Ingresos</th>
                <th className="p-3 lg:p-4 font-bold text-center">Comportamiento</th>
                <th className="p-3 lg:p-4 font-bold text-center">Perfil</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {auditoriaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="font-black text-gray-700 text-lg mb-1">Sin resultados</p>
                      <p className="text-gray-400 text-sm">No se encontraron perfiles con los filtros actuales.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                auditoriaFiltrada.map((vehiculo, index) => {
                  const { datosInstitucionales } = vehiculo;
                  return (
                    <Fragment key={vehiculo.patente}>
                      <tr className="hover:bg-blue-50/20 transition-all duration-200 group">
                        <td className="p-3 lg:p-4">
                          <div className="bg-gradient-to-b from-white to-gray-50 text-gray-900 px-3 py-1.5 rounded-lg font-mono text-xs font-black tracking-wider border-2 border-gray-800 shadow-sm inline-block">
                            {vehiculo.patente}
                          </div>
                        </td>
                        <td className="p-3 lg:p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-black text-blue-700 text-xs flex-shrink-0">
                              {datosInstitucionales.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{datosInstitucionales.username}</p>
                              <p className={`text-[10px] font-bold inline-block px-1.5 py-0.5 rounded-md mt-0.5 uppercase ${
                                datosInstitucionales.tipoPerfil === 'ALUMNO' ? 'bg-blue-100 text-blue-700' :
                                datosInstitucionales.tipoPerfil === 'DOCENTE' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>{datosInstitucionales.tipoPerfil}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 lg:p-4 text-center">
                          <span className="font-black text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg text-sm">
                            {vehiculo.operaciones}
                          </span>
                        </td>
                        <td className="p-3 lg:p-4 text-center">
                          {vehiculo.totalMultas > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-lg font-bold text-xs border border-red-200 pulse-debt">
                              Deuda: ${vehiculo.totalMultas.toLocaleString('es-AR')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold text-xs border border-emerald-200">
                              Al Día
                            </span>
                          )}
                        </td>
                        <td className="p-3 lg:p-4 text-center">
                          <button 
                            onClick={() => handleExpandirFicha(vehiculo.patente)} 
                            className={`px-4 py-2 rounded-lg font-black text-xs transition-all duration-300 active:scale-95 ${
                              patenteExpandida === vehiculo.patente
                                ? 'bg-gray-800 text-white'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {patenteExpandida === vehiculo.patente ? 'CERRAR' : 'VER CREDENCIAL'}
                          </button>
                        </td>
                      </tr>

                      {/* Acordeón expandido en desktop */}
                      {patenteExpandida === vehiculo.patente && (
                        <tr className="bg-gradient-to-b from-blue-50/30 via-white to-white">
                          <td colSpan="5" className="p-4 lg:p-6 border-l-4 border-blue-600">
                            {cargandoFicha ? (
                              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl animate-[shimmer_1.5s_infinite] bg-[length:200%_100%] flex-shrink-0"></div>
                                  <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-3/4 animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]"></div>
                                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-1/2 animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]"></div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="animate-[expandDown_0.4s_ease-out] origin-top">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                                  
                                  <div className="hidden md:block w-1.5 bg-gradient-to-b from-blue-600 to-blue-800 flex-shrink-0"></div>

                                  <div className="p-4 sm:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 bg-gradient-to-b from-gray-50 to-white md:min-w-[180px] relative">
                                    <div className="w-24 h-32 sm:w-28 sm:h-36 bg-gradient-to-br from-gray-100 to-white border-2 border-gray-300 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                                      <svg className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                    <span className={`mt-3 text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border ${
                                      datosInstitucionales.tipoPerfil === 'ALUMNO' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                      datosInstitucionales.tipoPerfil === 'DOCENTE' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                      'bg-gray-200 text-gray-800 border-gray-300'
                                    }`}>{datosInstitucionales.tipoPerfil}</span>
                                  </div>

                                  <div className="p-4 sm:p-6 flex-1">
                                    <div className="flex justify-between items-start border-b-2 border-gray-200 pb-3 mb-3">
                                      <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-gray-900">{datosInstitucionales.username}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase">ID:</span>
                                          <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-lg text-xs">#{vehiculo.patente}</span>
                                        </div>
                                      </div>
                                      <div className="text-right hidden sm:block">
                                        <p className="text-xs sm:text-sm text-blue-700 font-black uppercase tracking-widest">IES NUEVO HORIZONTE</p>
                                        <p className="text-[10px] text-gray-400 font-bold tracking-widest">CREDENCIAL DIGITAL</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                                      {datosInstitucionales.tipoPerfil !== 'PARTICULAR' && (
                                        <div className="col-span-1 sm:col-span-2 bg-blue-50 p-2.5 sm:p-3 rounded-xl border border-blue-100">
                                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Carrera / Especialidad</p>
                                          <p className="font-bold text-xs sm:text-sm text-gray-800 uppercase">{datosInstitucionales.carrera}</p>
                                        </div>
                                      )}
                                      
                                      {datosInstitucionales.tipoPerfil === 'ALUMNO' && (
                                        <>
                                          <div className="bg-gray-50 p-2.5 sm:p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Turno</p>
                                            <p className="font-bold text-xs sm:text-sm text-gray-800 uppercase">{datosInstitucionales.turnoCursado}</p>
                                          </div>
                                          <div className="bg-gray-50 p-2.5 sm:p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Año y Comisión</p>
                                            <p className="font-bold text-xs sm:text-sm text-gray-800 uppercase">{datosInstitucionales.curso}° - Com. "{datosInstitucionales.comision}"</p>
                                          </div>
                                        </>
                                      )}

                                      <div className="col-span-1 sm:col-span-2 bg-green-50 p-2.5 sm:p-3 rounded-xl border border-green-100">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">WhatsApp</p>
                                        <p className="font-bold text-xs sm:text-sm text-green-700">{datosInstitucionales.whatsapp}</p>
                                      </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200 flex justify-between items-end">
                                      <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Patente Autorizada</p>
                                        <p className="font-black text-lg sm:text-xl text-blue-700 uppercase tracking-wider">{vehiculo.patente}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Estado</p>
                                        {vehiculo.totalMultas > 0 ? (
                                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 font-black px-3 py-1.5 rounded-xl text-xs border border-red-200 pulse-debt">
                                            Deuda: ${vehiculo.totalMultas.toLocaleString('es-AR')}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-black px-3 py-1.5 rounded-xl text-xs border border-emerald-200">
                                            Al Día
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Botón tickets */}
                                <div className="mt-4 text-center">
                                  <button 
                                    onClick={() => setMostrarTickets(!mostrarTickets)}
                                    className="bg-gray-800 hover:bg-gray-900 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 mx-auto"
                                  >
                                    <svg className={`w-4 h-4 transition-transform ${mostrarTickets ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    {mostrarTickets ? 'Ocultar Tickets' : `Ver Tickets (${vehiculo.historial.length})`}
                                  </button>
                                </div>

                                {/* Tickets */}
                                {mostrarTickets && (
                                  <div className="mt-4 bg-gray-50 p-3 sm:p-4 rounded-2xl border border-gray-200 animate-[expandDown_0.4s_ease-out] origin-top">
                                    <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                                        {vehiculo.historial.slice().reverse().map(ticket => (
                                          <div key={ticket.id} className="bg-white border-2 border-dashed border-gray-300 p-3 rounded-xl text-xs hover:shadow-md transition-all">
                                            <div className="flex justify-between items-center mb-2">
                                              <span className="font-black text-gray-800">#{ticket.id}</span>
                                              <span className="text-gray-500 text-[10px]">{new Date(ticket.horaSalida).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <span className="text-gray-500">Lugar: <b>{ticket.cochera?.codigo}</b></span>
                                              <span className={`font-black ${ticket.montoTotal > 500 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                ${ticket.montoTotal.toLocaleString('es-AR')}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ESTILOS */}
      <style jsx>{`
        .pulse-debt {
          animation: pulseRed 2s infinite;
        }
        
        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}