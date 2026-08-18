import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="theme-provider-wrapper" data-theme={theme} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};


export const useTheme = () => useContext(ThemeContext);
