import React, { createContext, useContext, useMemo, useState } from 'react';

const ChamaContext = createContext(null);

export function ChamaProvider({ children }) {
  const [selectedChama, setSelectedChama] = useState(null);
  const [chamas, setChamas] = useState([]);

  const ensureDefaultSelected = useMemo(
    () => () => {
      if (selectedChama) return;
      if (!Array.isArray(chamas) || chamas.length === 0) return;
      setSelectedChama(chamas[0]);
    },
    [selectedChama, chamas]
  );

  const value = useMemo(
    () => ({
      selectedChama,
      setSelectedChama,
      chamas,
      setChamas,
      ensureDefaultSelected,
      clearSelectedChama: () => setSelectedChama(null),
      clearChamas: () => setChamas([]),
    }),
    [selectedChama, chamas, ensureDefaultSelected]
  );

  return <ChamaContext.Provider value={value}>{children}</ChamaContext.Provider>;
}

export function useChama() {
  const ctx = useContext(ChamaContext);
  if (!ctx) throw new Error('ChamaProvider missing');
  return ctx;
}
