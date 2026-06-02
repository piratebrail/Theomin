// src/components/ui/IconButton.tsx
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export function IconButton({ 
  icon, 
  variant = 'ghost', 
  size = 'md', 
  tooltip,
  className,
  ...props 
}: IconButtonProps) {
  return (
    <button
      className={`icon-btn icon-btn--${variant} icon-btn--${size} ${className || ''}`}
      title={tooltip}
      {...props}
    >
      {icon}
    </button>
  );
}
