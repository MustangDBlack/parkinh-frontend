import { useState } from 'react';
import ModuloFinanzas from './ModuloFinanzas';
import ModuloAuditoria from './ModuloAuditoria';

export default function Dashboard({ reservas }) {
  const [tabActiva, setTabActiva] = useState('FINANZAS');
  
  return (
    <div className="space-y-4 sm:space-y-6 fade-in">
      
      {/* NAVEGACIÓN DE MÓDULOS (Segmented Control Minimalista) */}
      <div className="flex justify-center mb-2 sm:mb-4">
        <div className="inline-flex bg-gray-200/60 p-1.5 rounded-xl backdrop-blur-sm shadow-inner overflow-x-auto max-w-full">
          <button 
            onClick={() => setTabActiva('FINANZAS')} 
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              tabActiva === 'FINANZAS' 
                ? 'bg-white text-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.15)]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Finanzas
          </button>
          <button 
            onClick={() => setTabActiva('AUDITORIA')} 
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              tabActiva === 'AUDITORIA' 
                ? 'bg-white text-blue-700 shadow-[0_4px_12px_rgba(37,99,235,0.15)]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Fichas de Usuarios
          </button>
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL DE MÓDULOS */}
      <div className="transition-all duration-300">
        {tabActiva === 'FINANZAS' && <ModuloFinanzas reservas={reservas} />}
        {tabActiva === 'AUDITORIA' && <ModuloAuditoria reservas={reservas} />}
      </div>

    </div>
  );
}