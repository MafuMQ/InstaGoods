import React, { createContext, useContext, useState } from "react";

interface LocationContextType {
  address: string;
  setAddress: (address: string) => void;
  lat: number | null;
  lng: number | null;
  setCoords: (lat: number | null, lng: number | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const setCoords = (newLat: number | null, newLng: number | null) => {
    setLat(newLat);
    setLng(newLng);
  };

  return (
    <LocationContext.Provider value={{ address, setAddress, lat, lng, setCoords }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
