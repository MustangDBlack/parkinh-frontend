import { useState, useMemo } from 'react';

export default function ModuloFinanzas({ reservas }) {
  const [filtroTiempo, setFiltroTiempo] = useState('HOY');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('TODOS');

  const reservasCompletadas = useMemo(() => {
    return reservas.filter(r => r.horaSalida != null);
  }, [reservas]);

  const datosFiltrados = useMemo(() => {
    const ahora = new Date();
    
    return reservasCompletadas.filter(reserva => {
      const fechaSalida = new Date(reserva.horaSalida);
      let pasaFiltroTiempo = true;

      if (filtroTiempo === 'HOY') {
        pasaFiltroTiempo = fechaSalida.toDateString() === ahora.toDateString();
      } else if (filtroTiempo === 'SEMANA') {
        const hace7Dias = new Date();
        hace7Dias.setDate(ahora.getDate() - 7);
        pasaFiltroTiempo = fechaSalida >= hace7Dias;
      } else if (filtroTiempo === 'MES') {
        pasaFiltroTiempo = fechaSalida.getMonth() === ahora.getMonth() && fechaSalida.getFullYear() === ahora.getFullYear();
      } else if (filtroTiempo === 'RANGO') {
        if (fechaDesde && fechaHasta) {
          const inicio = new Date(fechaDesde);
          inicio.setHours(0, 0, 0, 0);
          const fin = new Date(fechaHasta);
          fin.setHours(23, 59, 59, 999);
          pasaFiltroTiempo = fechaSalida >= inicio && fechaSalida <= fin;
        }
      }

      let pasaFiltroMetodo = true;
      if (filtroMetodo !== 'TODOS') {
        const metodo = reserva.metodoPago || 'EFECTIVO';
        pasaFiltroMetodo = metodo === filtroMetodo;
      }

      return pasaFiltroTiempo && pasaFiltroMetodo;
    });
  }, [reservasCompletadas, filtroTiempo, fechaDesde, fechaHasta, filtroMetodo]);

  const metricas = useMemo(() => {
    let total = 0, efectivo = 0, transferencia = 0, recargosPorMulta = 0;
    datosFiltrados.forEach(reserva => {
      const monto = reserva.montoTotal || 0;
      total += monto;
      if (reserva.metodoPago === 'TRANSFERENCIA') transferencia += monto;
      else efectivo += monto;
      if (reserva.horaFinEsperada) {
        const difMinutos = (new Date(reserva.horaSalida) - new Date(reserva.horaFinEsperada)) / (1000 * 60);
        if (difMinutos > 15 && monto > 500) recargosPorMulta += (monto - 500);
      }
    });
    return { total, efectivo, transferencia, recargosPorMulta, cantidad: datosFiltrados.length };
  }, [datosFiltrados]);

  return (
    <div className="space-y-4 sm:space-y-6 fade-in">
      
      {/* CABECERA */}
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-emerald-600/5 to-blue-600/5"></div>
        <div className="relative p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-gray-800 tracking-tight">Panel Financiero</h2>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">Control de recaudación y métricas de estacionamiento</p>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-5">
        <div className="flex flex-col gap-3">
          {/* Filtros de tiempo - Scroll horizontal en mobile */}
          <div className="flex bg-gray-100 p-1 sm:p-1.5 rounded-xl overflow-x-auto -mx-1 px-1">
            {[
              { key: 'HOY', label: 'Hoy', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { key: 'SEMANA', label: 'Semana', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { key: 'MES', label: 'Mes', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { key: 'TODO', label: 'Histórico', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
              { key: 'RANGO', label: 'Fechas', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' }
            ].map(filtro => (
              <button 
                key={filtro.key} 
                onClick={() => setFiltroTiempo(filtro.key)} 
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  filtroTiempo === filtro.key 
                    ? 'bg-white text-blue-700 shadow-[0_2px_8px_rgba(37,99,235,0.12)]' 
                    : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
                }`}
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={filtro.icon} />
                </svg>
                <span className="hidden xs:inline">{filtro.label}</span>
              </button>
            ))}
          </div>

          {/* Rango de fechas y método de pago */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {filtroTiempo === 'RANGO' && (
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 animate-[slideRight_0.3s_ease-out] w-full sm:w-auto">
                <input 
                  type="date" 
                  value={fechaDesde} 
                  onChange={(e) => setFechaDesde(e.target.value)} 
                  className="text-[10px] sm:text-xs font-bold text-gray-700 px-2 sm:px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white border border-gray-200 flex-1 sm:flex-none" 
                />
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <input 
                  type="date" 
                  value={fechaHasta} 
                  onChange={(e) => setFechaHasta(e.target.value)} 
                  className="text-[10px] sm:text-xs font-bold text-gray-700 px-2 sm:px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white border border-gray-200 flex-1 sm:flex-none" 
                />
              </div>
            )}
            
            <div className="relative w-full sm:w-48">
              <select 
                value={filtroMetodo} 
                onChange={(e) => setFiltroMetodo(e.target.value)} 
                className="w-full bg-white border-2 border-gray-200 rounded-xl pl-9 sm:pl-10 pr-10 py-2.5 text-xs sm:text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all appearance-none cursor-pointer"
              >
                <option value="TODOS">Todos los Pagos</option>
                <option value="EFECTIVO">Solo Efectivo</option>
                <option value="TRANSFERENCIA">Solo Transferencias</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Recaudación */}
        <div className="col-span-2 lg:col-span-1 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 p-4 sm:p-6 rounded-2xl shadow-[0_8px_24px_rgba(37,99,235,0.25)] text-white group">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 group-hover:bg-white/10 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-blue-200 text-[10px] sm:text-sm font-black uppercase tracking-wider">Recaudación</p>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight mb-1">${metricas.total.toLocaleString('es-AR')}</h3>
            <div className="flex items-center gap-2 mt-2 sm:mt-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <p className="text-blue-200 text-[10px] sm:text-xs font-bold">{metricas.cantidad} operaciones</p>
            </div>
          </div>
        </div>

        {/* Efectivo */}
        <div className={`relative overflow-hidden bg-white p-3 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-500 hover:shadow-md group ${
          filtroMetodo === 'TRANSFERENCIA' ? 'opacity-40 grayscale' : ''
        }`}>
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full -mr-6 -mt-6 sm:-mr-8 sm:-mt-8 group-hover:bg-emerald-100 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-[10px] sm:text-sm font-bold uppercase tracking-wider">Efectivo</p>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-gray-800">${metricas.efectivo.toLocaleString('es-AR')}</h3>
          </div>
          <div className="mt-3 sm:mt-4 h-1 sm:h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
        </div>

        {/* Transferencia */}
        <div className={`relative overflow-hidden bg-white p-3 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-500 hover:shadow-md group ${
          filtroMetodo === 'EFECTIVO' ? 'opacity-40 grayscale' : ''
        }`}>
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full -mr-6 -mt-6 sm:-mr-8 sm:-mt-8 group-hover:bg-blue-100 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-gray-400 text-[10px] sm:text-sm font-bold uppercase tracking-wider">Digital</p>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-gray-800">${metricas.transferencia.toLocaleString('es-AR')}</h3>
          </div>
          <div className="mt-3 sm:mt-4 h-1 sm:h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
        </div>

        {/* Multas */}
        <div className={`relative overflow-hidden bg-white p-3 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all duration-500 hover:shadow-md ${
          metricas.recargosPorMulta > 0 ? 'border-l-4 border-l-red-500 pulse-debt' : ''
        }`}>
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full -mr-6 -mt-6 sm:-mr-8 sm:-mt-8"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-400 text-[10px] sm:text-sm font-bold uppercase tracking-wider">Multas</p>
            </div>
            <h3 className={`text-lg sm:text-2xl font-black ${metricas.recargosPorMulta > 0 ? 'text-red-600' : 'text-gray-800'}`}>
              ${metricas.recargosPorMulta.toLocaleString('es-AR')}
            </h3>
          </div>
          {metricas.recargosPorMulta > 0 && (
            <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 bg-red-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 animate-[blinkWarning_1s_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01" />
              </svg>
              <p className="text-[10px] sm:text-xs text-red-600 font-black uppercase">Infracciones</p>
            </div>
          )}
        </div>
      </div>

      {/* LIBRO DIARIO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-lg sm:rounded-xl flex items-center justify-center">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-black text-gray-800">Libro Diario</h3>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full"></span>
            <span className="text-[10px] sm:text-xs text-gray-500 font-bold bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl">
              {datosFiltrados.length}
            </span>
          </div>
        </div>
        
        {/* Tabla responsive */}
        <div className="overflow-x-auto -mx-0">
          <div className="min-w-[600px] sm:min-w-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 via-white to-gray-50 text-gray-500 text-[10px] sm:text-xs uppercase tracking-wider border-b-2 border-gray-100">
                  <th className="p-2.5 sm:p-4 font-bold">Fecha</th>
                  <th className="p-2.5 sm:p-4 font-bold">Cochera</th>
                  <th className="p-2.5 sm:p-4 font-bold">Dominio</th>
                  <th className="p-2.5 sm:p-4 font-bold">Pase</th>
                  <th className="p-2.5 sm:p-4 font-bold">Método</th>
                  <th className="p-2.5 sm:p-4 font-bold text-right">Cobrado</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm divide-y divide-gray-100">
                {datosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 sm:p-16 text-center">
                      <div className="max-w-sm mx-auto">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-inner">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="font-black text-gray-700 text-base sm:text-lg mb-1">Sin transacciones</p>
                        <p className="text-gray-400 text-xs sm:text-sm font-medium">No se encontraron registros en este período</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  datosFiltrados.slice().reverse().map((reserva, index) => (
                    <tr 
                      key={reserva.id} 
                      className="hover:bg-blue-50/20 transition-all duration-200 group"
                    >
                      <td className="p-2.5 sm:p-4">
                        <span className="text-gray-700 font-bold text-[11px] sm:text-sm">
                          {new Date(reserva.horaSalida).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </td>
                      <td className="p-2.5 sm:p-4">
                        <span className="font-black text-gray-800 bg-gray-100 px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-sm">
                          {reserva.cochera?.codigo || '-'}
                        </span>
                      </td>
                      <td className="p-2.5 sm:p-4">
                        <span className="inline-block bg-gradient-to-b from-white to-gray-50 text-gray-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-mono text-[10px] sm:text-xs font-black tracking-wider border-2 border-gray-800 shadow-sm">
                          {reserva.patente}
                        </span>
                      </td>
                      <td className="p-2.5 sm:p-4">
                        <span className="text-gray-700 font-bold text-[10px] sm:text-xs">
                          {reserva.tipoPase ? reserva.tipoPase.replace('_', ' ') : 'ESTANDAR'}
                        </span>
                      </td>
                      <td className="p-2.5 sm:p-4">
                        <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black ${
                          reserva.metodoPago === 'TRANSFERENCIA' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {reserva.metodoPago || 'EFECTIVO'}
                        </span>
                      </td>
                      <td className="p-2.5 sm:p-4 text-right">
                        <span className="font-black text-gray-800 text-[11px] sm:text-base bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl">
                          ${reserva.montoTotal.toLocaleString('es-AR')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ESTILOS */}
      <style jsx>{`
        .pulse-debt {
          animation: pulseRed 2s infinite;
        }
        
        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        
        @media (max-width: 640px) {
          .pulse-debt {
            animation: pulseRedMobile 2s infinite;
          }
          
          @keyframes pulseRedMobile {
            0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3); }
            70% { box-shadow: 0 0 0 4px rgba(220, 38, 38, 0); }
            100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
          }
        }
      `}</style>
    </div>
  );
}