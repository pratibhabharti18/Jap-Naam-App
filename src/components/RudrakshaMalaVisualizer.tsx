import React from 'react';

interface RudrakshaMalaVisualizerProps {
  currentBead: number; // 0 to malaSize
  malaSize: number; // usually 108
  className?: string;
}

export const RudrakshaMalaVisualizer: React.FC<RudrakshaMalaVisualizerProps> = ({
  currentBead,
  malaSize,
  className = '',
}) => {
  // We render 54 visual bead dots evenly distributed along the circumference
  // to keep the visual clean and prevent crowding on mobile screens,
  // representing the 108 mala cycle accurately.
  const visualBeadCount = 54;
  const radius = 135;
  const center = 150;

  // Percentage of completion
  const progressPercent = Math.min(1, currentBead / Math.max(1, malaSize));
  const activeVisualBeads = Math.round(progressPercent * visualBeadCount);

  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        className="transform -rotate-90 overflow-visible"
      >
        <defs>
          {/* Rudraksha Wood Gradient */}
          <radialGradient id="rudrakshaBead" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#8C532B" />
            <stop offset="60%" stop-color="#542B10" />
            <stop offset="100%" stop-color="#2E1505" />
          </radialGradient>
          {/* Active Glowing Saffron Bead */}
          <radialGradient id="activeBeadGlow" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FEF08A" />
            <stop offset="40%" stop-color="#F59E0B" />
            <stop offset="85%" stop-color="#C88735" />
            <stop offset="100%" stop-color="#B45309" />
          </radialGradient>
          {/* Meru / Guru Bead (Golden Brass) */}
          <radialGradient id="meruBead" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#FFFBEB" />
            <stop offset="35%" stop-color="#F59E0B" />
            <stop offset="80%" stop-color="#B89A60" />
            <stop offset="100%" stop-color="#785B24" />
          </radialGradient>
        </defs>

        {/* Sacred Thread Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#B89A60"
          strokeWidth="1.5"
          strokeDasharray="2 4"
          strokeOpacity="0.4"
        />

        {/* Dynamic Beads along circumference */}
        {Array.from({ length: visualBeadCount }).map((_, index) => {
          const angle = (index / visualBeadCount) * 2 * Math.PI;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const isActive = index < activeVisualBeads;
          const isCurrentTarget = index === activeVisualBeads && currentBead > 0;

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={isActive ? 4 : isCurrentTarget ? 4.5 : 3.2}
              fill={isActive || isCurrentTarget ? 'url(#activeBeadGlow)' : 'url(#rudrakshaBead)'}
              stroke={isActive ? '#F59E0B' : '#785B24'}
              strokeWidth={isActive ? '1.2' : '0.5'}
              className="transition-all duration-300"
              style={{
                filter: isCurrentTarget
                  ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.9))'
                  : isActive
                  ? 'drop-shadow(0 0 3px rgba(200, 135, 53, 0.5))'
                  : 'none',
              }}
            />
          );
        })}

        {/* Meru / Guru Bead at the Top (angle 0 in transformed coordinate) */}
        <g transform={`translate(${center + radius}, ${center})`}>
          <circle
            cx="0"
            cy="0"
            r="7"
            fill="url(#meruBead)"
            stroke="#F59E0B"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' }}
          />
          {/* Tassel representation */}
          <path
            d="M 5 -3 L 13 -5 L 14 0 L 13 5 L 5 3 Z"
            fill="#C88735"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
};
