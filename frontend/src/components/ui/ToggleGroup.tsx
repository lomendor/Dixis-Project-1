'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface ToggleGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value,
  onValueChange,
  children,
  className
}) => {
  return (
    <div className={cn("inline-flex", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as { value?: string };
          return React.cloneElement(child, {
            isSelected: childProps.value === value,
            onClick: () => onValueChange(childProps.value || ''),
          } as any);
        }
        return child;
      })}
    </div>
  );
};

interface ToggleGroupItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ToggleGroupItem: React.FC<ToggleGroupItemProps> = ({
  value,
  children,
  className,
  isSelected = false,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "transition-all duration-200",
        isSelected 
          ? "bg-white text-blue-600 shadow-sm" 
          : "text-gray-600 hover:text-gray-900",
        className
      )}
    >
      {children}
    </button>
  );
};