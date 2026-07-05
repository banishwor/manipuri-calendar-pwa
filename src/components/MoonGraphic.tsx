import React from 'react';

interface MoonGraphicProps {
  phase: string; // 'purnima' | 'thasi' | 'ekadasi'
  moonPhase?: string; // 'waning' | 'waxing'
  size?: number | string;
  className?: string;
}

export const MoonGraphic: React.FC<MoonGraphicProps> = ({
  phase,
  moonPhase = 'waxing',
  size = 48,
  className = ''
}) => {
  const normPhase = phase.toLowerCase();
  const normMoonPhase = moonPhase ? moonPhase.toLowerCase() : 'waxing';

  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  if (normPhase === 'purnima') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={className}
        style={{ width: pixelSize, height: pixelSize }}
      >
        {/* Full Golden Radiant Moon */}
        <circle cx="50" cy="50" r="46" fill="#FBD15B" />
        {/* Soft glowing accent */}
        <circle cx="50" cy="50" r="32" fill="#FFFFFF" fillOpacity="0.25" />
      </svg>
    );
  }

  if (normPhase === 'thasi') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={className}
        style={{ width: pixelSize, height: pixelSize }}
      >
        {/* New / Dark Moon (Gray with outline) */}
        <circle cx="50" cy="50" r="46" fill="rgba(100, 116, 139, 0.15)" stroke="rgba(100, 116, 139, 0.4)" strokeWidth="4" />
      </svg>
    );
  }

  if (normPhase === 'ekadasi') {
    if (normMoonPhase === 'waning') {
      return (
        <svg
          viewBox="0 0 100 100"
          className={className}
          style={{ width: pixelSize, height: pixelSize }}
        >
          {/* Base background circle (Shadow half) */}
          <circle cx="50" cy="50" r="46" fill="rgba(100, 116, 139, 0.15)" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="2" />
          {/* Left half is golden, right half is dark */}
          <path d="M 50,4 A 46,46 0 0,0 50,96 Z" fill="#FBD15B" />
        </svg>
      );
    } else {
      return (
        <svg
          viewBox="0 0 100 100"
          className={className}
          style={{ width: pixelSize, height: pixelSize }}
        >
          {/* Base background circle (Shadow half) */}
          <circle cx="50" cy="50" r="46" fill="rgba(100, 116, 139, 0.15)" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="2" />
          {/* Right half is golden, left half is dark */}
          <path d="M 50,4 A 46,46 0 0,1 50,96 Z" fill="#FBD15B" />
        </svg>
      );
    }
  }

  // Fallback
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <circle cx="50" cy="50" r="46" fill="#FBD15B" />
    </svg>
  );
};
