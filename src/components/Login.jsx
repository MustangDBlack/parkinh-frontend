import { useState } from 'react';

const CARRERAS_IES = [
  "Tecnicatura Superior en Acompañamiento Terapéutico",
  "Tecnicatura Superior en Administración Financiera",
  "Tecnicatura Superior en Administración y Gestión de Servicios de Salud",
  "Tecnicatura Superior en Agente Sanitario y Promotor de la Salud",
  "Tecnicatura Superior en Ciencia de Datos e Inteligencia Artificial",
  "Tecnicatura Superior en Cocinas Regionales y Cultura Alimentaria",
  "Tecnicatura Superior en Desarrollo de Software",
  "Tecnicatura Superior en Enfermería",
  "Tecnicatura Superior en Esterilización",
  "Tecnicatura Superior en Farmacia",
  "Tecnicatura Superior en Gestión Jurídica",
  "Tecnicatura Superior en Hemoterapia",
  "Tecnicatura Superior en Higiene y Seguridad en el Trabajo",
  "Tecnicatura Superior en Laboratorio de Análisis Clínicos",
  "Tecnicatura Superior en Niñez, Adolescencia y Familia",
  "Tecnicatura Superior en Periodismo y Nuevas Tecnologías",
  "Tecnicatura Superior en Preparación Física",
  "Tecnicatura Superior en Prótesis Dental",
  "Tecnicatura Superior en Actividad Física y Fitness",
  "Tecnicatura Superior en Soporte de Infraestructura de Tecnología de la Información",
  "Tecnicatura Superior en Administración y Gestión Tributaria",
  "Tecnicatura Superior en Traducción Técnico Científica en Inglés",
  "Tecnicatura Superior en Soporte TIC",
  "Tecnicatura Superior en Higiene y Seguridad en el Laburo"
];

