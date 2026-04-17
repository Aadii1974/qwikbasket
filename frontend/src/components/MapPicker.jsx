import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix typical leaflet icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (position && map) {
       map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapPicker = ({ initialPos, onConfirm, onCancel }) => {
  const [position, setPosition] = useState(initialPos || { lat: 28.7041, lng: 77.1025 }); // Default: Delhi

  useEffect(() => {
    if (initialPos && initialPos.lat && initialPos.lng) {
      setPosition(initialPos);
    }
  }, [initialPos]);

  return (
    <div className="flex flex-col gap-4">
      <div className="h-[400px] w-full rounded-2xl overflow-hidden border-2 border-slate-200 z-10 relative">
        <MapContainer center={position} zoom={15} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      <div className="flex items-center gap-3 mt-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
        <p><strong>Tip:</strong> You can click anywhere on the map to adjust your exact delivery pin securely.</p>
      </div>
      <div className="flex gap-3">
        {onCancel && (
          <button onClick={onCancel} className="flex-1 p-3 font-bold text-slate-500 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition">
            Skip / Cancel
          </button>
        )}
        <button onClick={() => onConfirm(position)} className="flex-1 bg-[var(--secondary)] text-white font-black rounded-xl p-3 hover:bg-[var(--secondary-dark)] transition shadow-lg shadow-green-200">
          Confirm Delivery Location
        </button>
      </div>
    </div>
  );
};

export default MapPicker;
