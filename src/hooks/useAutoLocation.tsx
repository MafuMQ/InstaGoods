import { useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { reverseGeocode } from "@/lib/geocode";

interface AutoLocationResult {
  success: boolean;
  error?: string;
}

export const useAutoLocation = () => {
  const { setAddress } = useLocation();
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = async (): Promise<AutoLocationResult> => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      return {
        success: false,
        error: "Geolocation is not supported by this browser"
      };
    }

    setIsDetecting(true);

    try {
      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // Cache for 1 minute
          }
        );
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude);

      if (address) {
        setAddress(address);
        return { success: true };
      } else {
        return {
          success: false,
          error: "Unable to determine address from location"
        };
      }
    } catch (error: any) {
      let errorMessage = "Unable to detect location";
      
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = "Location access denied by user";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = "Location information unavailable";
      } else if (error.code === error.TIMEOUT) {
        errorMessage = "Location request timed out";
      }

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsDetecting(false);
    }
  };

  return {
    detectLocation,
    isDetecting
  };
};