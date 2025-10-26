
// Use Google Maps Geocoding API to get lat/lng from address
// NOTE: The API key is currently hardcoded in main.tsx. For production, move to an environment variable.
const GOOGLE_MAPS_API_KEY = "AIzaSyDgXizfpUFvwyV-h8dB88KP_EkHsMCGWgM";

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
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
