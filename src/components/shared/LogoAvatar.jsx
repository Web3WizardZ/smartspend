import React from 'react';

export default function LogoAvatar({ logoUrl, initials, brandColour, name, size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg',
  };

  if (logoUrl) {
    return (
      <div className={`${sizes[size]} rounded-2xl bg-white border border-border flex items-center justify-center overflow-hidden flex-shrink-0`}>
        <img
          src={logoUrl}
          alt={name || ''}
          className="w-3/4 h-3/4 object-contain"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div className="hidden items-center justify-center w-full h-full font-bold text-white" style={{ backgroundColor: brandColour || 'hsl(var(--primary))' }}>
          {initials || name?.charAt(0) || '?'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: brandColour || 'hsl(var(--primary))' }}
    >
      {initials || name?.charAt(0) || '?'}
    </div>
  );
}