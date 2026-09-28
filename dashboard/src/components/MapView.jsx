import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { DISTRICT_COORDS } from '../utils/constants';

// Placeholder Map if no API key is provided
const MapPlaceholder = ({ insights }) => {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Grid background to look like a map base */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      <div className="z-10 text-center bg-slate-800/80 p-6 rounded-xl border border-slate-700 max-w-md backdrop-blur-sm">
        <h3 className="text-lg font-bold text-slate-200 mb-2">Google Maps Integration</h3>
        <p className="text-sm text-slate-400 mb-4">
          Provide <code className="bg-slate-900 px-1 py-0.5 rounded text-primary">VITE_GOOGLE_MAPS_API_KEY</code> in your .env file to enable the interactive map visualization.
        </p>
        
        {/* Mock visualization data */}
        <div className="mt-4 border-t border-slate-700 pt-4 text-left">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Active Data Points:</p>
          <div className="space-y-2">
            {insights?.slice(0, 3).map(insight => (
              <div key={insight.id} className="flex justify-between items-center text-sm bg-slate-900/50 p-2 rounded">
                <span className="text-slate-300">{insight.district}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  insight.urgencyScore >= 80 ? 'bg-danger/20 text-danger border border-danger/30' :
                  insight.urgencyScore >= 60 ? 'bg-warning/20 text-warning border border-warning/30' :
                  'bg-success/20 text-success border border-success/30'
                }`}>
                  Score: {insight.urgencyScore}
                </span>
              </div>
            ))}
            <div className="text-center text-xs text-slate-500 mt-2">and {Math.max(0, (insights?.length || 0) - 3)} more regions...</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MapView = ({ insights, loading }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!apiKey) {
    return <MapPlaceholder insights={insights} />;
  }

  // Dark mode styling for Google Maps
  const mapOptions = {
    mapId: 'DEMO_MAP_ID', // Replace with real Map ID if available for advanced styling
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
      },
      {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
      },
    ]
  };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={{ lat: 20.5937, lng: 78.9629 }}
        defaultZoom={5}
        options={mapOptions}
        style={{ width: '100%', height: '100%' }}
      >
        {insights?.map(insight => {
          const coords = DISTRICT_COORDS[insight.district];
          if (!coords) return null;
          
          let pinColor = '#22c55e'; // Green
          if (insight.avgUrgency >= 4) pinColor = '#ef4444'; // Red
          else if (insight.avgUrgency >= 3) pinColor = '#f59e0b'; // Orange
          else if (insight.avgUrgency >= 2) pinColor = '#eab308'; // Yellow

          const isCritical = insight.avgUrgency >= 4;

          return (
            <AdvancedMarker 
              key={insight.id} 
              position={coords}
              className={isCritical ? 'marker-pulse' : ''}
              title={`${insight.district}: ${insight.totalComplaints} complaints`}
            >
              <Pin 
                background={pinColor}
                borderColor={pinColor}
                glyphColor="#fff"
                scale={isCritical ? 1.4 : 1}
              />
              {/* Optional: Add custom InfoWindow implementation here if needed */}
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
};

export default MapView;
