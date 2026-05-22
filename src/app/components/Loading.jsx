import React from 'react';

// GRASP: Pure Fabrication - componente presentacional simple para separar la vista de carga.
export default function Loading({ message = 'Cargando...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}>
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm sm:text-base">{message}</p>
    </div>
  );
}
