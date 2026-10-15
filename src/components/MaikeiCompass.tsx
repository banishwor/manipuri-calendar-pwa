import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { LanguageMode, Translations } from '../types';
import { Translator } from '../utils/translator';

export interface CompassPoint {
  key: string;
  polarAngle: number; // Trigonometric angle on 2D plane (degrees): 0 = East, 90 = South, 180 = West, 270 = North
  labelEn: string;
}

export const DIRECTION_METADATA: Record<string, { needleAngle: number; en: string }> = {
  'AWANG': { needleAngle: 0, en: 'North' },
  'CHINGKHEI': { needleAngle: 45, en: 'North-East' },
  'NONGPOK': { needleAngle: 90, en: 'East' },
  'MEIRAM': { needleAngle: 135, en: 'South-East' },
  'KHA': { needleAngle: 180, en: 'South' },
  'MAKHA': { needleAngle: 180, en: 'South' },
  'SANTHONG': { needleAngle: 225, en: 'South-West' },
  'NONGCHUP': { needleAngle: 270, en: 'West' },
  'KOUBRU': { needleAngle: 315, en: 'North-West' }
};

export const COMPASS_DIAL_POINTS: CompassPoint[] = [
  { key: 'AWANG', polarAngle: 270, labelEn: 'N' },
  { key: 'CHINGKHEI', polarAngle: 315, labelEn: 'NE' },
  { key: 'NONGPOK', polarAngle: 0, labelEn: 'E' },
  { key: 'MEIRAM', polarAngle: 45, labelEn: 'SE' },
  { key: 'KHA', polarAngle: 90, labelEn: 'S' },
  { key: 'SANTHONG', polarAngle: 135, labelEn: 'SW' },
  { key: 'NONGCHUP', polarAngle: 180, labelEn: 'W' },
  { key: 'KOUBRU', polarAngle: 225, labelEn: 'NW' }
];

export interface MaikeiCompassProps {
  selectedDirection: string;
  selectedMonthName?: string;
  languageMode: LanguageMode;
  translations: Translations | null;
  className?: string;
  showReadout?: boolean;
}

