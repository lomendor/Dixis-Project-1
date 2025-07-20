'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DixisLogoProps {
  variant?: 'icon' | 'full' | 'text-only' | 'custom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
  clickable?: boolean;
  href?: string;
}

const sizeClasses = {
  sm: {
    icon: 'w-6 h-6',
    full: 'h-8',
    text: 'text-lg',
    custom: 'h-8',
    customText: 'text-xl'
  },
  md: {
    icon: 'w-8 h-8',
    full: 'h-10',
    text: 'text-xl',
    custom: 'h-10',
    customText: 'text-2xl'
  },
  lg: {
    icon: 'w-12 h-12',
    full: 'h-14',
    text: 'text-2xl',
    custom: 'h-14',
    customText: 'text-3xl'
  },
  xl: {
    icon: 'w-16 h-16',
    full: 'h-20',
    text: 'text-3xl',
    custom: 'h-16',
    customText: 'text-4xl'
  }
};

export default function DixisLogo({
  variant = 'icon',
  size = 'md',
  className = '',
  animated = false,
  clickable = true,
  href = '/'
}: DixisLogoProps) {
  const logoContent = () => {
    switch (variant) {
      case 'icon':
        return (
          <div className={`relative ${sizeClasses[size].icon} ${className}`}>
            <Image
              src="/images/dixis-logo-icon.png"
              alt="Dixis Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        );
      
      case 'full':
        return (
          <div className={`relative ${sizeClasses[size].full} ${className}`}>
            <Image
              src="/images/dixis-logo-with-text.png"
              alt="Dixis - Φρέσκα Ελληνικά Προϊόντα"
              width={120}
              height={40}
              className="object-contain h-full w-auto"
              priority
            />
          </div>
        );
      
      case 'text-only':
        return (
          <span className={`font-bold text-emerald-600 ${sizeClasses[size].text} ${className}`}>
            Dixis
          </span>
        );
      
      case 'custom':
        return (
          <div className={`flex items-center gap-3 ${className}`}>
            <div className={`relative ${sizeClasses[size].custom} aspect-square drop-shadow-sm`}>
              <Image
                src="/images/dixis-logo-clean.png"
                alt="Dixis Logo"
                fill
                className="object-contain"
                priority
                sizes={`${parseInt(sizeClasses[size].custom.replace('h-', '')) * 4}px`}
              />
            </div>
            <span className={`font-bold text-black ${sizeClasses[size].customText} tracking-tight select-none`} 
                  style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
              Dixis
            </span>
          </div>
        );
      
      default:
        return null;
    }
  };

  const LogoWrapper = animated ? motion.div : 'div';
  const animationProps = animated ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2, ease: 'easeInOut' }
  } : {};

  if (clickable) {
    return (
      <Link href={href} className="inline-block">
        <LogoWrapper {...animationProps}>
          {logoContent()}
        </LogoWrapper>
      </Link>
    );
  }

  return (
    <LogoWrapper {...animationProps}>
      {logoContent()}
    </LogoWrapper>
  );
}

// Specific logo variants for common use cases
export function DixisLogoIcon({ size = 'md', className = '', animated = false, clickable = true }: Pick<DixisLogoProps, 'size' | 'className' | 'animated' | 'clickable'>) {
  return <DixisLogo variant="icon" size={size} className={className} animated={animated} clickable={clickable} />;
}

export function DixisLogoFull({ size = 'md', className = '', animated = false, clickable = true }: Pick<DixisLogoProps, 'size' | 'className' | 'animated' | 'clickable'>) {
  return <DixisLogo variant="full" size={size} className={className} animated={animated} clickable={clickable} />;
}

export function DixisLogoText({ size = 'md', className = '', animated = false, clickable = true }: Pick<DixisLogoProps, 'size' | 'className' | 'animated' | 'clickable'>) {
  return <DixisLogo variant="text-only" size={size} className={className} animated={animated} clickable={clickable} />;
}

export function DixisLogoCustom({ size = 'md', className = '', animated = false, clickable = true }: Pick<DixisLogoProps, 'size' | 'className' | 'animated' | 'clickable'>) {
  return <DixisLogo variant="custom" size={size} className={className} animated={animated} clickable={clickable} />;
}