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

// 🚀 IMPORTACIÓN DE MERCADO PAGO CONTROLADA NATIVAMENTE POR ENTORNO
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Consumimos la Public Key puramente desde los Environments de Dockploy/Vite sin fallbacks estáticos en código
const MP_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';

if (MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'es-AR' });
} else {
  console.warn("⚠️ Alerta: VITE_MERCADOPAGO_PUBLIC_KEY está vacía o no se encuentra definida en Dockploy.");
}

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

  useEffect(() => {
    const timer = setTimeout(() => setCargandoApp(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // --- ESTADOS DINÁMICOS EN BASE A LA BASE DE DATOS ---
  const [miCochera, setMiCochera] = useState(null);
  const [miPatente, setMiPatente] = useState(null);
  
  // Guardamos el objeto completo de la reserva para pasarlo al reloj
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

  const memoriaNotificaciones = useRef({ reservaId: null, avisoInicio: false, aviso15: false, expirado: false });
  const [confirmacion, setConfirmacion] = useState({ isOpen: false, titulo: '', mensaje: '', onConfirmar: null, tipo: 'peligro' });

  useEffect(() => {
    if (usuario) {
      cargarCocheras();
      cargarReservas();
    }
  }, [usuario]);

  // Escucha y confirmación automática del retorno oficial de Mercado Pago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const rId = urlParams.get('reservaId');
    const hs = urlParams.get('horas');

    if ((status === 'approved' || window.location.pathname === '/pago-exitoso') && rId && hs) {
      fetch(`${BACKEND_URL}/api/reservas/${rId}/confirmar-extension?horas=${hs}`, {
        method: 'PUT'
      })
      .then(res => {
        if (!res.ok) throw new Error("No se pudo impactar la prórroga.");
        return res.json();
      })
      .then(() => {
        window.history.replaceState({}, document.title, "/");
        setNotificacion({
          tipo: 'info',
          mensaje: `✅ ¡Pago aprobado! Se añadieron +${hs} hora(s) correctamente a tu cochera.`
        });
        cargarReservas();
      })
      .catch(err => console.error("Error al confirmar extensión horaria:", err));
    }
  }, []); 

  // SARRIL: MOTOR DE SINCRONIZACIÓN MULTIDISPOSITIVO REAL-TIME
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

  // VALIDACIÓN DE INTEGRIDAD DESDE EL BACKEND
  useEffect(() => {
    if (usuario?.rol === 'USER' && miCochera && cocheras.length > 0) {
      const cocheraExiste = cocheras.find(c => c.codigo === miCochera);
      
      if (!cocheraExiste) {
        setMiCochera(null);
        setMiPatente(null);
        setReservaActivaUsuario(null); 
        setNotificacion({
          tipo: 'info',
          mensaje: 'El lugar que tenías asignado fue eliminado o liberado por la administración. Tu estado ha sido reiniciado.'
        });
      }
    }
  }, [cocheras, miCochera, usuario]);

  // MOTOR DEL TIEMPO BLINDADO
  useEffect(() => {
    if (usuario?.rol !== 'USER' || !miCochera || reservas.length === 0) return;

    const miReservaActiva = [...reservas]
      .sort((a, b) => b.id - a.id) 
      .find(r => r.cochera?.codigo === miCochera && !r.horaSalida && r.usuario?.username === usuario.username);
    
    if (!miReservaActiva || !miReservaActiva.horaFinEsperada) {
      memoriaNotificaciones.current = { reservaId: null, avisoInicio: false, aviso15: false, expirado: false };
      return;
    }

    if (memoriaNotificaciones.current.reservaId !== miReservaActiva.id) {
      memoriaNotificaciones.current = { 
        reservaId: miReservaActiva.id, 
        avisoInicio: false,
        aviso15: false, 
        expirado: false 
      };
    }

    const intervalo = setInterval(() => {
      const ahora = new Date();
      const horaFin = new Date(miReservaActiva.horaFinEsperada);
      const diferenciaMinutos = (horaFin - ahora) / (1000 * 60);

      if (diferenciaMinutos < -1440) return;

      if (diferenciaMinutos > 15 && !memoriaNotificaciones.current.avisoInicio) {
        const horaFormateada = horaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setNotificacion({
          tipo: 'info',
          mensaje: `🏍️ ¡Reserva Activa! Tu lugar vence a las ${horaFormateada}. Recuerda retirarte a tiempo para evitar multas.`
        });
        memoriaNotificaciones.current.avisoInicio = true;
      }
      else if (diferenciaMinutos <= 15 && diferenciaMinutos > 0 && !memoriaNotificaciones.current.aviso15) {
        setNotificacion({
          tipo: 'alerta',
          mensaje: '⏱️ Tu tiempo de estacionamiento vence en menos de 15 minutos. ¡Evita multas!'
        });
        memoriaNotificaciones.current.avisoInicio = true; 
        memoriaNotificaciones.current.aviso15 = true;
      } 
      else if (diferenciaMinutos <= 0 && diferenciaMinutos > -1440 && !memoriaNotificaciones.current.expirado) {
        setNotificacion({
          tipo: 'peligro',
          mensaje: '⚠️ ¡Tu tiempo ha expirado! A partir de este momento se aplicará un recargo en tu ticket final.'
        });
        memoriaNotificaciones.current.avisoInicio = true;
        memoriaNotificaciones.current.aviso15 = true;
        memoriaNotificaciones.current.expirado = true; 
      }
    }, 4000); 

    return () => clearInterval(intervalo);
  }, [usuario, miCochera, reservas]);

  const cargarCocheras = () => {
    fetch(`${BACKEND_URL}/api/cocheras`)
      .then(res => {
        if (!res.ok) throw new Error("Error en servidor al cargar cocheras.");
        return res.json();
      })
      .then(data => setCocheras(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Error al cargar cocheras:", err);
        setCocheras([]);
      });
  };

  const cargarReservas = () => {
    fetch(`${BACKEND_URL}/api/reservas`)
      .then(res => {
        if (!res.ok) throw new Error("Error del servidor al cargar reservas.");
        return res.json();
      })
      .then(data => setReservas(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Error al cargar reservas:", err);
        setReservas([]); 
      });
  };

  const solicitarExtensionDeTiempo = (reservaId, horas) => {
    setNotificacion({ tipo: 'info', mensaje: "Iniciando pasarela de pago seguro..." });
    
    fetch(`${BACKEND_URL}/api/reservas/${reservaId}/solicitar-extension?horas=${horas}`, {
      method: 'POST'
    })
    .then(async res => {
      if (!res.ok) throw new Error("No se pudo generar la orden en Mercado Pago.");
      return res.json();
    })
    .then(data => {
      setNotificacion(null);
      setPreferenceId(data.preferenceId);
      window._datosExtensionPendiente = { reservaId, horas }; 
    })
    .catch(err => {
      setNotificacion({ tipo: 'peligro', mensaje: err.message });
    });
  };

  const handleLogin = (user, pass) => {
    setErrorLogin('');
    fetch(`${BACKEND_URL}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    })
    .then(async res => {
      if (!res.ok) throw new Error("Credenciales incorrectas o error de conexión.");
      return res.json();
    })
    .then(data => {
      setUsuario(data);
      localStorage.setItem('usuario_parquimetro', JSON.stringify(data));
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
  };

  const liberarCochera = (codigo) => {
    fetch(`${BACKEND_URL}/api/cocheras/${codigo}/salida`, { method: 'POST' })
    .then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: El servidor rechazó la operación.`);
      }
      return res.json();
    })
    .then(data => {
      cargarCocheras();
      cargarReservas();
      setLugarOcupadoInfo(null); 

      if (data && data.estadoPago === 'PENDIENTE') {
        setNotificacion({
          tipo: 'peligro',
          mensaje: `⚠️ Atención: Has generado una multa por tiempo extra. Monto a pagar: $${data.montoTotal}. Debes saldarla en tu Historial para volver a usar el sistema.`
        });
      }

      if (data && data.cochera) {
        setTicketModal(data);
      } else {
        setNotificacion({ tipo: 'info', mensaje: "Lugar liberado correctamente." });
      }
    })
    .catch(err => {
      console.error(err);
      setNotificacion({ tipo: 'peligro', mensaje: `Operación fallida: ${err.message}` });
    });
  };

  const manejarClicCochera = (lugar) => {
    if (usuario.rol === 'USER' && lugar.codigo === miCochera) {
      setConfirmacion({
        isOpen: true,
        titulo: '¿Liberar tu lugar?',
        mensaje: `¿Estás seguro de liberar tu cajón ${lugar.codigo} y ver tu comprobante de salida (incluyendo multas si aplican)?`,
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
        setNotificacion({
          tipo: 'info',
          mensaje: 'Modo Administrador: No tienes permisos para asignar lugares. Esta función es exclusiva para Usuarios y Guardias.'
        });
        return;
      }

      if (usuario.rol === 'USER' && miCochera) {
        setNotificacion({
          tipo: 'alerta',
          mensaje: `Ya tienes reservado el cajón ${miCochera}. Solo se permite una reserva por usuario.`
        });
        return;
      }
      setLugarParaReservar(lugar);
    } 
    else {
      if (usuario.rol === 'USER') {
        setNotificacion({ tipo: 'info', mensaje: 'Este lugar está ocupado por otro vehículo.' });
      } else {
        const reservaActiva = reservas.find(r => r.cochera?.codigo === lugar.codigo && !r.horaSalida);
        setLugarOcupadoInfo({ lugar, reserva: reservaActiva });
      }
    }
  };

  const procesarReserva = (codigo, patente, tipoPase, turno, monto) => {
    setTimeout(() => {
      const params = new URLSearchParams({ 
        patente, tipoPase, turno, monto, username: usuario.username 
      }).toString();

      fetch(`${BACKEND_URL}/api/cocheras/${codigo}/entrada?${params}`, { method: 'POST' })
      .then(async res => {
        if (!res.ok) {
           const errorData = await res.json().catch(() => ({ message: 'Error de red o servidor' }));
           if (res.status === 403) throw new Error("🚫 " + errorData.message);
           throw new Error(errorData.message || 'No se pudo completar la reserva.');
        }
        return res.json(); 
      })
      .then(ticket => {
        setLugarParaReservar(null); 
        cargarCocheras();
        cargarReservas();
        setTicketModal(ticket); 
      })
      .catch(err => {
        setLugarParaReservar(null);
        if (err.message.includes("🚫")) {
           setNotificacion({ tipo: 'peligro', mensaje: err.message });
           setMostrarHistorial(true); 
        } else {
           setNotificacion({ tipo: 'alerta', mensaje: err.message });
        }
      });
    }, 500); 
  };

  const procesarPagoDeuda = (reserva) => {
    setMostrarHistorial(false);
    setNotificacion({ tipo: 'info', mensaje: 'Generando orden de pago en Mercado Pago...' });

    fetch(`${BACKEND_URL}/api/reservas/${reserva.id}/pagar-deuda`, { method: 'PUT' })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'No se pudo generar la orden de pago.');
        }
        return res.json();
      })
      .then(data => {
        setNotificacion(null);
        setPreferenceId(data.preferenceId);
        window._reservaDeudaActiva = reserva.id;
      })
      .catch(err => {
        setNotificacion({ tipo: 'peligro', mensaje: `Error al generar pago: ${err.message}` });
        setMostrarHistorial(true);
      });
  };

  const finalizarPagoMercadoPago = () => {
    setPreferenceId(null);
    
    if (window._datosExtensionPendiente) {
      const { reservaId: extId, horas: extHs } = window._datosExtensionPendiente;
      
      fetch(`${BACKEND_URL}/api/reservas/${extId}/confirmar-extension?horas=${extHs}`, { method: 'PUT' })
        .then(async res => {
          if (!res.ok) throw new Error("No se pudo impactar la prórroga de tiempo.");
          return res.json();
        })
        .then(() => {
          setNotificacion({ tipo: 'info', mensaje: `✅ ¡Tiempo extendido! Se agregaron +${extHs} hora(s) a tu estadía.` });
          delete window._datosExtensionPendiente;
          cargarReservas();
        })
        .catch(err => setNotificacion({ tipo: 'peligro', mensaje: err.message }));
      
      return; 
    }

    const reservaId = window._reservaDeudaActiva;
    if (!reservaId) return;

    fetch(`${BACKEND_URL}/api/reservas/${reservaId}/confirmar-pago-deuda`, { method: 'PUT' })
      .then(async res => {
        if (!res.ok) throw new Error("El servidor no pudo procesar la cancelación de la deuda.");
        return res.json();
      })
      .then(() => {
        setNotificacion({ tipo: 'info', mensaje: "✅ ¡Deuda cancelada exitosamente! Tu cuenta ha sido habilitada." });
        delete window._reservaDeudaActiva;
        cargarReservas(); 
        setMostrarHistorial(true); 
      })
      .catch(err => {
        setNotificacion({ tipo: 'peligro', mensaje: "❌ Hubo un error al registrar tu pago: " + err.message });
      });
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
      mensaje: `¿Estás seguro de eliminar definitivamente el cajón ${codigo}? Esta acción no se puede deshacer.`,
      tipo: 'peligro',
      onConfirmar: () => {
        fetch(`${BACKEND_URL}/api/cocheras/${codigo}`, { method: 'DELETE' })
        .then(async res => {
          if (!res.ok) throw new Error("No se pudo eliminar el lugar.");
          cargarCocheras();
          setNotificacion({ tipo: 'info', mensaje: `Cochera ${codigo} eliminada correctamente.` });
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
          <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-600 text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-[0_10px_40px_rgba(37,99,235,0.3)] mx-auto animate-[pulse_2s_infinite]">
            NH
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 rounded-full w-48 mx-auto animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]"></div>
            <p className="text-sm text-slate-400 font-medium">Cargando sistema...</p>
          </div>
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
        <NotificacionPush 
          tipo={notificacion.tipo} 
          mensaje={notificacion.mensaje} 
          onClose={() => setNotificacion(null)} 
        />
      )}

      <Navbar 
        usuario={usuario} 
        vista={vista} 
        setVista={setVista} 
        onLogout={handleLogout} 
        onAbrirHistorial={() => setMostrarHistorial(true)} 
      />

      <div className="max-w-6xl mx-auto p-6 print:p-0 animate-[fadeIn_0.5s_ease-out]">
        
        <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-[pulse_8s_infinite]"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-[pulse_10s_infinite]"></div>
        </div>
        
        {vista === 'mapa' && (
          <Mapa 
            usuario={usuario} 
            cocheras={cocheras} 
            nuevoCodigo={nuevoCodigo} 
            setNuevoCodigo={setNuevoCodigo} 
            agregarCochera={agregarCochera} 
            manejarClicCochera={manejarClicCochera} 
            eliminarCochera={eliminarCochera}
            reservas={reservas} 
            miCochera={miCochera}
            miPatente={miPatente}
            reservaActivaUsuario={reservaActivaUsuario}
            onExtenderTiempo={solicitarExtensionDeTiempo} 
          />
        )}
        
        {vista === 'dashboard' && usuario.rol === 'ADMIN' && (
          <Dashboard recaudacionTotal={recaudacionTotal} reservas={reservas} />
        )}

      </div>

      {mostrarHistorial && (
        <ModalHistorial 
          usuario={usuario} 
          onClose={() => setMostrarHistorial(false)} 
          onPagarDeuda={procesarPagoDeuda} 
        />
      )}

      <TicketModal ticketModal={ticketModal} setTicketModal={setTicketModal} imprimirTicket={() => window.print()} />

      {lugarParaReservar && !preferenceId && (
        <ModalReserva 
          lugar={lugarParaReservar} 
          usuario={usuario}
          onClose={() => setLugarParaReservar(null)} 
          onConfirmar={procesarReserva}
        />
      )}

      {preferenceId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-[fadeIn_0.3s_ease-out]">
            <h3 className="text-xl font-black text-slate-800 mb-2">Finalizar Pago</h3>
            <p className="text-slate-500 mb-6 font-medium">Paga de forma segura con Mercado Pago</p>
            
            <div className="min-h-[100px] flex items-center justify-center">
              <Wallet initialization={{ preferenceId: preferenceId }} customization={{ texts: { valueProp: 'smart_option' } }} />
            </div>
            
            <div className="mt-6 flex flex-col gap-2">
              <button 
                onClick={finalizarPagoMercadoPago} 
                className="w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-lg transition-colors text-sm"
              >
                [Simular Pago Exitoso]
              </button>
              <button 
                onClick={() => { 
                  setPreferenceId(null); 
                  setLugarParaReservar(null);
                  delete window._datosExtensionPendiente;
                  if (window._reservaDeudaActiva) {
                    setMostrarHistorial(true);
                    delete window._reservaDeudaActiva;
                  }
                }} 
                className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                Cancelar Operación
              </button>
            </div>
          </div>
        </div>
      )}

      {lugarOcupadoInfo && (
        <ModalFicha 
          info={lugarOcupadoInfo}
          onClose={() => setLugarOcupadoInfo(null)}
          onLiberar={liberarCochera}
        />
      )}

      <ModalConfirmacion 
        isOpen={confirmacion.isOpen}
        titulo={confirmacion.titulo}
        mensaje={confirmacion.mensaje}
        tipo={confirmacion.tipo}
        onConfirmar={confirmacion.onConfirmar}
        onCancelar={() => setConfirmacion({ ...confirmacion, isOpen: false })}
      />
      
    </div>
  );
}

export default App;