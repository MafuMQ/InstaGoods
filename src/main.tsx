import React, { useEffect, useState } from 'react';
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
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('New version available, refreshing...');
                
                // Optionally notify user and refresh
                if (confirm('A new version is available. Would you like to refresh to get the latest version?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Use a restricted frontend key for Maps JS API (for autocomplete/maps UI)
const frontendMapsKey = import.meta.env.VITE_GOOGLE_MAPS_FRONTEND_KEY;

// Fallback component when Google Maps fails to load
const GoogleMapsErrorFallback = () => (
  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg m-2">
    <p className="text-sm text-yellow-800">
      ⚠️ Google Maps failed to load. This may be due to an ad-blocker or network issue.
    </p>
    <p className="text-xs text-yellow-600 mt-1">
      Try disabling your ad-blocker or refreshing the page.
    </p>
  </div>
);

// Custom app wrapper that handles Google Maps loading state
const AppWrapper = () => {
  // State to track Google Maps loading - must be inside component
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);
  
  // Only render app content when Google Maps is confirmed loaded
  if (!googleMapsLoaded && !googleMapsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (googleMapsError) {
    return (
      <>
        <GoogleMapsErrorFallback />
        <App />
      </>
    );
  }

  return <App />;
};

const handleLoadError = () => {
  console.error('Google Maps failed to load');
  setGoogleMapsError(true);
  setGoogleMapsLoaded(true); // Still allow app to render, just show error
};

const handleLoadSuccess = () => {
  console.log('Google Maps loaded successfully');
  setGoogleMapsLoaded(true);
  setGoogleMapsError(false);
};

createRoot(document.getElementById("root")!).render(
  <LoadScript 
    googleMapsApiKey={frontendMapsKey} 
    libraries={['places']}
    onLoad={handleLoadSuccess}
    onError={handleLoadError}
    loadingElement={<div style={{ height: '100vh' }} />}
  >
    <LocationProvider>
      <DeliveryAndAvailableProvider>
        <AppWrapper />
      </DeliveryAndAvailableProvider>
    </LocationProvider>
  </LoadScript>
);
