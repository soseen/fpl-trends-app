import { createContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import React from "react";

type AppContextProviderProps = {
  children: React.ReactNode;
};

const AppContext = createContext({});

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const { pathname } = useLocation(); // Get current route

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};
