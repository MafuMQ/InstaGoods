import React, { useState, useCallback } from 'react';
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
                console.log('New version available, refreshing...');
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
interface GoogleMapsErrorFallbackProps {
  message?: string;
  is503Error?: boolean;
  onRetry?: () => void;
}

const GoogleMapsErrorFallback: React.FC<GoogleMapsErrorFallbackProps> = ({ 
  message, 
  is503Error,
  onRetry 
}) => (
  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg m-2">
    <p className="text-sm text-yellow-800">
      ⚠️ {message || 'Google Maps failed to load. This may be due to an ad-blocker or network issue.'}
    </p>
    {is503Error && (
      <p className="text-xs text-yellow-600 mt-2">
        The Google Maps service is temporarily unavailable. Please try again in a few minutes.
      </p>
    )}
    <p className="text-xs text-yellow-600 mt-1">
      Try disabling your ad-blocker or refreshing the page.
    </p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="mt-2 px-4 py-2 bg-yellow-200 hover:bg-yellow-300 rounded text-sm text-yellow-800 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Main app content with error boundary
const AppWithErrorBoundary = ({ 
  googleMapsError, 
  errorDetails, 
  is503Error,
  onRetry 
}: { 
  googleMapsError: boolean;
  errorDetails: string;
  is503Error: boolean;
  onRetry?: () => void;
}) => (
  <>
    {googleMapsError && (
      <GoogleMapsErrorFallback 
        message={errorDetails} 
        is503Error={is503Error}
        onRetry={onRetry}
      />
    )}
    <LocationProvider>
      <DeliveryAndAvailableProvider>
        <App />
      </DeliveryAndAvailableProvider>
    </LocationProvider>
  </>
);

// Root component that manages Google Maps loading state
const Root = () => {
  // State to track Google Maps loading
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [is503Error, setIs503Error] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Handler for successful Google Maps load
  const handleLoadSuccess = useCallback(() => {
    console.log('Google Maps loaded successfully');
    setGoogleMapsLoaded(true);
    setGoogleMapsError(false);
    setErrorDetails('');
    setIs503Error(false);
  }, []);

  // Handler for Google Maps load errors (including 503)
  const handleLoadError = useCallback((error: Error | undefined) => {
    console.error('Google Maps failed to load', error);
    
    // Check if it's a 503 Service Unavailable error
    const errorMessage = error?.message || '';
    const isServiceUnavailable = 
      errorMessage.includes('503') || 
      errorMessage.includes('Service Unavailable') ||
      errorMessage.includes('gen_204') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('network');
    
    setIs503Error(isServiceUnavailable);
    
    if (isServiceUnavailable) {
      setErrorDetails('Google Maps service is temporarily unavailable (503). Please try again later.');
    } else if (errorMessage) {
      setErrorDetails(`Google Maps failed to load: ${errorMessage}`);
    } else {
      setErrorDetails('Google Maps failed to load. This may be due to an ad-blocker or network issue.');
    }
    
    setGoogleMapsError(true);
    setGoogleMapsLoaded(true); // Still allow app to render, just show error
  }, []);

  // Retry handler
  const handleRetry = useCallback(() => {
    console.log('Retrying Google Maps load...');
    setRetryCount(prev => prev + 1);
    setGoogleMapsError(false);
    setGoogleMapsLoaded(false);
    setErrorDetails('');
    setIs503Error(false);
  }, []);

  // Show loading screen while Google Maps is loading
  if (!googleMapsLoaded && !googleMapsError) {
    return (
      <LoadScript 
        key={`load-script-${retryCount}`} // Force re-mount on retry
        googleMapsApiKey={frontendMapsKey} 
        libraries={['places']}
        onLoad={handleLoadSuccess}
        onError={handleLoadError}
        loadingElement={<LoadingScreen />}
      >
        <div style={{ height: '100vh' }} />
      </LoadScript>
    );
  }

  // Render app with error boundary when there's an error
  return (
    <LoadScript 
      key={`load-script-${retryCount}`}
      googleMapsApiKey={frontendMapsKey} 
      libraries={['places']}
      onLoad={handleLoadSuccess}
      onError={handleLoadError}
      loadingElement={<LoadingScreen />}
    >
      <AppWithErrorBoundary 
        googleMapsError={googleMapsError}
        errorDetails={errorDetails}
        is503Error={is503Error}
        onRetry={retryCount < 3 ? handleRetry : undefined}
      />
    </LoadScript>
  );
};

createRoot(document.getElementById("root")!).render(<Root />);
