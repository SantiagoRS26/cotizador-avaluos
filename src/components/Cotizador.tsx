// src/components/Cotizador.tsx

import React, { useState } from "react";
import Mapa from "./Map"; // Asegúrate de que la ruta de importación sea correcta
import axios from "axios";

// Coordenadas de la oficina del avaluador
const oficinaAvaluador = { lat: 4.601955010311332, lng: -74.07203983933485 };

// Definir los precios por área como un arreglo ordenado
const preciosAreaArray = [
    { area: 20, price: 100000 },
    { area: 40, price: 150000 },
    { area: 60, price: 200000 },
    { area: 80, price: 250000 },
    { area: 100, price: 300000 },
    { area: 120, price: 350000 },
];

// Precio por kilómetro recorrido (ejemplo)
const precioPorKilometro = 15000;

// Función de interpolación lineal para determinar el precio basado en el área
const getPriceForArea = (area: number): number => {
    // Si el área es menor o igual al mínimo, retornar el precio mínimo
    if (area <= preciosAreaArray[0].area) {
        return preciosAreaArray[0].price;
    }

    // Si el área es mayor o igual al máximo, retornar el precio máximo
    if (area >= preciosAreaArray[preciosAreaArray.length - 1].area) {
        return preciosAreaArray[preciosAreaArray.length - 1].price;
    }

    // Encontrar los dos puntos de referencia más cercanos
    for (let i = 0; i < preciosAreaArray.length - 1; i++) {
        const lower = preciosAreaArray[i];
        const upper = preciosAreaArray[i + 1];

        if (area === lower.area) {
            return lower.price;
        }

        if (area > lower.area && area < upper.area) {
            // Interpolación lineal
            const slope = (upper.price - lower.price) / (upper.area - lower.area);
            return lower.price + slope * (area - lower.area);
        }
    }

    // En caso de que no se encuentre, retornar el precio base
    return preciosAreaArray[0].price;
};

const Cotizador = () => {
    const [area, setArea] = useState<number>(20); // Ahora cualquier número
    const [pisos, setPisos] = useState<number>(1);
    const [ubicacionInmueble, setUbicacionInmueble] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [distanciaRuta, setDistanciaRuta] = useState<number>(0); // Distancia de la ruta
    const [tiempoRuta, setTiempoRuta] = useState<string>(""); // Tiempo estimado de la ruta
    const [ruta, setRuta] = useState<Array<[number, number]>>([]); // Coordenadas de la ruta

    // Función para hacer la solicitud de enrutamiento a la API de OSRM
    const calcularRuta = async (latInmueble: number, lngInmueble: number) => {
        try {
            // Hacer la solicitud HTTP a OSRM para obtener la ruta entre dos puntos
            const response = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${oficinaAvaluador.lng},${oficinaAvaluador.lat};${lngInmueble},${latInmueble}?overview=full&geometries=geojson&steps=true`
            );

            // Obtener los datos de la ruta
            const rutaGeoJSON = response.data.routes[0].geometry.coordinates; // Array de [lng, lat]
            const rutaLatLng: Array<[number, number]> = rutaGeoJSON.map(
                (coord: [number, number]) => [coord[1], coord[0]] // Convertir a [lat, lng]
            );

            const distancia = response.data.routes[0].legs[0].distance / 1000; // En kilómetros
            const tiempo = response.data.routes[0].legs[0].duration / 60; // En minutos

            setDistanciaRuta(distancia);
            setTiempoRuta(`${tiempo.toFixed(2)} minutos`);
            setRuta(rutaLatLng); // Almacenar la ruta
        } catch (error) {
            console.error("Error al obtener la ruta:", error);
        }
    };

    // Calcular el precio final
    const calcularAvaluo = () => {
        const precioBase = getPriceForArea(area);
        const precioPisos = precioBase * pisos;

        // Calcular el costo de desplazamiento por km
        const costoDesplazamiento = distanciaRuta * precioPorKilometro;

        const precioFinal = precioPisos + costoDesplazamiento;
        return precioFinal;
    };

    // Manejar la ubicación seleccionada en el mapa
    const handleLocationSelect = (lat: number, lng: number) => {
        setUbicacionInmueble({ lat, lng });
        calcularRuta(lat, lng); // Calcular la ruta después de seleccionar la ubicación
    };

    // Formatear el precio en COP
    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(precio);
    };

    const precioFinal = calcularAvaluo();

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-12">
            <h1 className="text-3xl font-bold text-center text-teal-600 mb-8">
                Cotizador de Avaluos
            </h1>

            {/* Selección de área */}
            <div className="mb-6">
                <label
                    htmlFor="area"
                    className="block text-lg font-semibold text-gray-700">
                    Área (m²):
                </label>
                <input
                    type="number"
                    id="area"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    min="1"
                    step="1"
                    className="w-full p-3 mt-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Ingrese el área en m²"
                />
            </div>

            {/* Selección de número de pisos */}
            <div className="mb-6">
                <label
                    htmlFor="pisos"
                    className="block text-lg font-semibold text-gray-700">
                    Número de pisos:
                </label>
                <input
                    type="number"
                    id="pisos"
                    value={pisos}
                    onChange={(e) => setPisos(Number(e.target.value))}
                    min="1"
                    className="w-full p-3 mt-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
            </div>

            {/* Componente del mapa para seleccionar la ubicación */}
            <Mapa onLocationSelect={handleLocationSelect} ruta={ruta} />

            {/* Mostrar la distancia y el tiempo de la ruta */}
            {distanciaRuta > 0 && (
                <div className="mt-6">
                    <p className="text-lg text-gray-800">
                        Distancia a la ubicación seleccionada:{" "}
                        <strong>{distanciaRuta.toFixed(2)} km</strong>
                    </p>
                    <p className="text-lg text-gray-800">
                        Tiempo estimado de la ruta: <strong>{tiempoRuta}</strong>
                    </p>
                </div>
            )}

            {/* Mostrar el precio final */}
            <div className="mt-6 text-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Precio Final del Avaluo:
                </h2>
                <p className="text-3xl font-bold text-teal-600">
                    {formatearPrecio(precioFinal)}
                </p>
            </div>
        </div>
    );
};

export default Cotizador;
