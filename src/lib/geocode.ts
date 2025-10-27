
// Use Google Maps Geocoding API
// For production, this should go through a backend proxy with server-side API key
// For now, using direct API call (requires VITE_GOOGLE_MAPS_FRONTEND_KEY in .env)
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
    if (!res.ok) return null;
    const data = await res.json();
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
