import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'smartspend_country';

export const COUNTRIES = [
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
];

const CountryContext = createContext(null);

export function CountryProvider({ children }) {
  const [country, setCountryState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });

  const setCountry = (code) => {
    localStorage.setItem(STORAGE_KEY, code);
    setCountryState(code);
  };

  const clearCountry = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCountryState(null);
  };

  return (
    <CountryContext.Provider value={{ country, setCountry, clearCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
}