// Use Google Maps Geocoding API
// For production, this should go through a backend proxy with server-side API key
// For now, using direct API call (requires VITE_GOOGLE_MAPS_FRONTEND_KEY in .env)

export interface GeocodeResult {
  lat: number;
  lng: number;
}

export interface GeocodeError {
  code: 'NETWORK_ERROR' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR' | 'SERVICE_UNAVAILABLE';
  message: string;
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null;
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_FRONTEND_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not configured");
      return null;
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const res = await fetch(url);
    
    // Handle HTTP errors including 503 Service Unavailable
    if (!res.ok) {
      if (res.status === 503) {
        console.error("Google Maps Geocoding API is temporarily unavailable (503)");
      }
      return null;
    }
    
    const data = await res.json();
    
    // Handle API-specific errors
    if (data.status === 'OVER_QUERY_LIMIT') {
      console.warn("Google Maps API query limit exceeded");
    } else if (data.status === 'REQUEST_DENIED') {
      console.error("Google Maps API request denied");
    } else if (data.status === 'INVALID_REQUEST') {
      console.warn("Invalid Google Maps API request");
    } else if (data.status === 'UNKNOWN_ERROR') {
      console.error("Google Maps API server error");
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn("No results found for address");
    }
    
    if (data.status === "OK" && data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    return null;
  } catch (e) {
    console.error("Geocoding error:", e);
    return null;
  }
}

// Reverse geocode lat/lng to address using Google Maps Geocoding API
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_FRONTEND_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not configured");
      return null;
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const res = await fetch(url);
    
    // Handle HTTP errors including 503 Service Unavailable
    if (!res.ok) {
      if (res.status === 503) {
        console.error("Google Maps Geocoding API is temporarily unavailable (503)");
      }
      return null;
    }
    
    const data = await res.json();
    
    // Handle API-specific errors
    if (data.status === 'OVER_QUERY_LIMIT') {
      console.warn("Google Maps API query limit exceeded");
    } else if (data.status === 'REQUEST_DENIED') {
      console.error("Google Maps API request denied");
    } else if (data.status === 'INVALID_REQUEST') {
      console.warn("Invalid Google Maps API request");
    } else if (data.status === 'UNKNOWN_ERROR') {
      console.error("Google Maps API server error");
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn("No results found for location");
    }
    
    if (data.status === "OK" && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (e) {
    console.error("Reverse geocoding error:", e);
    return null;
  }
}
