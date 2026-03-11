'use client';

/**
 * Account Icon Display Component
 * Renders a Lucide icon for an account with consistent styling
 */

import React from 'react';
import { AccountIcon } from '@/app/types/account';
import { getLucideIcon } from '@/app/utils/lucideIconMap';

interface AccountIconDisplayProps {
  icon: AccountIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  withBackground?: boolean;
}

const sizeConfig = {
  xs: { icon: 'w-3 h-3', container: 'w-6 h-6', strokeWidth: 1.5 },
  sm: { icon: 'w-4 h-4', container: 'w-8 h-8', strokeWidth: 1.5 },
  md: { icon: 'w-5 h-5', container: 'w-10 h-10', strokeWidth: 1.5 },
  lg: { icon: 'w-6 h-6', container: 'w-12 h-12', strokeWidth: 1.5 },
  xl: { icon: 'w-8 h-8', container: 'w-14 h-14', strokeWidth: 1.5 },
};

export function AccountIconDisplay({
  icon,
  size = 'md',
  color,
  className = '',
  withBackground = false,
}: AccountIconDisplayProps) {
  const IconComponent = getLucideIcon(icon);
  const config = sizeConfig[size];

  if (withBackground) {
    return (
      <div
        className={`${config.container} rounded-lg flex items-center justify-center ${className}`}
        style={{ backgroundColor: color ? `${color}20` : undefined }}
      >
        <IconComponent
          className={config.icon}
          style={{ color }}
          strokeWidth={config.strokeWidth}
        />
      </div>
    );
  }

  return (
    <IconComponent
      className={`${config.icon} ${className}`}
      style={{ color }}
      strokeWidth={config.strokeWidth}
    />
  );
}
