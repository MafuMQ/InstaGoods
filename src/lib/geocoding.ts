// Geocoding utilities for address-to-coordinate conversion
// Uses the existing /api/geocode-proxy endpoint

export interface GeoLocation {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

export interface GeocodeResult {
  success: boolean;
  location?: GeoLocation;
  error?: string;
}

// Cache duration in milliseconds (7 days)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry {
  location: GeoLocation;
  timestamp: number;
}

/**
 * Get cached coordinates from localStorage
 */
function getCachedLocation(address: string): GeoLocation | null {
  try {
    const cacheKey = `geocode_${encodeURIComponent(address.toLowerCase())}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const entry: CacheEntry = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - entry.timestamp < CACHE_DURATION) {
        console.log(`[Geocoding] Cache hit for: ${address}`);
        return entry.location;
      }
      
      // Expired - remove from cache
      localStorage.removeItem(cacheKey);
    }
  } catch (error) {
    console.error('[Geocoding] Cache read error:', error);
  }
  
  return null;
}

/**
 * Save coordinates to localStorage cache
 */
function cacheLocation(address: string, location: GeoLocation): void {
  try {
    const cacheKey = `geocode_${encodeURIComponent(address.toLowerCase())}`;
    const entry: CacheEntry = {
      location,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error('[Geocoding] Cache write error:', error);
  }
}

/**
 * Geocode an address to coordinates using Google Maps API via proxy
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  // Check cache first
  const cached = getCachedLocation(address);
  if (cached) {
    return { success: true, location: cached };
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(`/api/geocode-proxy?address=${encodedAddress}`);
    
    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.error || 'Geocoding request failed' 
      };
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location: GeoLocation = {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address
      };
      
      // Cache the result
      cacheLocation(address, location);
      
      return { success: true, location };
    }
    
    return { 
      success: false, 
      error: data.status || 'No results found' 
    };
    
  } catch (error) {
    console.error('[Geocoding] Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Geocode multiple addresses in batch
 */
export async function geocodeAddresses(
  addresses: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();
  
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    
    // Check cache first for each address
    const cached = getCachedLocation(address);
    if (cached) {
      results.set(address, { success: true, location: cached });
    } else {
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = await geocodeAddress(address);
      results.set(address, result);
    }
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, addresses.length);
    }
  }
  
  return results;
}

/**
 * Calculate distance between two addresses (geocodes if needed)
 */
export async function calculateDistanceBetweenAddresses(
  fromAddress: string,
  toAddress: string
): Promise<{ distance: number; error?: string }> {
  // Geocode both addresses
  const [fromResult, toResult] = await Promise.all([
    geocodeAddress(fromAddress),
    geocodeAddress(toAddress)
  ]);
  
  if (!fromResult.success || !toResult.success) {
    return {
      distance: 0,
      error: `Could not geocode addresses: ${fromResult.error || toResult.error}`
    };
  }
  
  // Import haversine dynamically to avoid circular dependencies
  const { haversineDistance } = await import('./distance');
  const distance = haversineDistance(
    fromResult.location!.lat,
    fromResult.location!.lng,
    toResult.location!.lat,
    toResult.location!.lng
  );
  
  return { distance };
}

/**
 * Get location from stored user data or default to a city center
 * This provides fallback behavior when geocoding isn't available
 */
export function getDefaultLocation(city: string = 'Johannesburg'): GeoLocation {
  // Major South African cities as defaults
  const cityDefaults: Record<string, GeoLocation> = {
    'johannesburg': { lat: -26.2041, lng: 28.0473 },
    'cape town': { lat: -33.9249, lng: 18.4241 },
    'durban': { lat: -29.8587, lng: 31.0218 },
    'pretoria': { lat: -25.7479, lng: 28.2293 },
    'port elizabeth': { lat: -33.9608, lng: 25.6022 },
    'bloemfontein': { lat: -29.0852, lng: 26.1596 }
  };
  
  const cityKey = city.toLowerCase();
  return cityDefaults[cityKey] || cityDefaults['johannesburg'];
}

/**
 * Format an address for geocoding
 */
export function formatAddressForGeocode(
  street: string,
  city: string,
  province?: string,
  country: string = 'South Africa'
): string {
  const parts = [street, city];
  if (province) parts.push(province);
  parts.push(country);
  return parts.filter(p => p).join(', ');
}
