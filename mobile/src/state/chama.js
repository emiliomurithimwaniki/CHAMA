import React, { createContext, useContext, useMemo, useState } from 'react';

const ChamaContext = createContext(null);

export function ChamaProvider({ children }) {
  const [selectedChama, setSelectedChama] = useState(null);

  const value = useMemo(
    () => ({
      selectedChama,
      setSelectedChama,
      clearSelectedChama: () => setSelectedChama(null),
    }),
    [selectedChama]
  );

  return <ChamaContext.Provider value={value}>{children}</ChamaContext.Provider>;
}

export function useChama() {
  const ctx = useContext(ChamaContext);
  if (!ctx) throw new Error('ChamaProvider missing');
  return ctx;
}
