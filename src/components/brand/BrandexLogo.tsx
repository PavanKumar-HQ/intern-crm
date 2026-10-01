import React from 'react';

interface BrandexLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function BrandexLogo({
  className = '',
  size = 'md',
  showText = true,
}: BrandexLogoProps) {
  const iconSizes = {
    sm: { width: 22, height: 22 },
    md: { width: 28, height: 28 },
    lg: { width: 36, height: 36 },
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const dim = iconSizes[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Brandex Geometric Vibrant Emblem */}
      <div
        className="flex items-center justify-center rounded-lg shadow-sm shrink-0"
        style={{
          width: dim.width + 10,
          height: dim.height + 10,
          background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #7C3AED 100%)',
          boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
        }}
      >
        <svg
          width={dim.width}
          height={dim.height}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* First left slant stripe */}
          <path d="M22 82L40 18H28L10 82H22Z" fill="#FFFFFF" fillOpacity="0.95" />

          {/* Second left slant stripe */}
          <path d="M36 82L54 18H42L24 82H36Z" fill="#FFFFFF" fillOpacity="0.95" />

          {/* Upper B loop & right structure */}
          <path d="M50 18H74C82 18 88 24 88 34C88 43 82 48 74 48H58L50 18Z" fill="#FFFFFF" fillOpacity="0.95" />

          {/* Lower B loop with outward curve */}
          <path d="M58 48H76C84 48 90 54 90 66C90 76 84 82 74 82H46L58 48Z" fill="#FFFFFF" fillOpacity="0.95" />

          {/* Dynamic Faceted Contrast Triangle Accent */}
          <polygon points="46,82 68,82 56,48" fill="#FBBF24" />

          {/* Inner negative space cutouts */}
          <rect x="58" y="28" width="14" height="10" rx="3" fill="#4F46E5" />
          <circle cx="68" cy="65" r="6" fill="#6366F1" />
        </svg>
      </div>

      {/* Brandex Clean Bold Wordmark */}
      {showText && (
        <span
          className={`font-bold tracking-tight text-[#171717] ${textSizes[size]} font-sans select-none flex items-center`}
          style={{ letterSpacing: '-0.02em' }}
        >
          Brandex
        </span>
      )}
    </div>
  );
}