export const MaikeiCompass: React.FC<MaikeiCompassProps> = ({
  selectedDirection,
  selectedMonthName = '',
  languageMode,
  translations,
  className = '',
  showReadout = true
}) => {
  const normDirection = (selectedDirection || 'CHINGKHEI').toUpperCase();
  const activeDirection = normDirection === 'MAKHA' ? 'KHA' : normDirection;
  const needleAngle = DIRECTION_METADATA[activeDirection]?.needleAngle ?? 45;

  const dirDisplayNative = Translator.translateDirection(activeDirection, languageMode, translations);
  const dirDisplayEng = DIRECTION_METADATA[activeDirection]?.en || activeDirection;
  const translatedMonth = selectedMonthName ? Translator.translateMonth(selectedMonthName, languageMode, translations) : '';

  // 240x240 Unified ViewBox Geometry
  const center = 120;
  const outerBezelRadius = 114;
  const outerAccentRadius = 110;
  const textRadius = 92;
  const astrolabeRadius = 74;
  const innerBoundaryRadius = 64;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Astrolabe SVG Dial */}
      <div className="relative w-full max-w-[210px] aspect-square">
        <svg className="w-full h-full" viewBox="0 0 240 240">
          {/* Outer Bezel */}
          <circle
            cx={center}
            cy={center}
            r={outerBezelRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-gray-200 dark:text-gray-800"
          />

          {/* Delicate Outer Accent Ring */}
          <circle
            cx={center}
            cy={center}
            r={outerAccentRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-200/80 dark:text-gray-800/60"
          />

          {/* Celestial Astrolabe Dashed Hairline Ring */}
          <circle
            cx={center}
            cy={center}
            r={astrolabeRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2.5 3.5"
            className="text-gray-300 dark:text-gray-700"
          />

          {/* Subtle Inner Boundary Ring */}
          <circle
            cx={center}
            cy={center}
            r={innerBoundaryRadius}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1 3"
            className="text-gray-200/60 dark:text-gray-800/40"
          />

          {/* 8 Cardinal & Ordinal Points on the Astrolabe Track */}
          {COMPASS_DIAL_POINTS.map((pt) => {
            const rad = (pt.polarAngle * Math.PI) / 180;
            const isTarget = pt.key === activeDirection;
            const dotX = center + astrolabeRadius * Math.cos(rad);
            const dotY = center + astrolabeRadius * Math.sin(rad);

            return (
              <g key={`pt-${pt.key}`}>
                {/* Glowing Outer Halo for Active Direction */}
                {isTarget && (
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r={7.5}
                    className="stroke-rose-500 fill-rose-500/20 stroke-1.5"
                  />
                )}
                {/* Center Core Dot */}
                <circle
                  cx={dotX}
                  cy={dotY}
                  r={isTarget ? 3.5 : 2}
                  className={isTarget ? 'fill-rose-600 dark:fill-rose-400' : 'fill-gray-300 dark:fill-gray-600'}
                />
              </g>
            );
          })}

          {/* Direction Text Labels with Authentic Manipuri Names as Hero */}
          {COMPASS_DIAL_POINTS.map((pt) => {
            const rad = (pt.polarAngle * Math.PI) / 180;
            const isTarget = pt.key === activeDirection;
            const textX = center + textRadius * Math.cos(rad);
            const textY = center + textRadius * Math.sin(rad);

            const manipuriName = Translator.translateDirection(pt.key, languageMode, translations);

            return (
              <text
                key={`lbl-${pt.key}`}
                x={textX}
                y={textY}
                textAnchor="middle"
                dominantBaseline="central"
                className={`select-none pointer-events-none transition-colors ${
                  isTarget
                    ? 'fill-rose-700 dark:fill-rose-400 font-black'
                    : 'fill-gray-500 dark:fill-gray-400 font-bold'
                }`}
              >
                {/* Line 1: Authentic Manipuri Direction Name */}
                <tspan
                  x={textX}
                  dy="-0.25em"
                  fontSize={isTarget ? '9.5px' : '8.5px'}
                  fontWeight={isTarget ? '900' : '700'}
                >
                  {manipuriName}
                </tspan>
                {/* Line 2: Cardinal Navigational Abbreviation */}
                <tspan
                  x={textX}
                  dy="1.2em"
                  fontSize="7px"
                  fontWeight="800"
                  className={isTarget ? 'fill-rose-600 dark:fill-rose-300' : 'fill-gray-400 dark:fill-gray-500'}
                >
                  {pt.labelEn}
                </tspan>
              </text>
            );
          })}

          {/* Dynamic Rotating Pointer Needle with Symmetrical (0,0) Center Anchoring */}
          <g transform={`translate(${center}, ${center})`}>
            <motion.g
              animate={{ rotate: needleAngle }}
              transition={{
                type: 'spring',
                stiffness: 90,
                damping: 13,
                mass: 0.8
              }}
              style={{
                transformOrigin: 'center',
                transformBox: 'fill-box'
              }}
            >
              {/* Symmetrical bounding anchor ensures transform-origin: center is 100% locked to (0,0) */}
              <circle cx="0" cy="0" r={innerBoundaryRadius} fill="none" opacity="0" pointerEvents="none" />

              {/* Active / Inauspicious Needle (Faceted Crimson Ruby Arrow) */}
              <polygon
                points="0,-58 -3.6,0 0,-2"
                className="fill-rose-700 dark:fill-rose-600 filter drop-shadow(0 2px 4px rgba(190,18,60,0.35))"
              />
              <polygon
                points="0,-58 3.6,0 0,-2"
                className="fill-rose-500 dark:fill-rose-400"
              />

              {/* Counterweight (Faceted Dark Slate Arrow) */}
              <polygon
                points="0,28 -3.6,0 0,2"
                className="fill-slate-600 dark:fill-slate-600"
              />
              <polygon
                points="0,28 3.6,0 0,2"
                className="fill-slate-400 dark:fill-slate-500"
              />

              {/* Center Brass Compass Jewel */}
              <circle
                cx="0"
                cy="0"
                r="6"
                className="fill-amber-400 stroke-amber-600 stroke-1 shadow-sm"
              />
              <circle
                cx="0"
                cy="0"
                r="2.5"
                className="fill-white"
              />
            </motion.g>
          </g>
        </svg>
      </div>

      {/* Optional Integrated Readout */}
      {showReadout && (
        <div className="flex flex-col items-center text-center mt-1">
          <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight">
            {dirDisplayNative} · {dirDisplayEng}
          </span>
          {translatedMonth && (
            <span className="text-[10.5px] font-bold text-rose-800 dark:text-rose-400 mt-0.5">
              Thasi maikei - {translatedMonth}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
