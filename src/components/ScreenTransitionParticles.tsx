import React from 'react';
import { GameScreen } from '../types';

interface ScreenTransitionParticlesProps {
  currentScreen: GameScreen;
  triggerBurst?: boolean;
}

export const ScreenTransitionParticles: React.FC<ScreenTransitionParticlesProps> = () => {
  // Removido completamente para garantir zero overhead de GPU e zero partículas
  return null;
};

