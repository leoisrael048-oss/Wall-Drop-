import React from 'react';

interface DustParticlesProps {
  density?: number;
  speed?: number;
  color?: string;
}

export const DustParticles: React.FC<DustParticlesProps> = () => {
  // Removido completamente para garantir zero overhead de GPU e zero partículas
  return null;
};

