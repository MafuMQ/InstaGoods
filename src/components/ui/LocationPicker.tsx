import React from "react";
import PlacesAutocomplete from "react-places-autocomplete";
import { useLocation } from "@/context/LocationContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";

const LocationPicker: React.FC = () => {
  const { address, setAddress } = useLocation();

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
              placeholder: "Set region...",
              className: "pl-3 pr-10 w-full md:w-56",
            })}
          />
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
