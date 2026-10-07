import { DriverLocation } from '../types';

/**
 * Fetches the user's current device geolocation via the HTML5 Geolocation API.
 * Performs optional reverse-geocoding if the Google Maps JavaScript API is initialized.
 */
export async function getDeviceGeolocation(): Promise<DriverLocation> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your current browser.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, heading } = position.coords;
        let formattedAddress = `Live Device Location (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`;

        // Attempt reverse geocoding if Google Maps API is loaded
        try {
          if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
            const geocoder = new (window as any).google.maps.Geocoder();
            const response = await geocoder.geocode({
              location: { lat: latitude, lng: longitude }
            });
            if (response.results && response.results[0]) {
              formattedAddress = response.results[0].formatted_address;
            }
          }
        } catch {
          // Fallback to coordinates string
        }

        resolve({
          lat: latitude,
          lng: longitude,
          address: formattedAddress,
          heading: heading || undefined,
          isDeviceLocation: true,
          accuracyMeters: Math.round(accuracy)
        });
      },
      (error) => {
        let msg = 'Failed to acquire device location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location access was denied. Please allow location permissions in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Device location is currently unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please try again.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  });
}
