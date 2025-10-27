import React, { createContext, useContext, useState } from "react";

interface DeliveryAndAvailableContextType {
  onlyAvailable: boolean;
  setOnlyAvailable: (val: boolean) => void;
  deliveryOnly: boolean;
  setDeliveryOnly: (val: boolean) => void;
}

const DeliveryAndAvailableContext = createContext<DeliveryAndAvailableContextType | undefined>(undefined);

export const DeliveryAndAvailableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  return (
    <DeliveryAndAvailableContext.Provider value={{ onlyAvailable, setOnlyAvailable, deliveryOnly, setDeliveryOnly }}>
      {children}
    </DeliveryAndAvailableContext.Provider>
  );
};

export const useDeliveryAndAvailable = () => {
  const context = useContext(DeliveryAndAvailableContext);
  if (!context) {
    throw new Error("useDeliveryAndAvailable must be used within a DeliveryAndAvailableProvider");
  }
  return context;
};