// DEFINICIÓN DE LA URL BASE DESDE EL ENTORNO
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export default function Login({ onLogin, errorLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorRegistro, setErrorRegistro] = useState('');

  const [email, setEmail] = useState('');
  const [tipoPerfil, setTipoPerfil] = useState('ALUMNO');
  const [carrera, setCarrera] = useState(CARRERAS_IES[0]);
  const [turnoCursado, setTurnoCursado] = useState('TARDE');
  const [curso, setCurso] = useState('1ro');
  const [comision, setComision] = useState('A');
  const [patenteHabitual, setPatenteHabitual] = useState('');
  const [whatsapp, setWhatsapp] = useState(''); 
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [dni, setDni] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isRegistering) {
      if (!email.includes('@')) return setErrorRegistro("Debés ingresar un correo electrónico válido.");
      if (!patenteHabitual) return setErrorRegistro("Debés ingresar la patente de tu vehículo.");
      if (!whatsapp) return setErrorRegistro("Debés ingresar un número de WhatsApp de contacto.");
      
      if (tipoPerfil === 'PARTICULAR') {
        if (!nombreCompleto || !dni) return setErrorRegistro("Los usuarios particulares deben ingresar Nombre Completo y DNI.");
      }

      setErrorRegistro('');
      setMensajeExito('');
      
      const payload = {
        username,
        password,
        email,
        rol: 'USER',
        tipoPerfil,
        patenteHabitual: patenteHabitual.replace(/\s+/g, '').toUpperCase(), 
        whatsapp,
        carrera: tipoPerfil !== 'PARTICULAR' ? carrera : null,
        turnoCursado: tipoPerfil === 'ALUMNO' ? turnoCursado : null,
        curso: tipoPerfil === 'ALUMNO' ? curso : null,
        comision: tipoPerfil === 'ALUMNO' ? comision : null,
        nombreCompleto: tipoPerfil === 'PARTICULAR' ? nombreCompleto : null,
        dni: tipoPerfil === 'PARTICULAR' ? dni : null
      };

      // FETCH CORREGIDO CON LA VARIABLE DE ENTORNO
      fetch(`${BACKEND_URL}/api/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(async res => {
        if (!res.ok) throw new Error("El usuario, matrícula o correo ya existe.");
        return res.json();
      })
      .then(() => {
        setMensajeExito('¡Cuenta creada con éxito! Ahora podés iniciar sesión.');
        setIsRegistering(false);
        setPassword('');
      })
      .catch(err => setErrorRegistro(err.message));

    } else {
      onLogin(username, password);
    }
  };

  return (
    <div className="min-h-screen w-full flex relative bg-cover bg-center bg-no-repeat font-sans antialiased overflow-y-auto overflow-x-hidden"
      style={{ backgroundImage: "url('/parquimetroimagen.png')" }}>
      
      {/* Overlay con gradiente suave e institucional */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/80 to-slate-900/85 backdrop-blur-[2px] z-0"></div>
      
      {/* Grid sutil */}
      <div className="absolute inset-0 z-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Blobs luminosos de fondo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-600 rounded-full filter blur-[120px] opacity-15 animate-[pulse_12s_infinite]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-sky-500 rounded-full filter blur-[120px] opacity-10 animate-[pulse_14s_infinite]" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="w-full flex flex-col lg:flex-row relative z-10 max-w-6xl mx-auto min-h-screen">
        
        {/* Lado izquierdo - Branding Institucional */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center px-12 xl:px-16">
          
          {/* LOGO PARKINH CORREGIDO: PARKI en Blanco, NH en Azul con Shimmer */}
          <h1 className="text-5xl xl:text-6xl font-black tracking-tight leading-none drop-shadow-lg mb-2">
            <span className="text-white font-black">PARKI</span>
            <span className="shimmer-text-blue font-black ml-0.5">NH</span>
          </h1>
          <p className="text-lg text-blue-200/80 font-bold mb-8 tracking-wide">Estacionamiento Inteligente</p>
          
          {/* Tarjeta con logo oficial IES NH incorporado */}
          <div className="text-white/90 space-y-4 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-w-lg relative overflow-hidden">
            
            {/* Marca de agua / destello sutil en el fondo de la tarjeta */}
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <img src="/logoiesnh.png" alt="Marca de agua IES" className="w-48 h-48 object-contain filter brightness-200" />
            </div>

            <div className="flex items-center gap-3.5 mb-2 relative z-10">
              {/* Contenedor del Logo Institucional discreto */}
              <div className="w-12 h-12 bg-white rounded-2xl p-1.5 flex items-center justify-center shadow-md border border-white/30 shrink-0">
                <img 
                  src="/logoiesnh.png" 
                  alt="IES NH" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback visual si el formato del nombre varía
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white block">IES Nuevo Horizonte</span>
                <span className="text-xs font-bold text-blue-200/70 tracking-widest uppercase">Instituto de Educación Superior</span>
              </div>
            </div>
            
            <p className="text-sm text-white/80 leading-relaxed relative z-10">
              Sistema integral de gestión vehicular y accesos para nuestra comunidad académica en <span className="font-bold text-white">San Salvador de Jujuy</span>.
            </p>
            
            <div className="flex items-center gap-2 mt-4 text-xs font-bold tracking-widest uppercase text-blue-300 relative z-10">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
              <span>Plataforma Institucional Oficial</span>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-6 lg:p-12 min-h-screen">
          <div className="w-full max-w-md glass-premium p-4 sm:p-6 lg:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/20 my-2 sm:my-4 relative">
            
            {/* Logo Mobile */}
            <div className="lg:hidden text-center mb-4 flex flex-col items-center">
              <img src="/logoiesnh.png" alt="IES NH" className="w-14 h-14 object-contain mb-2 drop-shadow-md" />
              <h1 className="text-3xl font-black tracking-tight drop-shadow-md">
                <span className="text-slate-800 font-black">PARKI</span>
                <span className="text-blue-600 font-black">NH</span>
              </h1>
              <p className="text-xs text-blue-700/80 font-bold tracking-wide">Estacionamiento Inteligente</p>
            </div>

            {/* Cabecera */}
            <div className="text-center lg:text-left mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {isRegistering ? 'Registro Institucional' : 'Bienvenido de nuevo'}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                    {isRegistering ? 'Completá tus datos para vincular tu vehículo.' : 'Ingresá tus credenciales institucionales para continuar.'}
                  </p>
                </div>
                {isRegistering && (
                  <button 
                    onClick={() => {
                      setIsRegistering(false);
                      setErrorRegistro('');
                      setMensajeExito('');
                    }}
                    className="lg:hidden w-8 h-8 bg-white/60 hover:bg-white rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-2 shadow-sm"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Mensajes */}
            {errorLogin && !isRegistering && (
              <div className="bg-red-50/90 text-red-700 p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold border border-red-200 flex items-center gap-2 shadow-sm mb-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="leading-tight">{errorLogin}</span>
              </div>
            )}
            
            {errorRegistro && isRegistering && (
              <div className="bg-red-50/90 text-red-700 p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold border border-red-200 flex items-center gap-2 shadow-sm mb-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="leading-tight">{errorRegistro}</span>
              </div>
            )}
            
            {mensajeExito && !isRegistering && (
              <div className="bg-emerald-50/90 text-emerald-800 p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-bold border border-emerald-200 flex items-center gap-2 shadow-sm mb-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="leading-tight">{mensajeExito}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 ml-1">Usuario / Matrícula</label>
                  <input 
                    type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]"
                    placeholder="Ej: alumno123"
                  />
                </div>
                
                {isRegistering && (
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 ml-1">Correo Electrónico</label>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} required={isRegistering}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]"
                      placeholder="tu@email.com"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 ml-1">Contraseña</label>
                  <input 
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]"
                    placeholder="········"
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="border-t border-slate-200/60 pt-3 mt-3 space-y-3">
                  
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 ml-1">Tipo de Vínculo</label>
                    <select 
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] cursor-pointer"
                      value={tipoPerfil} onChange={(e) => setTipoPerfil(e.target.value)}
                    >
                      <option value="ALUMNO">Alumno IES</option>
                      <option value="DOCENTE">Docente IES</option>
                      <option value="PARTICULAR">Particular / Externo</option>
                    </select>
                  </div>

                  {tipoPerfil !== 'PARTICULAR' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 ml-1">Carrera / Tecnicatura</label>
                        <select 
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl text-slate-900 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] cursor-pointer"
                          value={carrera} onChange={(e) => setCarrera(e.target.value)}
                        >
                          {CARRERAS_IES.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>
                      </div>

                      {tipoPerfil === 'ALUMNO' && (
                        <div className="grid grid-cols-3 gap-2 bg-white/50 p-2.5 sm:p-3 rounded-xl border border-slate-200">
                          <div>
                            <label className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase mb-1">Turno</label>
                            <select className="w-full p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg text-[10px] sm:text-xs font-bold focus:ring-2 focus:ring-blue-500/30 cursor-pointer shadow-sm" value={turnoCursado} onChange={(e) => setTurnoCursado(e.target.value)}>
                              <option value="MAÑANA">Mañana</option>
                              <option value="TARDE">Tarde</option>
                              <option value="NOCHE">Noche</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase mb-1">Año</label>
                            <select className="w-full p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg text-[10px] sm:text-xs font-bold focus:ring-2 focus:ring-blue-500/30 cursor-pointer shadow-sm" value={curso} onChange={(e) => setCurso(e.target.value)}>
                              <option value="1ro">1ro</option>
                              <option value="2do">2do</option>
                              <option value="3ro">3ro</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase mb-1">Comisión</label>
                            <select className="w-full p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg text-[10px] sm:text-xs font-bold focus:ring-2 focus:ring-blue-500/30 cursor-pointer shadow-sm" value={comision} onChange={(e) => setComision(e.target.value)}>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="Única">Única</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {tipoPerfil === 'PARTICULAR' && (
                    <div className="grid grid-cols-1 gap-2.5 bg-amber-50/50 p-3 sm:p-4 rounded-xl border border-amber-200">
                      <div>
                        <label className="block text-[10px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 ml-1">Nombre Completo</label>
                        <input 
                          type="text" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required={tipoPerfil === 'PARTICULAR'}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-amber-200 rounded-xl font-bold text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all shadow-sm"
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 ml-1">DNI / Documento</label>
                        <input 
                          type="text" value={dni} onChange={(e) => setDni(e.target.value)} required={tipoPerfil === 'PARTICULAR'}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-amber-200 rounded-xl font-bold text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 transition-all shadow-sm"
                          placeholder="Ej: 30123456"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 ml-1">Patente</label>
                      <input 
                        type="text" value={patenteHabitual} onChange={(e) => setPatenteHabitual(e.target.value)} maxLength="9" required={isRegistering}
                        className="w-full px-3 py-2.5 sm:py-3 bg-slate-50 border border-slate-300 rounded-xl focus:border-blue-500 focus:bg-white uppercase text-center font-black text-base sm:text-lg tracking-[0.15em] text-slate-900 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder:tracking-normal placeholder:font-medium placeholder:text-xs"
                        placeholder="AB 123 CD"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 ml-1">WhatsApp</label>
                      <input 
                        type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required={isRegistering}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/70 backdrop-blur-sm border border-slate-300 rounded-xl font-bold text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]"
                        placeholder="3881234567"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={`w-full text-white font-black text-sm sm:text-base py-3 sm:py-3.5 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 relative overflow-hidden group shadow-lg ${
                  isRegistering 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500/20 hover:shadow-emerald-500/30' 
                  : 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 shadow-blue-500/20 hover:shadow-blue-500/30'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isRegistering ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Guardar Mi Perfil
                    </>
                  ) : (
                    <>
                      Acceder al Portal
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </form>

            <div className="text-center mt-4 pt-4 border-t border-slate-200/60 space-y-3">
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {isRegistering ? '¿Ya estás registrado en el sistema?' : '¿Eres nuevo en la playa de estacionamiento?'}
              </p>
              <button 
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorRegistro('');
                  setMensajeExito('');
                }}
                className="text-slate-700 bg-white/80 hover:bg-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl transition-all duration-300 shadow-sm border border-slate-200 hover:border-slate-300 w-full sm:w-auto"
              >
                {isRegistering ? 'Volver a Iniciar Sesión' : 'Crear mi Credencial Digital'}
              </button>
              
              <div className="pt-2 flex items-center justify-center gap-2">
                <img src="/logoiesnh.png" alt="IES Logo Mini" className="w-4 h-4 object-contain opacity-70" />
                <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Plataforma del <span className="font-black text-slate-800">IES Nuevo Horizonte</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .glass-premium {
          background: rgba(255, 255, 255, 0.70);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        
        .shimmer-text-blue {
          background: linear-gradient(90deg, #60a5fa 0%, #bfdbfe 50%, #3b82f6 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 3s linear infinite;
        }
        
        @keyframes shine {
          to { background-position: 200% center; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.10; }
          50% { transform: scale(1.05); opacity: 0.15; }
        }
      `}} />
    </div>
  );
}