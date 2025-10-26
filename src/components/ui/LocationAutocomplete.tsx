import React, { useState } from "react";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { Input } from "@/components/ui/input";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectAddress: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ value, onChange, onSelectAddress, placeholder }) => {
  const [loading, setLoading] = useState(false);

  const handleSelect = async (address: string) => {
    onChange(address);
    setLoading(true);
    try {
      const results = await geocodeByAddress(address);
      if (results && results.length > 0) {
        const { lat, lng } = await getLatLng(results[0]);
        onSelectAddress(address, lat, lng);
      }
    } catch (e) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlacesAutocomplete
      value={value}
      onChange={onChange}
      onSelect={handleSelect}
      debounce={300}
      searchOptions={{ types: ["(regions)"] }}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading: suggestionsLoading }) => (
        <div className="relative w-full">
          <Input
            {...getInputProps({
              placeholder: placeholder || "Enter address or area...",
              className: "pl-3 pr-10 w-full",
              disabled: loading,
            })}
          />
          {(suggestions.length > 0 || suggestionsLoading) && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
              {(loading || suggestionsLoading) && <div className="p-2 text-sm text-muted-foreground">Loading...</div>}
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

export default LocationAutocomplete;
