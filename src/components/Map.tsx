// src/components/Map.tsx

import React, { useState, useEffect } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMapEvents,
	Polyline,
	useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder"; // Importar el plugin

// Coordenadas de la oficina del avaluador (ubicación predefinida)
const oficinaAvaluador = { lat: 4.601955010311332, lng: -74.07203983933485 };

// Definir dos íconos diferentes para los marcadores
const oficinaIcon = new L.Icon({
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png", // Icono para la oficina
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", // Icono de sombra para la oficina
	shadowSize: [41, 41],
	shadowAnchor: [12, 41],
});

const seleccionIcon = new L.Icon({
	iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Icono para la selección
	iconSize: [40, 40],
	iconAnchor: [20, 41],
	popupAnchor: [1, -34],
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", // Icono de sombra
	shadowSize: [41, 41],
	shadowAnchor: [12, 41],
});

// Componente para manejar el clic del usuario y obtener la ubicación
const LocationMarker = ({
	onLocationSelect,
}: {
	onLocationSelect: (lat: number, lng: number) => void;
}) => {
	useMapEvents({
		click(e) {
			const { lat, lng } = e.latlng;
			onLocationSelect(lat, lng); // Llamamos a la función con las coordenadas
		},
	});

	return null;
};

// Componente para agregar el control de geocodificación
const GeocoderControl = ({
	onGeocode,
}: {
	onGeocode: (lat: number, lng: number) => void;
}) => {
	const map = useMap();

	useEffect(() => {
		if (!map) return;

		const geocoderControl = L.Control.geocoder({
			defaultMarkGeocode: false,
			geocoder: L.Control.Geocoder.nominatim({
				geocodingQueryParams: {
					countrycodes: "co", // Limitar a Colombia (opcional)
				},
			}),
		})
			.on("markgeocode", function (e: any) {
				const latlng = e.geocode.center;
				onGeocode(latlng.lat, latlng.lng);
				map.setView(latlng, map.getZoom());
			})
			.addTo(map);

		return () => {
			geocoderControl.remove();
		};
	}, [map, onGeocode]);

	return null;
};

// Definir las props del componente Mapa
interface MapaProps {
	onLocationSelect: (lat: number, lng: number) => void;
	ruta: Array<[number, number]>; // Coordenadas de la ruta
}

const Mapa: React.FC<MapaProps> = ({ onLocationSelect, ruta }) => {
	const [ubicacionInmueble, setUbicacionInmueble] = useState<{
		lat: number;
		lng: number;
	} | null>(null);

	// Función para manejar la selección de una dirección desde el geocodificador
	const handleGeocode = (lat: number, lng: number) => {
		setUbicacionInmueble({ lat, lng });
		onLocationSelect(lat, lng);
	};

	return (
		<div className="relative h-96 rounded-xl shadow-md overflow-hidden">
			<MapContainer
				center={oficinaAvaluador} // Centrado en la ubicación de la oficina
				zoom={13}
				style={{ height: "100%", width: "100%" }}>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				/>

				{/* Marca de la oficina del avaluador con ícono específico */}
				<Marker
					position={oficinaAvaluador}
					icon={oficinaIcon}>
					<Popup>Oficina del Avaluador</Popup>
				</Marker>

				{/* Marca de la ubicación seleccionada con otro ícono */}
				{ubicacionInmueble && (
					<Marker
						position={ubicacionInmueble}
						icon={seleccionIcon}>
						<Popup>Ubicación del Inmueble</Popup>
					</Marker>
				)}

				{/* Renderizar la ruta si existe */}
				{ruta && ruta.length > 0 && (
					<Polyline
						positions={ruta}
						color="blue"
					/>
				)}

				{/* Componente para manejar el clic del usuario y colocar el marcador */}
				<LocationMarker
					onLocationSelect={(lat, lng) => {
						setUbicacionInmueble({ lat, lng }); // Actualizamos la ubicación seleccionada
						onLocationSelect(lat, lng); // Pasamos las coordenadas al componente padre
					}}
				/>

				{/* Agregar el control de geocodificación */}
				<GeocoderControl onGeocode={handleGeocode} />
			</MapContainer>
		</div>
	);
};

export default Mapa;
