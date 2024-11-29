// src/components/Mapa.tsx

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Coordenadas de la oficina del avaluador (ubicación predefinida)
const oficinaAvaluador = { lat: 4.601955010311332, lng: -74.07203983933485 };

// Componente para manejar el clic del usuario y obtener la ubicación
const LocationMarker = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng); // Llamamos a la función con las coordenadas
    },
  });

  return null;
};

const Mapa = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  const [ubicacionInmueble, setUbicacionInmueble] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div className="relative h-96 rounded-xl shadow-md overflow-hidden">
      <MapContainer
        center={oficinaAvaluador} // Centrado en la ubicación de la oficina
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Marca de la oficina del avaluador */}
        <Marker position={oficinaAvaluador}>
          <Popup>Oficina del Avaluador</Popup>
        </Marker>

        {/* Marca de la ubicación del inmueble */}
        {ubicacionInmueble && (
          <Marker position={ubicacionInmueble}>
            <Popup>Ubicación del Inmueble</Popup>
          </Marker>
        )}

        {/* Componente para manejar el clic del usuario y colocar el marcador */}
        <LocationMarker onLocationSelect={(lat, lng) => {
          setUbicacionInmueble({ lat, lng }); // Actualizamos la ubicación seleccionada
          onLocationSelect(lat, lng); // Pasamos las coordenadas al componente padre
        }} />
      </MapContainer>
    </div>
  );
};

export default Mapa;
