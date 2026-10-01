import React from 'react';
import Image from 'next/image';

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
  const heights = {
    sm: 24,
    md: 30,
    lg: 38,
  };

  const h = heights[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Clean high-contrast container for the official Brandex logo */}
      <div className="bg-white rounded-lg px-2.5 py-1.5 border border-[#E2DDD2] shadow-xs flex items-center justify-center">
        {showText ? (
          <Image
            src="/brandex-logo.png"
            alt="Brandex CRM"
            width={120}
            height={h}
            priority
            className="object-contain"
            style={{ height: `${h}px`, width: 'auto' }}
          />
        ) : (
          <Image
            src="/brandex-icon.png"
            alt="Brandex"
            width={h}
            height={h}
            priority
            className="object-contain"
            style={{ height: `${h}px`, width: 'auto' }}
          />
        )}
      </div>
    </div>
  );
}
