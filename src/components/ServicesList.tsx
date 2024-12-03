// src/components/ServicesList.tsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import ServiceCard from "./ServiceCard";
import services from "../data/services";
import { FaSearch, FaTimes } from "react-icons/fa";

const ServicesList: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
	const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

	// Definir las opciones de filtro
	const priceRanges = [
		{ label: "$0 - $500.000", min: 0, max: 500000 },
		{ label: "$500.001 - $1.000.000", min: 500001, max: 1000000 },
		{ label: "$1.000.001 - $5.000.000", min: 1000001, max: 5000000 },
		{ label: "Más de $5.000.000", min: 5000001, max: Infinity },
	];

	const categories = useMemo(
		() => Array.from(new Set(services.map((service) => service.category))),
		[]
	);
	const types = useMemo(
		() => Array.from(new Set(services.map((service) => service.type))),
		[]
	);

	// Implementar debounce manualmente usando useEffect y useRef
	const debounceTimeout = useRef<number | undefined>(undefined);

	useEffect(() => {
		// Limpiar el timeout anterior
		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current);
		}

		// Establecer un nuevo timeout
		debounceTimeout.current = window.setTimeout(() => {
			setDebouncedSearchTerm(searchTerm.toLowerCase());
		}, 300);

		// Limpiar al desmontar el componente
		return () => {
			if (debounceTimeout.current) {
				clearTimeout(debounceTimeout.current);
			}
		};
	}, [searchTerm]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const handlePriceRangeChange = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		setSelectedPriceRange(event.target.value);
	};

	const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value, checked } = event.target;
		setSelectedCategories((prev) =>
			checked ? [...prev, value] : prev.filter((cat) => cat !== value)
		);
	};

	const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value, checked } = event.target;
		setSelectedTypes((prev) =>
			checked ? [...prev, value] : prev.filter((type) => type !== value)
		);
	};

	const removeFilter = (
		type: "category" | "type" | "price" | "search",
		value?: string
	) => {
		switch (type) {
			case "category":
				if (value) {
					setSelectedCategories((prev) => prev.filter((cat) => cat !== value));
				}
				break;
			case "type":
				if (value) {
					setSelectedTypes((prev) => prev.filter((t) => t !== value));
				}
				break;
			case "price":
				setSelectedPriceRange("");
				break;
			case "search":
				setSearchTerm("");
				setDebouncedSearchTerm("");
				break;
			default:
				break;
		}
	};

	const resetFilters = () => {
		setSearchTerm("");
		setDebouncedSearchTerm("");
		setSelectedPriceRange("");
		setSelectedCategories([]);
		setSelectedTypes([]);
	};

	// Función para convertir el precio a un número para comparación
	const parsePrice = (priceStr: string): number => {
		// Extraer el primer número encontrado en la cadena
		const match = priceStr.match(/\d+/g);
		if (match) {
			// Convertir el array de strings a un solo número
			return parseInt(match.join(""), 10);
		}
		return 0; // Default si no se encuentra número
	};

	const filteredServices = services.filter((service) => {
		// Filtro por búsqueda
		const matchesSearch = service.service
			.toLowerCase()
			.includes(debouncedSearchTerm);

		// Filtro por rango de precio
		let matchesPrice = true;
		if (selectedPriceRange) {
			const range = priceRanges.find(
				(range) => range.label === selectedPriceRange
			);
			if (range) {
				const price = parsePrice(service.price);
				matchesPrice = price >= range.min && price <= range.max;
			}
		}

		// Filtro por categorías
		const matchesCategory =
			selectedCategories.length > 0
				? selectedCategories.includes(service.category)
				: true;

		// Filtro por tipos
		const matchesType =
			selectedTypes.length > 0 ? selectedTypes.includes(service.type) : true;

		return matchesSearch && matchesPrice && matchesCategory && matchesType;
	});

	return (
		<div className="container mx-auto px-4 py-8">
			<h2 className="text-3xl font-bold mb-6 text-center">
				LISTA DE SERVICIOS 2024
			</h2>

			{/* Layout Principal: Sidebar de Filtros y Sección de Servicios */}
			<div className="flex flex-col md:flex-row">
				{/* Sidebar de Filtros */}
				<aside className="w-full md:w-1/4 md:pr-4 mb-6 md:mb-0">
					{/* Buscador */}
					<div className="mb-6">
						<div className="relative">
							<input
								type="text"
								placeholder="Buscar servicios..."
								className="w-full p-4 pl-12 text-lg border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
								value={searchTerm}
								onChange={handleSearchChange}
							/>
							<FaSearch
								className="absolute left-4 top-4 text-gray-500"
								size={20}
							/>
						</div>
					</div>

					{/* Controles de Filtro */}
					<div className="space-y-6">
						{/* Filtro por Rango de Precio */}
						<div>
							<label className="block text-gray-700 font-semibold mb-2">
								Rango de Precio
							</label>
							<select
								value={selectedPriceRange}
								onChange={handlePriceRangeChange}
								className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
								<option value="">Todos los Rangos de Precio</option>
								{priceRanges.map((range, index) => (
									<option
										key={index}
										value={range.label}>
										{range.label}
									</option>
								))}
							</select>
						</div>

						{/* Filtro por Categoría */}
						<div>
							<label className="block text-gray-700 font-semibold mb-2">
								Categorías
							</label>
							<div className="flex flex-col space-y-2 max-h-64 overflow-y-auto">
								{categories.map((category, index) => (
									<label
										key={index}
										className="inline-flex items-center">
										<input
											type="checkbox"
											value={category}
											checked={selectedCategories.includes(category)}
											onChange={handleCategoryChange}
											className="form-checkbox h-5 w-5 text-blue-600"
										/>
										<span className="ml-2 text-gray-700">{category}</span>
									</label>
								))}
							</div>
						</div>

						{/* Filtro por Tipo de Trabajo */}
						<div>
							<label className="block text-gray-700 font-semibold mb-2">
								Tipos de Trabajo
							</label>
							<div className="flex flex-col space-y-2 max-h-64 overflow-y-auto">
								{types.map((type, index) => (
									<label
										key={index}
										className="inline-flex items-center">
										<input
											type="checkbox"
											value={type}
											checked={selectedTypes.includes(type)}
											onChange={handleTypeChange}
											className="form-checkbox h-5 w-5 text-blue-600"
										/>
										<span className="ml-2 text-gray-700">{type}</span>
									</label>
								))}
							</div>
						</div>
					</div>
				</aside>

				{/* Sección Principal de Servicios */}
				<main className="w-full md:w-3/4 md:pl-4">
					{/* Etiquetas de Filtros Activos */}
					<div className="flex flex-wrap justify-start mb-6 gap-2">
						{(searchTerm ||
							selectedPriceRange ||
							selectedCategories.length > 0 ||
							selectedTypes.length > 0) && (
							<button
								onClick={resetFilters}
								className="flex items-center px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
								<FaTimes className="mr-2" /> Resetear Filtros
							</button>
						)}
						{selectedCategories.map((category, index) => (
							<span
								key={`cat-${index}`}
								className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
								{category}
								<FaTimes
									className="ml-2 cursor-pointer"
									onClick={() => removeFilter("category", category)}
								/>
							</span>
						))}
						{selectedTypes.map((type, index) => (
							<span
								key={`type-${index}`}
								className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
								{type}
								<FaTimes
									className="ml-2 cursor-pointer"
									onClick={() => removeFilter("type", type)}
								/>
							</span>
						))}
						{selectedPriceRange && (
							<span className="flex items-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
								Precio: {selectedPriceRange}
								<FaTimes
									className="ml-2 cursor-pointer"
									onClick={() => removeFilter("price")}
								/>
							</span>
						)}
						{searchTerm && (
							<span className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
								Búsqueda: {searchTerm}
								<FaTimes
									className="ml-2 cursor-pointer"
									onClick={() => removeFilter("search")}
								/>
							</span>
						)}
					</div>

					{/* Grid de servicios */}
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{filteredServices.length > 0 ? (
							filteredServices.map((service, index) => (
								<ServiceCard
									key={index}
									service={service.service}
									price={service.price}
									icon={service.icon}
								/>
							))
						) : (
							<div className="col-span-full text-center">
								<p className="text-xl font-semibold text-gray-500">
									No se encontraron servicios que coincidan con tu búsqueda.
								</p>
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
};

export default ServicesList;
