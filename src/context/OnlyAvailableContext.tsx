import React, { createContext, useContext, useState } from "react";

interface OnlyAvailableContextType {
  onlyAvailable: boolean;
  setOnlyAvailable: (val: boolean) => void;
}

const OnlyAvailableContext = createContext<OnlyAvailableContextType | undefined>(undefined);

export const OnlyAvailableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  return (
    <OnlyAvailableContext.Provider value={{ onlyAvailable, setOnlyAvailable }}>
      {children}
    </OnlyAvailableContext.Provider>
  );
};

export const useOnlyAvailable = () => {
  const context = useContext(OnlyAvailableContext);
  if (!context) {
    throw new Error("useOnlyAvailable must be used within an OnlyAvailableProvider");
  }
  return context;
};