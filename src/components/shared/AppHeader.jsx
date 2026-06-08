import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = "https://media.base44.com/images/public/user_69ea57333f824d48a1afdd12/e7314e200_image.png";

export default function AppHeader({ title, showBack, rightAction, onBack }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button onClick={onBack || (() => navigate(-1))} className="p-1 -ml-1 rounded-xl hover:bg-muted transition-colors">
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
          ) : (
            <img src={LOGO_URL} alt="SmartSpend" className="w-8 h-8 rounded-lg" />
          )}
          {title && <h1 className="text-lg font-bold text-foreground">{title}</h1>}
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}