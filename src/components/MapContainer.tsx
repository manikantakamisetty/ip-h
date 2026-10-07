import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import L from 'leaflet';
import {
  ExternalLink,
  Navigation,
  Compass,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Sparkles,
  Layers,
  Fuel,
  Clock
} from 'lucide-react';
import { ZonalDumpYard, MainDumpYard, DriverLocation, RouteMetrics } from '../types';
import { GOOGLE_MAPS_CONFIG } from '../utils/config';

interface MapContainerProps {
  driverLocation: DriverLocation;
  yards: ZonalDumpYard[];
  selectedYardIds: string[];
  mainYard: MainDumpYard;
  routeMetrics: RouteMetrics | null;
  onSelectYard?: (yardId: string) => void;
  onGoogleRouteCalculated?: (metrics: {
    totalDistanceKm: number;
    estimatedTravelTimeMins: number;
  }) => void;
  onUseDeviceLocation?: () => void;
  onResetDepotLocation?: () => void;
  isAcquiringLocation?: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  driverLocation,
  yards,
  selectedYardIds,
  mainYard,
  routeMetrics,
  onSelectYard,
  onGoogleRouteCalculated,
  onUseDeviceLocation,
  onResetDepotLocation,
  isAcquiringLocation = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Engine state: 'google' | 'leaflet'
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  const [googleMapsReady, setGoogleMapsReady] = useState<boolean>(false);
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);
  const [selectedPinYard, setSelectedPinYard] = useState<ZonalDumpYard | null>(null);

  // Google Maps instances
  const gMapInstanceRef = useRef<google.maps.Map | null>(null);
  const gDirectionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const gMarkersRef = useRef<google.maps.Marker[]>([]);

  // Leaflet instances for fallback
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const leafletRouteLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Google Maps JS API
  useEffect(() => {
    let isMounted = true;

    const initGoogleMaps = async () => {
      try {
        if (!((window as any).google?.maps)) {
          setOptions({
            key: GOOGLE_MAPS_CONFIG.MAPS_API_KEY,
            v: 'weekly',
            libraries: ['places', 'geometry']
          });
          await importLibrary('maps');
          await importLibrary('routes');
        }

        if (!isMounted || !mapContainerRef.current) return;

        // Initialize Google Map instance
        const center = { lat: 17.44, lng: 78.48 }; // Hyderabad Metro Center
        const map = new google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.fill',
              stylers: [{ color: '#ffffff' }, { lightness: 17 }]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }]
            },
            {
              featureType: 'road.arterial',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }, { lightness: 18 }]
            },
            {
              featureType: 'road.local',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }, { lightness: 16 }]
            },
            {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }, { lightness: 21 }]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{ color: '#dedede' }, { lightness: 21 }]
            },
            {
              elementType: 'labels.text.stroke',
              stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }]
            },
            {
              elementType: 'labels.text.fill',
              stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }]
            },
            {
              featureType: 'administrative',
              elementType: 'geometry.fill',
              stylers: [{ color: '#fefefe' }, { lightness: 20 }]
            }
          ]
        });

        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#0284c7',
            strokeOpacity: 0.85,
            strokeWeight: 5
          }
        });

        gMapInstanceRef.current = map;
        gDirectionsRendererRef.current = directionsRenderer;
        setGoogleMapsReady(true);
        setMapEngine('google');
      } catch (err: any) {
        console.warn('Google Maps JS Loader notice, falling back to GIS Engine:', err);
        setGoogleMapsError(err?.message || 'Google Maps JS API initializing fallback');
        setMapEngine('leaflet');
      }
    };

    initGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Render Google Maps Markers & Directions
  useEffect(() => {
    if (mapEngine !== 'google' || !googleMapsReady || !gMapInstanceRef.current) return;

    const map = gMapInstanceRef.current;
    const directionsRenderer = gDirectionsRendererRef.current;

    // Clear existing Google markers
    gMarkersRef.current.forEach((m) => m.setMap(null));
    gMarkersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    // Driver / Device Starting Location Marker
    const driverPos = { lat: driverLocation.lat, lng: driverLocation.lng };
    const isDevice = Boolean(driverLocation.isDeviceLocation);

    const driverMarker = new google.maps.Marker({
      position: driverPos,
      map,
      title: isDevice
        ? `📍 Live Device GPS (Starting Point): ${driverLocation.address}`
        : 'Driver Fleet Depot - Sanath Nagar',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: isDevice ? 11 : 9,
        fillColor: isDevice ? '#2563eb' : '#0f172a',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3.5
      },
      zIndex: 999
    });
    gMarkersRef.current.push(driverMarker);
    bounds.extend(driverPos);

    // If Device GPS is active, draw subtle accuracy radius circle
    if (isDevice) {
      const accuracyCircle = new google.maps.Circle({
        strokeColor: '#3b82f6',
        strokeOpacity: 0.6,
        strokeWeight: 1.5,
        fillColor: '#60a5fa',
        fillOpacity: 0.15,
        map,
        center: driverPos,
        radius: driverLocation.accuracyMeters || 60
      });
      gMarkersRef.current.push(accuracyCircle as any);
    }

    // Main Dump Yard Terminal Marker
    const mainPos = { lat: mainYard.location.lat, lng: mainYard.location.lng };
    const mainMarker = new google.maps.Marker({
      position: mainPos,
      map,
      title: mainYard.name,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 7,
        fillColor: '#0f766e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    });
    gMarkersRef.current.push(mainMarker);
    bounds.extend(mainPos);

    // Zonal Yard Markers
    yards.forEach((yard) => {
      const isSelected = selectedYardIds.includes(yard.id);
      const isOverflow = yard.fillPercentage >= 80;
      const isModerate = yard.fillPercentage >= 50 && yard.fillPercentage < 80;

      const fillColor = isOverflow ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981';

      const yardMarker = new google.maps.Marker({
        position: { lat: yard.location.lat, lng: yard.location.lng },
        map,
        title: `${yard.name} (${yard.fillPercentage}% fill)`,
        label: {
          text: `${Math.round(yard.fillPercentage)}%`,
          color: '#ffffff',
          fontSize: '10px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 16 : 13,
          fillColor,
          fillOpacity: 1,
          strokeColor: isSelected ? '#4338ca' : '#ffffff',
          strokeWeight: isSelected ? 3.5 : 2
        }
      });

      yardMarker.addListener('click', () => {
        setSelectedPinYard(yard);
        if (onSelectYard) onSelectYard(yard.id);
      });

      gMarkersRef.current.push(yardMarker);
      bounds.extend({ lat: yard.location.lat, lng: yard.location.lng });
    });

    // 3. Compute Google Maps Multi-Stop Directions via DirectionsService
    if (selectedYardIds.length > 0 && directionsRenderer) {
      const selectedYardsList = yards.filter((y) => selectedYardIds.includes(y.id));

      const waypoints: google.maps.DirectionsWaypoint[] = selectedYardsList.map((y) => ({
        location: new google.maps.LatLng(y.location.lat, y.location.lng),
        stopover: true
      }));

      const directionsService = new google.maps.DirectionsService();

      directionsService.route(
        {
          origin: new google.maps.LatLng(driverLocation.lat, driverLocation.lng),
          destination: new google.maps.LatLng(mainYard.location.lat, mainYard.location.lng),
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);

            // Compute total actual route distance from Google Directions legs
            let totalMeters = 0;
            let totalSeconds = 0;
            const route = result.routes[0];
            if (route && route.legs) {
              route.legs.forEach((leg) => {
                totalMeters += leg.distance?.value || 0;
                totalSeconds += leg.duration?.value || 0;
              });

              const gDistanceKm = Number((totalMeters / 1000).toFixed(1));
              const gDurationMins = Math.round(totalSeconds / 60) + selectedYardsList.length * 15;

              if (onGoogleRouteCalculated) {
                onGoogleRouteCalculated({
                  totalDistanceKm: gDistanceKm,
                  estimatedTravelTimeMins: gDurationMins
                });
              }
            }
          } else {
            console.warn('Google DirectionsService status:', status);
          }
        }
      );
    } else if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as any);
      map.fitBounds(bounds, 50);
    }
  }, [
    mapEngine,
    googleMapsReady,
    driverLocation,
    yards,
    selectedYardIds,
    mainYard,
    onSelectYard,
    onGoogleRouteCalculated
  ]);

  // 4. Initialize Leaflet Map if in Leaflet Mode
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [17.44, 78.48],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd' }
      ).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletMarkersLayerRef.current = L.layerGroup().addTo(map);
      leafletRouteLayerRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    const markersLayer = leafletMarkersLayerRef.current;
    const routeLayer = leafletRouteLayerRef.current;

    if (!map || !markersLayer || !routeLayer) return;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    const bounds = L.latLngBounds([]);

    // Leaflet Pins
    const isDeviceLeaflet = Boolean(driverLocation.isDeviceLocation);
    const driverMarker = L.marker([driverLocation.lat, driverLocation.lng]);
    driverMarker.bindPopup(
      isDeviceLeaflet
        ? `<b>📍 Live Device Starting Point</b><br/><span style="font-size:11px;">${driverLocation.address}</span>`
        : '<b>Driver Fleet Depot: Sanath Nagar</b>'
    );
    driverMarker.addTo(markersLayer);
    bounds.extend([driverLocation.lat, driverLocation.lng]);

    const mainMarker = L.marker([mainYard.location.lat, mainYard.location.lng]);
    mainMarker.bindPopup(`<b>${mainYard.name}</b>`);
    mainMarker.addTo(markersLayer);
    bounds.extend([mainYard.location.lat, mainYard.location.lng]);

    yards.forEach((yard) => {
      const marker = L.marker([yard.location.lat, yard.location.lng]);
      marker.bindPopup(`<b>${yard.name}</b><br/>Capacity: ${yard.fillPercentage}%`);
      marker.addTo(markersLayer);
      bounds.extend([yard.location.lat, yard.location.lng]);
    });

    if (routeMetrics && routeMetrics.orderedStops.length > 0) {
      const coords: [number, number][] = [
        [driverLocation.lat, driverLocation.lng],
        ...routeMetrics.orderedStops.map((s) => [s.location.lat, s.location.lng] as [number, number]),
        [mainYard.location.lat, mainYard.location.lng]
      ];
      L.polyline(coords, { color: '#0284c7', weight: 4, dashArray: '6, 6' }).addTo(routeLayer);
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
    } else {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [mapEngine, driverLocation, yards, mainYard, routeMetrics]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-50 flex flex-col">
      {/* Top Map Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Status & Engine Badge + Device Location Toggle */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">
              {mapEngine === 'google' ? 'Google Maps JS API' : 'CartoDB GIS Engine'}
            </span>
          </div>

          {onUseDeviceLocation && (
            <button
              onClick={driverLocation.isDeviceLocation ? onResetDepotLocation : onUseDeviceLocation}
              disabled={isAcquiringLocation}
              className={`px-3 py-1.5 rounded-xl border shadow-md text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md active:scale-95 ${
                driverLocation.isDeviceLocation
                  ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20'
                  : 'bg-white/95 hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={
                driverLocation.isDeviceLocation
                  ? 'Starting from Device GPS. Click to reset to Depot.'
                  : 'Click to start route from your current device GPS location.'
              }
            >
              <MapPin
                className={`w-3.5 h-3.5 ${
                  driverLocation.isDeviceLocation ? 'text-white' : 'text-blue-600 animate-bounce'
                }`}
              />
              <span>
                {isAcquiringLocation
                  ? 'Acquiring GPS...'
                  : driverLocation.isDeviceLocation
                  ? 'Device GPS (Active)'
                  : 'Use Device GPS'}
              </span>
            </button>
          )}
        </div>

        {/* Legend Badges */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-3 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-700">Critical (&ge;80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-amber-700">Moderate (50-79%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-700">Normal (&lt;50%)</span>
          </div>
        </div>
      </div>

      {/* Map DOM Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Yard Detail Card */}
      {selectedPinYard && (
        <div className="absolute bottom-4 left-4 z-[400] max-w-sm bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl transition-all">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Zone {selectedPinYard.zoneCode}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{selectedPinYard.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{selectedPinYard.location.address}</p>
            </div>
            <button
              onClick={() => setSelectedPinYard(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
            >
              &times;
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <div>
              <span className="text-slate-500 block text-[10px]">Current Load</span>
              <span className="font-extrabold text-slate-800">
                {selectedPinYard.currentWasteTons} / {selectedPinYard.maxCapacityTons} T
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">Fill Level</span>
              <span
                className={`font-black text-sm ${
                  selectedPinYard.fillPercentage >= 80
                    ? 'text-red-600'
                    : selectedPinYard.fillPercentage >= 50
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {selectedPinYard.fillPercentage}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Deep Link Button */}
      {routeMetrics && routeMetrics.googleMapsDeepLink && (
        <div className="absolute bottom-4 right-4 z-[400] pointer-events-auto">
          <a
            href={routeMetrics.googleMapsDeepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xl shadow-slate-900/30 transition-all hover:scale-[1.02] active:scale-95 border border-slate-700"
          >
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>Launch Turn-by-Turn in Google Maps App</span>
          </a>
        </div>
      )}
    </div>
  );
};
