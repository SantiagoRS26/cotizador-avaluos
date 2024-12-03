// src/components/ServiceCard.tsx
import React from 'react';
import { IconContext } from 'react-icons';
import { FaRegClipboard } from 'react-icons/fa';

interface ServiceCardProps {
  service: string;
  price: string;
  icon: React.ComponentType;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, price, icon: Icon }) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 text-white shadow-md rounded-xl p-6 flex flex-col items-center hover:shadow-xl hover:scale-105 transition-transform duration-300 min-h-[350px]">
      <IconContext.Provider
        value={{ size: '3em', className: 'text-gray-300 mb-4 transition-transform duration-300 hover:scale-110' }}
      >
        {Icon ? <Icon /> : <FaRegClipboard />}
      </IconContext.Provider>
      <h3 className="text-2xl font-semibold mb-2 text-center">{service}</h3>
      <div className="flex items-center justify-center h-12 w-full mt-auto">
        <p className="bg-gray-100 text-gray-800 font-medium text-lg px-4 py-2 rounded-full shadow-sm">
          {price}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;
