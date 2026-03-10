import { createContext, useContext, useState, ReactNode } from "react";

interface SupplierNavContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SupplierNavContext = createContext<SupplierNavContextType | undefined>(undefined);

export function SupplierNavProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SupplierNavContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SupplierNavContext.Provider>
  );
}

export function useSupplierNav() {
  const context = useContext(SupplierNavContext);
  if (context === undefined) {
    throw new Error("useSupplierNav must be used within a SupplierNavProvider");
  }
  return context;
}
