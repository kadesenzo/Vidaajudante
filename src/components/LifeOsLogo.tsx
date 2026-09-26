import React from 'react';

interface LifeOsLogoProps {
  variant?: 'full' | 'header' | 'icon' | 'emblem';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showIcons?: boolean;
  className?: string;
}

export const LifeOsLogo: React.FC<LifeOsLogoProps> = ({
  variant = 'header',
  size = 'md',
  showSubtitle = false,
  showIcons = false,
  className = '',
}) => {
  // Dimensions map for icon/emblem
  const sizeMap = {
    xs: { px: 24, fontSize: 'text-sm', subSize: 'text-[9px]' },
    sm: { px: 32, fontSize: 'text-base', subSize: 'text-[10px]' },
    md: { px: 42, fontSize: 'text-xl', subSize: 'text-xs' },
    lg: { px: 64, fontSize: 'text-2xl', subSize: 'text-sm' },
    xl: { px: 96, fontSize: 'text-4xl', subSize: 'text-base' },
  };

  const currentSize = sizeMap[size];

  // The Pure Vector Emblem of Life OS (Stylized L with Cyan Checkmark & Arc)
  const renderEmblem = (widthPx: number, isSquircle: boolean = true) => {
    return (
      <div
        style={{ width: widthPx, height: widthPx }}
        className={`relative flex items-center justify-center flex-shrink-0 transition-transform ${
          isSquircle ? 'rounded-[26%] shadow-lg' : ''
        }`}
      >
        <svg
          viewBox="0 0 512 512"
          width="100%"
          height="100%"
          className="overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`lGrad_${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="30%" stopColor="#0284C7" />
              <stop offset="65%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>

            <linearGradient id={`arcGrad_${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>

            <linearGradient id={`borderGrad_${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="35%" stopColor="#0072FF" />
              <stop offset="70%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>

            <radialGradient id={`glow_${size}`} cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#7C3AED" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#08080C" stopOpacity="0" />
            </radialGradient>
          </defs>

          {isSquircle && (
            <>
              {/* Dark Obsidian Squircle */}
              <rect x="0" y="0" width="512" height="512" rx="112" fill="#08080C" />
              {/* Radial Center Glow */}
              <rect x="0" y="0" width="512" height="512" rx="112" fill={`url(#glow_${size})`} />
              {/* Glowing Neon Perimeter Border */}
              <rect
                x="12"
                y="12"
                width="488"
                height="488"
                rx="102"
                fill="none"
                stroke={`url(#borderGrad_${size})`}
                strokeWidth="10"
                strokeOpacity="0.95"
              />
            </>
          )}

          {/* Central Stylized "L" with Checkmark */}
          <g transform={isSquircle ? 'translate(0, -6)' : 'translate(-8, -8)'}>
            {/* Circular Arc in crook */}
            <path
              d="M 234 126 A 84 84 0 1 1 342 254"
              fill="none"
              stroke={`url(#arcGrad_${size})`}
              strokeWidth="24"
              strokeLinecap="round"
            />

            {/* Stylized "L" Body */}
            <path
              d="M 175 80 
                 C 188 80, 222 92, 226 120
                 C 228 140, 228 215, 228 235
                 C 228 268, 242 288, 280 288
                 L 308 288
                 C 325 288, 332 300, 328 314
                 C 324 328, 310 335, 288 335
                 L 225 335
                 C 180 335, 152 300, 152 260
                 L 152 105
                 C 152 88, 158 80, 175 80 Z"
              fill={`url(#lGrad_${size})`}
            />

            {/* Electric Cyan Checkmark */}
            <path
              d="M 250 178 L 278 206 L 324 148"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    );
  };

  // If variant is 'icon' or 'emblem'
  if (variant === 'icon') {
    return <div className={`inline-block ${className}`}>{renderEmblem(currentSize.px, true)}</div>;
  }

  if (variant === 'emblem') {
    return <div className={`inline-block ${className}`}>{renderEmblem(currentSize.px, false)}</div>;
  }

  // Full Hero Card Logo (as seen in the uploaded reference)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <div className="relative mb-3">
          <img
            src="/logo.svg"
            alt="Life OS Logo"
            className="w-48 h-48 sm:w-56 sm:h-56 drop-shadow-[0_12px_32px_rgba(0,180,255,0.25)] rounded-[24%] transition-transform hover:scale-[1.02]"
          />
        </div>
      </div>
    );
  }

  // Default 'header' variant (Icon + Life OS text + optional subtitle)
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {renderEmblem(currentSize.px, true)}

      <div className="flex flex-col leading-none">
        <div className={`font-bold tracking-tight text-white flex items-center ${currentSize.fontSize}`}>
          <span>Life</span>
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent ml-1">
            OS
          </span>
        </div>

        {(showSubtitle || variant === 'header') && (
          <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-white/50 mt-0.5">
            Sua Vida, Organizada
          </span>
        )}
      </div>
    </div>
  );
};
