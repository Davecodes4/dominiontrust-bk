import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  hover = false,
  ...props
}) => {
  const baseStyles = 'rounded-lg border transition-all duration-200';
  
  const variants = {
    default: 'bg-card text-card-foreground border-border',
    elevated: 'bg-card text-card-foreground border-border shadow-lg',
    glass: 'glass border-white/10',
    gradient: 'gradient-primary text-white border-transparent',
  };
  
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={clsx(
        baseStyles,
        variants[variant],
        paddings[padding],
        {
          'card-hover': hover,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 