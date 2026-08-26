import { useEffect, useState, useRef } from 'react';
import './index.css';

// Componentes
import Login from './components/Login';
import Navbar from './components/Navbar';
import Mapa from './components/Mapa';
import Dashboard from './components/Dashboard';
import TicketModal from './components/TicketModal';
import EstadoPago from './components/EstadoPago';
import ModalReserva from './components/ModalReserva';
import ModalFicha from './components/ModalFicha'; 
import NotificacionPush from './components/NotificacionPush';
import ModalHistorial from './components/ModalHistorial';
import ModalConfirmacion from './components/ModalConfirmacion';
import ModalAyuda from './components/ModalAyuda';

function App() {
  const path = window.location.pathname;
  if (path === '/pago-exitoso') return <EstadoPago estado="exitoso" />;
  if (path === '/pago-pendiente') return <EstadoPago estado="pendiente" />;
  if (path === '/pago-fallido') return <EstadoPago estado="fallido" />;

  const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

  const [usuario, setUsuario] = useState(() => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario_parquimetro');
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    } catch (error) {
      localStorage.removeItem('usuario_parquimetro');
      return null;
    }
  });
  
  const [errorLogin, setErrorLogin] = useState('');
  const [cargandoApp, setCargandoApp] = useState(true);

  const [mostrarModalAyuda, setMostrarModalAyuda] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCargandoApp(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (usuario) {
      const yaVioAyuda = sessionStorage.getItem('parkinh_ayuda_vista');
      if (!yaVioAyuda) {
        setMostrarModalAyuda(true);
      }
    }
  }, [usuario]);

  const cerrarModalAyuda = () => {
    setMostrarModalAyuda(false);
    sessionStorage.setItem('parkinh_ayuda_vista', 'true');
  };

  const [miCochera, setMiCochera] = useState(null);
  const [miPatente, setMiPatente] = useState(null);
  const [reservaActivaUsuario, setReservaActivaUsuario] = useState(null); 
  const [cocheras, setCocheras] = useState([]);
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  
  const [vista, setVista] = useState('mapa'); 
  const [reservas, setReservas] = useState([]);
  const [ticketModal, setTicketModal] = useState(null);
  const [lugarParaReservar, setLugarParaReservar] = useState(null); 
  const [lugarOcupadoInfo, setLugarOcupadoInfo] = useState(null);
  
  const [preferenceId, setPreferenceId] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const [estadoSimulador, setEstadoSimulador] = useState('inicio'); 
  const [ticketTemporal, setTicketTemporal] = useState(null);

  // 🚀 MEJORA: Agregamos "horaFin" a la memoria para detectar extensiones de tiempo
  const memoriaNotificaciones = useRef({ reservaId: null, horaFin: null, avisoInicio: false, aviso15: false, expirado: false });
  const [confirmacion, setConfirmacion] = useState({ isOpen: false, titulo: '', mensaje: '', onConfirmar: null, tipo: 'peligro' });

  useEffect(() => {
    if (usuario) {
      cargarCocheras();
      cargarReservas();
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario && usuario.rol === 'USER' && reservas.length > 0) {
      const miReservaActiva = [...reservas]
        .sort((a, b) => b.id - a.id)
        .find(r => !r.horaSalida && r.usuario?.username === usuario.username);

      if (miReservaActiva) {
        setMiCochera(miReservaActiva.cochera?.codigo || null);
        setMiPatente(miReservaActiva.patente || null);
        setReservaActivaUsuario(miReservaActiva); 
      } else {
        setMiCochera(null);
        setMiPatente(null);
        setReservaActivaUsuario(null); 
      }
    } else if (!usuario) {
      setMiCochera(null);
      setMiPatente(null);
      setReservaActivaUsuario(null); 
    }
  }, [reservas, usuario]);

  useEffect(() => {
    if (usuario?.rol === 'USER' && miCochera && cocheras.length > 0) {
      const cocheraExiste = cocheras.find(c => c.codigo === miCochera);
      if (!cocheraExiste) {
        setMiCochera(null);
        setMiPatente(null);
        setReservaActivaUsuario(null); 
        setNotificacion({ tipo: 'info', mensaje: 'El lugar fue liberado por la administración.' });
      }
    }
  }, [cocheras, miCochera, usuario]);

  useEffect(() => {
    if (usuario?.rol !== 'USER' || !miCochera || reservas.length === 0) return;

    const miReservaActiva = [...reservas]
      .sort((a, b) => b.id - a.id) 
      .find(r => r.cochera?.codigo === miCochera && !r.horaSalida && r.usuario?.username === usuario.username);
    
    if (!miReservaActiva || !miReservaActiva.horaFinEsperada) return;

    // 🚀 MEJORA: Si la reserva es nueva o la HORA FIN cambió (porque compró más tiempo), reiniciamos las alarmas
    if (
      memoriaNotificaciones.current.reservaId !== miReservaActiva.id ||
      memoriaNotificaciones.current.horaFin !== miReservaActiva.horaFinEsperada
    ) {
      memoriaNotificaciones.current = { 
        reservaId: miReservaActiva.id, 
        horaFin: miReservaActiva.horaFinEsperada, 
        avisoInicio: false, 
        aviso15: false, 
        expirado: false 
      };
    }

    const intervalo = setInterval(() => {
      const ahora = new Date();
      const horaFin = new Date(miReservaActiva.horaFinEsperada);
      const diferenciaMinutos = (horaFin - ahora) / (1000 * 60);

      if (diferenciaMinutos < -1440) return; // Si es viejísima ignorar

      if (diferenciaMinutos > 15 && !memoriaNotificaciones.current.avisoInicio) {
        const horaFormateada = horaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setNotificacion({ tipo: 'info', mensaje: `🏍️ Tu lugar vence a las ${horaFormateada}.` });
        memoriaNotificaciones.current.avisoInicio = true;
      }
      else if (diferenciaMinutos <= 15 && diferenciaMinutos > 0 && !memoriaNotificaciones.current.aviso15) {
        setNotificacion({ tipo: 'alerta', mensaje: '⏱️ Tu tiempo vence en menos de 15 minutos.' });
        memoriaNotificaciones.current.avisoInicio = true; 
        memoriaNotificaciones.current.aviso15 = true;
      } 
      else if (diferenciaMinutos <= 0 && diferenciaMinutos > -1440 && !memoriaNotificaciones.current.expirado) {
        setNotificacion({ tipo: 'peligro', mensaje: '⚠️ ¡Tu tiempo ha expirado! Se está aplicando recargo por multa.' });
        memoriaNotificaciones.current.avisoInicio = true;
        memoriaNotificaciones.current.aviso15 = true;
        memoriaNotificaciones.current.expirado = true; 
      }
    }, 4000); 

    return () => clearInterval(intervalo);
  }, [usuario, miCochera, reservas]);

  const cargarCocheras = () => {
    fetch(`${BACKEND_URL}/api/cocheras`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setCocheras(Array.isArray(data) ? data : []))
      .catch(() => setCocheras([]));
  };

  const cargarReservas = () => {
    fetch(`${BACKEND_URL}/api/reservas`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setReservas(Array.isArray(data) ? data : []))
      .catch(() => setReservas([]));
  };

  const solicitarExtensionDeTiempo = (reservaId, horas) => {
    setEstadoSimulador('inicio');
    setPreferenceId("simulador-" + Math.random());
    window._datosExtensionPendiente = { reservaId, horas }; 
  };

  const handleLogin = (user, pass) => {
    setErrorLogin('');
    fetch(`${BACKEND_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    })
    .then(async res => {
      if (!res.ok) throw new Error("Credenciales incorrectas.");
      return res.json();
    })
    .then(data => {
      setUsuario(data);
      localStorage.setItem('usuario_parquimetro', JSON.stringify(data));
      setMostrarModalAyuda(true);
      sessionStorage.removeItem('parkinh_ayuda_vista');
    })
    .catch(err => setErrorLogin(err.message));
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario_parquimetro');
    setVista('mapa');
    setTicketModal(null);
    setLugarParaReservar(null);
    setLugarOcupadoInfo(null);
    setPreferenceId(null);
    setNotificacion(null);
    setMostrarHistorial(false); 
    setMostrarModalAyuda(false);
    sessionStorage.removeItem('parkinh_ayuda_vista');
  };

  const liberarCochera = (codigo) => {
    fetch(`${BACKEND_URL}/api/cocheras/${codigo}/salida`, { method: 'POST' })
    .then(async res => {
      if (!res.ok) throw new Error(`El servidor rechazó la operación.`);
      return res.json();
    })
    .then(data => {
      cargarCocheras();
      cargarReservas();
      setLugarOcupadoInfo(null); 
      if (data && data.estadoPago === 'PENDIENTE') {
        setNotificacion({ tipo: 'peligro', mensaje: `⚠️ Generaste una multa de $${data.montoTotal}. Págala en tu Historial.` });
      }
      if (data && data.cochera) {
        setTicketModal(data);
      } else {
        setNotificacion({ tipo: 'info', mensaje: "Lugar liberado correctamente." });
      }
    })
    .catch(err => setNotificacion({ tipo: 'peligro', mensaje: err.message }));
  };

  const manejarClicCochera = (lugar) => {
    if (usuario.rol === 'USER' && lugar.codigo === miCochera) {
      setConfirmacion({
        isOpen: true,
        titulo: '¿Liberar tu lugar?',
        mensaje: `¿Estás seguro de liberar tu cajón ${lugar.codigo} y ver tu comprobante de salida?`,
        tipo: 'info',
        onConfirmar: () => {
          liberarCochera(lugar.codigo);
          setConfirmacion({ ...confirmacion, isOpen: false });
        }
      });
      return; 
    }

    if (!lugar.ocupado) {
      if (usuario.rol === 'ADMIN') {
        setNotificacion({ tipo: 'info', mensaje: 'Modo Administrador: No tienes permisos para asignar lugares.' });
        return;
      }
      
      if (usuario.rol === 'USER') {
        if (miCochera) {
          setNotificacion({ tipo: 'alerta', mensaje: `Ya tienes reservado el cajón ${miCochera}.` });
          return;
        }

        // 🚀 MEJORA: Validar si el usuario tiene deudas pendientes antes de reservar
        const tieneDeuda = reservas.some(r => r.estadoPago === 'PENDIENTE' && r.usuario?.username === usuario.username);
        
        if (tieneDeuda) {
          setNotificacion({ 
            tipo: 'peligro', 
            mensaje: '⚠️ Operación denegada: Tienes multas pendientes. Ve a "Tickets" para regularizar tu situación antes de estacionar.' 
          });
          return; // Corta la ejecución, no lo deja abrir el modal de reserva
        }
      }
      
      setLugarParaReservar(lugar);
    } else {
      if (usuario.rol === 'USER') {
        setNotificacion({ tipo: 'info', mensaje: 'Este lugar está ocupado por otro vehículo.' });
      } else {
        const reservaActiva = reservas.find(r => r.cochera?.codigo === lugar.codigo && !r.horaSalida);
        setLugarOcupadoInfo({ lugar, reserva: reservaActiva });
      }
    }
  };

  const procesarReserva = (codigo, patente, tipoPase, turno, monto) => {
    setLugarParaReservar(null); 
    setEstadoSimulador('inicio');
    setPreferenceId("simulador-" + Math.random());
    window._datosReservaInicial = { codigo, patente, tipoPase, turno, monto };
  };

  const procesarPagoDeuda = (reserva) => {
    setMostrarHistorial(false);
    setEstadoSimulador('inicio');
    setPreferenceId("simulador-" + Math.random());
    window._reservaDeudaActiva = reserva.id;
  };

  const ejecutarSimulacionPago = () => {
    setEstadoSimulador('cargando');
    
    if (window._datosReservaInicial) {
      const { codigo, patente, tipoPase, turno, monto } = window._datosReservaInicial;
      const params = new URLSearchParams({ patente, tipoPase, turno, monto, username: usuario.username }).toString();

      fetch(`${BACKEND_URL}/api/cocheras/${codigo}/entrada?${params}`, { method: 'POST' })
      .then(async res => {
        if (!res.ok) throw new Error("No se pudo completar la reserva.");
        return res.json(); 
      })
      .then(ticket => {
        cargarCocheras(); 
        cargarReservas();
        setTicketTemporal(ticket); 
        setEstadoSimulador('exitoso'); 
        delete window._datosReservaInicial;
      })
      .catch(err => {
        setNotificacion({ tipo: 'peligro', mensaje: err.message });
        setPreferenceId(null);
      });
      return;
    }

    if (window._datosExtensionPendiente) {
      const { reservaId: extId, horas: extHs } = window._datosExtensionPendiente;
      fetch(`${BACKEND_URL}/api/reservas/${extId}/confirmar-extension?horas=${extHs}`, { method: 'PUT' })
        .then(async res => {
          if (!res.ok) throw new Error("No se pudo impactar la prórroga de tiempo.");
          return res.json();
        })
        .then(() => {
          cargarReservas();
          setEstadoSimulador('exitoso');
          delete window._datosExtensionPendiente;
        })
        .catch(err => {
          setNotificacion({ tipo: 'peligro', mensaje: err.message });
          setPreferenceId(null);
        });
      return; 
    }

    const reservaId = window._reservaDeudaActiva;
    if (reservaId) {
      fetch(`${BACKEND_URL}/api/reservas/${reservaId}/confirmar-pago-deuda`, { method: 'PUT' })
        .then(async res => {
          if (!res.ok) throw new Error("El servidor no pudo cancelar la deuda.");
          return res.json();
        })
        .then(() => {
          cargarReservas(); 
          setEstadoSimulador('exitoso');
          window._abrirHistorialPostPago = true; 
          delete window._reservaDeudaActiva;
        })
        .catch(err => {
          setNotificacion({ tipo: 'peligro', mensaje: err.message });
          setPreferenceId(null);
        });
    }
  };

  const cerrarSimuladorYActualizar = () => {
    setPreferenceId(null);
    setEstadoSimulador('inicio');
    
    if (ticketTemporal) {
      setTicketModal(ticketTemporal);
      setTicketTemporal(null);
    }
    
    if (window._abrirHistorialPostPago) {
      setMostrarHistorial(true);
      delete window._abrirHistorialPostPago;
    }
  };

  const agregarCochera = (e) => {
    e.preventDefault();
    if (!nuevoCodigo) return;
    fetch(`${BACKEND_URL}/api/cocheras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: nuevoCodigo.toUpperCase(), tipo: "ESTANDAR", ocupado: false, tarifaActual: 0 })
    })
    .then(async res => {
      if (!res.ok) throw new Error("No se pudo agregar la cochera.");
      cargarCocheras(); 
      setNuevoCodigo(''); 
      setNotificacion({ tipo: 'info', mensaje: `Cochera ${nuevoCodigo.toUpperCase()} agregada exitosamente.` });
    })
    .catch(err => setNotificacion({ tipo: 'peligro', mensaje: err.message }));
  };

  const eliminarCochera = (codigo) => {
    if (usuario.rol !== 'ADMIN') return;
    setConfirmacion({
      isOpen: true,
      titulo: 'Eliminar Cochera',
      mensaje: `¿Estás seguro de eliminar el cajón ${codigo}?`,
      tipo: 'peligro',
      onConfirmar: () => {
        fetch(`${BACKEND_URL}/api/cocheras/${codigo}`, { method: 'DELETE' })
        .then(async res => {
          if (!res.ok) throw new Error("No se pudo eliminar el lugar.");
          cargarCocheras();
          setNotificacion({ tipo: 'info', mensaje: `Cochera ${codigo} eliminada.` });
          setConfirmacion({ ...confirmacion, isOpen: false });
        })
        .catch(err => {
          setNotificacion({ tipo: 'peligro', mensaje: err.message });
          setConfirmacion({ ...confirmacion, isOpen: false });
        });
      }
    });
  };

  if (cargandoApp && !usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 animate-[fadeIn_0.5s_ease-out]">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-600 text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-[0_10px_40px_rgba(37,99,235,0.3)] mx-auto animate-[pulse_2s_infinite]">NH</div>
        </div>
      </div>
    );
  }

  if (!usuario) return <Login onLogin={handleLogin} errorLogin={errorLogin} />;

  const reservasCompletadas = reservas.filter(r => r.montoTotal > 0);
  const recaudacionTotal = reservasCompletadas.reduce((total, r) => total + r.montoTotal, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 print:bg-white print:min-h-0 transition-colors duration-500">
      
      {notificacion && (
        <NotificacionPush tipo={notificacion.tipo} mensaje={notificacion.mensaje} onClose={() => setNotificacion(null)} />
      )}

      <Navbar usuario={usuario} vista={vista} setVista={setVista} onLogout={handleLogout} onAbrirHistorial={() => setMostrarHistorial(true)} />

      <div className="max-w-6xl mx-auto p-6 print:p-0 animate-[fadeIn_0.5s_ease-out]">
        {vista === 'mapa' && (
          <Mapa 
            usuario={usuario} cocheras={cocheras} nuevoCodigo={nuevoCodigo} setNuevoCodigo={setNuevoCodigo} 
            agregarCochera={agregarCochera} manejarClicCochera={manejarClicCochera} eliminarCochera={eliminarCochera}
            reservas={reservas} miCochera={miCochera} miPatente={miPatente} reservaActivaUsuario={reservaActivaUsuario}
            onExtenderTiempo={solicitarExtensionDeTiempo} 
          />
        )}
        {vista === 'dashboard' && usuario.rol === 'ADMIN' && (
          <Dashboard recaudacionTotal={recaudacionTotal} reservas={reservas} />
        )}
      </div>

      {mostrarHistorial && (
        <ModalHistorial usuario={usuario} onClose={() => setMostrarHistorial(false)} onPagarDeuda={procesarPagoDeuda} />
      )}

      <TicketModal ticketModal={ticketModal} setTicketModal={setTicketModal} imprimirTicket={() => window.print()} />

      {lugarParaReservar && !preferenceId && (
        <ModalReserva lugar={lugarParaReservar} usuario={usuario} onClose={() => setLugarParaReservar(null)} onConfirmar={procesarReserva} />
      )}

      <ModalAyuda isOpen={mostrarModalAyuda} onClose={cerrarModalAyuda} />

      {preferenceId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-[fadeIn_0.3s_ease-out]">
            
            {estadoSimulador === 'inicio' && (
              <>
                <h3 className="text-xl font-black text-slate-800 mb-2">Pasarela de Pagos</h3>
                <p className="text-slate-500 mb-6 font-medium text-sm">Módulo seguro de transacciones</p>
                
                <div className="min-h-[80px] flex flex-col items-center justify-center w-full gap-4">
                  <button 
                    onClick={ejecutarSimulacionPago} 
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    Simular Pago
                  </button>
                </div>
                
                <div className="mt-4 flex flex-col gap-2">
                  <button 
                    onClick={() => { 
                      setPreferenceId(null); 
                      setLugarParaReservar(null);
                      delete window._datosExtensionPendiente;
                      delete window._datosReservaInicial;
                      if (window._reservaDeudaActiva) {
                        setMostrarHistorial(true);
                        delete window._reservaDeudaActiva;
                      }
                      cargarCocheras();
                      cargarReservas();
                    }} 
                    className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Cancelar Operación
                  </button>
                </div>
              </>
            )}

            {estadoSimulador === 'cargando' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                 <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                 <p className="text-slate-600 font-bold">Procesando pago en el sistema...</p>
              </div>
            )}

            {estadoSimulador === 'exitoso' && (
              <div className="py-4 animate-[fadeIn_0.5s_ease-out]">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                 </div>
                 <h3 className="text-2xl font-black text-slate-800 mb-2">¡Pago Realizado!</h3>
                 <p className="text-slate-500 mb-6 font-medium">La transacción se completó con éxito.</p>
                 
                 <button 
                    onClick={cerrarSimuladorYActualizar} 
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                 >
                    Finalizar
                 </button>
              </div>
            )}

          </div>
        </div>
      )}

      {lugarOcupadoInfo && (
        <ModalFicha info={lugarOcupadoInfo} onClose={() => setLugarOcupadoInfo(null)} onLiberar={liberarCochera} />
      )}

      <ModalConfirmacion 
        isOpen={confirmacion.isOpen} titulo={confirmacion.titulo} mensaje={confirmacion.mensaje} tipo={confirmacion.tipo}
        onConfirmar={confirmacion.onConfirmar} onCancelar={() => setConfirmacion({ ...confirmacion, isOpen: false })}
      />
      
    </div>
  );
}

export default App;