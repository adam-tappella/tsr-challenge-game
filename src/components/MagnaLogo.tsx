/**
 * MagnaLogo Component
 * 
 * Displays the official Magna logo following brand guidelines.
 * - White/light backgrounds: Use full color logo (magna-logo.png)
 * - Dark/black backgrounds: Use white reverse logo (magna-logo-white.png)
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface MagnaLogoProps {
  /** Use white/reverse logo for dark backgrounds */
  variant?: 'color' | 'white' | 'black';
  /** Size preset */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom className for additional styling */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
}

const sizeClasses = {
  xs: 'h-6',
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16',
};

/**
 * Official Magna logo component
 * Uses proper brand assets based on background color
 */
export const MagnaLogo: React.FC<MagnaLogoProps> = ({
  variant = 'color',
  size = 'md',
  className,
  alt = 'Magna International',
}) => {
  const logoSrc = {
    color: '/magna-logo.png',
    white: '/magna-logo-white.png',
    black: '/magna-logo-black.png',
  }[variant];

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={cn(sizeClasses[size], 'w-auto object-contain', className)}
    />
  );
};

MagnaLogo.displayName = 'MagnaLogo';

export default MagnaLogo;
