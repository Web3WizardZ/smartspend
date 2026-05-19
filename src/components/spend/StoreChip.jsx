import React from 'react';
import LogoAvatar from '../shared/LogoAvatar';

export default function StoreChip({ retailer, onClick }) {
  return (
    <button
      onClick={() => onClick(retailer)}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all active:scale-95 min-w-[76px]"
    >
      <LogoAvatar
        logoUrl={retailer.logo_url}
        initials={retailer.initials}
        brandColour={retailer.brand_colour}
        name={retailer.name}
        size="md"
      />
      <span className="text-xs font-medium text-foreground text-center leading-tight line-clamp-2">
        {retailer.name}
      </span>
    </button>
  );
}