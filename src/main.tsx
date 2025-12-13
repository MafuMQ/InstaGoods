
import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { LocationProvider } from "@/context/LocationContext";
import { LoadScript } from "@react-google-maps/api";
import "./index.css";
import { DeliveryAndAvailableProvider } from './context/OnlyAvailableContext';

// Register service worker for performance optimization
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Use a restricted frontend key for Maps JS API (for autocomplete/maps UI)
const frontendMapsKey = import.meta.env.VITE_GOOGLE_MAPS_FRONTEND_KEY;
createRoot(document.getElementById("root")!).render(
  <LoadScript googleMapsApiKey={frontendMapsKey} libraries={['places']} >
    <LocationProvider>
      <DeliveryAndAvailableProvider>
        <App />
      </DeliveryAndAvailableProvider>
    </LocationProvider>
  </LoadScript>
);
