// KitchenSyncLogo.tsx - Reusable wordmark with rotated K
import React from 'react';

interface KitchenSyncLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'sidebar';
  variant?: 'light' | 'dark' | 'gradient';
  className?: string;
  showIcon?: boolean; // Optional: show the table icon before the wordmark
}

export const KitchenSyncLogo: React.FC<KitchenSyncLogoProps> = ({ 
  size = 'medium', 
  variant = 'dark',
  className = '',
  showIcon = false
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      fontSize: '1rem',      // 16px
      kSize: '1.1rem',       // 17.6px
      gap: '0.1rem',         // 1.6px
      iconSize: '20px'
    },
    medium: {
      fontSize: '1.25rem',   // 20px
      kSize: '1.35rem',      // 21.6px
      gap: '0.15rem',        // 2.4px
      iconSize: '24px'
    },
    large: {
      fontSize: '1.75rem',   // 28px
      kSize: '1.9rem',       // 30.4px
      gap: '0.2rem',         // 3.2px
      iconSize: '32px'
    },
    xlarge: {
      fontSize: '2.5rem',    // 40px
      kSize: '2.7rem',       // 43.2px
      gap: '0.25rem',        // 4px
      iconSize: '48px'
    },
    sidebar: {
      fontSize: '1.125rem',  // 18px - slightly larger than small
      kSize: '1.2rem',       // 19.2px
      gap: '0.1rem',         // 1.6px
      iconSize: '22px'       // Smaller circular logo for better proportions
    }
  };

  const config = sizeConfig[size];

  // Color variants
  const colorStyles = {
    light: {
      color: 'white',
      kColor: 'white',
      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
      kGradient: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)'
    },
    dark: {
      color: '#1f2937',
      kColor: '#1f2937',
      textShadow: 'none',
      kGradient: 'linear-gradient(135deg, #1f2937 0%, #3b82f6 100%)'
    },
    gradient: {
      color: 'transparent',
      kColor: 'transparent',
      textShadow: 'none',
      kGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
    }
  };

  const colors = colorStyles[variant];

  return (
    <div 
      className={`inline-flex items-center ${className}`}
      style={{ 
        fontFamily: 'Inter, sans-serif',
        gap: showIcon ? config.gap : 0
      }}
    >
      {/* Optional Icon - Circular logo, size-adjusted based on context, rotated 90° counterclockwise */}
      {showIcon && (
        <img 
          src="/k-table-logo.svg" 
          alt="KitchenSync Icon" 
          style={{ 
            width: `${parseFloat(config.iconSize) * (size === 'sidebar' ? 1.32 : 1.3)}px`, // Increased by 20% (1.1 * 1.2 = 1.32)
            height: `${parseFloat(config.iconSize) * (size === 'sidebar' ? 1.32 : 1.3)}px`, // Increased by 20% (1.1 * 1.2 = 1.32)
            marginRight: size === 'sidebar' ? '-8px' : '-18px', // Moved left 10px (less negative = closer to text)
            position: 'relative',
            top: size === 'sidebar' ? '-1px' : '-11px', // Moved down 10px (less negative = lower)
            verticalAlign: 'middle',
            display: 'inline-block',
            transform: 'rotate(-90deg)', // Rotate 90 degrees counterclockwise
            zIndex: 1 // Put circle in background so text overlays it
          }}
        />
      )}
      
      {/* No separate K - the circular logo contains the K */}

      {/* Rest of "itchenSync" */}
      <span
        style={{
          fontSize: config.fontSize,
          fontWeight: 700,
          letterSpacing: '0.5px',
          color: colors.color,
          textShadow: colors.textShadow,
          background: variant === 'gradient' ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : undefined,
          WebkitBackgroundClip: variant === 'gradient' ? 'text' : undefined,
          WebkitTextFillColor: variant === 'gradient' ? 'transparent' : undefined,
          backgroundClip: variant === 'gradient' ? 'text' : undefined,
          lineHeight: 1,
          position: 'relative',
          zIndex: 2 // Text overlays the circle
        }}
      >
        itchenSync
      </span>
    </div>
  );
};

export default KitchenSyncLogo;

