import React, { useState } from "react";
import PlacesAutocomplete from "react-places-autocomplete";
import { useLocation } from "@/context/LocationContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { reverseGeocode } from "@/lib/geocode";
import { MapPin, Loader2 } from "lucide-react";

const LocationPicker: React.FC = () => {
  const { address, setAddress } = useLocation();
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any form submission
    e.stopPropagation(); // Prevent event bubbling
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return;
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
      const detectedAddress = await reverseGeocode(latitude, longitude);

      if (detectedAddress) {
        setAddress(detectedAddress);
      } else {
        console.warn("Unable to determine address from location");
      }
    } catch (error: unknown) {
      console.error("Location detection failed:", error);
      
      if (error instanceof GeolocationPositionError) {
        let errorMessage = "Unable to detect location";
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location access denied by user";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information unavailable";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out";
        }
        
        console.warn(errorMessage);
      }
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <PlacesAutocomplete
      value={address}
      onChange={setAddress}
      onSelect={setAddress}
      debounce={300}
      searchOptions={{ types: ["(regions)"] }}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div className="relative w-full">
          <Input
            {...getInputProps({
              placeholder: "Set location...",
              className: "pl-3 pr-12 w-full md:w-56",
            })}
          />
          
          {/* GPS Button integrated within the input */}
          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetecting}
            title="Auto-detect my location"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDetecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </button>
          
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
              {loading && (
                <div className="p-2 flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              )}
              {suggestions.map((suggestion) => (
                <div
                  {...getSuggestionItemProps(suggestion, {
                    className:
                      "p-2 cursor-pointer hover:bg-primary/10 text-sm text-foreground",
                  })}
                  key={suggestion.placeId}
                >
                  {suggestion.description}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PlacesAutocomplete>
  );
};

export default LocationPicker;
