import { createContext, useContext, useState } from 'react';

// A = Offline Deals, B = OxyLoans, C = Both
const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('dashMode') || 'A');

  const changeMode = (m) => {
    setMode(m);
    localStorage.setItem('dashMode', m);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode: changeMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export const useMode = () => useContext(ModeContext);
