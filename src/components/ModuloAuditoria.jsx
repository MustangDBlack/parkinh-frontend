import { useState, useMemo, Fragment } from 'react';

export default function ModuloAuditoria({ reservas }) {
  const [patenteExpandida, setPatenteExpandida] = useState(null);
  const [busquedaPatente, setBusquedaPatente] = useState('');
  const [filtroComportamiento, setFiltroComportamiento] = useState('TODOS'); 
  const [mostrarTickets, setMostrarTickets] = useState(false);
  const [cargandoFicha, setCargandoFicha] = useState(false);
  
  // Estado para la paginación de tickets por vehículo (clave: patente, valor: número de página)
  const [paginasTickets, setPaginasTickets] = useState({});

  const TICKETS_POR_PAGINA = 5;

  const handleExpandirFicha = (patente) => {
    if (patenteExpandida === patente) {
      setPatenteExpandida(null);
      setMostrarTickets(false);
    } else {
      setCargandoFicha(true);
      setPatenteExpandida(patente);
      setMostrarTickets(false);
      // Reiniciar a la página 1 al abrir
      setPaginasTickets(prev => ({ ...prev, [patente]: 1 }));
      setTimeout(() => setCargandoFicha(false), 300);
    }
  };

  const cambiarPagina = (patente, nuevaPagina) => {
    setPaginasTickets(prev => ({ ...prev, [patente]: nuevaPagina }));
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
      const tieneDeuda = reserva.estadoPago === 'PENDIENTE';
      
      if (!agrupado[pat]) {
        agrupado[pat] = { 
          patente: pat, 
          totalGastado: 0, 
          deudaActiva: 0, 
          operaciones: 0, 
          todosLosTickets: [],
          datosInstitucionales: {
            username: reserva.usuario?.username || 'USUARIO_NO_VINCULADO',
            nombre: reserva.usuario?.nombre || '',
            apellido: reserva.usuario?.apellido || '',
            tipoPerfil: reserva.usuario?.tipoPerfil || 'PARTICULAR',
            carrera: reserva.usuario?.carrera || 'N/A',
            turnoCursado: reserva.usuario?.turnoCursado || 'N/A',
            curso: reserva.usuario?.curso || '-',
            comision: reserva.usuario?.comision || '-',
            whatsapp: reserva.usuario?.whatsapp || 'SIN REGISTRO'
          }
        };
      }
      
      agrupado[pat].operaciones += 1;
      agrupado[pat].todosLosTickets.push(reserva);
      
      if (tieneDeuda) {
        agrupado[pat].deudaActiva += monto;
      } else {
        agrupado[pat].totalGastado += monto;
      }
    });

    Object.values(agrupado).forEach(vehiculo => {
      vehiculo.todosLosTickets.sort((a, b) => b.id - a.id);
    });

    return Object.values(agrupado).sort((a, b) => b.totalGastado - a.totalGastado);
  }, [reservasCompletadas]);

  const auditoriaFiltrada = useMemo(() => {
    return auditoriaVehiculos.filter(vehiculo => {
      const coincidePatente = vehiculo.patente.includes(busquedaPatente.trim().toUpperCase());
      const coincideComportamiento = 
        filtroComportamiento === 'TODOS' ? true :
        filtroComportamiento === 'INFRACTOR' ? vehiculo.deudaActiva > 0 :
        vehiculo.deudaActiva === 0;
      return coincidePatente && coincideComportamiento;
    });
  }, [auditoriaVehiculos, busquedaPatente, filtroComportamiento]);

  // Función para formatear el tiempo excedido en Horas y Minutos
  const formatearTiempoExcedido = (ms) => {
    const totalMinutos = Math.floor(ms / (1000 * 60));
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    if (horas === 0) return `${minutos} minutos`;
    if (minutos === 0) return `${horas} hora${horas > 1 ? 's' : ''}`;
    return `${horas} hora${horas > 1 ? 's' : ''} y ${minutos} minutos`;
  };

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
                className="pl-9 sm:pl-10 pr-4 py-2.5 text-xs sm:text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 w-full bg-white transition-all duration-300 uppercase"
              />
            </div>
            <div className="relative w-full sm:w-44">
              <select 
                value={filtroComportamiento} 
                onChange={(e) => setFiltroComportamiento(e.target.value)} 
                className="w-full px-3 sm:px-4 py-2.5 text-xs sm:text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-gray-700 font-medium bg-white transition-all duration-300 appearance-none pr-8 sm:pr-10 cursor-pointer"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="INFRACTOR">Solo con Deuda</option>
                <option value="EJEMPLAR">Solo Al Día</option>
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
            const nombreCompleto = datosInstitucionales.nombre && datosInstitucionales.apellido 
              ? `${datosInstitucionales.nombre} ${datosInstitucionales.apellido}` 
              : datosInstitucionales.username;

            const paginaActual = paginasTickets[vehiculo.patente] || 1;
            const totalPaginas = Math.ceil(vehiculo.todosLosTickets.length / TICKETS_POR_PAGINA) || 1;
            const ticketsPaginados = vehiculo.todosLosTickets.slice(
              (paginaActual - 1) * TICKETS_POR_PAGINA,
              paginaActual * TICKETS_POR_PAGINA
            );

            return (
              <div key={vehiculo.patente} className="p-3 space-y-3 animate-[fadeIn_0.3s_ease-out]" style={{ animationDelay: `${index * 0.05}s` }}>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-gradient-to-b from-white to-gray-50 text-gray-900 px-3 py-1.5 rounded-lg font-mono text-sm font-black tracking-wider border-2 border-gray-800 shadow-sm">
                      {vehiculo.patente}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{nombreCompleto}</p>
                      <p className="text-[11px] text-gray-400 font-medium">@{datosInstitucionales.username}</p>
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
                
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">
                    {vehiculo.operaciones} ingresos
                  </span>
                  {vehiculo.deudaActiva > 0 ? (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-lg font-black border border-red-200 text-[10px]">
                      🔴 Deuda: ${vehiculo.deudaActiva.toLocaleString('es-AR')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg font-black border border-emerald-200 text-[10px]">
                      🟢 Al Día
                    </span>
                  )}
                </div>

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
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-black text-blue-700 text-sm flex-shrink-0">
                              {nombreCompleto.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-black text-gray-800">{nombreCompleto}</p>
                              <p className="text-[10px] text-gray-500">Patente: #{vehiculo.patente}</p>
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
                          
                          {vehiculo.deudaActiva > 0 ? (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-center shadow-inner">
                              <p className="text-[10px] font-bold text-red-600 uppercase mb-0.5">Usuario Inhabilitado</p>
                              <p className="font-black text-red-700 text-sm">Deuda Total: ${vehiculo.deudaActiva.toLocaleString('es-AR')}</p>
                            </div>
                          ) : (
                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                              <p className="font-black text-emerald-700 text-sm">🟢 Activo y al día</p>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => setMostrarTickets(!mostrarTickets)}
                          className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <svg className={`w-4 h-4 transition-transform ${mostrarTickets ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </svg>
                          {mostrarTickets ? 'Ocultar Historial' : `Ver Historial Unificado (${vehiculo.operaciones})`}
                        </button>

                        {/* Historial Paginado en Mobile */}
                        {mostrarTickets && (
                          <div className="space-y-3 pb-2">
                            <div className="flex justify-between items-center bg-slate-100 py-1.5 px-3 rounded-lg text-[11px] font-black text-slate-600">
                              <span>📋 Historial (Pág. {paginaActual} de {totalPaginas})</span>
                              <span>Total: {vehiculo.todosLosTickets.length}</span>
                            </div>

                            {ticketsPaginados.map(ticket => {
                              const esDeuda = ticket.estadoPago === 'PENDIENTE';
                              const montoTotal = ticket.montoTotal || 0;
                              const tarifaBase = montoTotal > 500 ? 500 : montoTotal;
                              const multaExceso = montoTotal > 500 ? montoTotal - 500 : 0;

                              let tiempoExcedidoTexto = '';
                              if (ticket.horaSalida && ticket.horaFinEsperada) {
                                const diffMs = new Date(ticket.horaSalida) - new Date(ticket.horaFinEsperada);
                                if (diffMs > 0) {
                                  tiempoExcedidoTexto = formatearTiempoExcedido(diffMs);
                                }
                              }

                              const horaEntradaFormateada = ticket.horaEntrada || ticket.createdAt 
                                ? new Date(ticket.horaEntrada || ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) 
                                : 'N/A';

                              const horaSalidaFormateada = ticket.horaSalida 
                                ? new Date(ticket.horaSalida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) 
                                : 'Activo';

                              return (
                                <div 
                                  key={ticket.id} 
                                  className={`bg-white border-2 p-3.5 rounded-xl text-xs shadow-sm space-y-2 relative overflow-hidden ${
                                    esDeuda ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                                  }`}
                                >
                                  <div className={`absolute top-0 left-0 w-1.5 h-full ${esDeuda ? 'bg-red-600' : 'bg-emerald-500'}`}></div>
                                  
                                  <div className="flex justify-between items-center pl-2">
                                    <span className="font-black text-gray-900">Ticket #{ticket.id}</span>
                                    <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
                                      esDeuda ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                      {esDeuda ? 'PENDIENTE' : 'PAGADO'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-1 pl-2 text-[11px] text-slate-600 pt-1 border-t border-gray-100">
                                    <div>Cajón: <b className="text-slate-800">{ticket.cochera?.codigo || 'N/A'}</b></div>
                                    {/* 🚀 CORRECCIÓN: Reemplazamos guiones bajos por espacios para mostrar "4 HORAS" */}
                                    <div>Pase: <b className="text-slate-800 uppercase">{ticket.tipoPase ? ticket.tipoPase.replace('_', ' ') : 'ESTANDAR'}</b></div>
                                    <div className="col-span-2 bg-slate-50 p-1.5 rounded border border-slate-200 mt-1 flex justify-between">
                                      <span>📥 Ingreso: <b>{horaEntradaFormateada}</b></span>
                                      <span>📤 Egreso: <b>{horaSalidaFormateada}</b></span>
                                    </div>
                                  </div>

                                  <div className={`p-2.5 rounded-lg space-y-1 mt-2 pl-2 border text-[11px] ${
                                    esDeuda ? 'bg-red-50 border-red-200 text-red-900' : 'bg-gray-50 border-gray-200 text-slate-700'
                                  }`}>
                                    <div className="flex justify-between">
                                      <span>Tarifa Base / Reserva:</span>
                                      <span className="font-bold">${tarifaBase.toLocaleString('es-AR')}</span>
                                    </div>
                                    {multaExceso > 0 && (
                                      <div className="flex justify-between text-red-600 font-semibold pt-1 border-t border-red-200">
                                        <span>Multa ({tiempoExcedidoTexto} de exceso):</span>
                                        <span>+${multaExceso.toLocaleString('es-AR')}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 font-black text-xs">
                                      <span>Total del Ticket:</span>
                                      <span className={esDeuda ? 'text-red-700 text-sm' : 'text-emerald-700'}>
                                        ${montoTotal.toLocaleString('es-AR')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {/* CONTROLES DE PAGINACIÓN MOBILE */}
                            {totalPaginas > 1 && (
                              <div className="flex items-center justify-between pt-2">
                                <button
                                  disabled={paginaActual === 1}
                                  onClick={() => cambiarPagina(vehiculo.patente, paginaActual - 1)}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold rounded-lg text-xs disabled:opacity-40"
                                >
                                  Anterior
                                </button>
                                <span className="text-xs font-bold text-gray-500">Pág {paginaActual} de {totalPaginas}</span>
                                <button
                                  disabled={paginaActual === totalPaginas}
                                  onClick={() => cambiarPagina(vehiculo.patente, paginaActual + 1)}
                                  className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs disabled:opacity-40"
                                >
                                  Siguiente
                                </button>
                              </div>
                            )}
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
                <th className="p-3 lg:p-4 font-bold">Usuario / Nombre y Apellido</th>
                <th className="p-3 lg:p-4 font-bold text-center">Ingresos</th>
                <th className="p-3 lg:p-4 font-bold text-center">Estado Operativo</th>
                <th className="p-3 lg:p-4 font-bold text-center">Acción</th>
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
                auditoriaFiltrada.map((vehiculo) => {
                  const { datosInstitucionales } = vehiculo;
                  const nombreCompleto = datosInstitucionales.nombre && datosInstitucionales.apellido 
                    ? `${datosInstitucionales.nombre} ${datosInstitucionales.apellido}` 
                    : datosInstitucionales.username;

                  const paginaActual = paginasTickets[vehiculo.patente] || 1;
                  const totalPaginas = Math.ceil(vehiculo.todosLosTickets.length / TICKETS_POR_PAGINA) || 1;
                  const ticketsPaginados = vehiculo.todosLosTickets.slice(
                    (paginaActual - 1) * TICKETS_POR_PAGINA,
                    paginaActual * TICKETS_POR_PAGINA
                  );

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
                              {nombreCompleto.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{nombreCompleto}</p>
                              <p className="text-[11px] text-gray-400 font-medium">@{datosInstitucionales.username}</p>
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
                          {vehiculo.deudaActiva > 0 ? (
                            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl font-black text-xs border border-red-200 pulse-debt shadow-sm">
                              🔴 Deuda: ${vehiculo.deudaActiva.toLocaleString('es-AR')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-black text-xs border border-emerald-200">
                              🟢 Al Día
                            </span>
                          )}
                        </td>
                        
                        <td className="p-3 lg:p-4 text-center">
                          <button 
                            onClick={() => handleExpandirFicha(vehiculo.patente)} 
                            className={`px-4 py-2 rounded-lg font-black text-xs transition-all duration-300 active:scale-95 ${
                              patenteExpandida === vehiculo.patente
                                ? 'bg-gray-800 text-white shadow-inner'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            }`}
                          >
                            {patenteExpandida === vehiculo.patente ? 'CERRAR' : 'VER CREDENCIAL'}
                          </button>
                        </td>
                      </tr>

                      {patenteExpandida === vehiculo.patente && (
                        <tr className="bg-gradient-to-b from-blue-50/30 via-white to-white">
                          <td colSpan="5" className={`p-4 lg:p-6 border-l-4 ${vehiculo.deudaActiva > 0 ? 'border-red-500' : 'border-emerald-500'}`}>
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
                              <div className="animate-[expandDown_0.4s_ease-out] origin-top space-y-4">
                                
                                {/* Credencial Principal Desktop */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                                  
                                  <div className={`hidden md:block w-1.5 flex-shrink-0 ${vehiculo.deudaActiva > 0 ? 'bg-red-500' : 'bg-gradient-to-b from-blue-600 to-blue-800'}`}></div>

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
                                        <h3 className="text-xl sm:text-2xl font-black text-gray-900">{nombreCompleto}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase">Usuario:</span>
                                          <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-lg text-xs">@{datosInstitucionales.username}</span>
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
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Estado Operativo</p>
                                        {vehiculo.deudaActiva > 0 ? (
                                          <span className="inline-flex flex-col items-end gap-0.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-200 pulse-debt shadow-sm">
                                            <span className="font-black text-[10px] uppercase">🔴 Inhabilitado</span>
                                            <span className="font-black text-sm">Deuda: ${vehiculo.deudaActiva.toLocaleString('es-AR')}</span>
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-black px-4 py-2 rounded-xl text-sm border border-emerald-200">
                                            🟢 Al Día
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-center pt-2">
                                  <button 
                                    onClick={() => setMostrarTickets(!mostrarTickets)}
                                    className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 mx-auto shadow-md hover:shadow-lg"
                                  >
                                    <svg className={`w-4 h-4 transition-transform ${mostrarTickets ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    {mostrarTickets ? 'Ocultar Historial' : `Ver Historial Unificado (${vehiculo.operaciones})`}
                                  </button>
                                </div>

                                {/* Historial Paginado en Desktop */}
                                {mostrarTickets && (
                                  <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 animate-[expandDown_0.4s_ease-out] origin-top space-y-3">
                                    <div className="flex justify-between items-center bg-slate-100 py-2 px-3 rounded-lg border border-slate-200 text-xs font-black text-slate-600">
                                      <span>📋 Historial Completo de Operaciones (Pág. {paginaActual} de {totalPaginas})</span>
                                      <span>Total Registros: {vehiculo.todosLosTickets.length}</span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {ticketsPaginados.map(ticket => {
                                        const esDeuda = ticket.estadoPago === 'PENDIENTE';
                                        const montoTotal = ticket.montoTotal || 0;
                                        const tarifaBase = montoTotal > 500 ? 500 : montoTotal;
                                        const multaExceso = montoTotal > 500 ? montoTotal - 500 : 0;

                                        let tiempoExcedidoTexto = '';
                                        if (ticket.horaSalida && ticket.horaFinEsperada) {
                                          const diffMs = new Date(ticket.horaSalida) - new Date(ticket.horaFinEsperada);
                                          if (diffMs > 0) {
                                            tiempoExcedidoTexto = formatearTiempoExcedido(diffMs);
                                          }
                                        }

                                        const horaEntradaFormateada = ticket.horaEntrada || ticket.createdAt 
                                          ? new Date(ticket.horaEntrada || ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) 
                                          : 'N/A';

                                        const horaSalidaFormateada = ticket.horaSalida 
                                          ? new Date(ticket.horaSalida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) 
                                          : 'Activo';

                                        return (
                                          <div 
                                            key={ticket.id} 
                                            className={`bg-white border-2 p-4 rounded-xl shadow-sm space-y-2 relative overflow-hidden transition-all ${
                                              esDeuda ? 'border-red-400 bg-red-50/10' : 'border-gray-200'
                                            }`}
                                          >
                                            <div className={`absolute top-0 left-0 w-1.5 h-full ${esDeuda ? 'bg-red-600' : 'bg-emerald-500'}`}></div>

                                            <div className="flex justify-between items-center pl-2">
                                              <span className="font-black text-gray-900 text-xs">Ticket #{ticket.id}</span>
                                              <span className={`font-black px-2.5 py-0.5 rounded text-[10px] ${
                                                esDeuda ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                              }`}>
                                                {esDeuda ? 'PENDIENTE (DEUDA)' : 'PAGADO'}
                                              </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 pl-2 text-xs text-slate-600 pt-1 border-t border-gray-100">
                                              <div>Cajón: <b className="text-slate-800">{ticket.cochera?.codigo || 'N/A'}</b></div>
                                              {/* 🚀 CORRECCIÓN: Reemplazamos guiones bajos por espacios para mostrar "4 HORAS" */}
                                              <div>Pase: <b className="text-slate-800 uppercase">{ticket.tipoPase ? ticket.tipoPase.replace('_', ' ') : 'ESTANDAR'}</b></div>
                                              <div>Estado: <b className="text-slate-800">{ticket.horaSalida ? 'Finalizado' : 'En curso'}</b></div>
                                            </div>

                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs flex justify-between items-center text-slate-700 font-medium ml-2">
                                              <span>📥 Ingreso: <b>{horaEntradaFormateada}</b></span>
                                              <span>📤 Egreso: <b>{horaSalidaFormateada}</b></span>
                                            </div>

                                            <div className={`p-3 rounded-xl space-y-1.5 mt-2 border text-xs ${
                                              esDeuda ? 'bg-red-50/70 border-red-200 text-red-900' : 'bg-gray-50 border-gray-200 text-slate-700'
                                            }`}>
                                              <div className="flex justify-between">
                                                <span>Tarifa Base / Reserva:</span>
                                                <span className="font-bold">${tarifaBase.toLocaleString('es-AR')}</span>
                                              </div>
                                              {multaExceso > 0 && (
                                                <div className="flex justify-between text-red-600 font-semibold pt-1 border-t border-red-200">
                                                  <span>Multa ({tiempoExcedidoTexto} de exceso):</span>
                                                  <span>+${multaExceso.toLocaleString('es-AR')}</span>
                                                </div>
                                              )}
                                              <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 font-black text-sm">
                                                <span>Total del Ticket:</span>
                                                <span className={esDeuda ? 'text-red-700 text-base' : 'text-emerald-700'}>
                                                  ${montoTotal.toLocaleString('es-AR')}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* CONTROLES DE PAGINACIÓN DESKTOP */}
                                    {totalPaginas > 1 && (
                                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                        <button
                                          disabled={paginaActual === 1}
                                          onClick={() => cambiarPagina(vehiculo.patente, paginaActual - 1)}
                                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs disabled:opacity-40 transition-all cursor-pointer"
                                        >
                                          ← Anterior
                                        </button>
                                        <span className="text-xs font-black text-slate-600">Página {paginaActual} de {totalPaginas}</span>
                                        <button
                                          disabled={paginaActual === totalPaginas}
                                          onClick={() => cambiarPagina(vehiculo.patente, paginaActual + 1)}
                                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs disabled:opacity-40 transition-all cursor-pointer"
                                        >
                                          Siguiente →
                                        </button>
                                      </div>
                                    )}
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

      {/* ESTILOS (Corregido el Warning de React) */}
      <style dangerouslySetInnerHTML={{__html: `
        .pulse-debt {
          animation: pulseRed 2s infinite;
        }
        
        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
      `}} />
    </div>
  );
}