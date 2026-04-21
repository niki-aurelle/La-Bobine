// Palette La Bobine — Tons chauds, féminins, artisanaux
export const Colors = {
  // Primaires
  primary: '#C8956C',       // Terre cuite douce
  primaryLight: '#E8B99A',  // Saumon clair
  primaryDark: '#9A6B47',   // Caramel foncé

  // Secondaires
  secondary: '#8B6F5E',     // Taupe
  secondaryLight: '#C4A99A', // Beige rosé

  // Arrière-plans
  background: '#FAF7F4',    // Blanc cassé chaud
  surface: '#FFFFFF',
  surfaceSecondary: '#F5EDE6', // Fond carte

  // Textes
  textPrimary: '#2D1B0E',   // Brun très foncé
  textSecondary: '#6B4F3A', // Brun moyen
  textMuted: '#A68B77',     // Brun clair / gris chaud
  textOnPrimary: '#FFFFFF',

  // Statuts commandes
  statusDraft: '#9CA3AF',
  statusConfirmed: '#60A5FA',
  statusInProgress: '#FBBF24',
  statusFitting: '#A78BFA',
  statusReady: '#34D399',
  statusDelivered: '#10B981',
  statusCancelled: '#F87171',

  // Utilitaires
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',

  // Bordures / séparateurs
  border: '#E5D5C8',
  divider: '#F0E0D0',

  // Overlay / shadow
  overlay: 'rgba(45, 27, 14, 0.5)',
  shadow: 'rgba(45, 27, 14, 0.12)',

  // Blanc / Noir
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ColorKey = keyof typeof Colors;
