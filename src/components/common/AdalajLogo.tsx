import React from 'react';

interface AdalajLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
  height?: number;
}

export const AdalajLogo: React.FC<AdalajLogoProps> = ({
  variant = 'full',
  className = '',
  height = 42,
}) => {
  if (variant === 'icon') {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-[#9A2229] text-white shadow-sm border border-[#F59E0B]/30 overflow-hidden ${className}`}
        style={{ width: `${height}px`, height: `${height}px` }}
      >
        <img
          src="/pwa-192x192.png"
          alt="Adalaj Icon"
          className="w-full h-full object-contain p-0.5"
          onError={(e) => {
            // Fallback to text icon if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="font-serif font-black text-lg tracking-wider text-white hidden">A</span>
      </div>
    );
  }

  // Full / Compact official badge image
  const displayHeight = variant === 'compact' ? Math.min(height, 34) : height;

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src="/adalaj-logo-trimmed.png"
        alt="ADALAJ — Made for Real Moments"
        style={{ height: `${displayHeight}px`, width: 'auto' }}
        className="object-contain drop-shadow transition-transform hover:scale-[1.01]"
        onError={(e) => {
          // Fallback to full png if trimmed is missing
          e.currentTarget.src = '/adalaj-logo.png';
        }}
      />
    </div>
  );
};
